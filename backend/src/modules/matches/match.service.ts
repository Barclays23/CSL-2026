import { Types } from "mongoose";
import { AppError } from "../../shared/errors/appError.js";
import type { PaginatedResult } from "../../shared/types/common.types.js";
import type { IPlayerRepository, PlayerEntity } from "../players/player.types.js";
import type { ITeamRepository, TeamBriefDTO } from "../teams/team.types.js";
import type { IMatchService, IMatchRepository } from "./match.interfaces.js";
import type { GoalCreateDTO, GoalFields, MatchCreateDTO, MatchEntity, MatchFields, MatchListFilter, MatchQueryDTO, MatchResponseDTO, MatchGoalDTO, MatchPlayerBriefDTO, MatchUpdateDTO, MatchTeamReferenceEntity, MatchPlayerReferenceEntity, PopulatedGoalEntity, PopulatedMatchEntity } from "./match.types.js";

export class MatchService implements IMatchService {
  constructor(
    private readonly _matchRepository: IMatchRepository,
    private readonly _teamRepository: ITeamRepository,
    private readonly _playerRepository: IPlayerRepository,
  ) {}

  async getMatches(query: MatchQueryDTO): Promise<PaginatedResult<MatchResponseDTO>> {
    const filter: MatchListFilter = {};
    if (query.stage) filter.stage = query.stage;
    if (query.groupName) filter.groupName = query.groupName;
    if (query.status) filter.status = query.status;

    if (query.search) {
      const matchedTeams = await this._teamRepository.findTeams({
        status: "active",
        name: { $regex: query.search, $options: "i" },
      }, 1, 100);
      const matchedTeamIds = matchedTeams.items.map((team) => team._id);
      filter.$or = [
        { matchNo: { $regex: query.search, $options: "i" } },
        { team1Ref: { $in: matchedTeamIds } },
        { team2Ref: { $in: matchedTeamIds } },
      ];
    }

    const result = await this._matchRepository.findMatches(filter, query.page, query.limit);
    return {
      items: result.items.map((match) => this.mapMatchToResponseDTO(match)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async getMatchById(matchId: string): Promise<MatchResponseDTO> {
    this.ensureValidObjectId(matchId, "match");
    const match = await this._matchRepository.findMatchWithTeamsAndGoals(matchId);
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    return this.mapMatchToResponseDTO(match);
  }

  async createMatch(input: MatchCreateDTO): Promise<MatchResponseDTO> {
    const groupName = input.stage === "group" ? input.groupName ?? null : null;
    await this.validateMatchTeams(input.team1Ref, input.team2Ref, input.stage, groupName);

    if (await this._matchRepository.findMatchByNumber(input.matchNo)) {
      throw new AppError("Match number already exists", 409, "DUPLICATE_MATCH", {
        matchNo: "Match number already exists",
      });
    }

    if (input.stage !== "group" && input.status === "completed") {
      throw new AppError("Create a knockout match as scheduled, add goals, then complete it with a shootout if required", 422, "INVALID_MATCH_COMPLETION");
    }
    if (input.stage === "group" && input.penaltyShootout) {
      throw new AppError("Group-stage matches cannot have a penalty shootout", 422, "GROUP_SHOOTOUT");
    }

    const matchFields: MatchFields = {
      matchNo: input.matchNo,
      stage: input.stage,
      groupName,
      kickoffAt: input.kickoffAt,
      venue: input.venue ?? null,
      team1Ref: new Types.ObjectId(input.team1Ref),
      team2Ref: new Types.ObjectId(input.team2Ref),
      status: input.status,
      goals: [],
      penaltyShootout: null,
      notes: input.notes ?? null,
    };

    const createdMatch = await this._matchRepository.createMatch(matchFields);
    const populatedMatch = await this._matchRepository.findMatchWithTeamsAndGoals(String(createdMatch._id));
    if (!populatedMatch) throw new AppError("Created match could not be retrieved", 500, "MATCH_CREATE_FAILED");
    return this.mapMatchToResponseDTO(populatedMatch);
  }

  async updateMatch(matchId: string, input: MatchUpdateDTO): Promise<MatchResponseDTO> {
    this.ensureValidObjectId(matchId, "match");
    const existingMatch = await this._matchRepository.findMatchById(matchId);
    if (!existingMatch) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");

    const updatedStage = input.stage ?? existingMatch.stage;
    const updatedTeam1Id = input.team1Ref ?? String(existingMatch.team1Ref);
    const updatedTeam2Id = input.team2Ref ?? String(existingMatch.team2Ref);
    const updatedGroupName = updatedStage === "group"
      ? input.groupName === undefined ? existingMatch.groupName : input.groupName
      : null;

    await this.validateMatchTeams(updatedTeam1Id, updatedTeam2Id, updatedStage, updatedGroupName);

    const teamAssignmentsChanged =
      updatedTeam1Id !== String(existingMatch.team1Ref) ||
      updatedTeam2Id !== String(existingMatch.team2Ref);
    if (teamAssignmentsChanged && existingMatch.goals.length > 0) {
      throw new AppError("Remove or reassign existing goal entries before changing match teams", 409, "MATCH_HAS_GOALS");
    }

    if (input.matchNo && input.matchNo !== existingMatch.matchNo) {
      const duplicateMatch = await this._matchRepository.findMatchByNumber(input.matchNo);
      if (duplicateMatch && String(duplicateMatch._id) !== matchId) {
        throw new AppError("Match number already exists", 409, "DUPLICATE_MATCH", {
          matchNo: "Match number already exists",
        });
      }
    }

    const mergedMatch: MatchFields = {
      matchNo: input.matchNo ?? existingMatch.matchNo,
      stage: updatedStage,
      groupName: updatedGroupName,
      kickoffAt: input.kickoffAt ?? existingMatch.kickoffAt,
      venue: input.venue === undefined ? existingMatch.venue : input.venue,
      team1Ref: new Types.ObjectId(updatedTeam1Id),
      team2Ref: new Types.ObjectId(updatedTeam2Id),
      status: input.status ?? existingMatch.status,
      goals: existingMatch.goals,
      penaltyShootout: input.penaltyShootout === undefined ? existingMatch.penaltyShootout : input.penaltyShootout,
      notes: input.notes === undefined ? existingMatch.notes : input.notes,
    };

    this.validateCompletedMatchResult(mergedMatch);
    const updatedMatch = await this._matchRepository.updateMatch(matchId, {
      matchNo: mergedMatch.matchNo,
      stage: mergedMatch.stage,
      groupName: mergedMatch.groupName,
      kickoffAt: mergedMatch.kickoffAt,
      venue: mergedMatch.venue,
      team1Ref: mergedMatch.team1Ref,
      team2Ref: mergedMatch.team2Ref,
      status: mergedMatch.status,
      penaltyShootout: mergedMatch.penaltyShootout,
      notes: mergedMatch.notes,
    });
    if (!updatedMatch) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");

    const populatedMatch = await this._matchRepository.findMatchWithTeamsAndGoals(matchId);
    if (!populatedMatch) throw new AppError("Updated match could not be retrieved", 500, "MATCH_UPDATE_FAILED");
    return this.mapMatchToResponseDTO(populatedMatch);
  }

  async deleteMatch(matchId: string): Promise<void> {
    this.ensureValidObjectId(matchId, "match");
    const deleted = await this._matchRepository.deleteMatch(matchId);
    if (!deleted) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
  }

  async addGoalToMatch(matchId: string, input: GoalCreateDTO): Promise<MatchResponseDTO> {
    this.ensureValidObjectId(matchId, "match");
    const match = await this._matchRepository.findMatchById(matchId);
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");

    const goal = await this.buildValidatedGoal(match, input);
    const resultingGoals = [...match.goals, goal];
    this.validateCompletedMatchResult({ ...match, goals: resultingGoals });

    const updatedMatch = await this._matchRepository.appendGoal(matchId, goal);
    if (!updatedMatch) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    return this.mapMatchToResponseDTO(updatedMatch);
  }

  async updateMatchGoal(matchId: string, goalId: string, input: GoalCreateDTO): Promise<MatchResponseDTO> {
    this.ensureValidObjectId(matchId, "match");
    this.ensureValidObjectId(goalId, "goal");
    const match = await this._matchRepository.findMatchById(matchId);
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");

    const existingGoal = match.goals.find((goal) => String(goal._id) === goalId);
    if (!existingGoal) throw new AppError("Goal not found", 404, "GOAL_NOT_FOUND");

    const updatedGoal = await this.buildValidatedGoal(match, input);
    const resultingGoals = match.goals.map((goal) => String(goal._id) === goalId ? updatedGoal : goal);
    this.validateCompletedMatchResult({ ...match, goals: resultingGoals });

    const savedMatch = await this._matchRepository.updateMatchGoal(matchId, goalId, updatedGoal);
    if (!savedMatch) throw new AppError("Goal not found", 404, "GOAL_NOT_FOUND");
    return this.mapMatchToResponseDTO(savedMatch);
  }

  async deleteMatchGoal(matchId: string, goalId: string): Promise<MatchResponseDTO> {
    this.ensureValidObjectId(matchId, "match");
    this.ensureValidObjectId(goalId, "goal");
    const match = await this._matchRepository.findMatchById(matchId);
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");

    const existingGoal = match.goals.find((goal) => String(goal._id) === goalId);
    if (!existingGoal) throw new AppError("Goal not found", 404, "GOAL_NOT_FOUND");

    const resultingGoals = match.goals.filter((goal) => String(goal._id) !== goalId);
    this.validateCompletedMatchResult({ ...match, goals: resultingGoals });

    const savedMatch = await this._matchRepository.removeMatchGoal(matchId, goalId);
    if (!savedMatch) throw new AppError("Goal not found", 404, "GOAL_NOT_FOUND");
    return this.mapMatchToResponseDTO(savedMatch);
  }

  private async validateMatchTeams(
    team1Id: string,
    team2Id: string,
    stage: MatchFields["stage"],
    groupName: string | null,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(team1Id) || !Types.ObjectId.isValid(team2Id)) {
      throw new AppError("Select two valid teams", 422, "INVALID_TEAMS");
    }
    if (team1Id === team2Id) throw new AppError("A team cannot play itself", 422, "SAME_TEAMS");

    const [team1, team2] = await Promise.all([
      this._teamRepository.findTeamById(team1Id),
      this._teamRepository.findTeamById(team2Id),
    ]);
    if (!team1 || team1.status !== "active" || !team2 || team2.status !== "active") {
      throw new AppError("Both match teams must be active", 422, "INVALID_TEAMS");
    }

    if (stage === "group") {
      if (!groupName) throw new AppError("Group name is required for a group-stage match", 422, "GROUP_REQUIRED");
      if (team1.groupName !== groupName || team2.groupName !== groupName) {
        throw new AppError("Both teams must belong to the selected group", 422, "GROUP_MISMATCH");
      }
    }
  }

  private async buildValidatedGoal(match: MatchEntity, input: GoalCreateDTO): Promise<GoalFields> {
    const team1Id = String(match.team1Ref);
    const team2Id = String(match.team2Ref);
    const scoringTeamId = input.scoringTeamRef;

    if (scoringTeamId !== team1Id && scoringTeamId !== team2Id) {
      throw new AppError("Scoring team must be one of the match teams", 422, "INVALID_SCORING_TEAM");
    }

    if (input.goalType === "normal") {
      if (!input.scorerRef) throw new AppError("Select a goal scorer", 422, "SCORER_REQUIRED");
      const scorer = await this._playerRepository.findPlayerById(input.scorerRef);
      if (!scorer || scorer.status !== "active" || String(scorer.teamRef) !== scoringTeamId) {
        throw new AppError("Normal scorer must be an active player in the scoring team", 422, "INVALID_SCORER");
      }
      return {
        scoringTeamRef: new Types.ObjectId(scoringTeamId),
        goalType: "normal",
        scorerRef: new Types.ObjectId(input.scorerRef),
        ownGoalPlayerRef: null,
      };
    }

    if (!input.ownGoalPlayerRef) throw new AppError("Select the own-goal player", 422, "OWN_GOAL_PLAYER_REQUIRED");
    const ownGoalPlayer = await this._playerRepository.findPlayerById(input.ownGoalPlayerRef);
    const opposingTeamId = scoringTeamId === team1Id ? team2Id : team1Id;
    if (!ownGoalPlayer || String(ownGoalPlayer.teamRef) !== opposingTeamId) {
      throw new AppError("Own-goal player must belong to the opposing team", 422, "INVALID_OWN_GOAL_PLAYER");
    }

    return {
      scoringTeamRef: new Types.ObjectId(scoringTeamId),
      goalType: "own_goal",
      scorerRef: null,
      ownGoalPlayerRef: new Types.ObjectId(input.ownGoalPlayerRef),
    };
  }

  private validateCompletedMatchResult(match: MatchFields): void {
    if (match.stage === "group" && match.penaltyShootout) {
      throw new AppError("Group-stage matches cannot have a penalty shootout", 422, "GROUP_SHOOTOUT");
    }
    if (match.status !== "completed" || match.stage === "group") return;

    const team1Id = String(match.team1Ref);
    const team2Id = String(match.team2Ref);
    const team1Goals = match.goals.filter((goal) => String(goal.scoringTeamRef) === team1Id).length;
    const team2Goals = match.goals.filter((goal) => String(goal.scoringTeamRef) === team2Id).length;

    if (team1Goals === team2Goals) {
      if (!match.penaltyShootout || match.penaltyShootout.team1Score === match.penaltyShootout.team2Score) {
        throw new AppError("A tied completed knockout match requires a shootout with a winner", 422, "SHOOTOUT_REQUIRED");
      }
      return;
    }

    if (match.penaltyShootout) {
      throw new AppError("Penalty shootout is only allowed when the normal-time score is tied", 422, "UNNECESSARY_SHOOTOUT");
    }
  }

  private mapMatchToResponseDTO(match: PopulatedMatchEntity): MatchResponseDTO {
    return {
      _id: String(match._id),
      matchNo: match.matchNo,
      stage: match.stage,
      groupName: match.groupName,
      kickoffAt: match.kickoffAt.toISOString(),
      venue: match.venue,
      team1Ref: this.mapTeamReference(match.team1Ref),
      team2Ref: this.mapTeamReference(match.team2Ref),
      status: match.status,
      goals: match.goals.map((goal) => this.mapGoalToResponseDTO(goal)),
      penaltyShootout: match.penaltyShootout,
      notes: match.notes,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString(),
    };
  }

  private mapGoalToResponseDTO(goal: PopulatedGoalEntity): MatchGoalDTO {
    return {
      _id: String(goal._id),
      scoringTeamRef: this.mapTeamReference(goal.scoringTeamRef),
      goalType: goal.goalType,
      scorerRef: this.mapPlayerReference(goal.scorerRef),
      ownGoalPlayerRef: this.mapPlayerReference(goal.ownGoalPlayerRef),
      createdAt: goal.createdAt.toISOString(),
    };
  }

  private mapTeamReference(reference: Types.ObjectId | MatchTeamReferenceEntity): string | TeamBriefDTO {
    if (reference instanceof Types.ObjectId) return String(reference);
    const team: TeamBriefDTO = {
      _id: String(reference._id),
      name: reference.name,
      shortName: reference.shortName,
      logo: reference.logo,
      groupName: reference.groupName,
    };
    return team;
  }

  private mapPlayerReference(reference: Types.ObjectId | MatchPlayerReferenceEntity | null): string | MatchPlayerBriefDTO | null {
    if (!reference) return null;
    if (reference instanceof Types.ObjectId) return String(reference);

    return {
      _id: String(reference._id),
      name: reference.name,
      position: reference.position,
      jerseyNo: reference.jerseyNo,
      profilePic: reference.profilePic,
      teamRef: reference.teamRef ? String(reference.teamRef) : null,
    };
  }

  private ensureValidObjectId(id: string, label: string): void {
    if (!Types.ObjectId.isValid(id)) throw new AppError(`Invalid ${label} ID`, 400, "INVALID_ID");
  }
}
