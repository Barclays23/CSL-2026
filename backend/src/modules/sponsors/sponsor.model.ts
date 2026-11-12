import { Schema, model, type InferSchemaType } from "mongoose";
const assetSchema = new Schema({url:{type:String,required:true},publicId:{type:String,required:true}},{_id:false});
const sponsorSchema = new Schema({
  name:{type:String,required:true,trim:true},
  logo:{type:assetSchema,default:null},
  tier:{type:String,default:null,trim:true},
  website:{type:String,default:null,trim:true},
  contactPerson:{type:String,default:null,select:false},
  contactMobile:{type:String,default:null,select:false},
  status:{type:String,enum:["active","inactive"],default:"active"},
  notes:{type:String,default:null,select:false}
},{timestamps:true});
export type SponsorRecord = InferSchemaType<typeof sponsorSchema>;
export const SponsorModel = model("Sponsor",sponsorSchema);
