/** Input contract for creating the initial administrator account. */
export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
}
export type AdminUserCreateInput = CreateAdminUserDto;

import type { UserRole, UserStatus } from "./user.types.js";

export interface AdminUserDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
