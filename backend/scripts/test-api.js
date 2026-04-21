import fetch from 'node-fetch';

async function testPurchaseAPI() {
  console.log('🔍 Testing Purchase API Endpoint...\n');

  try {
    // Test data
    const testData = {
      courseId: "68d643524badd7713e527129", // A course ID from our test
      paymentDetails: {
        razorpay_payment_id: `test_pay_${Date.now()}`,
        razorpay_signature: `test_sig_${Date.now()}`
      }
    };

    console.log('📤 Sending purchase request...');
    console.log('📋 Test data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5001/api/v1/payments/purchase-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail without proper authentication cookie
        // but we can see if the endpoint is working
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));

    if (response.status === 401) {
      console.log('\n✅ Endpoint is working! Got expected 401 (authentication required)');
    } else if (response.status === 500) {
      console.log('\n❌ Server error occurred');
    } else {
      console.log('\n✅ Endpoint responded successfully!');
    }

  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
  }
}

testPurchaseAPI();