import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { UserRepository } from "../modules/users/user.repository.js";
import { AppError } from "../shared/errors/appError.js";
import type { JwtAdminPayload } from "../modules/auth/auth.types.js";

const userRepository = new UserRepository();

function isAdministratorTokenPayload(payload: string | jwt.JwtPayload): payload is jwt.JwtPayload & JwtAdminPayload {
  return typeof payload !== "string"
    && typeof payload.sub === "string"
    && typeof payload.email === "string"
    && payload.role === "admin";
}

export const authenticate: RequestHandler = async (request, _response, next) => {
  const token: unknown = request.cookies?.csl_token;
  if (typeof token !== "string" || token.length === 0) {
    next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
    return;
  }

  let decodedToken: string | jwt.JwtPayload;
  try {
    decodedToken = jwt.verify(token, env.JWT_SECRET);
  } catch {
    next(new AppError("Invalid or expired session", 401, "INVALID_TOKEN"));
    return;
  }

  if (!isAdministratorTokenPayload(decodedToken)) {
    next(new AppError("Invalid administrator token", 401, "INVALID_TOKEN"));
    return;
  }

  try {
    const administrator = await userRepository.findUserById(decodedToken.sub);
    if (!administrator || administrator.status !== "active" || administrator.role !== "admin") {
      next(new AppError("Administrator account is blocked or unavailable", 403, "ADMIN_BLOCKED"));
      return;
    }

    request.user = {
      id: String(administrator._id),
      role: administrator.role,
      email: administrator.email,
    };
    next();
  } catch (error: unknown) {
    next(error);
  }
};
