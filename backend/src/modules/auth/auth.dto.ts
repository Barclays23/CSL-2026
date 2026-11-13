import type { AdminUserDTO } from "../users/user.types.js";


/** Validated administrator login payload. */
export interface LoginDto {
  identifier: string;
  password: string;
}
export type LoginInput = LoginDto;
export type LoginCredentials = LoginDto;


export interface AuthSessionDTO {
  token: string;
  user: AdminUserDTO;
}
