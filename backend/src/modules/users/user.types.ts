export type UserStatus="active"|"blocked";
export interface UserFields {
  name:string;
  email:string;
  passwordHash:string;
  role:"admin";
  status:UserStatus;
}
export interface AdminUserDTO {
  _id:string;
  name:string;
  email:string;
  role:"admin";
  status:UserStatus;
}
