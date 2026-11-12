import { Schema, model, type InferSchemaType } from "mongoose";
const assetSchema = new Schema({url:{type:String,required:true},publicId:{type:String,required:true}},{_id:false});
const playerSchema = new Schema({
  name:{type:String,required:true,trim:true,minlength:2,maxlength:80},
  mobile:{type:String,required:true,trim:true,unique:true},
  email:{type:String,default:null,lowercase:true,trim:true},
  dateOfBirth:{type:Date,default:null},
  position:{type:String,enum:["GK","DF","MF","FW"],required:true},
  isIconPlayer:{type:Boolean,default:false},
  teamRef:{type:Schema.Types.ObjectId,ref:"Team",default:null},
  jerseyNo:{type:Number,default:null,min:1},
  auctionPrice:{type:Number,default:0,min:0},
  auctionStatus:{type:String,enum:["pending","sold","unsold"],default:"pending"},
  status:{type:String,enum:["active","inactive"],default:"active"},
  profilePic:{type:assetSchema,default:null}
},{timestamps:true});
playerSchema.index({email:1},{unique:true,partialFilterExpression:{email:{$type:"string"}}});
playerSchema.index({teamRef:1,jerseyNo:1},{unique:true,partialFilterExpression:{teamRef:{$type:"objectId"},jerseyNo:{$type:"number"}}});
playerSchema.index({teamRef:1,status:1,auctionStatus:1});
export type PlayerRecord = InferSchemaType<typeof playerSchema>;
export const PlayerModel = model("Player",playerSchema);
