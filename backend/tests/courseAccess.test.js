import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';
import Order from '../models/order.model.js';
import ProductMapping from '../models/productMapping.model.js';

const request = supertest(app);

describe('Course Access Bug Fix Tests', () => {
  let testUser;
  let testCourse1;
  let testCourse2;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_TEST_URI || process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await Promise.all([
      userModel.deleteMany({}),
      courseModel.deleteMany({}),
      Enrollment.deleteMany({}),
      Order.deleteMany({}),
      ProductMapping.deleteMany({})
    ]);

    // Create test courses
    testCourse1 = await courseModel.create({
      title: 'Test Course 1',
      description: 'This is test course 1',
      category: 'Programming',
      createdBy: 'Test Instructor',
      price: 299
    });

    testCourse2 = await courseModel.create({
      title: 'Test Course 2', 
      description: 'This is test course 2',
      category: 'Design',
      createdBy: 'Test Instructor',
      price: 399
    });

    // Create test user
    testUser = await userModel.create({
      fullName: 'test user',
      email: 'test@example.com',
      password: 'test1234',
      role: 'USER'
    });

    // Get auth token
    const loginResponse = await request
      .post('/api/v1/user/login')
      .send({
        email: 'test@example.com',
        password: 'test1234'
      });

    authToken = loginResponse.headers['set-cookie'];

    // Create product mappings
    await ProductMapping.create({
      productId: `course_${testCourse1._id}`,
      productType: 'single_course',
      courseIds: [testCourse1._id],
      name: testCourse1.title,
      price: testCourse1.price,
      isActive: true
    });

    await ProductMapping.create({
      productId: `course_${testCourse2._id}`,
      productType: 'single_course', 
      courseIds: [testCourse2._id],
      name: testCourse2.title,
      price: testCourse2.price,
      isActive: true
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await Promise.all([
      userModel.deleteMany({}),
      courseModel.deleteMany({}),
      Enrollment.deleteMany({}),
      Order.deleteMany({}),
      ProductMapping.deleteMany({})
    ]);
  });

  describe('Course Access Authorization', () => {
    it('should deny access to course content without enrollment', async () => {
      const response = await request
        .get(`/api/v1/courses/${testCourse1._id}`)
        .set('Cookie', authToken);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('do not have access');
    });

    it('should allow access to course content with valid enrollment', async () => {
      // Create enrollment for course 1
      await Enrollment.create({
        userId: testUser._id,
        courseId: testCourse1._id,
        enrollmentType: 'purchase',
        isActive: true
      });

      const response = await request
        .get(`/api/v1/courses/${testCourse1._id}`)
        .set('Cookie', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should only allow access to purchased course, not all courses', async () => {
      // Enroll user in course 1 only
      await Enrollment.create({
        userId: testUser._id,
        courseId: testCourse1._id,
        enrollmentType: 'purchase',
        isActive: true
      });

      // Should allow access to course 1
      const response1 = await request
        .get(`/api/v1/courses/${testCourse1._id}`)
        .set('Cookie', authToken);

      expect(response1.status).toBe(200);

      // Should deny access to course 2
      const response2 = await request
        .get(`/api/v1/courses/${testCourse2._id}`)
        .set('Cookie', authToken);

      expect(response2.status).toBe(403);
    });
  });

  describe('Individual Course Purchase', () => {
    it('should create enrollment only for purchased course', async () => {
      const purchaseResponse = await request
        .post('/api/v1/payment/purchase-course')
        .set('Cookie', authToken)
        .send({
          courseId: testCourse1._id,
          paymentDetails: {
            razorpay_payment_id: 'test_payment_123',
            razorpay_signature: 'test_signature'
          }
        });

      expect(purchaseResponse.status).toBe(200);
      expect(purchaseResponse.body.success).toBe(true);

      // Verify enrollment was created for course 1 only
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId.toString()).toBe(testCourse1._id.toString());
      expect(enrollments[0].enrollmentType).toBe('purchase');

      // Verify user can access course 1
      const accessResponse1 = await request
        .get(`/api/v1/payment/course-access/${testCourse1._id}`)
        .set('Cookie', authToken);

      expect(accessResponse1.status).toBe(200);
      expect(accessResponse1.body.hasAccess).toBe(true);

      // Verify user cannot access course 2
      const accessResponse2 = await request
        .get(`/api/v1/payment/course-access/${testCourse2._id}`)
        .set('Cookie', authToken);

      expect(accessResponse2.status).toBe(200);
      expect(accessResponse2.body.hasAccess).toBe(false);
    });

    it('should prevent double purchase of same course', async () => {
      // Create existing enrollment
      await Enrollment.create({
        userId: testUser._id,
        courseId: testCourse1._id,
        enrollmentType: 'purchase',
        isActive: true
      });

      // Try to purchase again
      const response = await request
        .post('/api/v1/payment/purchase-course')
        .set('Cookie', authToken)
        .send({
          courseId: testCourse1._id,
          paymentDetails: {
            razorpay_payment_id: 'test_payment_456',
            razorpay_signature: 'test_signature'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already have access');
    });
  });

  describe('Subscription Purchase', () => {
    beforeEach(async () => {
      // Create subscription product mapping
      await ProductMapping.create({
        productId: 'subscription_all_courses',
        productType: 'subscription',
        courseIds: [testCourse1._id, testCourse2._id],
        name: 'All Courses Subscription',
        price: 499,
        isActive: true,
        subscriptionDetails: {
          planId: process.env.RAZORPAY_PLAN_ID || 'test_plan_id',
          duration: 365,
          isRecurring: true
        }
      });
    });

    it('should create enrollments for all courses in subscription', async () => {
      // Mock subscription verification (simplified for test)
      const user = await userModel.findById(testUser._id);
      user.subscription = {
        id: 'test_sub_123',
        status: 'active'
      };
      await user.save();

      // Manually create enrollments as subscription verification would
      await Promise.all([testCourse1._id, testCourse2._id].map(courseId =>
        Enrollment.create({
          userId: testUser._id,
          courseId: courseId,
          enrollmentType: 'subscription',
          isActive: true,
          accessDetails: {
            subscriptionId: 'test_sub_123'
          }
        })
      ));

      // Verify enrollments were created for both courses
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(2);
      expect(enrollments.every(e => e.enrollmentType === 'subscription')).toBe(true);

      // Verify access to both courses
      const access1 = await request
        .get(`/api/v1/payment/course-access/${testCourse1._id}`)
        .set('Cookie', authToken);

      const access2 = await request
        .get(`/api/v1/payment/course-access/${testCourse2._id}`)
        .set('Cookie', authToken);

      expect(access1.body.hasAccess).toBe(true);
      expect(access2.body.hasAccess).toBe(true);
    });
  });

  describe('Admin Access', () => {
    let adminToken;

    beforeEach(async () => {
      // Create admin user
      const adminUser = await userModel.create({
        fullName: 'admin user',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'ADMIN'
      });

      // Get admin auth token
      const loginResponse = await request
        .post('/api/v1/user/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        });

      adminToken = loginResponse.headers['set-cookie'];
    });

    it('should allow admin access to all courses without enrollment', async () => {
      const response1 = await request
        .get(`/api/v1/courses/${testCourse1._id}`)
        .set('Cookie', adminToken);

      const response2 = await request
        .get(`/api/v1/courses/${testCourse2._id}`)
        .set('Cookie', adminToken);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it('should return admin access type for course access check', async () => {
      const response = await request
        .get(`/api/v1/payment/course-access/${testCourse1._id}`)
        .set('Cookie', adminToken);

      expect(response.status).toBe(200);
      expect(response.body.hasAccess).toBe(true);
      expect(response.body.accessType).toBe('admin');
    });
  });

  describe('User Enrollments API', () => {
    it('should return only user\'s enrolled courses', async () => {
      // Create enrollments for course 1 only
      await Enrollment.create({
        userId: testUser._id,
        courseId: testCourse1._id,
        enrollmentType: 'purchase',
        isActive: true
      });

      const response = await request
        .get('/api/v1/payment/my-enrollments')
        .set('Cookie', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.enrollments).toHaveLength(1);
      expect(response.body.enrollments[0].courseId._id).toBe(testCourse1._id.toString());
      expect(response.body.totalCourses).toBe(1);
    });

    it('should not return inactive enrollments', async () => {
      // Create active and inactive enrollments
      await Enrollment.create({
        userId: testUser._id,
        courseId: testCourse1._id,
        enrollmentType: 'purchase',
        isActive: true
      });

      await Enrollment.create({
        userId: testUser._id,
        courseId: testCourse2._id,
        enrollmentType: 'purchase',
        isActive: false
      });

      const response = await request
        .get('/api/v1/payment/my-enrollments')
        .set('Cookie', authToken);

      expect(response.status).toBe(200);
      expect(response.body.enrollments).toHaveLength(1);
      expect(response.body.enrollments[0].courseId._id).toBe(testCourse1._id.toString());
    });
  });

  describe('Webhook Idempotency', () => {
    it('should handle duplicate webhook calls gracefully', async () => {
      const courseId = testCourse1._id;
      const paymentDetails = {
        razorpay_payment_id: 'test_payment_duplicate',
        razorpay_signature: 'test_signature'
      };

      // First purchase
      const response1 = await request
        .post('/api/v1/payment/purchase-course')
        .set('Cookie', authToken)
        .send({
          courseId,
          paymentDetails
        });

      expect(response1.status).toBe(200);

      // Verify only one enrollment exists
      const enrollments1 = await Enrollment.find({ userId: testUser._id, courseId });
      expect(enrollments1).toHaveLength(1);

      // Duplicate purchase attempt (simulating duplicate webhook)
      const response2 = await request
        .post('/api/v1/payment/purchase-course')
        .set('Cookie', authToken)
        .send({
          courseId,
          paymentDetails
        });

      expect(response2.status).toBe(400);
      expect(response2.body.message).toContain('already have access');

      // Verify still only one enrollment
      const enrollments2 = await Enrollment.find({ userId: testUser._id, courseId });
      expect(enrollments2).toHaveLength(1);
    });
  });
});

describe('Integration Test: Complete Purchase Flow', () => {
  let testUser, testCourse, authToken;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_TEST_URI || process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up and setup
    await Promise.all([
      userModel.deleteMany({}),
      courseModel.deleteMany({}),
      Enrollment.deleteMany({}),
      Order.deleteMany({}),
      ProductMapping.deleteMany({})
    ]);

    testCourse = await courseModel.create({
      title: 'Integration Test Course',
      description: 'Course for integration testing',
      category: 'Testing',
      createdBy: 'Test Instructor',
      price: 199
    });

    testUser = await userModel.create({
      fullName: 'integration user',
      email: 'integration@example.com',
      password: 'test1234',
      role: 'USER'
    });

    const loginResponse = await request
      .post('/api/v1/user/login')
      .send({
        email: 'integration@example.com',
        password: 'test1234'
      });

    authToken = loginResponse.headers['set-cookie'];

    await ProductMapping.create({
      productId: `course_${testCourse._id}`,
      productType: 'single_course',
      courseIds: [testCourse._id],
      name: testCourse.title,
      price: testCourse.price,
      isActive: true
    });
  });

  it('should complete full purchase and access flow correctly', async () => {
    // Step 1: User should not have access initially
    const initialAccessCheck = await request
      .get(`/api/v1/payment/course-access/${testCourse._id}`)
      .set('Cookie', authToken);

    expect(initialAccessCheck.body.hasAccess).toBe(false);

    // Step 2: User attempts to view course content - should fail
    const unauthorizedAccess = await request
      .get(`/api/v1/courses/${testCourse._id}`)
      .set('Cookie', authToken);

    expect(unauthorizedAccess.status).toBe(403);

    // Step 3: User purchases the course
    const purchaseResponse = await request
      .post('/api/v1/payment/purchase-course')
      .set('Cookie', authToken)
      .send({
        courseId: testCourse._id,
        paymentDetails: {
          razorpay_payment_id: 'integration_test_payment',
          razorpay_signature: 'integration_test_signature'
        }
      });

    expect(purchaseResponse.status).toBe(200);
    expect(purchaseResponse.body.success).toBe(true);

    // Step 4: Verify enrollment was created
    const enrollment = await Enrollment.findOne({
      userId: testUser._id,
      courseId: testCourse._id
    });

    expect(enrollment).toBeTruthy();
    expect(enrollment.isActive).toBe(true);
    expect(enrollment.enrollmentType).toBe('purchase');

    // Step 5: User should now have access
    const accessCheck = await request
      .get(`/api/v1/payment/course-access/${testCourse._id}`)
      .set('Cookie', authToken);

    expect(accessCheck.body.hasAccess).toBe(true);
    expect(accessCheck.body.accessType).toBe('purchase');

    // Step 6: User can now view course content
    const authorizedAccess = await request
      .get(`/api/v1/courses/${testCourse._id}`)
      .set('Cookie', authToken);

    expect(authorizedAccess.status).toBe(200);
    expect(authorizedAccess.body.success).toBe(true);

    // Step 7: Verify user's enrollments list
    const enrollmentsList = await request
      .get('/api/v1/payment/my-enrollments')
      .set('Cookie', authToken);

    expect(enrollmentsList.status).toBe(200);
    expect(enrollmentsList.body.enrollments).toHaveLength(1);
    expect(enrollmentsList.body.enrollments[0].courseId._id).toBe(testCourse._id.toString());
  });
});
