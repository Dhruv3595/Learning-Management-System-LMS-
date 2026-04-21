import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";
import { razorpay } from "../server.js";

// Get all orders for the logged-in user
export const getMyOrders = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            paymentStatus, 
            dateFrom, 
            dateTo,
            orderType 
        } = req.query;

        console.log("=== FETCHING USER ORDERS ===");
        console.log("User ID:", _id);
        console.log("Filters:", { status, paymentStatus, dateFrom, dateTo, orderType });

        // Build filter query - only show completed and paid orders
        const filter = { 
            userId: _id,
            paymentStatus: 'paid',
            orderStatus: 'completed'
        };
        
        // Add additional filters if provided
        if (status && status !== 'all') filter.orderStatus = status;
        if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;
        if (orderType && orderType !== 'all') filter.orderType = orderType;
        
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        console.log("Final filter:", filter);

        // Get orders with populated course details - only include existing courses
        const orders = await Order.find(filter)
            .populate({
                path: 'courseIds',
                select: 'title description thumbnail price instructor duration numberOfLectures category',
                // Only populate courses that actually exist (not deleted)
                match: { _id: { $exists: true } }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        console.log("Found orders before filtering:", orders.length);

        // Filter out orders with deleted courses and ensure course data exists
        const validOrders = orders.filter(order => {
            // Remove any null courseIds (deleted courses)
            order.courseIds = order.courseIds.filter(course => course !== null);
            
            // Only include orders that still have valid courses
            return order.courseIds && order.courseIds.length > 0;
        });

        console.log("Valid orders after filtering:", validOrders.length);

        // Get total count for pagination (only valid orders)
        const allValidOrders = await Order.find(filter).populate({
            path: 'courseIds',
            match: { _id: { $exists: true } }
        });
        
        const totalValidOrders = allValidOrders.filter(order => 
            order.courseIds && order.courseIds.length > 0
        ).length;

        console.log("Total valid orders for pagination:", totalValidOrders);

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: {
                orders: validOrders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalValidOrders / parseInt(limit)),
                    totalOrders: totalValidOrders,
                    hasNext: skip + validOrders.length < totalValidOrders,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return next(new AppError(error.message, 500));
    }
};

// Get specific order details
export const getOrderById = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { _id } = req.user;

        const order = await Order.findOne({ _id: orderId, userId: _id })
            .populate('courseIds', 'title description thumbnail price instructor duration lectures')
            .populate('userId', 'fullName email');

        if (!order) {
            return next(new AppError("Order not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            data: order
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Create a new order (used during purchase process)
export const createOrder = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { courseIds, pricing, orderType = 'course_purchase' } = req.body;

        // Validate courses exist and calculate total
        const courses = await Course.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return next(new AppError("Some courses not found", 404));
        }

        // Calculate pricing if not provided
        let calculatedPricing = pricing;
        if (!pricing) {
            const subtotal = courses.reduce((sum, course) => sum + course.price, 0);
            calculatedPricing = {
                subtotal,
                discount: 0,
                tax: 0,
                total: subtotal,
                currency: 'INR'
            };
        }

        // Create order
        const order = new Order({
            userId: _id,
            courseIds,
            pricing: calculatedPricing,
            orderType,
            paymentStatus: 'pending',
            orderStatus: 'processing'
        });

        await order.save();

        // Populate course details for response
        await order.populate('courseIds', 'title description thumbnail price');

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update order status (internal use)
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus, orderStatus, paymentDetails } = req.body;

        const updateData = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentDetails) updateData.paymentDetails = { ...updateData.paymentDetails, ...paymentDetails };

        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        ).populate('courseIds', 'title description thumbnail price');

        if (!order) {
            return next(new AppError("Order not found", 404));
        }

        // If payment is successful, add courses to user's purchased courses
        if (paymentStatus === 'paid' && orderStatus === 'completed') {
            const user = await User.findById(order.userId);
            if (user) {
                const existingCourseIds = user.purchasedCourses.map(id => id.toString());
                const newCourseIds = order.courseIds
                    .map(id => id.toString())
                    .filter(id => !existingCourseIds.includes(id));
                
                if (newCourseIds.length > 0) {
                    user.purchasedCourses.push(...newCourseIds);
                    await user.save();
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get order statistics for user dashboard
export const getOrderStats = async (req, res, next) => {
    try {
        const { _id } = req.user;

        console.log("=== FETCHING ORDER STATS ===");
        console.log("User ID:", _id);

        // Only count valid orders with existing courses
        const stats = await Order.aggregate([
            { 
                $match: { 
                    userId: _id,
                    paymentStatus: 'paid',
                    orderStatus: 'completed'
                } 
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseIds',
                    foreignField: '_id',
                    as: 'validCourses'
                }
            },
            {
                // Only include orders that have at least one valid course
                $match: {
                    'validCourses.0': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "completed"] }, 1, 0] }
                    },
                    totalSpent: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$pricing.total", 0] }
                    },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalOrders: 0,
            completedOrders: 0,
            totalSpent: 0,
            pendingOrders: 0
        };

        console.log("Order stats result:", result);

        res.status(200).json({
            success: true,
            message: "Order statistics fetched successfully",
            data: result
        });

    } catch (error) {
        console.error("Error fetching order stats:", error);
        return next(new AppError(error.message, 500));
    }
};

// Search orders
export const searchOrders = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { query, page = 1, limit = 10 } = req.query;

        console.log("=== SEARCHING ORDERS ===");
        console.log("User ID:", _id);
        console.log("Search query:", query);

        if (!query) {
            return next(new AppError("Search query is required", 400));
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build search criteria - only for valid paid orders
        const searchFilter = {
            userId: _id,
            paymentStatus: 'paid',
            orderStatus: 'completed'
        };

        // First find courses that match the search query
        const courses = await Course.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { instructor: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).select('_id');

        const courseIds = courses.map(course => course._id);

        // Then find orders that contain these courses or match order number
        const orderFilter = {
            ...searchFilter,
            $or: [
                { courseIds: { $in: courseIds } },
                { orderNumber: { $regex: query, $options: 'i' } }
            ]
        };

        console.log("Search filter:", orderFilter);

        const orders = await Order.find(orderFilter)
            .populate({
                path: 'courseIds',
                select: 'title description thumbnail price instructor duration numberOfLectures category',
                match: { _id: { $exists: true } }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Filter out orders with deleted courses
        const validOrders = orders.filter(order => {
            order.courseIds = order.courseIds.filter(course => course !== null);
            return order.courseIds && order.courseIds.length > 0;
        });

        const totalResults = await Order.countDocuments(orderFilter);

        console.log("Search results:", validOrders.length, "Total:", totalResults);

        res.status(200).json({
            success: true,
            message: "Search results fetched successfully",
            data: {
                orders: validOrders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalResults / parseInt(limit)),
                    totalOrders: totalResults,
                    hasNext: skip + validOrders.length < totalResults,
                    hasPrev: parseInt(page) > 1
                },
                searchQuery: query
            }
        });

    } catch (error) {
        console.error("Error searching orders:", error);
        return next(new AppError(error.message, 500));
    }
};

// Admin: Get all orders (for admin panel)
export const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, paymentStatus } = req.query;

        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return next(new AppError("Access denied. Admin only.", 403));
        }

        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate('userId', 'fullName email')
            .populate('courseIds', 'title price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "All orders fetched successfully",
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / parseInt(limit)),
                    totalOrders
                }
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Check if user has access to course lectures (based on purchase/subscription)
export const checkCourseAccess = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { _id } = req.user;

        // Check if user has a valid order for this course or subscription
        const hasAccess = await Order.findOne({
            userId: _id,
            $or: [
                {
                    courseIds: courseId,
                    paymentStatus: 'paid',
                    orderStatus: { $in: ['completed', 'processing'] }
                },
                {
                    orderType: 'subscription',
                    paymentStatus: 'paid',
                    orderStatus: { $in: ['completed', 'processing'] }
                }
            ]
        });

        if (!hasAccess) {
            return next(new AppError("You don't have access to this course. Please purchase the course or subscribe.", 403));
        }

        res.status(200).json({
            success: true,
            message: "Course access verified",
            hasAccess: true,
            orderId: hasAccess._id,
            orderType: hasAccess.orderType
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};