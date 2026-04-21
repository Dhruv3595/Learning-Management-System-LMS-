import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Test function to manually create enrollment for testing
const testEnrollment = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing course enrollment...\n');
    
    // Find a test user and course
    const user = await userModel.findOne({ email: { $regex: /@gmail.com/i } });
    const course = await courseModel.findOne();
    
    if (!user || !course) {
      console.log('❌ No test user or course found');
      return;
    }
    
    console.log(`👤 User: ${user.email}`);
    console.log(`📚 Course: ${course.title}`);
    console.log(`🆔 Course ID: ${course._id}\n`);
    
    // Check if enrollment already exists
    const existing = await Enrollment.findOne({
      userId: user._id,
      courseId: course._id
    });
    
    if (existing) {
      console.log('📋 Existing enrollment found:', {
        enrollmentType: existing.enrollmentType,
        isActive: existing.isActive,
        enrollmentDate: existing.enrollmentDate
      });
    } else {
      // Create test enrollment
      const enrollment = await Enrollment.create({
        userId: user._id,
        courseId: course._id,
        enrollmentType: 'purchase',
        isActive: true,
        accessDetails: {
          reason: 'Test enrollment for debugging'
        }
      });
      
      console.log('✅ Test enrollment created:', {
        enrollmentId: enrollment._id,
        enrollmentType: enrollment.enrollmentType,
        isActive: enrollment.isActive
      });
    }
    
    // Test course access check
    console.log('\\n🔍 Testing course access...');
    const accessEnrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: course._id,
      isActive: true
    }).populate('courseId', 'title');
    
    const hasAccess = accessEnrollment && accessEnrollment.isValid();
    
    console.log('✅ Access check result:', {
      hasAccess,
      accessType: accessEnrollment ? accessEnrollment.enrollmentType : null,
      courseName: accessEnrollment && accessEnrollment.courseId ? accessEnrollment.courseId.title : null
    });
    
    console.log('\\n📊 All enrollments for user:');
    const allEnrollments = await Enrollment.find({ userId: user._id })
      .populate('courseId', 'title')
      .sort({ enrollmentDate: -1 });
    
    allEnrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. ${enrollment.courseId?.title || 'Unknown Course'} - ${enrollment.enrollmentType} (${enrollment.isActive ? 'Active' : 'Inactive'})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\\n👋 Database connection closed');
  }
};

// Run test
testEnrollment().catch(console.error);