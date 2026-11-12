import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/appError.js";

export const errorMiddleware: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errorCode ? { errorCode: error.errorCode } : {}),
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    });
    return;
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const field = issue.path.join(".");
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
    });
    return;
  }

  console.error("[API_ERROR]", error);
  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
