import mongoose, { Schema, Document } from "mongoose";
import { IPost } from "./Post";
import { IUser } from "./User";

export interface IComment extends Document {
  content: string;
  post: mongoose.Types.ObjectId | IPost;
  author: mongoose.Types.ObjectId | IUser;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model<IComment>("Comment", CommentSchema);
