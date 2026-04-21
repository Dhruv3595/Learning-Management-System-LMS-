import userModel from "../models/user.model.js";
import paymentModel from "../models/payment.model.js";
import courseModel from "../models/course.model.js";
import orderModel from "../models/order.model.js";
import AppError from "../utils/error.utils.js";

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find({}).select("-password -forgotPasswordToken -forgotPasswordExpiry");
    
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      count: users.length
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(new AppError("User ID is required", 400));
    }

    const user = await userModel.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return next(new AppError("You cannot delete your own account", 400));
    }

    await userModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return next(new AppError("User ID is required", 400));
    }

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return next(new AppError("Valid role (USER or ADMIN) is required", 400));
    }

    const user = await userModel.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
      return next(new AppError("You cannot change your own role", 400));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await userModel.countDocuments({});
    const totalAdmins = await userModel.countDocuments({ role: "ADMIN" });
    const totalRegularUsers = await userModel.countDocuments({ role: "USER" });
    const subscribedUsers = await userModel.countDocuments({ "subscription.status": "active" });

    // Get user registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userRegistrations = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "User statistics fetched successfully",
      stats: {
        totalUsers,
        totalAdmins,
        totalRegularUsers,
        subscribedUsers,
        userRegistrations
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get revenue statistics
const getRevenueStats = async (req, res, next) => {
  try {
    // Get revenue by month (last 6 months) from both Payments and Orders
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Revenue from subscription payments (Payment model)
    const subscriptionRevenueData = await paymentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          razorpay_payment_id: { $exists: true, $ne: null } // Only successful payments
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$amount" } // Use actual payment amounts
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Revenue from individual course purchases (Order model)
    const coursePurchaseRevenueData = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: "paid",
          orderStatus: "completed"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$pricing.total" } // Use pricing.total from orders
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Combine revenue data from both sources
    const combinedRevenueData = [...subscriptionRevenueData, ...coursePurchaseRevenueData]
      .reduce((acc, item) => {
        const key = `${item._id.year}-${item._id.month}`;
        if (!acc[key]) {
          acc[key] = { _id: item._id, revenue: 0 };
        }
        acc[key].revenue += item.revenue;
        return acc;
      }, {});

    const revenueData = Object.values(combinedRevenueData).sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    });

    // Calculate total revenue from both sources
    const subscriptionTotalResult = await paymentModel.aggregate([
      {
        $match: {
          razorpay_payment_id: { $exists: true, $ne: null } // Only successful payments
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const coursePurchaseTotalResult = await orderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: "completed"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$pricing.total" }
        }
      }
    ]);

    const subscriptionTotal = subscriptionTotalResult.length > 0 ? subscriptionTotalResult[0].total : 0;
    const coursePurchaseTotal = coursePurchaseTotalResult.length > 0 ? coursePurchaseTotalResult[0].total : 0;
    const totalRevenue = subscriptionTotal + coursePurchaseTotal;

    res.status(200).json({
      success: true,
      message: "Revenue statistics fetched successfully",
      totalRevenue,
      revenueData
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get course statistics
const getCourseStats = async (req, res, next) => {
  try {
    const totalCourses = await courseModel.countDocuments({});

    // Get course distribution by category
    const courseDistribution = await courseModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Course statistics fetched successfully",
      totalCourses,
      courseDistribution
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserStats,
  getRevenueStats,
  getCourseStats
};