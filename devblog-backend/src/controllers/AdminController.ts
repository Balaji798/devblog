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
      const users = await User.find()
        .select("-password -refreshTokenHash")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive } = req.body;
      const { id } = req.params;

      if (id === (req as any).user?.id) {
        return res.status(400).json({
          success: false,
          error: "You cannot modify your own admin account here",
        });
      }

      if (role === undefined && isActive === undefined) {
        return res.status(400).json({
          success: false,
          error: "No valid updates provided",
        });
      }

      if (role !== undefined && !["ADMIN", "USER"].includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user role",
        });
      }

      if (isActive !== undefined && typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          error: "isActive must be a boolean",
        });
      }

      const targetUser = await User.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Do not allow an admin to deactivate or demote another admin.
      // This protects the administrator accounts from accidental lockout.
      if (
        targetUser.role === "ADMIN" &&
        (role === "USER" || isActive === false)
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Admin accounts cannot be demoted or deactivated through this operation",
        });
      }

      if (role !== undefined) {
        targetUser.role = role;
      }

      if (isActive !== undefined) {
        targetUser.isActive = isActive;

        if (!isActive) {
          targetUser.refreshTokenHash = undefined;
        }
      }

      await targetUser.save();

      const safeUser = await User.findById(id).select(
        "-password -refreshTokenHash",
      );

      res.status(200).json({
        success: true,
        data: safeUser,
      });
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
