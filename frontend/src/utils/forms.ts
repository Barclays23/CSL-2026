import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/utils/errorHandler";

export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (!(error instanceof ApiError) || !error.fieldErrors) return;
  for (const [key, message] of Object.entries(error.fieldErrors)) {
    setError(key as Path<T>, { message });
  }
}

type AdminVariant<T> = Extract<T, { mobile: string }> extends never
  ? T & { mobile: string }
  : Extract<T, { mobile: string }>;

export function isAdminRecord<T extends object>(record: T): record is AdminVariant<T> {
  return "mobile" in record && typeof record.mobile === "string";
}