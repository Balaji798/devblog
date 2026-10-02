import { PostRepository } from "../repositories/PostRepository";
import { generateSlug } from "../utils/helpers";
import Notification from "../models/Notification";
import { emitNotification } from "../socket";

const postRepo = new PostRepository();

export class PostService {
  static async getPosts(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};
    return postRepo.findActivePaginated(query, skip, limit);
  }

  static async getPostBySlug(slug: string) {
    const post = await postRepo.findBySlug(slug);
    if (!post) throw new Error("Post not found");
    return post;
  }

  static async createPost(title: string, content: string, authorId: string) {
    const slug = generateSlug(title);
    return postRepo.create({ title, content, slug, author: authorId as any });
  }

  static async updatePost(
    id: string,
    title: string,
    content: string,
    userId: string,
    userRole: string,
  ) {
    const post = await postRepo.findById(id);
    if (!post || post.isDeleted) throw new Error("Post not found");

    if (post.author.toString() !== userId && userRole !== "ADMIN") {
      throw new Error("Forbidden: You can only edit your own posts");
    }

    const updates: any = { content };
    if (title && title !== post.title) {
      updates.title = title;
      updates.slug = generateSlug(title);
    }

    return postRepo.update(id, updates);
  }

  static async deletePost(id: string, userId: string, userRole: string) {
    const post = await postRepo.findById(id);
    if (!post || post.isDeleted) throw new Error("Post not found");

    if (post.author.toString() !== userId && userRole !== "ADMIN") {
      throw new Error("Forbidden: You can only delete your own posts");
    }

    // Architecture: Soft delete post. Do not physically delete its comments.
    return postRepo.softDelete(id);
  }

  static async toggleLike(id: string, userId: string) {
    const post = await postRepo.findById(id);
    if (!post || post.isDeleted) throw new Error("Post not found");

    // Explicit runtime check for like versus unlike
    const hasLiked = post.likes?.includes(userId as any);
    const updatedPost = await postRepo.toggleLike(id, userId);

    if (!hasLiked && post.author.toString() !== userId) {
      // Persist the real-time event
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "LIKE",
        post: id,
      });
      await notification.populate("sender", "name avatarIndex");
      await notification.populate("post", "title slug");

      // Dispatch target specific live signal
      emitNotification(post.author.toString(), notification);
    }

    return updatedPost;
  }
}
