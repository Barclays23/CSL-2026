// backend/src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appConfig } from "../../config/env.config.js";
import { AppError } from "../../shared/errors/appError.js";
import type { IUserRepository } from "../users/user.interfaces.js";
import type { UserEntity } from "../users/user.types.js";
import type { AdminUserDTO } from "../users/user.dto.js";
import type { IAuthService } from "./auth.interfaces.js";
import type { AuthSessionDTO, LoginCredentials } from "./auth.types.js";



type ParsedIdentifier =
  | { type: "email"; value: string }
  | { type: "mobile"; value: string }
  | { type: "username"; value: string };




export class AuthService implements IAuthService {
   constructor(private readonly _userRepository: IUserRepository) {}

   async login(credentials: LoginCredentials): Promise<AuthSessionDTO> {
      const rawIdentifier = credentials.identifier?.trim();
      const password = credentials.password;

      if (!rawIdentifier || !password) {
         throw new AppError("Credentials and password are required", 400, "VALIDATION_ERROR");
      }

      const parsed = this.parseIdentifier(rawIdentifier);
      const user = await this.findUserByIdentifier(parsed);

      if (!user) {
         const labelMap: Record<ParsedIdentifier["type"], string> = {
         email: "email address",
         mobile: "mobile number",
         username: "username",
         };
         throw new AppError(
         `No account found with this ${labelMap[parsed.type]}`,
         404,
         "USER_NOT_FOUND"
         );
      }

      if (user.status !== "active") {
         throw new AppError(
         "Your account is inactive. Please contact an administrator",
         403,
         "ACCOUNT_INACTIVE"
         );
      }

      if (user.role !== "admin") {
         throw new AppError(
         "Access denied. Administrator privileges required",
         403,
         "FORBIDDEN"
         );
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
         throw new AppError("Incorrect password", 401, "INVALID_CREDENTIALS");
      }

      const token = jwt.sign(
         { role: user.role, email: user.email },
         appConfig.JWT_SECRET,
         {
         subject: String(user._id),
         expiresIn: appConfig.JWT_EXPIRES_IN,
         }
      );

      return {
         token,
         user: this.toAdminUserDTO(user),
      };
   }

   async getCurrentAdmin(userId: string): Promise<AdminUserDTO> {
      if (!userId?.trim()) {
         throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
      }

      const user = await this._userRepository.findUserById(userId);
      if (!user) {
         throw new AppError("Administrator account not found", 404, "USER_NOT_FOUND");
      }
      if (user.status !== "active") {
         throw new AppError("Administrator account is inactive", 403, "ACCOUNT_INACTIVE");
      }
      if (user.role !== "admin") {
         throw new AppError("Administrator privileges required", 403, "FORBIDDEN");
      }

      return this.toAdminUserDTO(user);
   }

   private parseIdentifier(raw: string): ParsedIdentifier {
      if (raw.includes("@")) {
         return { type: "email", value: raw.toLowerCase() };
      }

      const compactPhone = raw.replace(/[\s()-]/g, "");
      if (/^(?:\+91)?[6-9]\d{9}$/.test(compactPhone)) {
         const normalizedMobile = compactPhone.startsWith("+91")
         ? compactPhone.slice(3)
         : compactPhone;
         return { type: "mobile", value: normalizedMobile };
      }

      return { type: "username", value: raw.toLowerCase() };
   }

   private async findUserByIdentifier(parsed: ParsedIdentifier): Promise<UserEntity | null> {
      switch (parsed.type) {
         case "email":
         return this._userRepository.findUserByEmail(parsed.value);
         case "mobile":
         return this._userRepository.findUserByMobile(parsed.value);
         case "username":
         return this._userRepository.findUserByUsername(parsed.value);
      }
   }

   private toAdminUserDTO(user: {
      _id: unknown;
      name: string;
      email: string;
      mobile: string;
      username?: string;
      role: AdminUserDTO["role"];
      status: AdminUserDTO["status"];
   }): AdminUserDTO {
      return {
         _id: String(user._id),
         name: user.name,
         email: user.email,
         mobile: user.mobile,
         ...(user.username ? { username: user.username } : {}),
         role: user.role,
         status: user.status,
      };
   }
}