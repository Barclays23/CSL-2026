/** Validated administrator login payload. */
export interface LoginDto {
  email: string;
  password: string;
}
export type LoginInput = LoginDto;

import type { AdminUserDTO } from "../users/user.types.js";

export interface AuthSessionDTO {
  token: string;
  user: AdminUserDTO;
}

export type LoginCredentials = LoginDto;
