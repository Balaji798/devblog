import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/PostService";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    content: z.string().min(10),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(10),
  }),
  params: z.object({ id: z.string() }),
});

export class PostController {
  static async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await PostService.getPosts(page, limit, search);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await PostService.getPostBySlug(req.params.slug as string);
      res.status(200).json({ success: true, data: post });
    } catch (error: any) {
      if (error.message === "Post not found")
        res.status(404).json({ success: false, error: "Post not found" });
      else next(error);
    }
  }

  static async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.createPost(
        req.body.title,
        req.body.content,
        req.user.id,
      );
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.updatePost(
        req.params.id as string,
        req.body.title,
        req.body.content,
        req.user.id,
        req.user.role,
      );
      res.status(200).json({ success: true, data: post });
    } catch (error: any) {
      if (error.message.includes("Forbidden"))
        res.status(403).json({ success: false, error: error.message });
      else if (error.message === "Post not found")
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }

  static async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await PostService.deletePost(
        req.params.id as string,
        req.user.id,
        req.user.role,
      );
      res
        .status(200)
        .json({ success: true, data: "Post deleted successfully" });
    } catch (error: any) {
      if (error.message.includes("Forbidden"))
        res.status(403).json({ success: false, error: error.message });
      else if (error.message === "Post not found")
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }

  static async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await PostService.toggleLike(
        req.params.id as string,
        req.user.id,
      );
      res.status(200).json({ success: true, data: post });
    } catch (error: any) {
      if (error.message === "Post not found")
        res.status(404).json({ success: false, error: error.message });
      else next(error);
    }
  }
}
