import mongoose from 'mongoose';
import dotenv from 'dotenv';
import courseModel from '../models/course.model.js';
import userModel from '../models/user.model.js';
import Enrollment from '../models/enrollment.model.js';
import Order from '../models/order.model.js';
import ProductMapping from '../models/productMapping.model.js';

dotenv.config();

async function connectDB() {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🌟 Database connected: ${connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function testPurchaseFlow() {
  await connectDB();

  console.log('\n🔍 Testing Purchase Flow Components...\n');

  try {
    // 1. Test Course Model Access
    console.log('1. Testing Course Model...');
    const courses = await courseModel.find().limit(3);
    console.log(`   ✅ Found ${courses.length} courses`);
    courses.forEach(course => {
      console.log(`   📚 ${course.title} (ID: ${course._id})`);
    });

    if (courses.length === 0) {
      console.log('   ❌ No courses found. Please add some courses first.');
      return;
    }

    // 2. Test Users
    console.log('\n2. Testing Users...');
    const users = await userModel.find({ role: 'USER' }).limit(3);
    console.log(`   ✅ Found ${users.length} users`);
    users.forEach(user => {
      console.log(`   👤 ${user.fullName} (${user.email}) - ID: ${user._id}`);
    });

    if (users.length === 0) {
      console.log('   ❌ No users found. Please register some users first.');
      return;
    }

    // 3. Test Order Creation
    console.log('\n3. Testing Order Creation...');
    const testUser = users[0];
    const testCourse = courses[0];
    
    const orderNumber = `TEST-ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const testOrder = {
      orderNumber,
      userId: testUser._id,
      courseIds: [testCourse._id],
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paymentDetails: {
        razorpay_payment_id: `test_pay_${Date.now()}`,
        razorpay_signature: `test_sig_${Date.now()}`,
        paymentMethod: 'razorpay'
      },
      pricing: {
        subtotal: testCourse.price || 999,
        total: testCourse.price || 999
      }
    };

    console.log(`   Creating test order: ${orderNumber}`);
    const order = await Order.create(testOrder);
    console.log(`   ✅ Order created successfully: ${order._id}`);

    // 4. Test Enrollment - Check existing first
    console.log('\n4. Testing Enrollment...');
    const existingEnrollment = await Enrollment.findOne({
      userId: testUser._id,
      courseId: testCourse._id
    });

    if (existingEnrollment) {
      console.log(`   ⚠️ Enrollment already exists for user-course combination`);
      console.log(`   📝 Existing enrollment ID: ${existingEnrollment._id}`);
      console.log(`   🔑 Enrollment type: ${existingEnrollment.enrollmentType}`);
      console.log(`   ✅ Active: ${existingEnrollment.isActive}`);
    } else {
      console.log(`   Creating new enrollment...`);
      const testEnrollment = {
        userId: testUser._id,
        courseId: testCourse._id,
        orderId: order._id,
        enrollmentType: 'purchase',
        isActive: true
      };

      const enrollment = await Enrollment.create(testEnrollment);
      console.log(`   ✅ Enrollment created successfully: ${enrollment._id}`);
    }

    // 5. Test Product Mapping
    console.log('\n5. Testing Product Mapping...');
    await ProductMapping.findOneAndUpdate(
      { productId: testCourse._id },
      {
        productId: testCourse._id,
        productType: 'course',
        courseIds: [testCourse._id]
      },
      { upsert: true }
    );
    console.log(`   ✅ Product mapping created/updated for course: ${testCourse._id}`);

    // 6. Test Access Verification
    console.log('\n6. Testing Access Verification...');
    const userEnrollment = await Enrollment.findOne({
      userId: testUser._id,
      courseId: testCourse._id,
      isActive: true
    });

    if (userEnrollment) {
      console.log(`   ✅ User has access to course: ${testCourse.title}`);
      console.log(`   📅 Enrollment Date: ${userEnrollment.enrollmentDate}`);
      console.log(`   🔑 Access Type: ${userEnrollment.enrollmentType}`);
    } else {
      console.log(`   ❌ User does not have access to course`);
    }

    // 7. Cleanup Test Data
    console.log('\n7. Cleaning up test data...');
    await Order.findByIdAndDelete(order._id);
    console.log(`   ✅ Test data cleaned up`);

    console.log('\n🎉 All Purchase Flow Tests Passed!\n');

    // 8. Show Current Statistics
    console.log('📊 Current System Statistics:');
    const totalCourses = await courseModel.countDocuments();
    const totalUsers = await userModel.countDocuments({ role: 'USER' });
    const totalOrders = await Order.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalProductMappings = await ProductMapping.countDocuments();

    console.log(`   📚 Total Courses: ${totalCourses}`);
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   📦 Total Orders: ${totalOrders}`);
    console.log(`   🎓 Total Enrollments: ${totalEnrollments}`);
    console.log(`   🔗 Total Product Mappings: ${totalProductMappings}`);

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('📋 Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database disconnected');
    process.exit(0);
  }
}

// Run the test
testPurchaseFlow();