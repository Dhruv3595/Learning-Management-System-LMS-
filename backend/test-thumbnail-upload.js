// Simple test to create a course via API with thumbnail
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testCourseWithThumbnail() {
    try {
        console.log('🧪 Testing course creation with thumbnail...');
        
        const form = new FormData();
        form.append('title', 'Thumbnail Test Course - ' + Date.now());
        form.append('description', 'This course is created to test the thumbnail upload functionality. The image should be visible on both course list and detail pages.');
        form.append('category', 'Technology');
        form.append('createdBy', 'Test Creator');
        form.append('price', '1999');
        
        // Use existing image from uploads folder
        const imagePath = './uploads/adam-berkecz-K6kZKJOmZrk-unsplash.jpg';
        if (fs.existsSync(imagePath)) {
            form.append('thumbnail', fs.createReadStream(imagePath));
            console.log('📸 Using image:', imagePath);
        } else {
            console.log('❌ Test image not found');
            return;
        }
        
        const response = await fetch('http://localhost:5001/api/v1/courses', {
            method: 'POST',
            body: form
        });
        
        const result = await response.json();
        console.log('📊 Response:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('✅ Course created successfully!');
            console.log('🖼️  Thumbnail path:', result.course.thumbnail);
            
            // Test if image is accessible
            const imageUrl = `http://localhost:5001${result.course.thumbnail}`;
            console.log('🔗 Image URL:', imageUrl);
            
            const imageTest = await fetch(imageUrl);
            console.log('📷 Image accessible:', imageTest.ok ? '✅' : '❌');
        } else {
            console.log('❌ Course creation failed:', result.message);
        }
        
    } catch (error) {
        console.error('💥 Test error:', error.message);
    }
}

testCourseWithThumbnail();