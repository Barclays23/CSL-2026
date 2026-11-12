import { z } from "zod";

export const nameBase = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be 80 characters or fewer");

export const emailBase = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email address")
  .transform((value) => (value === "" ? null : value));

export const mobileBase = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => /^(?:\+91)?[6-9]\d{9}$/.test(value),
    "Enter a valid mobile number, for example 9847012345",
  )
  .transform((value) => (value.startsWith("+91") ? value.slice(3) : value));

export const optionalMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => value === "" || /^(?:\+91)?[6-9]\d{9}$/.test(value),
    "Enter a valid mobile number",
  )
  .transform((value) => {
    if (!value) return null;
    return value.startsWith("+91") ? value.slice(3) : value;
  });

export const passwordBase = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");

export const teamNameBase = z
  .string()
  .trim()
  .min(2, "Team name must be at least 2 characters")
  .max(60, "Team name must be 60 characters or fewer");

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
    return typeof value === "number" ? value : Number(value);
  })
  .refine((value) => value === null || (Number.isInteger(value) && value >= 1 && value <= 99), {
    message: "Jersey number must be a whole number from 1 to 99",
  });

export const auctionPriceBase = z.coerce
  .number({ error: "Enter a price in rupees" })
  .min(0, "Price cannot be negative")
  .max(100000, "Price is too large");

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

export const PHOTO_MAX_BYTES = 1_500_000;
export const PHOTO_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export function validatePhotoFile(file: File) {
  if (!PHOTO_MIME.includes(file.type)) return "Use a JPG, PNG, WEBP or SVG image";
  if (file.size > PHOTO_MAX_BYTES) return "Image must be 1.5 MB or smaller";
  return null;
}
