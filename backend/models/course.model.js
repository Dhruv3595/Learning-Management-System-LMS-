import { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      unique: true,
      required: [true, "Title is required"],
      minLength: [5, "Title must be at least 5 character"],
      maxLength: [59, "Title should be less than 60 character"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minLength: [8, "Description must be at least 8 character"],
      maxLength: [500, "Description should be less than 500 character"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    thumbnail: {
      type: String,
    },
    video: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function(value) {
          // Ensure price is a valid positive number and matches what we store
          return Number.isInteger(value) && value >= 0;
        },
        message: "Price must be a valid positive integer"
      }
    },
    lectures: [
      {
        title: {
          type: String,
          required: [true, "Lecture title is required"],
          trim: true,
        },
        description: {
          type: String,
          required: [true, "Lecture description is required"],
          trim: true,
        },
        videoType: {
          type: String,
          enum: ["youtube", "upload"],
          required: [true, "Video type is required"],
        },
        videoUrl: {
          type: String,
          required: [true, "Video URL is required"],
        },
        lecture: {
          public_id: {
            type: String,
          },
          secure_url: {
            type: String,
          },
        },
      },
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Course = model("Course", courseSchema);

export default Course;
