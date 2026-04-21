import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/user.model.js';
import AppError from '../utils/error.utils.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth Login/Signup
export const googleAuth = async (req, res, next) => {
  try {
    const { userInfo, type } = req.body;
    
    if (!userInfo || !userInfo.email) {
      return next(new AppError('User information is required', 400));
    }

    const { id: googleId, email, name, picture } = userInfo;

    // Check if user already exists
    let user = await userModel.findOne({ email });

    if (user) {
      // User exists, log them in
      const token = user.generateJWTToken();
      
      user.password = undefined; // Don't send password
      
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          subscription: user.subscription,
          purchasedCourses: user.purchasedCourses,
        },
      });
    } else {
      // Create new user
      const newUser = await userModel.create({
        fullName: name,
        email: email,
        password: 'google_oauth_' + Date.now(), // Dummy password for Google users
        phone: 'Not provided', // Google doesn't provide phone
        avatar: {
          public_id: 'google_' + googleId,
          secure_url: picture || '',
        },
      });

      const token = newUser.generateJWTToken();
      
      newUser.password = undefined; // Don't send password

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return res.status(201).json({
        success: true,
        message: 'Account created and logged in successfully',
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          subscription: newUser.subscription,
          purchasedCourses: newUser.purchasedCourses || [],
        },
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    return next(new AppError('Google authentication failed', 500));
  }
};