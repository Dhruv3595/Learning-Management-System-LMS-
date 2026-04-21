import axios from 'axios';

const API_URL = 'http://localhost:5001/api/v1';

async function testForgotPassword() {
  try {
    console.log('\n🧪 Testing Forgot Password Email Functionality\n');
    console.log('=' . repeat(50));
    
    // Replace with a real registered email in your database
    const testEmail = 'rhythmp9713@gmail.com'; // Change this to a registered user email
    
    console.log(`\n📧 Sending forgot password request for: ${testEmail}`);
    
    const response = await axios.post(`${API_URL}/user/forgot-password`, {
      email: testEmail
    });
    
    console.log('\n✅ SUCCESS Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.development) {
      console.log('\n⚠️  DEVELOPMENT MODE - SMTP not configured');
      console.log('📋 Reset Token:', response.data.resetToken);
      console.log('🔗 Reset URL:', response.data.resetURL);
      console.log('\n💡 You can use this URL to test password reset without email');
    } else {
      console.log('\n📨 EMAIL SENT SUCCESSFULLY!');
      console.log('📬 Check the inbox of:', testEmail);
      console.log('📁 Also check spam/junk folder if not in inbox');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n' + '='.repeat(50));
    console.log('❌ Test failed!\n');
  }
}

// Run the test
testForgotPassword();
