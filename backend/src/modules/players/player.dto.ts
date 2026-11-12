import { z } from "zod";
const optionalEmail=z.union([z.email(),z.literal(""),z.null()]).optional().transform(v=>typeof v==="string"&&v.trim()?v.trim().toLowerCase():null);
const asset=z.object({url:z.url(),publicId:z.string().min(1)});
export const playerCreateSchema=z.object({
  name:z.string().trim().min(2).max(80),mobile:z.string().trim().min(7).max(20),email:optionalEmail,
  dateOfBirth:z.coerce.date().nullable().optional(),position:z.enum(["GK","DF","MF","FW"]),
  isIconPlayer:z.boolean().default(false),teamRef:z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  jerseyNo:z.coerce.number().int().min(1).nullable().optional(),auctionPrice:z.coerce.number().min(0).default(0),
  auctionStatus:z.enum(["pending","sold","unsold"]).default("pending"),status:z.enum(["active","inactive"]).default("active"),
  profilePic:asset.nullable().optional()
}).strict().superRefine((v,ctx)=>{if(v.dateOfBirth&&v.dateOfBirth>new Date())ctx.addIssue({code:"custom",path:["dateOfBirth"],message:"Date of birth cannot be in the future"});});
export const playerUpdateSchema=playerCreateSchema.partial().strict().superRefine((v,ctx)=>{if(v.dateOfBirth&&v.dateOfBirth>new Date())ctx.addIssue({code:"custom",path:["dateOfBirth"],message:"Date of birth cannot be in the future"});});
const optionalFilter=<T extends string>(values:readonly [T,...T[]])=>z.union([z.enum(values),z.literal("")]).optional().transform(v=>v||undefined);
export const playerQuerySchema=z.object({
  page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(10),
  search:z.string().trim().optional(),
  position:optionalFilter(["GK","DF","MF","FW"]),
  status:optionalFilter(["active","inactive"]),
  auctionStatus:optionalFilter(["pending","sold","unsold"]),
  teamRef:z.union([z.string().regex(/^[a-f\d]{24}$/i),z.literal("unassigned"),z.literal("")]).optional().transform(v=>v||undefined)
});
export type PlayerCreateInput=z.infer<typeof playerCreateSchema>;
export type PlayerUpdateInput=z.infer<typeof playerUpdateSchema>;
export type PlayerQueryInput=z.infer<typeof playerQuerySchema>;
