import { Router } from "express";
import {
  getAllUsers,
  deleteUser,
  getUserStats,
  updateUserRole,
  getRevenueStats,
  getCourseStats,
} from "../controllers/admin.controller.js";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes require admin authentication
router.use(isLoggedIn, authorisedRoles("ADMIN"));

// User management routes
router.route("/users").get(getAllUsers);
router.route("/users/:id").delete(deleteUser).put(updateUserRole);

// Statistics routes
router.route("/stats").get(getUserStats);
router.route("/stats/revenue").get(getRevenueStats);
router.route("/stats/courses").get(getCourseStats);

export default router;