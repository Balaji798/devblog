import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error:
      "Too many authentication attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
