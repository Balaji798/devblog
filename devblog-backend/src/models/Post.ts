import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  isDeleted: boolean;
  deletedAt?: Date;
  likes: string[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    likes: [{ type: String }],
    commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ isDeleted: 1, createdAt: -1 });

export default mongoose.model<IPost>("Post", PostSchema);
