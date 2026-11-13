// frontend/src/schemas/common.schema.ts
import { z } from "zod";
import {
  PHOTO_MAX_BYTES,
  PHOTO_MIME_TYPES,
  PHOTO_VALIDATION_MESSAGES,
  type SupportedPhotoMimeType,
} from "@/constants/file.constants";

export const nameBase = z
  .string()
  .trim()
  .min(1, "Name is required")
  .min(3, "Name must be at least 3 characters")
  .max(40, "Name cannot exceed 40 characters")
  .regex(
    /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
    "Name can contain only letters and single spaces"
  );

export const teamNameBase = z
  .string()
  .trim()
  .min(1, "Team name is required")
  .min(2, "Team name must be at least 2 characters")
  .max(60, "Team name cannot exceed 60 characters")
  .regex(
    /^[A-Za-z0-9]+(?:\s[A-Za-z0-9]+)*$/,
    "Team name can contain only letters, numbers, and single spaces"
  );

export const emailBase = z
  .string()
  .trim()
  .min(1, "Email is required")
  .toLowerCase()
  .email("Enter a valid email address");

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid email address"
  )
  .transform((value) => (value === "" ? null : value));

export const mobileBase = z
  .string()
  .trim()
  .min(1, "Mobile number is required")
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .superRefine((val, ctx) => {
    const digitsOnly = val.startsWith("+91") ? val.slice(3) : val;

    if (!/^\d+$/.test(digitsOnly)) {
      ctx.addIssue({
        code: "custom",
        message: "Mobile number must contain digits only",
      });
      return;
    }

    if (digitsOnly.length !== 10) {
      ctx.addIssue({
        code: "custom",
        message: "Mobile number must be exactly 10 digits",
      });
      return;
    }

    if (!/^[6-9]/.test(digitsOnly)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid Indian mobile number starting with 6, 7, 8, or 9",
      });
    }
  })
  .transform((value) => (value.startsWith("+91") ? value.slice(3) : value));

export const optionalMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .superRefine((val, ctx) => {
    if (!val) return;
    const digitsOnly = val.startsWith("+91") ? val.slice(3) : val;

    if (!/^\d+$/.test(digitsOnly)) {
      ctx.addIssue({
        code: "custom",
        message: "Mobile number must contain digits only",
      });
      return;
    }

    if (digitsOnly.length !== 10) {
      ctx.addIssue({
        code: "custom",
        message: "Mobile number must be exactly 10 digits",
      });
      return;
    }

    if (!/^[6-9]/.test(digitsOnly)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid Indian mobile number starting with 6, 7, 8, or 9",
      });
    }
  })
  .transform((value) => {
    if (!value) return null;
    return value.startsWith("+91") ? value.slice(3) : value;
  });

export const passwordBase = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/\d/, "Include at least one number");

export const optionalDate = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
  }, "Date of birth cannot be in the future")
  .transform((value) => (value ? value : null));

export const requiredDate = z
  .string()
  .trim()
  .min(1, "Date is required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date");

export const jerseyNoBase = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? NaN : parsed;
  })
  .refine(
    (value) =>
      value === null ||
      (Number.isInteger(value) && value >= 1 && value <= 99),
    "Jersey number must be a whole number from 1 to 99"
  );

export const auctionPriceBase = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === "" || value === null || value === undefined) return 0;
    return typeof value === "number" ? value : Number(value);
  })
  .refine((value) => !Number.isNaN(value), "Enter a valid price in rupees")
  .refine((value) => value >= 0, "Auction price cannot be negative")
  .refine((value) => value <= 100000, "Auction price cannot exceed ₹1,00,000");

export const optionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid website URL")
  .transform((value) => (value ? value : null));

export function validatePhotoFile(file: File): string | null {
  if (!PHOTO_MIME_TYPES.includes(file.type as SupportedPhotoMimeType)) {
    return PHOTO_VALIDATION_MESSAGES.INVALID_TYPE;
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return PHOTO_VALIDATION_MESSAGES.FILE_TOO_LARGE;
  }
  return null;
}