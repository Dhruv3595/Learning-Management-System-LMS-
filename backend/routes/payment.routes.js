import { Router } from "express";
import {
  allPayments,
  buySubscription,
  cancelSubscription,
  getRazorPayApiKey,
  PaymentsStore,
  verifySubscription,
  purchaseIndividualCourse,
  checkCourseAccess,
  getUserEnrollments,
  createCourseOrder,
} from "../controllers/payment.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";
const router = Router();

// router.route('/razorpay-key').get(getRazorPayApiKey)
router.route("/razorpay-key").get(isLoggedIn, getRazorPayApiKey);

router.route("/subscribe").post(isLoggedIn, buySubscription);
router.route("/course-order").post(isLoggedIn, createCourseOrder);

router.route("/verify").post(isLoggedIn, verifySubscription);
router.route("/transection").post(isLoggedIn, PaymentsStore);
router.route("/unsubscribe").post(isLoggedIn, cancelSubscription);

router.route("/").get(isLoggedIn, authorisedRoles("ADMIN"), allPayments);
// Purchase a single course (non-subscription)
router.route("/purchase-course").post(isLoggedIn, purchaseIndividualCourse);

// Check course access for user
router.route("/course-access/:courseId").get(isLoggedIn, checkCourseAccess);

// Get user's enrollments
router.route("/my-enrollments").get(isLoggedIn, getUserEnrollments);

export default router;
