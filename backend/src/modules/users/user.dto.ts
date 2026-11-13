/** Input contract for creating the initial administrator account. */
export interface CreateAdminUserRequestDto {
  name: string;
  email: string;
  mobile: string;
  username?: string;
  password: string;
}

export type AdminUserCreateInput = CreateAdminUserRequestDto;

import type { UserRole, UserStatus } from "./user.types.js";

export interface AdminUserDTO {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  username?: string;
  role: UserRole;
  status: UserStatus;
}

export type AdminUserCreateDTO = Omit<CreateAdminUserRequestDto, "password"> & {
  passwordHash: string;
};
