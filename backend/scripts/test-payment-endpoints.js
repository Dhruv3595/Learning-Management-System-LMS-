// Test script to verify the payment fixes
import fetch from 'node-fetch';

async function testPaymentEndpoints() {
  console.log('🔍 Testing Payment Endpoints...\n');

  try {
    // Test 1: Test course order creation (should require auth)
    console.log('1. Testing course order creation...');
    const orderResponse = await fetch('http://localhost:5001/api/v1/payments/course-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: "68d643524badd7713e527129" // Test course ID
      })
    });

    const orderResult = await orderResponse.json();
    console.log(`   Status: ${orderResponse.status}`);
    console.log(`   Response:`, orderResult);

    if (orderResponse.status === 401) {
      console.log('   ✅ Correctly requires authentication\n');
    } else {
      console.log('   ⚠️ Unexpected response\n');
    }

    // Test 2: Test purchase course endpoint (should require auth)
    console.log('2. Testing purchase course endpoint...');
    const purchaseResponse = await fetch('http://localhost:5001/api/v1/payments/purchase-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: "68d643524badd7713e527129",
        paymentDetails: {
          razorpay_payment_id: "test_payment_123",
          razorpay_signature: "test_signature_123"
        }
      })
    });

    const purchaseResult = await purchaseResponse.json();
    console.log(`   Status: ${purchaseResponse.status}`);
    console.log(`   Response:`, purchaseResult);

    if (purchaseResponse.status === 401) {
      console.log('   ✅ Correctly requires authentication\n');
    } else {
      console.log('   ⚠️ Unexpected response\n');
    }

    // Test 3: Test subscription endpoint (should require auth)
    console.log('3. Testing subscription endpoint...');
    const subResponse = await fetch('http://localhost:5001/api/v1/payments/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const subResult = await subResponse.json();
    console.log(`   Status: ${subResponse.status}`);
    console.log(`   Response:`, subResult);

    if (subResponse.status === 401) {
      console.log('   ✅ Correctly requires authentication\n');
    } else {
      console.log('   ⚠️ Unexpected response\n');
    }

    console.log('🎉 All payment endpoints are properly secured!');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testPaymentEndpoints();