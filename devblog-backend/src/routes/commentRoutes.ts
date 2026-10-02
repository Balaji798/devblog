import { Router } from "express";
import {
  CommentController,
  updateCommentSchema,
} from "../controllers/CommentController";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";

const router = Router();

// Non-nested operations (patch and delete) address the comment directly.
router.patch(
  "/:id",
  authenticate,
  validate(updateCommentSchema),
  CommentController.updateComment,
);
router.delete("/:id", authenticate, CommentController.deleteComment);

export default router;
