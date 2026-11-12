export const TOURNAMENT_DEFAULTS={
  singletonKey:"CSL_CURRENT",
  maxActivePlayers:54,
  maxActiveTeams:6,
  maxPlayersPerTeam:9,
  auctionBudgetPerTeam:10000,
  requiredIconPlayers:1,
  requiredGoalkeepers:1,
  pointsRule:{win:3,draw:1,loss:0}
} as const;
export const PLAYER_POSITIONS=["GK","DF","MF","FW"] as const;
export const AUCTION_STATUSES=["pending","sold","unsold"] as const;
export const MATCH_STAGES=["group","quarter_final","semi_final","final"] as const;
export const MATCH_STATUSES=["scheduled","live","completed","postponed","cancelled"] as const;
