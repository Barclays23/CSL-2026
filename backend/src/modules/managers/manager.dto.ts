import { z } from "zod";
const email=z.union([z.email(),z.literal(""),z.null()]).optional().transform(v=>typeof v==="string"&&v.trim()?v.trim().toLowerCase():null);
const dateOfBirth=z.coerce.date().nullable().optional().refine(v=>!v||v<=new Date(),"Date of birth cannot be in the future");
export const managerCreateSchema=z.object({
  name:z.string().trim().min(2).max(80),mobile:z.string().trim().min(7).max(20),email,
  dateOfBirth,
  teamRef:z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  role:z.string().trim().max(40).nullable().optional(),
  profilePic:z.object({url:z.url(),publicId:z.string()}).nullable().optional(),
  status:z.enum(["active","inactive"]).default("active")
}).strict();
export const managerUpdateSchema=managerCreateSchema.partial().strict();
