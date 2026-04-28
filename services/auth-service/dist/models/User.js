import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    role: { type: String, required: true, enum: ["RIDER", "DRIVER", "ADMIN"] },
    name: { type: String, required: true },
    email: { type: String, index: true, sparse: true },
    phone: { type: String, index: true, sparse: true },
    passwordHash: { type: String, required: true }
}, { timestamps: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
export const UserModel = mongoose.model("User", UserSchema);
