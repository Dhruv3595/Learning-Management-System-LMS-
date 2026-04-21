import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "./models/course.model.js"; // Update the path based on your structure

dotenv.config(); // Load environment variables

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Sample course data
const courses = [
  {
    title: "Introduction to JavaScript",
    description: "Learn JavaScript from basics to advanced concepts.",
    category: "Programming",
    thumbnail: {
      public_id: "sample_thumbnail_1",
      secure_url: "https://via.placeholder.com/150",
    },
    lectures: [
      {
        title: "Variables & Data Types",
        description: "Understanding JS variables and data types.",
        lecture: {
          public_id: "lecture_1",
          secure_url: "https://example.com/lecture1.mp4",
        },
      },
      {
        title: "Functions & Scope",
        description: "Learn about functions and scope in JS.",
        lecture: {
          public_id: "lecture_2",
          secure_url: "https://example.com/lecture2.mp4",
        },
      },
    ],
    numberOfLectures: 2,
    createdBy: "John Doe",
  },
  {
    title: "Mastering Python",
    description: "A complete guide to Python programming.",
    category: "Programming",
    thumbnail: {
      public_id: "sample_thumbnail_2",
      secure_url: "https://via.placeholder.com/150",
    },
    lectures: [
      {
        title: "Introduction to Python",
        description: "Understanding Python basics.",
        lecture: {
          public_id: "lecture_3",
          secure_url: "https://example.com/lecture3.mp4",
        },
      },
      {
        title: "OOP in Python",
        description: "Learn Object-Oriented Programming in Python.",
        lecture: {
          public_id: "lecture_4",
          secure_url: "https://example.com/lecture4.mp4",
        },
      },
    ],
    numberOfLectures: 2,
    createdBy: "Alice Smith",
  },
];

// Insert data function
const insertData = async () => {
  try {
    await connectDB();
    await Course.deleteMany(); // Optional: Clears existing data
    await Course.insertMany(courses);
    console.log("✅ Courses inserted successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting courses:", error);
    process.exit(1);
  }
};

insertData();
