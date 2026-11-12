import { AppError } from "../errors/appError.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";

export function getRequiredRouteParam(
  value: string | string[] | undefined,
  parameterName: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(
      `The route parameter "${parameterName}" is missing or invalid`,
      HTTP_STATUS.BAD_REQUEST,
      "INVALID_ROUTE_PARAMETER",
    );
  }

  return value;
}
