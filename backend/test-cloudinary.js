import { configDotenv } from "dotenv";
configDotenv({ path: './.env' });
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary directly in test
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test basic configuration
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY);
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');
    
    // Check config object
    console.log('Cloudinary config:', cloudinary.config());
    
    // Test upload endpoint accessibility
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!', result);
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
    return false;
  }
}

testCloudinaryConnection();