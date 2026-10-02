import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/CommentService";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
  params: z.object({
    postId: z.string(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
  params: z.object({ id: z.string() }),
});

export class CommentController {
  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await CommentService.getCommentsForPost(
        req.params.postId as string,
        page,
        limit,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes("not found"))
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }

  static async createComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const comment = await CommentService.createComment(
        req.params.postId as string,
        req.body.content,
        req.user.id,
      );
      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      if (error.message.includes("not found"))
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }

  static async updateComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const comment = await CommentService.updateComment(
        req.params.id as string,
        req.body.content,
        req.user.id,
        req.user.role,
      );
      res.status(200).json({ success: true, data: comment });
    } catch (error: any) {
      if (error.message.includes("Forbidden"))
        res.status(403).json({ success: false, error: error.message });
      else if (error.message === "Comment not found")
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }

  static async deleteComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await CommentService.deleteComment(
        req.params.id as string,
        req.user.id,
        req.user.role,
      );
      res
        .status(200)
        .json({ success: true, data: "Comment deleted successfully" });
    } catch (error: any) {
      if (error.message.includes("Forbidden"))
        res.status(403).json({ success: false, error: error.message });
      else if (error.message === "Comment not found")
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }
}
