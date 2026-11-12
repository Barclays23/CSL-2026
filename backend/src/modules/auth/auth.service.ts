import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config.js";
import { AppError } from "../../shared/errors/appError.js";
import { UserRepository } from "../users/user.repository.js";
export class AuthService {
  constructor(private readonly _userRepo:UserRepository){}
  async login(email:string,password:string){
    const user=await this._userRepo.findByEmail(email);
    if(!user || user.status!=="active" || !(await bcrypt.compare(password,String(user.passwordHash))))
      throw new AppError("Invalid email or password",401,"INVALID_CREDENTIALS");
    const token=jwt.sign({role:"admin",email:user.email},env.JWT_SECRET,{subject:String(user._id),expiresIn:env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]});
    return {token,user:{_id:String(user._id),name:user.name,email:user.email,role:"admin" as const,status:user.status}};
  }
  async me(id:string){
    const user=await this._userRepo.findById(id);
    if(!user || user.status!=="active") throw new AppError("Administrator not found",401,"UNAUTHENTICATED");
    return {_id:String(user._id),name:user.name,email:user.email,role:"admin" as const,status:user.status};
  }
}
