import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  API_PREFIX: z.string().default("/api").transform((value) => {
    const normalizedPrefix = value.startsWith("/") ? value : "/" + value;
    return normalizedPrefix.replace(/\/+$/, "");
  }),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: z.url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),
  JWT_EXPIRES_IN: z.enum(["15m", "30m", "1h", "1d", "7d"]).default("1d"),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  ADMIN_NAME: z.string().default("CSL Administrator"),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().trim().min(1).default("csl-2026"),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().max(25).default(5),
});


export const appConfig = envSchema.parse(process.env);
export type AppConfig = z.infer<typeof envSchema>;