import { UserRepository } from "../modules/users/user.repository.js";
import { UserService } from "../modules/users/user.service.js";
import { SettingsRepository } from "../modules/settings/settings.repository.js";
import { PlayerRepository } from "../modules/players/player.repository.js";
import { TeamRepository } from "../modules/teams/team.repository.js";
import { ManagerRepository } from "../modules/managers/manager.repository.js";
import { SponsorRepository } from "../modules/sponsors/sponsor.repository.js";
import { MatchRepository } from "../modules/matches/match.repository.js";
import { StatisticsRepository } from "../modules/statistics/statistics.repository.js";

import { AuthService } from "../modules/auth/auth.service.js";
import { SettingsService } from "../modules/settings/settings.service.js";
import { PlayerService } from "../modules/players/player.service.js";
import { TeamService } from "../modules/teams/team.service.js";
import { ManagerService } from "../modules/managers/manager.service.js";
import { SponsorService } from "../modules/sponsors/sponsor.service.js";
import { MatchService } from "../modules/matches/match.service.js";
import { StatisticsService } from "../modules/statistics/statistics.service.js";
import { AuctionService } from "../modules/auction/auction.service.js";
import { UploadService } from "../modules/uploads/upload.service.js";

import { AuthController } from "../modules/auth/auth.controller.js";
import { SettingsController } from "../modules/settings/settings.controller.js";
import { PlayerController } from "../modules/players/player.controller.js";
import { TeamController } from "../modules/teams/team.controller.js";
import { ManagerController } from "../modules/managers/manager.controller.js";
import { SponsorController } from "../modules/sponsors/sponsor.controller.js";
import { MatchController } from "../modules/matches/match.controller.js";
import { StatisticsController } from "../modules/statistics/statistics.controller.js";
import { AuctionController } from "../modules/auction/auction.controller.js";
import { UploadController } from "../modules/uploads/upload.controller.js";

import type { IUserService } from "../modules/users/user.types.js";
import type { IAuthService, IAuthController } from "../modules/auth/auth.types.js";
import type { ISettingsService, ISettingsController } from "../modules/settings/settings.types.js";
import type { IPlayerService, IPlayerController } from "../modules/players/player.types.js";
import type { ITeamService, ITeamController } from "../modules/teams/team.types.js";
import type { IManagerService, IManagerController } from "../modules/managers/manager.types.js";
import type { ISponsorService, ISponsorController } from "../modules/sponsors/sponsor.types.js";
import type { IMatchService, IMatchController } from "../modules/matches/match.types.js";
import type { IStatisticsService, IStatisticsController } from "../modules/statistics/statistics.types.js";
import type { IAuctionService, IAuctionController } from "../modules/auction/auction.types.js";
import type { IUploadService, IUploadController } from "../modules/uploads/upload.types.js";

interface ServiceContainer {
  users: IUserService;
  auth: IAuthService;
  settings: ISettingsService;
  players: IPlayerService;
  teams: ITeamService;
  managers: IManagerService;
  sponsors: ISponsorService;
  matches: IMatchService;
  statistics: IStatisticsService;
  auction: IAuctionService;
  uploads: IUploadService;
}

interface ControllerContainer {
  auth: IAuthController;
  settings: ISettingsController;
  players: IPlayerController;
  teams: ITeamController;
  managers: IManagerController;
  sponsors: ISponsorController;
  matches: IMatchController;
  statistics: IStatisticsController;
  auction: IAuctionController;
  upload: IUploadController;
}

// Repositories are constructed once and shared through the application composition root.
const userRepository = new UserRepository();
const settingsRepository = new SettingsRepository();
const playerRepository = new PlayerRepository();
const teamRepository = new TeamRepository();
const managerRepository = new ManagerRepository();
const sponsorRepository = new SponsorRepository();
const matchRepository = new MatchRepository();
const statisticsRepository = new StatisticsRepository();

// Services receive repository/service contracts, not Express request objects.
const settingsService = new SettingsService(settingsRepository);
const userService = new UserService(userRepository);
const authService = new AuthService(userRepository);
const playerService = new PlayerService(playerRepository, teamRepository, settingsService);
const teamService = new TeamService(teamRepository, playerRepository, settingsService);
const managerService = new ManagerService(managerRepository, teamRepository);
const sponsorService = new SponsorService(sponsorRepository);
const matchService = new MatchService(matchRepository, teamRepository, playerRepository);
const statisticsService = new StatisticsService(
  statisticsRepository,
  settingsService,
  playerRepository,
  teamRepository,
);
const auctionService = new AuctionService(settingsService, teamRepository, playerRepository);
const uploadService = new UploadService();

export const services: ServiceContainer = {
  users: userService,
  auth: authService,
  settings: settingsService,
  players: playerService,
  teams: teamService,
  managers: managerService,
  sponsors: sponsorService,
  matches: matchService,
  statistics: statisticsService,
  auction: auctionService,
  uploads: uploadService,
};

export const controllers: ControllerContainer = {
  auth: new AuthController(services.auth),
  settings: new SettingsController(services.settings),
  players: new PlayerController(services.players),
  teams: new TeamController(services.teams, services.statistics),
  managers: new ManagerController(services.managers),
  sponsors: new SponsorController(services.sponsors),
  matches: new MatchController(services.matches),
  statistics: new StatisticsController(services.statistics),
  auction: new AuctionController(services.auction),
  upload: new UploadController(services.uploads),
};
