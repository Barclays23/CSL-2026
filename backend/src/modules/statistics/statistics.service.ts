import { AppError } from "../../shared/errors/appError.js";
import { SettingsService } from "../settings/settings.service.js";
import { PlayerRepository } from "../players/player.repository.js";
import { TeamRepository } from "../teams/team.repository.js";
import { StatisticsRepository } from "./statistics.repository.js";



type Row = Record<string, unknown>;
const idOf = (v: unknown) =>
  String(v && typeof v === "object" && "_id" in v ? (v as Row)._id : v);
const brief = (t: Row) => ({
  _id: String(t._id),
  name: t.name,
  shortName: t.shortName ?? null,
  logo: t.logo ?? null,
  groupName: t.groupName ?? null,
});


export class StatisticsService {
  constructor(private readonly _statisticsRepo:StatisticsRepository,private readonly _settingsService:SettingsService,private readonly _playerRepo:PlayerRepository,private readonly _teamRepo:TeamRepository){}
  async getTopScorers(){
    const [rows,people,teams]=await Promise.all([this._statisticsRepo.topScorerRows(),this._statisticsRepo.teamScorers(),this._statisticsRepo.activeTeams()]);
    const byId=new Map((people as unknown as Row[]).map(p=>[String(p._id),p]));
    const teamMap=new Map((teams as unknown as Row[]).map(t=>[String(t._id),t]));
    const result:Row[]=[];let previousGoals=-1,rank=0;
    for(const r of rows as unknown as Row[]){
      const goals=Number(r.goals);if(goals!==previousGoals)rank=result.length+1;previousGoals=goals;
      const p=byId.get(String(r._id));if(!p)continue;const tm=teamMap.get(String(p.teamRef));
      result.push({rank,player:{_id:String(p._id),name:p.name,position:p.position,isIconPlayer:Boolean(p.isIconPlayer),teamRef:p.teamRef?String(p.teamRef):null,jerseyNo:p.jerseyNo??null,auctionPrice:Number(p.auctionPrice??0),auctionStatus:p.auctionStatus??"pending",status:p.status??"inactive",profilePic:p.profilePic??null},team:tm?brief(tm):null,goals});
    }
    return result;
  }
  private async groupStandingsData(){
    const [matches,teams,settings]=await Promise.all([this._statisticsRepo.completedGroupMatches(),this._statisticsRepo.activeTeams(),this._settingsService.get()]);
    const rows=new Map<string,Row>();
    for(const t of teams as unknown as Row[])rows.set(String(t._id),{team:brief(t),played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,goalDifference:0,points:0});
    for(const raw of matches as unknown as Row[]){
      const goals=Array.isArray(raw.goals)?raw.goals as Row[]:[];
      const a=idOf(raw.team1Ref),b=idOf(raw.team2Ref);
      const ga=goals.filter(g=>idOf(g.scoringTeamRef)===a).length,gb=goals.filter(g=>idOf(g.scoringTeamRef)===b).length;
      const ra=rows.get(a),rb=rows.get(b);if(!ra||!rb)continue;
      ra.played=Number(ra.played)+1;rb.played=Number(rb.played)+1;
      ra.goalsFor=Number(ra.goalsFor)+ga;ra.goalsAgainst=Number(ra.goalsAgainst)+gb;
      rb.goalsFor=Number(rb.goalsFor)+gb;rb.goalsAgainst=Number(rb.goalsAgainst)+ga;
      if(ga>gb){ra.won=Number(ra.won)+1;rb.lost=Number(rb.lost)+1;ra.points=Number(ra.points)+Number(settings.pointsRule.win);}
      else if(gb>ga){rb.won=Number(rb.won)+1;ra.lost=Number(ra.lost)+1;rb.points=Number(rb.points)+Number(settings.pointsRule.win);}
      else{ra.drawn=Number(ra.drawn)+1;rb.drawn=Number(rb.drawn)+1;ra.points=Number(ra.points)+Number(settings.pointsRule.draw);rb.points=Number(rb.points)+Number(settings.pointsRule.draw);}
    }
    const groups=new Map<string,Row[]>();
    for(const r of rows.values()){r.goalDifference=Number(r.goalsFor)-Number(r.goalsAgainst);const group=String((r.team as Row).groupName??"Ungrouped");groups.set(group,[...(groups.get(group)||[]),r]);}
    return [...groups.entries()].map(([groupName,items])=>({groupName,rows:items.sort((a,b)=>Number(b.points)-Number(a.points)||Number(b.goalDifference)-Number(a.goalDifference)||Number(b.goalsFor)-Number(a.goalsFor)||String((a.team as Row).name).localeCompare(String((b.team as Row).name))).map((r,i)=>({...r,position:i+1,qualified:i<2}))}));
  }
  async getStandings(){return this.groupStandingsData();}
  async getOverallTeamStatistics(){
    const [matches,teams]=await Promise.all([this._statisticsRepo.completedMatches(),this._statisticsRepo.activeTeams()]);
    return (teams as unknown as Row[]).map(t=>{
      let played=0,goalsFor=0,goalsAgainst=0,cleanSheets=0;
      for(const raw of matches as unknown as Row[]){
        const a=idOf(raw.team1Ref),b=idOf(raw.team2Ref);if(a!==String(t._id)&&b!==String(t._id))continue;
        const goals=Array.isArray(raw.goals)?raw.goals as Row[]:[];
        const gf=goals.filter(g=>idOf(g.scoringTeamRef)===String(t._id)).length;
        const ga=goals.length-gf;played++;goalsFor+=gf;goalsAgainst+=ga;if(ga===0)cleanSheets++;
      }
    }
    const groups = new Map<string, Row[]>();
    for (const r of rows.values()) {
      r.goalDifference = Number(r.goalsFor) - Number(r.goalsAgainst);
      const group = String((r.team as Row).groupName ?? "Ungrouped");
      groups.set(group, [...(groups.get(group) || []), r]);
    }
    return [...groups.entries()].map(([groupName, items]) => ({
      groupName,
      rows: items
        .sort(
          (a, b) =>
            Number(b.points) - Number(a.points) ||
            Number(b.goalDifference) - Number(a.goalDifference) ||
            Number(b.goalsFor) - Number(a.goalsFor) ||
            String((a.team as Row).name).localeCompare(
              String((b.team as Row).name),
            ),
        )
        .map((r, i) => ({ ...r, position: i + 1, qualified: i < 2 })),
    }));
  }
  async getStandings() {
    return this.groupStandingsData();
  }
  async getOverallTeamStatistics() {
    const [matches, teams] = await Promise.all([
      this._statisticRepo.completedMatches(),
      this._statisticRepo.activeTeams(),
    ]);
    return (teams as unknown as Row[]).map((t) => {
      let played = 0,
        goalsFor = 0,
        goalsAgainst = 0,
        cleanSheets = 0;
      for (const raw of matches as unknown as Row[]) {
        const a = idOf(raw.team1Ref),
          b = idOf(raw.team2Ref);
        if (a !== String(t._id) && b !== String(t._id)) continue;
        const goals = Array.isArray(raw.goals) ? (raw.goals as Row[]) : [];
        const gf = goals.filter(
          (g) => idOf(g.scoringTeamRef) === String(t._id),
        ).length;
        const ga = goals.length - gf;
        played++;
        goalsFor += gf;
        goalsAgainst += ga;
        if (ga === 0) cleanSheets++;
      }
      return { team: brief(t), played, goalsFor, goalsAgainst, cleanSheets };
    });
  }
  async getTeamStatistics(teamId:string){
    const [standingGroups,overall]=await Promise.all([this.groupStandingsData(),this.getOverallTeamStatistics()]);
    const groupRow=standingGroups.flatMap(g=>g.rows as Row[]).find(r=>idOf((r.team as Row)._id)===teamId);
    const overallRow=overall.find(r=>idOf(r.team._id)===teamId);
    if(!overallRow)throw new AppError("Team not found",404,"NOT_FOUND");
    return {team:overallRow.team,group:groupRow?{played:groupRow.played,won:groupRow.won,drawn:groupRow.drawn,lost:groupRow.lost,goalsFor:groupRow.goalsFor,goalsAgainst:groupRow.goalsAgainst,goalDifference:groupRow.goalDifference,points:groupRow.points}:{played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,goalDifference:0,points:0},overall:{played:overallRow.played,goalsFor:overallRow.goalsFor,goalsAgainst:overallRow.goalsAgainst,cleanSheets:overallRow.cleanSheets}};
  }
  async getDashboardStatistics(){
    const [settings,activeTeams,auction,completed,upcoming,recent,topScorers,overall,upcomingCount]=await Promise.all([
      this._settingsService.get(),this._teamRepo.countActive(),this._playerRepo.auctionCounts(),this._statisticsRepo.completedMatches(),
      this._statisticsRepo.upcomingFixtures(),this._statisticsRepo.recentResults(),this.getTopScorers(),this.getOverallTeamStatistics(),this._statisticsRepo.upcomingCount()
    ]);
    const groupRow = standingGroups
      .flatMap((g) => g.rows as Row[])
      .find((r) => idOf((r.team as Row)._id) === teamId);
    const overallRow = overall.find((r) => idOf(r.team._id) === teamId);
    if (!overallRow) throw new AppError("Team not found", 404, "NOT_FOUND");
    return {
      team: overallRow.team,
      group: groupRow
        ? {
            played: groupRow.played,
            won: groupRow.won,
            drawn: groupRow.drawn,
            lost: groupRow.lost,
            goalsFor: groupRow.goalsFor,
            goalsAgainst: groupRow.goalsAgainst,
            goalDifference: groupRow.goalDifference,
            points: groupRow.points,
          }
        : {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
          },
      overall: {
        played: overallRow.played,
        goalsFor: overallRow.goalsFor,
        goalsAgainst: overallRow.goalsAgainst,
        cleanSheets: overallRow.cleanSheets,
      },
    };
  }
  async getDashboardStatistics() {
    const [
      settings,
      activeTeams,
      auction,
      completed,
      upcoming,
      recent,
      topScorers,
      overall,
      upcomingCount,
    ] = await Promise.all([
      this._settingsService.get(),
      this._teamsRepo.countActive(),
      this._playerRepo.auctionCounts(),
      this._statisticRepo.completedMatches(),
      this._statisticRepo.upcomingFixtures(),
      this._statisticRepo.recentResults(),
      this.getTopScorers(),
      this.getOverallTeamStatistics(),
      this._statisticRepo.upcomingCount(),
    ]);
    const matches = completed as unknown as Row[];
    const totalGoals = matches.reduce(
      (n, m) => n + (Array.isArray(m.goals) ? m.goals.length : 0),
      0,
    );
    const stats = overall as unknown as Row[];
    const pickOne = (field: string, key: string) => {
      const sorted = [...stats].sort(
        (a, b) =>
          Number(b[field] || 0) - Number(a[field] || 0) ||
          String((a.team as Row).name).localeCompare(
            String((b.team as Row).name),
          ),
      );
      const first = sorted[0];
      return first && Number(first[field] || 0) > 0
        ? { team: first.team, [key]: Number(first[field]) }
        : null;
    };
    const maxClean = Math.max(
      0,
      ...stats.map((s) => Number(s.cleanSheets || 0)),
    );
    const clean = stats
      .filter((s) => Number(s.cleanSheets || 0) === maxClean && maxClean > 0)
      .map((s) => ({ team: s.team, cleanSheets: Number(s.cleanSheets) }));
    return {
      tournamentName: settings.tournamentName,
      startDate: settings.startDate,
      endDate: settings.endDate,
      totalMatchesPlayed: matches.length,
      totalGoals,
      activeTeams,
      activePlayers: auction.activeAuctionPlayers,
      pendingPlayers: auction.pendingPlayers,
      soldPlayers: auction.soldPlayers,
      unsoldPlayers: auction.unsoldPlayers,
      totalAuctionSpend: auction.totalAuctionSpend,
      upcomingMatchCount: upcomingCount,
      topScorer: topScorers[0] ?? null,
      mostScoringTeam: pickOne("goalsFor", "goals"),
      mostConcedingTeam: pickOne("goalsAgainst", "goals"),
      mostCleanSheets: clean,
      upcomingFixtures: upcoming,
      recentResults: recent,
      alerts: [],
    };
  }
}
