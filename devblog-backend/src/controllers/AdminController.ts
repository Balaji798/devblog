import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";

export class AdminController {
  static async getDashboardStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const [totalUsers, totalPosts, totalComments] = await Promise.all([
        User.countDocuments({ role: { $ne: "ADMIN" } }),
        Post.countDocuments(),
        Comment.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        data: { totalUsers, totalPosts, totalComments },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      // Exclude fellow administrators to strictly safeguard the tier hierarchy
      const users = await User.find({ role: { $ne: "ADMIN" } })
        .select("-password -refreshTokenHash")
        .sort({ createdAt: -1 });
      console.log(JSON.stringify(users, null, 2));
      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive } = req.body;
      const updates: any = {};

      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) {
        updates.isActive = isActive;
        if (!isActive) {
          // Strict user deactivation requirement: forcefully revoke token hash
          updates.refreshTokenHash = undefined;
        }
      }

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      }).select("-password -refreshTokenHash");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      // Admin sees inclusive of soft-deleted records. No `isDeleted: false` filter.
      const posts = await Post.find()
        .populate("author", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: { posts } });
    } catch (error) {
      next(error);
    }
  }

  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await Comment.find()
        .populate("author", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  static async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await Post.findById(req.params.id).populate(
        "author",
        "name email avatarIndex",
      );
      if (!post) {
        res
          .status(404)
          .json({ success: false, error: "Post not found in database" });
        return;
      }
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
}
