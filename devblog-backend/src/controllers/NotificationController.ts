import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import Notification from "../models/Notification";

export class NotificationController {
  static async getNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const notifications = await Notification.find({ recipient: req.user.id })
        .populate("sender", "name avatarIndex")
        .populate("post", "title slug")
        .sort({ createdAt: -1 })
        .limit(20);

      res.status(200).json({ success: true, data: { notifications } });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.id },
        { isRead: true },
        { new: true },
      );

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, error: "Notification not found" });
      }

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }
}
