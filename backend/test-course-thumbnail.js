// Test script to create a course with thumbnail via API
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5001/api/v1';

async function testCourseCreation() {
    try {
        console.log('Testing course creation with thumbnail...');
        
        // Create form data
        const formData = new FormData();
        formData.append('title', 'Test Course With Thumbnail');
        formData.append('description', 'This is a test course created to verify thumbnail upload functionality. The thumbnail should be visible on both course list and course description pages.');
        formData.append('category', 'Technology');
        formData.append('createdBy', 'Test Admin');
        formData.append('price', '999');
        
        // Check if sample image exists, use one from uploads folder
        const uploadDir = 'uploads/';
        const files = fs.readdirSync(uploadDir);
        const imageFile = files.find(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
        
        if (imageFile) {
            const imagePath = path.join(uploadDir, imageFile);
            console.log('Using sample image:', imagePath);
            formData.append('thumbnail', fs.createReadStream(imagePath));
        } else {
            console.log('No sample image found in uploads directory');
        }
        
        // Make API request
        const response = await axios.post(`${API_BASE}/courses`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Cookie': 'your-auth-cookie-here' // You'll need to get this from browser
            }
        });
        
        console.log('✅ Course created successfully!');
        console.log('Course ID:', response.data.course._id);
        console.log('Thumbnail path:', response.data.course.thumbnail);
        
        // Test getting all courses
        console.log('\nTesting course list API...');
        const listResponse = await axios.get(`${API_BASE}/courses`);
        const createdCourse = listResponse.data.courses.find(c => c._id === response.data.course._id);
        console.log('Thumbnail in list:', createdCourse?.thumbnail);
        
        // Test getting specific course
        console.log('\nTesting course detail API...');
        const detailResponse = await axios.get(`${API_BASE}/courses/${response.data.course._id}`);
        console.log('Thumbnail in detail:', detailResponse.data.course.thumbnail);
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testCourseCreation();