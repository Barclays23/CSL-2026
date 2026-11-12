import type { ErrorRequestHandler, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/appError.js";
import { HTTP_STATUS } from "../shared/constants/http-status.constants.js";
import type { ApiErrorResponse } from "../shared/responses/response.types.js";

function sendApiError(
  response: Response,
  statusCode: number,
  payload: ApiErrorResponse,
): void {
  response.status(statusCode).json(payload);
}

function mapZodIssuesToFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const fieldPath = issue.path.join(".");
    if (fieldPath && fieldErrors[fieldPath] === undefined) {
      fieldErrors[fieldPath] = issue.message;
    }
  }
  return fieldErrors;
}

function mapMongooseValidationErrors(error: mongoose.Error.ValidationError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const [fieldName, validationError] of Object.entries(error.errors)) {
    fieldErrors[fieldName] = validationError.message;
  }
  return fieldErrors;
}

export const errorMiddleware: ErrorRequestHandler = (error: unknown, _request, response, _next): void => {
  if (error instanceof AppError) {
    const payload: ApiErrorResponse = {
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    };
    sendApiError(response, error.statusCode, payload);
    return;
  }

  if (error instanceof ZodError) {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      fieldErrors: mapZodIssuesToFieldErrors(error),
    };
    sendApiError(response, HTTP_STATUS.BAD_REQUEST, payload);
    return;
  }

  if (error instanceof multer.MulterError) {
    const tooLarge: boolean = error.code === "LIMIT_FILE_SIZE";
    const payload: ApiErrorResponse = {
      success: false,
      message: tooLarge ? "Image exceeds the upload size limit" : error.message,
      errorCode: error.code,
    };
    sendApiError(response, tooLarge ? HTTP_STATUS.PAYLOAD_TOO_LARGE : HTTP_STATUS.BAD_REQUEST, payload);
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Database validation failed",
      errorCode: "VALIDATION_ERROR",
      fieldErrors: mapMongooseValidationErrors(error),
    };
    sendApiError(response, 400, payload);
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    sendApiError(response, 400, {
      success: false,
      message: "Invalid identifier or value",
      errorCode: "INVALID_VALUE",
    });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    sendApiError(response, HTTP_STATUS.CONFLICT, {
      success: false,
      message: "A record with this value already exists",
      errorCode: "DUPLICATE_VALUE",
    });
    return;
  }

  if (error instanceof Error && error.message === "Only JPG, PNG, WEBP or AVIF images are allowed") {
    sendApiError(response, 400, {
      success: false,
      message: error.message,
      errorCode: "INVALID_IMAGE",
    });
    return;
  }

  console.error("[API_ERROR]", error);
  sendApiError(response, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    success: false,
    message: "An unexpected server error occurred",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
