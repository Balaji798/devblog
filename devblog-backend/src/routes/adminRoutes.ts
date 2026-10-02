import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Protect ALL admin routes with RBAC logic
router.use(authenticate, authorize(["ADMIN"]));

router.get("/dashboard", AdminController.getDashboardStats);
router.get("/users", AdminController.getUsers);
router.patch("/users/:id", AdminController.updateUser);
router.get("/posts", AdminController.getPosts);
router.get("/posts/:id", AdminController.getPostById);
router.get("/comments", AdminController.getComments);

export default router;
