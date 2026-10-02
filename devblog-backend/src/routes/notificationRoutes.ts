import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", NotificationController.getNotifications);
router.patch("/:id/read", NotificationController.markAsRead);

export default router;
