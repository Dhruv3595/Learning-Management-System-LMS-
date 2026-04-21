import { model, Schema } from "mongoose";

const contactSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            minLength: [3, "Name must be at least 3 characters"],
            maxLength: [50, "Name should be less than 50 characters"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            minLength: [10, "Message must be at least 10 characters"],
            maxLength: [1000, "Message should be less than 1000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

const Contact = model("Contact", contactSchema);

export default Contact; 