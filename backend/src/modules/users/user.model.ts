// backend/src/modules/users/user.model.ts
import { Schema, model } from "mongoose";
import type { UserFields } from "./user.types.js";


const userSchema = new Schema<UserFields>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
    mobile: { type: String, unique: true, sparse: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin"], default: "admin", required: true },
    status: { type: String, enum: ["active", "blocked"], default: "active", required: true },
  },
  { timestamps: true }
);

export type UserRecord = UserFields;
export const UserModel = model<UserFields>("User", userSchema);