// Helper function to test the course purchase flow
// For testing and debugging purposes

import mongoose from 'mongoose';
import courseModel from './models/course.model.js';
import userModel from './models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function main() {
  await connectDB();

  try {
    // 1. Fetch a sample course
    const course = await courseModel.findOne().exec();
    if (!course) {
      console.error('No courses found in database');
      process.exit(1);
    }
    console.log(`\nSample course found: ${course.title} (${course._id})`);

    // 2. Verify course ID is valid ObjectId
    console.log(`\nCourse ID validation check:`);
    console.log(`- Is course._id a valid ObjectId? ${mongoose.Types.ObjectId.isValid(course._id)}`);
    console.log(`- course._id type: ${typeof course._id}`);
    console.log(`- course._id.toString() type: ${typeof course._id.toString()}`);
    console.log(`- Is course._id.toString() a valid ObjectId? ${mongoose.Types.ObjectId.isValid(course._id.toString())}`);

    // 3. Check if course is properly indexed
    console.log(`\nChecking database indexes...`);
    const courseIndexes = await courseModel.collection.indexes();
    console.log('Course collection indexes:', courseIndexes);

    // 4. Test a sample purchase request payload
    console.log(`\nSample purchase request payload:`);
    const samplePayload = {
      courseId: course._id.toString()
    };
    console.log(JSON.stringify(samplePayload, null, 2));

    // 5. Fetch a sample user (non-admin)
    const user = await userModel.findOne({ role: 'USER' }).exec();
    if (user) {
      console.log(`\nSample user found: ${user.fullName} (${user._id})`);
    } else {
      console.log('\nNo regular users found in database');
    }

    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();