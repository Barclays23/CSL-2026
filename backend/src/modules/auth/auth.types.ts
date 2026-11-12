export interface LoginCredentials {
  email:string;
  password:string;
}
export interface JwtAdminPayload {
  sub:string;
  email:string;
  role:"admin";
}
