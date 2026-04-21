import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("📍 Connection URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log("✅ MongoDB connected successfully!");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("🏠 Host:", mongoose.connection.host);

    await mongoose.disconnect();
    console.log("🔌 Connection closed successfully");

  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Possible solutions:");
      console.log("1. Make sure MongoDB is installed and running");
      console.log("2. Check if MongoDB service is started");
      console.log("3. Verify the connection string is correct");
    }

    if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 Possible solutions:");
      console.log("1. Check your internet connection");
      console.log("2. Verify the MongoDB Atlas cluster is active");
      console.log("3. Check IP whitelist in MongoDB Atlas");
    }

    process.exit(1);
  }
};

testConnection();