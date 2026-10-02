import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: any; // To store decoded JWT payload (id, role)
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as any;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Account deactivated. Contact support.",
        });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(401)
      .json({
        success: false,
        error: "Unauthorized: Invalid or expired token",
      });
  }
};

export const authorize = (roles: Array<"USER" | "ADMIN">) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};
