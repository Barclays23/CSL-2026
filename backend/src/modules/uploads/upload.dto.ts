import { z } from "zod";

export const uploadPurposeSchema = z.enum([
  "user-profile",
  "player-profile",
  "team-logo",
  "team-poster",
  "manager-profile",
  "sponsor-logo",
]);

export const imageUploadSchema = z.object({
  purpose: uploadPurposeSchema,
}).strict();

export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
