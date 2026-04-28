import mongoose, { Schema } from "mongoose";

export type UserRole = "RIDER" | "DRIVER" | "ADMIN";

export type UserDoc = {
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDoc>(
  {
    role: { type: String, required: true, enum: ["RIDER", "DRIVER", "ADMIN"] },
    name: { type: String, required: true },
    email: { type: String, index: true, sparse: true },
    phone: { type: String, index: true, sparse: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

export const UserModel = mongoose.model<UserDoc>("User", UserSchema);

