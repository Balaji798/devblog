import { BaseRepository } from "./BaseRepository";
import Comment, { IComment } from "../models/Comment";
import { FilterQuery } from "mongoose";

export class CommentRepository extends BaseRepository<IComment> {
  constructor() {
    super(Comment);
  }

  async softDelete(id: string): Promise<IComment | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    );
  }

  async findActiveByPostPaginated(postId: string, skip: number, limit: number) {
    const query = { post: postId as any, isDeleted: false };
    const [comments, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name role avatarIndex"),
      this.model.countDocuments(query),
    ]);
    return { comments, total };
  }

  async findByIdWithAuthor(id: string): Promise<IComment | null> {
    return this.model.findById(id).populate("author", "name role avatarIndex");
  }
}
