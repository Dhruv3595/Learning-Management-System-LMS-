import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';
import Order from '../models/order.model.js';
import Enrollment from '../models/enrollment.model.js';
import ProductMapping from '../models/productMapping.model.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Migration script to fix existing data
const runMigration = async () => {
  try {
    console.log('🚀 Starting migration to fix course access bug...\n');

    // Step 1: Create initial product mappings
    console.log('1️⃣ Creating product mappings...');
    
    const allCourses = await courseModel.find({});
    console.log(`Found ${allCourses.length} courses in the system`);

    // Create a subscription product mapping for existing plan
    const subscriptionMapping = await ProductMapping.findOneAndUpdate(
      { productId: 'subscription_all_courses' },
      {
        productId: 'subscription_all_courses',
        productType: 'subscription',
        courseIds: allCourses.map(c => c._id),
        name: 'All Courses Subscription',
        description: 'Access to all courses in the platform',
        price: 499,
        currency: 'INR',
        isActive: true,
        subscriptionDetails: {
          planId: process.env.RAZORPAY_PLAN_ID,
          duration: 365, // 1 year
          isRecurring: true
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created subscription product mapping');

    // Create individual course mappings
    for (const course of allCourses) {
      await ProductMapping.findOneAndUpdate(
        { productId: `course_${course._id}` },
        {
          productId: `course_${course._id}`,
          productType: 'single_course',
          courseIds: [course._id],
          name: course.title,
          description: course.description,
          price: course.price || 299,
          currency: 'INR',
          isActive: true
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${allCourses.length} individual course mappings`);

    // Step 2: Migrate existing users with active subscriptions
    console.log('\n2️⃣ Migrating existing subscription users...');
    
    const subscribedUsers = await userModel.find({
      'subscription.status': 'active'
    });
    
    console.log(`Found ${subscribedUsers.length} users with active subscriptions`);

    let migratedSubscriptions = 0;
    for (const user of subscribedUsers) {
      try {
        // Create enrollments for all courses for subscription users
        const enrollmentPromises = allCourses.map(async (course) => {
          return await Enrollment.findOneAndUpdate(
            { userId: user._id, courseId: course._id },
            {
              userId: user._id,
              courseId: course._id,
              enrollmentType: 'subscription',
              isActive: true,
              accessDetails: {
                subscriptionId: user.subscription.id || 'migrated_subscription'
              },
              expiryDate: null
            },
            { upsert: true, new: true }
          );
        });
        
        await Promise.all(enrollmentPromises);
        migratedSubscriptions++;
        console.log(`✅ Migrated user ${user.email} - ${allCourses.length} course enrollments`);
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    // Step 3: Migrate existing orders to enrollments
    console.log('\n3️⃣ Migrating existing orders to enrollments...');
    
    const existingOrders = await Order.find({
      paymentStatus: 'paid',
      orderStatus: 'completed'
    }).populate('userId').populate('courseIds');

    let migratedOrders = 0;
    for (const order of existingOrders) {
      try {
        if (!order.userId || !order.courseIds || order.courseIds.length === 0) {
          console.log(`⚠️ Skipping order ${order._id} - missing user or courses`);
          continue;
        }

        for (const courseId of order.courseIds) {
          // Check if enrollment already exists
          const existingEnrollment = await Enrollment.findOne({
            userId: order.userId._id,
            courseId: courseId
          });

          if (!existingEnrollment) {
            await Enrollment.create({
              userId: order.userId._id,
              courseId: courseId,
              enrollmentType: order.orderType === 'subscription' ? 'subscription' : 'purchase',
              isActive: true,
              orderId: order._id,
              enrollmentDate: order.createdAt || new Date()
            });
          }
        }
        
        migratedOrders++;
        console.log(`✅ Migrated order ${order.orderNumber} for user ${order.userId.email}`);
      } catch (error) {
        console.error(`❌ Error migrating order ${order._id}:`, error.message);
      }
    }

    // Step 4: Clean up purchasedCourses array (deprecated)
    console.log('\n4️⃣ Cleaning up deprecated purchasedCourses field...');
    
    const usersWithPurchasedCourses = await userModel.find({
      purchasedCourses: { $exists: true, $ne: [] }
    });

    console.log(`Found ${usersWithPurchasedCourses.length} users with purchasedCourses data`);

    for (const user of usersWithPurchasedCourses) {
      try {
        // Migrate purchased courses to enrollments if not already exists
        for (const courseId of user.purchasedCourses) {
          const existingEnrollment = await Enrollment.findOne({
            userId: user._id,
            courseId: courseId
          });

          if (!existingEnrollment) {
            await Enrollment.create({
              userId: user._id,
              courseId: courseId,
              enrollmentType: 'purchase',
              isActive: true,
              enrollmentDate: new Date()
            });
          }
        }

        // Clear the deprecated field (comment out for safety)
        // user.purchasedCourses = [];
        // await user.save();
        
        console.log(`✅ Migrated purchasedCourses for user ${user.email}`);
      } catch (error) {
        console.error(`❌ Error migrating purchasedCourses for user ${user.email}:`, error.message);
      }
    }

    // Step 5: Verification
    console.log('\n5️⃣ Verification...');
    
    const totalEnrollments = await Enrollment.countDocuments({ isActive: true });
    const totalUsers = await userModel.countDocuments();
    const totalActiveSubscriptions = await userModel.countDocuments({ 'subscription.status': 'active' });
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Total enrollments created: ${totalEnrollments}`);
    console.log(`- Total users in system: ${totalUsers}`);
    console.log(`- Users with active subscriptions: ${totalActiveSubscriptions}`);
    console.log(`- Subscription users migrated: ${migratedSubscriptions}`);
    console.log(`- Orders migrated: ${migratedOrders}`);
    console.log(`- Product mappings created: ${allCourses.length + 1}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('- Test the system thoroughly before deploying to production');
    console.log('- The purchasedCourses field is deprecated but not removed for safety');
    console.log('- Monitor logs for any access issues');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Rollback function (if needed)
const rollbackMigration = async () => {
  console.log('🔄 Rolling back migration...');
  
  try {
    // Remove all enrollments
    const deletedEnrollments = await Enrollment.deleteMany({});
    console.log(`Removed ${deletedEnrollments.deletedCount} enrollments`);
    
    // Remove product mappings
    const deletedMappings = await ProductMapping.deleteMany({});
    console.log(`Removed ${deletedMappings.deletedCount} product mappings`);
    
    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    await rollbackMigration();
  } else {
    await runMigration();
  }
  
  await mongoose.disconnect();
  console.log('👋 Database connection closed');
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run migration
main().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});