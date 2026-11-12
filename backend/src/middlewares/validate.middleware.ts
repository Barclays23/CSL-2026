import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export type ValidationSource = "body" | "query" | "params";

export const validate = (
  schema: ZodType,
  source: ValidationSource = "body",
): RequestHandler => (request, response, next) => {
  const validationResult = schema.safeParse(request[source]);
  if (!validationResult.success) {
    next(validationResult.error);
    return;
  }

  if (source === "body") {
    request.body = validationResult.data;
  } else if (source === "params") {
    if (typeof validationResult.data === "object" && validationResult.data !== null) {
      for (const [parameterName, parameterValue] of Object.entries(validationResult.data)) {
        if (typeof parameterValue === "string") request.params[parameterName] = parameterValue;
      }
    }
  } else {
    response.locals.validatedQuery = validationResult.data;
  }

  next();
};
