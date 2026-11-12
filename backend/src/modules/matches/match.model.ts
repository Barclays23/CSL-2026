import { Schema, model, type InferSchemaType } from "mongoose";
const goalSchema = new Schema({
  scoringTeamRef:{type:Schema.Types.ObjectId,ref:"Team",required:true},
  goalType:{type:String,enum:["normal","own_goal"],required:true},
  scorerRef:{type:Schema.Types.ObjectId,ref:"Player",default:null},
  ownGoalPlayerRef:{type:Schema.Types.ObjectId,ref:"Player",default:null}
},{timestamps:{createdAt:true,updatedAt:false}});
const shootoutSchema = new Schema({
  team1Score:{type:Number,required:true,min:0},
  team2Score:{type:Number,required:true,min:0}
},{_id:false});
const matchSchema = new Schema({
  matchNo:{type:String,required:true,unique:true,trim:true},
  stage:{type:String,enum:["group","quarter_final","semi_final","final"],required:true},
  groupName:{type:String,default:null,trim:true},
  kickoffAt:{type:Date,required:true},
  venue:{type:String,default:null,trim:true},
  team1Ref:{type:Schema.Types.ObjectId,ref:"Team",required:true},
  team2Ref:{type:Schema.Types.ObjectId,ref:"Team",required:true},
  status:{type:String,enum:["scheduled","live","completed","postponed","cancelled"],default:"scheduled"},
  goals:{type:[goalSchema],default:[]},
  penaltyShootout:{type:shootoutSchema,default:null},
  notes:{type:String,default:null,trim:true}
},{timestamps:true});
matchSchema.index({status:1,kickoffAt:1});
matchSchema.index({stage:1,groupName:1});
matchSchema.index({team1Ref:1,team2Ref:1});
export type MatchRecord = InferSchemaType<typeof matchSchema>;
export const MatchModel = model("Match",matchSchema);
