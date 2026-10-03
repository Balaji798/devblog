import { Router } from "express";
import {
  AuthController,
  registerSchema,
  loginSchema,
  facebookCompleteSchema,
  resetPasswordSchema,
} from "../controllers/AuthController";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import passport from "passport";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register,
);
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);
router.post("/refresh", AuthController.refresh);
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

// Google OAuth
router.get(
  "/google",
  authLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    // req.user contains the logic from passport strategy (user, accessToken, refreshToken)
    // Send cookie and redirect to frontend
    AuthController.setCookie(res, req.user.refreshToken);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/login?token=${req.user.accessToken}&oauth=true`,
    );
  },
);

// Facebook OAuth
router.get(
  "/facebook",
  authLimiter,
  passport.authenticate("facebook", { scope: ["email"] }),
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req: any, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (req.user.isPartial) {
      return res.redirect(
        `${frontendUrl}/oauth/complete?tempToken=${req.user.tempToken}&name=${encodeURIComponent(req.user.name)}`,
      );
    }

    AuthController.setCookie(res, req.user.refreshToken);
    res.redirect(
      `${frontendUrl}/login?token=${req.user.accessToken}&oauth=true`,
    );
  },
);

router.post(
  "/facebook/complete",
  validate(facebookCompleteSchema),
  AuthController.completeFacebook,
);

export default router;
