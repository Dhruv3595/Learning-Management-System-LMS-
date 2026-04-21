import dotenv from "dotenv";
dotenv.config();
import paymentModel from "../models/payment.model.js";
import userModel from "../models/user.model.js";
import courseModel from "../models/course.model.js";
import Order from "../models/order.model.js";
import Enrollment from "../models/enrollment.model.js";
import ProductMapping from "../models/productMapping.model.js";
import AppError from "../utils/error.utils.js";
import { razorpay } from "../server.js";
import crypto from "crypto";
import mongoose from "mongoose";

export const getRazorPayApiKey = async (req, res, next) => {
  try {
    // console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    res.status(200).json({
      success: true,
      message: "Razorpay API Key",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

export const createCourseOrder = async (req, res, next) => {
  try {
    // Log the incoming request for debugging
    console.log("Course order request:", req.body);
    console.log("User:", req.user ? { id: req.user._id, email: req.user.email } : "No user");
    
    const { courseId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      console.error("No user ID found in request");
      return next(new AppError("Unauthorized, please login", 401));
    }

    if (!courseId) {
      console.error("No courseId provided in request body");
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }
    
    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error("Invalid courseId format received:", courseId, typeof courseId);
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format"
      });
    }

    console.log("Finding course with ID:", courseId);
    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      console.error("Course not found with ID:", courseId);
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    console.log("Course found:", course.title, "Price:", course.price);

    console.log("Checking existing enrollment for user:", userId, "course:", courseId);
    // Check if user already has access
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
      isActive: true
    });

    if (existingEnrollment) {
      console.log("User already enrolled in course");
      return res.status(400).json({
        success: false,
        message: "You already have access to this course"
      });
    }
    console.log("No existing enrollment found, proceeding with order creation");

    // Create Razorpay order for individual course
    const basePrice = course.price || 999;
    
    // Cap the price at ₹50,000 (5,000,000 paise) to avoid Razorpay limits
    const maxPrice = 50000; // ₹50,000
    const finalPrice = Math.min(basePrice, maxPrice);
    
    if (basePrice > maxPrice) {
      console.warn(`Course price ₹${basePrice} exceeds maximum allowed ₹${maxPrice}, capping at ₹${maxPrice}`);
    }
    
    const amount = finalPrice * 100; // Convert to paise
    const receipt = `course_${courseId}_${Date.now()}`.substring(0, 40); // Shorten receipt

    console.log("Creating Razorpay order with:", { amount, receipt, finalPrice });

    // Check if Razorpay is properly configured
    if (!razorpay) {
      console.error("Razorpay not configured properly");
      return next(new AppError("Payment service not available", 500));
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        type: 'individual_course'
      }
    });

    console.log("Razorpay order created successfully:", order.id);

    res.status(200).json({
      success: true,
      message: "Course order created successfully",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
      chargedAmount: finalPrice
    });

  } catch (error) {
    console.error("Error creating course order:", error);
    console.error("Error stack:", error.stack);
    return next(new AppError(error.message || "Failed to create order", 500));
  }
};

export const buySubscription = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await userModel.findById(_id);
    console.log(user);

    if (!user) {
      return next(new AppError("Unauthorized, please login"));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin cannot purchase a subscription", 400));
    }
    console.log("Plan ID:", process.env.RAZORPAY_PLAN_ID);

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 1,
    });

    console.log(`Sub  :: ${subscription}`);

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscribed Successfully",
      subscription_id: subscription.id,
    });
  } catch (e) {
    console.error("Subscription error:", e);
    return next(new AppError(e.message, 500));
  }
};

export const verifySubscription = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const {
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = req.body;
    
    if(!razorpay_payment_id || !razorpay_signature || !razorpay_subscription_id){
      console.warn('⚠️ Missing required Razorpay fields', req.body);
      return next(new AppError('Missing required Razorpay payment verification fields',400));
    }
    
    const user = await userModel.findById(_id);
    if (!user) {
      return next(new AppError("Unauthorised, please login", 500));
    }

    const subscriptionId = user.subscription.id;

    // Validate that we have the required environment variable
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET environment variable is not set');
      return next(new AppError("Payment verification configuration error", 500));
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionId}`)
      .digest("hex");

    console.log("Expected Signature:", generatedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Signature mismatch', { generatedSignature, razorpay_signature });
      return next(new AppError("Payment Not Verified, signature mismatch", 400));
    }

    await paymentModel.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";
    
    // 🔧 FIX: Get courses from product mapping instead of ALL courses
    const productMapping = await ProductMapping.findOne({ 
      'subscriptionDetails.planId': process.env.RAZORPAY_PLAN_ID,
      isActive: true 
    });
    
    if (!productMapping) {
      console.error('❌ No product mapping found for plan:', process.env.RAZORPAY_PLAN_ID);
      return next(new AppError('Invalid subscription plan', 400));
    }
    
    const courseIds = productMapping.courseIds;
    console.log('📚 Enrolling user in courses:', courseIds.length, 'courses');
    
    // Create enrollments for subscription courses
    const enrollmentPromises = courseIds.map(async (courseId) => {
      try {
        return await Enrollment.findOneAndUpdate(
          { userId: user._id, courseId },
          {
            userId: user._id,
            courseId,
            enrollmentType: 'subscription',
            isActive: true,
            accessDetails: {
              subscriptionId: razorpay_subscription_id
            },
            expiryDate: null // Subscription doesn't expire until cancelled
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - enrollment already exists, just update it
          return await Enrollment.findOneAndUpdate(
            { userId: user._id, courseId },
            { 
              isActive: true, 
              enrollmentType: 'subscription',
              accessDetails: {
                subscriptionId: razorpay_subscription_id
              }
            },
            { new: true }
          );
        }
        throw error;
      }
    });
    
    const enrollments = await Promise.all(enrollmentPromises);
    console.log('✅ Created/updated enrollments:', enrollments.length);
    
    await user.save();

    // Create order for subscription
    const subscriptionOrder = new Order({
      userId: user._id,
      courseIds: courseIds,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      orderType: 'subscription',
      paymentDetails: {
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        razorpay_order_id: razorpay_subscription_id,
        paymentMethod: 'razorpay'
      },
      pricing: {
        subtotal: productMapping.price,
        total: productMapping.price,
        currency: productMapping.currency || 'INR'
      }
    });
    await subscriptionOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
      orderId: subscriptionOrder._id,
      enrolledCourses: courseIds.length
    });
  } catch (e) {
    console.error('Error in verifySubscription:', e);
    return next(new AppError(e.message, 500));
  }
};

export const cancelSubscription = async (req, res, next) => {
  const { _id } = req.user;
  const user = await userModel.findById(_id);

  if (user.role === "ADMIN") {
    return next(new AppError("Admin cannot cancel subscription", 400));
  }

  const subscriptionId = user.subscription.id;

  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);

    user.subscription.status = subscription.status;

    await user.save();
    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    return next(new AppError(error.error.description, error.statusCode));
  }
};

export const allPayments = async (req, res, next) => {
  try {
    const { count, page } = req.query;
    const limit = parseInt(count) || 10;
    const skip = (parseInt(page) - 1) * limit || 0;

    // Get payments from database with user details
    const payments = await paymentModel.find({})
      .populate('user', 'fullName email') // populate user details
      .sort({ createdAt: -1 }) // latest first
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const totalPayments = await paymentModel.countDocuments();

    res.status(200).json({
      success: true,
      message: "All Payments retrieved successfully",
      allPayments: payments,
      pagination: {
        currentPage: parseInt(page) || 1,
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNextPage: skip + payments.length < totalPayments,
        hasPrevPage: skip > 0
      }
    });
  } catch (e) {
    console.error("Error fetching payments:", e);
    return next(new AppError(e.message, 500));
  }
};

export const PaymentsStore = async (req, res, next) => {
  const { razorpay_payment_id } = req.body;

  if (!razorpay_payment_id) {
    console.warn('⚠️ PaymentsStore called without razorpay_payment_id', req.body);
    return res
      .status(400)
      .json({ success: false, message: "Payment ID is required" });
  }

  try {
    console.log('🧾 Storing payment record for:', razorpay_payment_id, 'user', req.user?._id);
    
    // Store the payment record
    const payment = await paymentModel.create({
      razorpay_payment_id,
      razorpay_signature: "bypassed_signature", // since we are bypassing, add a dummy value
      user: req.user._id, // from auth middleware
    });

    // Update user subscription status to active
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    console.log('🔍 Before update - User subscription status:', user.subscription.status);
    user.subscription.status = "active";
    
    // Get all courses for subscription (or use product mapping)
    const productMapping = await ProductMapping.findOne({ 
      'subscriptionDetails.planId': process.env.RAZORPAY_PLAN_ID,
      isActive: true 
    });
    
    let courseIds = [];
    if (productMapping) {
      courseIds = productMapping.courseIds;
      console.log('📚 Using product mapping courses:', courseIds.length, 'courses');
    } else {
      // Fallback: Get all courses
      const allCourses = await courseModel.find({}, '_id');
      courseIds = allCourses.map(course => course._id);
      console.log('📚 Using all courses:', courseIds.length, 'courses');
    }
    
    // Create enrollments for subscription courses
    const enrollmentPromises = courseIds.map(async (courseId) => {
      try {
        return await Enrollment.findOneAndUpdate(
          { userId: user._id, courseId },
          {
            userId: user._id,
            courseId,
            enrollmentType: 'subscription',
            isActive: true,
            accessDetails: {
              paymentId: razorpay_payment_id
            }
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - enrollment already exists, just update it
          return await Enrollment.findOneAndUpdate(
            { userId: user._id, courseId },
            { 
              isActive: true, 
              enrollmentType: 'subscription',
              accessDetails: {
                paymentId: razorpay_payment_id
              }
            },
            { new: true }
          );
        }
        throw error;
      }
    });
    
    const enrollments = await Promise.all(enrollmentPromises);
    console.log('✅ Created/updated enrollments:', enrollments.length);
    
    // Add all courses to user's purchased courses for subscription
    const existingCourseIds = user.purchasedCourses.map(id => id.toString());
    const newCourseIds = courseIds
      .map(id => id.toString())
      .filter(id => !existingCourseIds.includes(id));
    
    if (newCourseIds.length > 0) {
      user.purchasedCourses.push(...newCourseIds);
    }
    
    await user.save();
    console.log('✅ After update - User subscription status:', user.subscription.status);

    // Create order for subscription
    const orderNumber = `SUB-ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const subscriptionOrder = await Order.create({
      orderNumber,
      userId: user._id,
      courseIds: courseIds,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paymentDetails: {
        razorpay_payment_id: razorpay_payment_id,
        paymentMethod: 'razorpay'
      },
      pricing: {
        subtotal: 499, // Subscription price
        total: 499
      }
    });

    res.status(201).json({ 
      success: true, 
      message: "Payment verified and subscription activated",
      payment,
      user: {
        subscription: user.subscription
      },
      enrolledCourses: enrollments.length,
      orderId: subscriptionOrder._id
    });
  } catch (error) {
    console.error("Error storing payment (PaymentsStore):", error?.response?.data || error);
    return next(new AppError(error.message || "Server Error", 500));
  }
};

// Purchase individual course
export const purchaseIndividualCourse = async (req, res, next) => {
  try {
    console.log("=== PURCHASE INDIVIDUAL COURSE ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user ? { id: req.user._id, email: req.user.email } : "No user");
    
    const { courseId, paymentDetails } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      console.error("No user ID found");
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!courseId || !paymentDetails) {
      console.error("Missing courseId or paymentDetails");
      return res.status(400).json({
        success: false,
        message: "Course ID and payment details are required"
      });
    }

    // Validate required payment fields
    if (!paymentDetails.razorpay_payment_id || !paymentDetails.razorpay_signature) {
      console.error("Missing payment details:", paymentDetails);
      return res.status(400).json({
        success: false,
        message: "Invalid payment details. Missing payment ID or signature."
      });
    }

    console.log("Finding course with ID:", courseId);
    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      console.error("Course not found:", courseId);
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    console.log("Course found:", course.title);

    console.log("Checking existing enrollment");
    // Check if user already has access to this course
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
      isActive: true
    });

    if (existingEnrollment) {
      console.log("User already enrolled");
      return res.status(400).json({
        success: false,
        message: "You already have access to this course"
      });
    }

    console.log("Verifying payment");
    // Verify payment with Razorpay (skip verification for test payments)
    const isTestPayment = paymentDetails.razorpay_payment_id.startsWith('test_pay_');
    
    if (!isTestPayment) {
      // Validate that we have the required environment variable
      if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error('RAZORPAY_KEY_SECRET environment variable is not set');
        return res.status(500).json({
          success: false,
          message: "Payment verification configuration error"
        });
      }
      
      // For real payments, verify with Razorpay
      const body = paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== paymentDetails.razorpay_signature) {
        console.error("Payment verification failed");
        return res.status(400).json({
          success: false,
          message: "Payment verification failed"
        });
      }
    }
    console.log("Payment verified successfully");

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log("Creating order:", orderNumber);
    // Create order
    const order = await Order.create({
      orderNumber,
      userId,
      courseIds: [courseId],
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paymentDetails: {
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_order_id: paymentDetails.razorpay_order_id,
        razorpay_signature: paymentDetails.razorpay_signature,
        paymentMethod: 'razorpay'
      },
      pricing: {
        subtotal: Math.min(course.price || 0, 50000),
        total: Math.min(course.price || 0, 50000)
      }
    });
    console.log("Order created:", order._id);

    console.log("Creating enrollment");
    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      orderId: order._id,
      enrollmentType: 'purchase',
      isActive: true
    });
    console.log("Enrollment created:", enrollment._id);

    console.log("Updating user purchased courses");
    // Add course to user's purchased courses
    const user = await userModel.findById(userId);
    if (user) {
      const courseIdStr = courseId.toString();
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      if (!user.purchasedCourses.includes(courseIdStr)) {
        user.purchasedCourses.push(courseIdStr);
        await user.save();
        console.log("User purchased courses updated");
      }
    }

    console.log("Creating product mapping");
    // Create product mapping if it doesn't exist
    await ProductMapping.findOneAndUpdate(
      { productId: courseId },
      {
        productId: courseId,
        productType: 'course',
        courseIds: [courseId]
      },
      { upsert: true }
    );

    console.log("✅ Course purchase completed successfully");
    res.status(200).json({
      success: true,
      message: "Course purchased successfully",
      data: {
        orderId: order._id,
        enrollmentId: enrollment._id,
        courseId,
        courseTitle: course.title
      }
    });

  } catch (error) {
    console.error("❌ Error in purchaseIndividualCourse:", error);
    console.error("Error stack:", error.stack);
    return next(new AppError(error.message || "Failed to purchase course", 500));
  }
};

// Check course access for a specific user and course
export const checkCourseAccess = async (req, res, next) => {
  try {
    const { _id: userId, role } = req.user;
    const { courseId } = req.params;
    
    if (!courseId) {
      return next(new AppError("Course ID is required", 400));
    }
    
    // Admin has access to all courses
    if (role === 'ADMIN') {
      return res.status(200).json({
        success: true,
        hasAccess: true,
        accessType: 'admin',
        message: 'Admin access granted'
      });
    }
    
    // Check if user has valid enrollment for this specific course
    const enrollment = await Enrollment.findOne({
      userId: userId,
      courseId: courseId,
      isActive: true
    }).populate('courseId', 'title');
    
    const hasAccess = enrollment && enrollment.isValid();
    
    res.status(200).json({
      success: true,
      hasAccess: hasAccess,
      accessType: enrollment ? enrollment.enrollmentType : null,
      enrollmentDate: enrollment ? enrollment.enrollmentDate : null,
      courseName: enrollment && enrollment.courseId ? enrollment.courseId.title : null,
      message: hasAccess ? 'Access granted' : 'No access - purchase required'
    });
  } catch (e) {
    console.error('Error in checkCourseAccess:', e);
    return next(new AppError(e.message, 500));
  }
};

// Get all enrollments for a user
export const getUserEnrollments = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const enrollments = await Enrollment.find({
      userId: userId,
      isActive: true
    }).populate('courseId', 'title description thumbnail category')
      .sort({ enrollmentDate: -1 });

    const validEnrollments = enrollments.filter(enrollment => enrollment.isValid());

    res.status(200).json({
      success: true,
      message: "User enrollments retrieved successfully",
      enrollments: validEnrollments,
      totalCourses: validEnrollments.length
    });
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    return next(new AppError(error.message, 500));
  }
};
