/** Input contract for creating the initial administrator account. */
export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
}
export type AdminUserCreateInput = CreateAdminUserDto;
