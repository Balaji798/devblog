import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export class AuthController {
  static setCookie(res: Response, token: string) {
    res.cookie("jwt_refresh", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Should match deployment requirements
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.register(
        req.body,
      );
      AuthController.setCookie(res, refreshToken);
      res.status(201).json({ success: true, data: { user, accessToken } });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password,
      );
      AuthController.setCookie(res, refreshToken);
      res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const oldToken = req.cookies.jwt_refresh;
      if (!oldToken) {
        res
          .status(401)
          .json({ success: false, error: "No refresh token provided" });
        return;
      }

      const { accessToken, newRefreshToken } =
        await AuthService.refresh(oldToken);
      AuthController.setCookie(res, newRefreshToken); // Rotation
      res.status(200).json({ success: true, data: { accessToken } });
    } catch (error) {
      // Clear cookie immediately if refresh fails
      res.clearCookie("jwt_refresh");
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.jwt_refresh;
      await AuthService.logout(token);
      res.clearCookie("jwt_refresh");
      res.status(200).json({ success: true, data: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthenticated");
      res.status(200).json({ success: true, data: req.user });
    } catch (e) {
      next(e);
    }
  }

  static async completeFacebook(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { tempToken, email } = req.body;
      if (!tempToken || !email) throw new Error("Missing tempToken or email");

      const { user, accessToken, refreshToken } =
        await AuthService.completeOAuth(tempToken, email);
      AuthController.setCookie(res, refreshToken);
      res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (error) {
      next(error);
    }
  }
}
