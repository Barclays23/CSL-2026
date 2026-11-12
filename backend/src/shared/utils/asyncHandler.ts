import type { Request, Response, NextFunction, RequestHandler } from "express";

export type AsyncControllerHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export const asyncHandler = (handler: AsyncControllerHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
