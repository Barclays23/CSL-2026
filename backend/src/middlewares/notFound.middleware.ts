import type { RequestHandler } from "express";
import { HTTP_STATUS } from "../shared/constants/http-status.constants.js";
import type { ApiErrorResponse } from "../shared/responses/response.types.js";

export const notFoundMiddleware: RequestHandler = (request, response): void => {
  const payload: ApiErrorResponse = {
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
    errorCode: "ROUTE_NOT_FOUND",
  };
  response.status(HTTP_STATUS.NOT_FOUND).json(payload);
};
