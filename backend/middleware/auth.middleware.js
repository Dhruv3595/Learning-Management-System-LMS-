import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";
import userModel from '../models/user.model.js';
import Enrollment from '../models/enrollment.model.js';
import Order from '../models/order.model.js';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    
    if (!token) {
        return next(new AppError("Unauthenticated, please login again", 401))
    }

    try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findById(userDetails.id);
        if (!user) {
            return next(new AppError("User not found", 401));
        }

        req.user = user; // 👈 THIS is what gives access in controller
        next();
    } catch (error) {
        return next(new AppError("Invalid token, please login again", 401));
    }
}

// authorised roles
const authorisedRoles = (...roles) => async (req, res, next) => {
    // Check if user exists first
    if (!req.user) {
        return next(new AppError("User authentication required", 401));
    }
    
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles)) {
        return next(new AppError("You do not have permission to access this routes", 403))
    }
    next();
}

const authorizeSubscriber = async (req, res, next) => {
    // Check if user exists first
    if (!req.user) {
        return next(new AppError("User authentication required", 401));
    }
    
    const {role, id} = req.user; 
    const user = await userModel.findById(id);
    
    if (!user) {
        return next(new AppError("User not found", 401));
    }
    
    const subscriptionStatus = user.subscription?.status;
    if (role !== 'ADMIN' && subscriptionStatus !== 'active') {
        return next(
            new AppError('Please subscribce to access this route!', 403)
        )
    }

    next();
}

// New middleware for course-specific authorization
const authorizeCourseAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError("User authentication required", 401));
        }
        
        const { role, _id: userId } = req.user;
        const courseId = req.params.id || req.params.courseId;
        
        if (!courseId) {
            return next(new AppError("Course ID is required", 400));
        }
        
        // Admin has access to all courses
        if (role === 'ADMIN') {
            return next();
        }
        
        // Check if user has valid enrollment for this specific course
        const enrollment = await Enrollment.findOne({
            userId: userId,
            courseId: courseId,
            isActive: true
        });
        
        if (enrollment && enrollment.isValid()) {
            // Add enrollment info to request for logging
            req.enrollment = enrollment;
            return next();
        }
        
        // If no valid enrollment, check if user has a paid order for this course
        const paidOrder = await Order.findOne({
            userId: userId,
            courseIds: courseId,
            paymentStatus: 'paid',
            orderStatus: 'completed'
        });
        
        if (paidOrder) {
            // User has a paid order, grant access
            // Optionally create enrollment if it doesn't exist
            try {
                const existingEnrollment = await Enrollment.findOne({
                    userId: userId,
                    courseId: courseId
                });
                
                if (!existingEnrollment) {
                    // Create enrollment retroactively
                    await Enrollment.create({
                        userId: userId,
                        courseId: courseId,
                        orderId: paidOrder._id,
                        enrollmentType: 'purchase',
                        isActive: true
                    });
                    console.log(`Created missing enrollment for user ${userId} and course ${courseId}`);
                } else if (!existingEnrollment.isActive) {
                    // Reactivate existing enrollment
                    existingEnrollment.isActive = true;
                    await existingEnrollment.save();
                    console.log(`Reactivated enrollment for user ${userId} and course ${courseId}`);
                }
            } catch (enrollmentError) {
                console.error('Error creating/reactivating enrollment:', enrollmentError);
                // Continue anyway since user has paid order
            }
            
            return next();
        }
        
        if (!enrollment || !enrollment.isValid()) {
            return next(new AppError('You do not have access to this course. Please purchase it first.', 403));
        }
    } catch (error) {
        console.error('Error in authorizeCourseAccess:', error);
        return next(new AppError('Error checking course access', 500));
    }
}

export {
    isLoggedIn,
    authorisedRoles,
    authorizeSubscriber,
    authorizeCourseAccess
}