import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  API_PREFIX: z.string().default("/api")
    .transform((value) => (value.startsWith("/") ? value : "/" + value).replace(/\/+$/, "")),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: z.url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),
  JWT_EXPIRES_IN: z.enum(["15m", "30m", "1h", "1d", "7d"]).default("1d"),
    .transform((value) => (value.startsWith("/") ? value : "/" + value).replace(/\/+$/, "")),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  ADMIN_NAME: z.string().default("CSL Administrator"),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(10).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().max(25).default(5),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
