import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import http from "http";
const PORT = process.env.PORT || 5001;
import Razorpay from "razorpay";

// Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Check Razorpay connection
async function testRazorpayConnection() {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // amount in paise (₹1)
      currency: "INR",
      receipt: "test_order_1",
    });
    console.log("✅ Razorpay connection successful. Test Order ID:", order.id);
  } catch (error) {
    console.error("❌ Razorpay connection failed:", error?.error || error);
  }
}
testRazorpayConnection();

// Create HTTP server with increased timeout for large file uploads
const server = http.createServer(app);

// Set server timeout to 30 minutes for large video uploads
server.timeout = 30 * 60 * 1000; // 30 minutes
server.keepAliveTimeout = 30 * 60 * 1000; // 30 minutes
server.headersTimeout = 31 * 60 * 1000; // 31 minutes (slightly more than keepAliveTimeout)

server.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
  console.log(`📁 Server timeout set to 30 minutes for large file uploads`);
});
