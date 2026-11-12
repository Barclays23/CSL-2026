import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/env.config.js";
import { UserRepository } from "../modules/users/user.repository.js";
import type { JwtAdminPayload } from "../modules/auth/auth.types.js";

const userRepository = new UserRepository();

function isAdministratorTokenPayload(payload: string | jwt.JwtPayload): payload is jwt.JwtPayload & JwtAdminPayload {
  return typeof payload !== "string"
    && typeof payload.sub === "string"
    && typeof payload.email === "string"
    && payload.role === "admin";
}

export const optionalAuthenticate: RequestHandler = async (request, _response, next) => {
  const token: unknown = request.cookies?.csl_token;
  if (typeof token !== "string" || token.length === 0) {
    next();
    return;
  }

  let decodedToken: string | jwt.JwtPayload;
  try {
    decodedToken = jwt.verify(token, appConfig.JWT_SECRET);
  } catch {
    next();
    return;
  }

  if (!isAdministratorTokenPayload(decodedToken)) {
    next();
    return;
  }

  try {
    const administrator = await userRepository.findUserById(decodedToken.sub);
    // Blocked or deleted administrators are treated as public visitors on read-only routes.
    if (administrator && administrator.status === "active" && administrator.role === "admin") {
      request.user = {
        id: String(administrator._id),
        role: administrator.role,
        email: administrator.email,
      };
    }
    next();
  } catch (error: unknown) {
    next(error);
  }
};
