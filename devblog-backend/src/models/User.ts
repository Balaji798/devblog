import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  role: "USER" | "ADMIN";
  avatarIndex: number;
  isActive: boolean;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    facebookId: { type: String, sparse: true, unique: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    avatarIndex: {
      type: Number,
      required: true,
      default: () => Math.floor(Math.random() * 4),
    },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User", UserSchema);
