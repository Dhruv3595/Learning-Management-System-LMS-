import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import fs from "fs";
import AppError from "../utils/error.utils.js";
import sendEmail from "../utils/sendEmail.js";
import Order from "../models/order.model.js";

const cookieOptions = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  secure: true,
  sameSite: "none",
};

// Register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check if user misses any fields
    if (!fullName || !email || !password || !phone) {
      return next(new AppError("All fields are required", 400));
    }

    // Check if the user already exists
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return next(new AppError("Email already exists, please login", 400));
    }

    // Save user in the database and log the user in
    const user = await userModel.create({
      fullName,
      email,
      password,
      phone,
    });

    if (!user) {
      return next(
        new AppError("User registration failed, please try again", 400)
      );
    }

    // File upload
    if (req.file) {
        try {
            user.avatar.secure_url = req.file.path;
        } catch (e) {
            return next(new AppError(e.message || "File not uploaded, please try again", 500));
        }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if user miss any field
    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return next(new AppError("Email or Password does not match", 400));
    }

    const token = await user.generateJWTToken();

    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User loggedin successfully",
      user,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// logout
const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "User loggedout successfully",
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// getProfile
const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await userModel.findById(id);

    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (e) {
    return next(new AppError("Failed to fetch user profile", 500));
  }
};

// forgot password
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  // check if user doesn't pass email
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError("Please enter a valid email address", 400));
  }

  const user = await userModel.findOne({ email });
  // check if user not registered with the email
  if (!user) {
    return next(new AppError("Email not registered", 400));
  }

  try {
    // Generate reset token
    const resetToken = await user.generatePasswordResetToken();
    await user.save();

    const resetPasswordURL = `${process.env.CLIENT_URL}/user/profile/reset-password/${resetToken}`;
    const subject = "Reset Password";
    const message = `You can reset your password by clicking this link: ${resetPasswordURL}\n\nIf the above link does not work for some reason then copy paste this link in new tab: ${resetPasswordURL}\n\nIf you have not requested this, kindly ignore.`;

    console.log("Reset URL:", resetPasswordURL);

    // Check if SMTP is properly configured (both username and password must be set and not empty)
    const smtpConfigured = process.env.SMTP_USERNAME &&
                          process.env.SMTP_PASSWORD &&
                          process.env.SMTP_USERNAME.trim() !== '' &&
                          process.env.SMTP_PASSWORD.trim() !== '';

    console.log("SMTP configured:", smtpConfigured);

    if (!smtpConfigured) {
      console.log("SMTP not configured. Using development mode with reset token:", resetToken);

      // In development mode, return success with the token for testing
      return res.status(200).json({
        success: true,
        message: `Reset password token generated successfully. Check console for reset token.`,
        resetToken: resetToken, // Only for development
        resetURL: resetPasswordURL, // Only for development
        development: true
      });
    }

    // SMTP is configured, try to send email
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email}`,
    });

  } catch (e) {
    console.error("Forgot password error:", e);

    // Clean up on error
    if (user) {
      user.forgotPasswordExpiry = undefined;
      user.forgotPasswordToken = undefined;
      await user.save();
    }

    return next(new AppError(`Failed to process forgot password request: ${e.message}`, 500));
  }
};

// reset password
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;

    const { password } = req.body;

    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await userModel.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new AppError("Token is invalid or expired, please try again", 400)
      );
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// change password
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword) {
      return next(new AppError("All fields are requared", 400));
    }

    const user = await userModel.findById(id).select("+password");

    if (!user) {
      return next(new AppError("User does not exist", 400));
    }

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return next(new AppError("Invalid Old Password", 400));
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// update profile
const updateUser = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const { id } = req.user;

    console.log(fullName);

    const user = await userModel.findById(id);

    if (!user) {
      return next(new AppError("user does not exist", 400));
    }

    if (fullName) {
      // Validate that fullName doesn't contain numbers
      if (/\d/.test(fullName)) {
        return next(new AppError("Full name cannot contain numbers", 400));
      }
      user.fullName = fullName;
    }

    if (req.file) {
      // Delete old avatar file if exists
      if (user.avatar.secure_url) {
        try {
          await fs.unlink(user.avatar.secure_url);
        } catch (error) {
          console.error('Failed to delete old avatar file:', error);
        }
      }

      try {
        user.avatar.secure_url = req.file.path;
      } catch (e) {
        return next(
          new AppError(e.message || "File not uploaded, please try again", 500)
        );
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User update successfully",
      user,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// Get My Courses
const getMyCourses = async (req, res, next) => {
  try {
    console.log('getMyCourses called, req.user:', req.user);
    const userId = req.user._id || req.user.id;
    console.log('Using userId:', userId);

    // Get user with purchased courses populated
    const user = await userModel.findById(userId).populate({
      path: 'purchasedCourses',
      select: 'title description category thumbnail numberOfLectures createdBy createdAt'
    });
    console.log('User found:', !!user);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    console.log('Purchased courses count:', user.purchasedCourses.length);

    // Normalize courses with purchase dates and normalized thumbnails
    const coursesWithDetails = user.purchasedCourses.map(course => {
      const courseObj = course.toObject();
      
      // Normalize thumbnail path
      if (courseObj.thumbnail) {
        let normalizedPath = courseObj.thumbnail.replace(/\\/g, '/');
        if (!normalizedPath.startsWith('/uploads/')) {
          normalizedPath = '/uploads/' + normalizedPath.replace(/^uploads\/?/, '');
        }
        courseObj.thumbnail = normalizedPath;
      }

      // Add purchase date (simplified for now)
      courseObj.purchaseDate = course.createdAt;

      // Add progress placeholder
      courseObj.progress = 0;

      return courseObj;
    });

    console.log('Returning courses count:', coursesWithDetails.length);

    res.status(200).json({
      success: true,
      message: "My courses fetched successfully",
      courses: coursesWithDetails,
    });
  } catch (e) {
    console.error('Error in getMyCourses:', e.message, e.stack);
    return next(new AppError(e.message, 500));
  }
};

export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
  getMyCourses,
};
