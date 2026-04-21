import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment if not specified
if (!process.env.MONGO_TEST_URI && !process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/lms_test';
}

// Set test environment
process.env.NODE_ENV = 'test';

// Suppress console.log during tests (optional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}