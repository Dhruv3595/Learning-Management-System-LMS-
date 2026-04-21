// Test endpoint to check if basic purchase flow works
import express from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import courseModel from '../models/course.model.js';
import AppError from '../utils/error.utils.js';

const router = express.Router();

// Simple test endpoint for purchase
router.post('/test-purchase', isLoggedIn, async (req, res, next) => {
  try {
    console.log('=== PURCHASE TEST ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : 'No user');
    
    const { courseId } = req.body;
    
    if (!courseId) {
      console.log('❌ No courseId provided');
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    // Simple course lookup
    const course = await courseModel.findById(courseId);
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    console.log('✅ Course found:', course.title);
    console.log('✅ Test endpoint working correctly');
    
    res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      course: {
        id: course._id,
        title: course.title,
        price: course.price
      },
      user: {
        id: req.user._id,
        email: req.user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return next(new AppError(error.message, 500));
  }
});

export default router;