import { Schema, model, type InferSchemaType } from "mongoose";
const assetSchema = new Schema({url:{type:String,required:true},publicId:{type:String,required:true}},{_id:false});
const managerSchema = new Schema({
  name:{type:String,required:true,trim:true},
  mobile:{type:String,required:true,trim:true,unique:true},
  email:{type:String,default:null,lowercase:true,trim:true},
  dateOfBirth:{type:Date,default:null},
  teamRef:{type:Schema.Types.ObjectId,ref:"Team",default:null},
  role:{type:String,default:null,trim:true},
  profilePic:{type:assetSchema,default:null},
  status:{type:String,enum:["active","inactive"],default:"active"}
},{timestamps:true});
managerSchema.index({email:1},{unique:true,partialFilterExpression:{email:{$type:"string"}}});
export type ManagerRecord = InferSchemaType<typeof managerSchema>;
export const ManagerModel = model("Manager",managerSchema);
