import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: "LIKE" | "COMMENT";
  post: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["LIKE", "COMMENT"], required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Optimize sequential fetch capabilities explicitly against target consumers
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
