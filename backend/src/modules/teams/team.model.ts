import { Schema, model, type InferSchemaType } from "mongoose";
const assetSchema = new Schema({url:{type:String,required:true},publicId:{type:String,required:true}},{_id:false});
const teamSchema = new Schema({
  name:{type:String,required:true,trim:true,unique:true},
  shortName:{type:String,default:null,trim:true},
  logo:{type:assetSchema,default:null},
  poster:{type:assetSchema,default:null},
  groupName:{type:String,default:null,trim:true},
  status:{type:String,enum:["active","inactive"],default:"active"}
},{timestamps:true});
export type TeamRecord = InferSchemaType<typeof teamSchema>;
export const TeamModel = model("Team",teamSchema);
