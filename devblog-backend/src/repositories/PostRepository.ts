import { BaseRepository } from "./BaseRepository";
import Post, { IPost } from "../models/Post";
import { FilterQuery } from "mongoose";

export class PostRepository extends BaseRepository<IPost> {
  constructor() {
    super(Post);
  }

  // Soft delete wrapper
  async softDelete(id: string): Promise<IPost | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    );
  }

  // Fetch paginated with populated author, excluding soft deleted explicitly
  async findActivePaginated(
    query: FilterQuery<IPost>,
    skip: number,
    limit: number,
  ) {
    const q = { ...query, isDeleted: false };
    const [posts, total] = await Promise.all([
      this.model
        .find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email role avatarIndex"),
      this.model.countDocuments(q),
    ]);
    return { posts, total };
  }

  async findBySlug(slug: string): Promise<IPost | null> {
    return this.model
      .findOne({ slug, isDeleted: false })
      .populate("author", "name email role avatarIndex");
  }

  async findByIdWithAuthor(id: string): Promise<IPost | null> {
    return this.model
      .findById(id)
      .populate("author", "name email role avatarIndex");
  }

  async toggleLike(postId: string, userId: string): Promise<IPost | null> {
    const post = await this.model.findById(postId);
    if (!post) return null;

    // We use string IDs for likes array natively to prevent complex population constraints
    const hasLiked = (post.likes || []).includes(userId as any);

    if (hasLiked) {
      return this.model.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } as any },
        { new: true },
      );
    } else {
      return this.model.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } as any },
        { new: true },
      );
    }
  }

  async incrementCommentCount(postId: string, amount: number) {
    return this.model.findByIdAndUpdate(postId, {
      $inc: { commentCount: amount },
    });
  }
}
