import { CommentRepository } from "../repositories/CommentRepository";
import { PostRepository } from "../repositories/PostRepository";
import Notification from "../models/Notification";
import { emitNotification } from "../socket";

const commentRepo = new CommentRepository();
const postRepo = new PostRepository();

export class CommentService {
  static async getCommentsForPost(postId: string, page: number, limit: number) {
    // Check if post exists and is not deleted
    const post = await postRepo.findById(postId);
    if (!post || post.isDeleted) {
      throw new Error("Post not found or has been deleted");
    }

    const skip = (page - 1) * limit;
    return commentRepo.findActiveByPostPaginated(postId, skip, limit);
  }

  static async createComment(
    postId: string,
    content: string,
    authorId: string,
  ) {
    const post = await postRepo.findById(postId);
    if (!post || post.isDeleted) {
      throw new Error("Post not found or has been deleted");
    }

    const comment = await commentRepo.create({
      post: postId as any,
      content,
      author: authorId as any,
    });

    await postRepo.incrementCommentCount(postId, 1);
    const populatedComment = await comment.populate("author", "name role");

    // Realtime persistence integration
    if (post.author.toString() !== authorId) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: authorId,
        type: "COMMENT",
        post: postId,
      });
      await notification.populate("sender", "name avatarIndex");
      await notification.populate("post", "title slug");

      emitNotification(post.author.toString(), notification);
    }

    return populatedComment;
  }

  static async updateComment(
    id: string,
    content: string,
    userId: string,
    userRole: string,
  ) {
    const comment = await commentRepo.findById(id);
    if (!comment || comment.isDeleted) throw new Error("Comment not found");

    if (comment.author.toString() !== userId && userRole !== "ADMIN") {
      throw new Error("Forbidden: You can only edit your own comments");
    }

    return commentRepo.update(id, { content });
  }

  static async deleteComment(id: string, userId: string, userRole: string) {
    const comment = await commentRepo.findById(id);
    if (!comment || comment.isDeleted) throw new Error("Comment not found");

    if (comment.author.toString() !== userId && userRole !== "ADMIN") {
      throw new Error("Forbidden: You can only delete your own comments");
    }

    await postRepo.incrementCommentCount(comment.post.toString(), -1);
    return commentRepo.softDelete(id);
  }
}
