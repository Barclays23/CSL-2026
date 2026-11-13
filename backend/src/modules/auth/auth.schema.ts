// backend/src/modules/auth/auth.schema.ts
import { z } from "zod";



// move to schema.constants.ts file
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^(?:\+91)?[6-9]\d{9}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;



export const loginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, "Email, mobile number, or username is required")
      .refine(
        (val) => {
          const compact = val.replace(/[\s()-]/g, "");
          return emailRegex.test(val) || mobileRegex.test(compact) || usernameRegex.test(val);
        },
        { message: "Enter a valid email address, mobile number, or username" }
      ),
    password: z.string().min(1, "Password is required"),
  })
  .strict();