/** Validated administrator login payload. */
export interface LoginDto {
  email: string;
  password: string;
}
export type LoginInput = LoginDto;
