import { Router } from "express";
import { 
    getMyOrders, 
    getOrderById, 
    createOrder, 
    updateOrderStatus, 
    getOrderStats, 
    searchOrders,
    getAllOrders,
    checkCourseAccess 
} from "../controllers/order.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

// User routes (require authentication)
router.get("/my-orders", isLoggedIn, getMyOrders);
router.get("/stats", isLoggedIn, getOrderStats);
router.get("/search", isLoggedIn, searchOrders);
router.get("/course/:courseId/access", isLoggedIn, checkCourseAccess);
router.get("/:orderId", isLoggedIn, getOrderById);
router.post("/create", isLoggedIn, createOrder);

// Admin routes
router.get("/admin/all", isLoggedIn, getAllOrders);

// Internal routes (for payment processing)
router.patch("/:orderId/status", updateOrderStatus);

export default router;