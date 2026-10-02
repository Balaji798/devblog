import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import logger from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { activityLogger } from "./middleware/activityLogger";
import passport from "./config/passport";

import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import adminRoutes from "./routes/adminRoutes";
import notificationRoutes from "./routes/notificationRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger, autoLogging: false }));
app.use(activityLogger);

// Initialize Passport for OAuth
app.use(passport.initialize());

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: "UP" } });
});

// Centralized error handler
app.use(errorHandler);

export default app;
