import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "./models/user.model.js";

dotenv.config();

const makeAdmin = async (email) => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log(`🔍 Looking for user with email: ${email}`);
    const user = await userModel.findOneAndUpdate(
      { email: email },
      { role: "ADMIN" },
      { new: true }
    );

    if (user) {
      console.log("✅ User promoted to ADMIN successfully!");
      console.log(`👤 User: ${user.fullName} (${user.email})`);
      console.log(`🔑 Role: ${user.role}`);
    } else {
      console.log("❌ User not found with that email");
      console.log("💡 Make sure the user has registered first");
    }

    await mongoose.disconnect();
    console.log("🔌 Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

// Usage: node make-admin.js user@example.com
const email = process.argv[2];
if (!email) {
  console.log("❌ Please provide an email address");
  console.log("Usage: node make-admin.js user@example.com");
  process.exit(1);
}

makeAdmin(email);