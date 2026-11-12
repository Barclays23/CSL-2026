import { Schema, model, type InferSchemaType } from "mongoose";
const userSchema = new Schema({
  name:{type:String,required:true,trim:true},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},
  passwordHash:{type:String,required:true,select:false},
  role:{type:String,enum:["admin"],default:"admin",required:true},
  status:{type:String,enum:["active","blocked"],default:"active",required:true}
},{timestamps:true});
export type UserRecord = InferSchemaType<typeof userSchema>;
export const UserModel = model("User",userSchema);
