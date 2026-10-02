import { Router } from "express";
import {
  PostController,
  createPostSchema,
  updatePostSchema,
} from "../controllers/PostController";
import {
  CommentController,
  createCommentSchema,
} from "../controllers/CommentController";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";

const router = Router();

// Post Routes
router.get("/", PostController.getPosts);
router.get("/:slug", PostController.getPostBySlug);

router.post(
  "/",
  authenticate,
  validate(createPostSchema),
  PostController.createPost,
);
router.patch(
  "/:id",
  authenticate,
  validate(updatePostSchema),
  PostController.updatePost,
);
router.delete("/:id", authenticate, PostController.deletePost);

router.post("/:id/like", authenticate, PostController.toggleLike);

// Nested Comment Routes natively on Post
router.get("/:postId/comments", CommentController.getComments);
router.post(
  "/:postId/comments",
  authenticate,
  validate(createCommentSchema),
  CommentController.createComment,
);

export default router;
