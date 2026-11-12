export interface StandingRow {
  position:number;team:unknown;played:number;won:number;drawn:number;lost:number;
  goalsFor:number;goalsAgainst:number;goalDifference:number;points:number;qualified:boolean;
}
export interface GroupStanding {groupName:string;rows:StandingRow[];}
export interface TopScorerDTO {rank:number;player:unknown;team:unknown|null;goals:number;}
