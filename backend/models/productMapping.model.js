import { Schema, model } from "mongoose";

const productMappingSchema = new Schema({
    productId: {
        type: String,
        required: true,
        unique: true // Each product can only map to one set of courses
    },
    productType: {
        type: String,
        enum: ['single_course', 'course_bundle', 'subscription'],
        required: true
    },
    courseIds: [{
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }],
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For subscription products
    subscriptionDetails: {
        planId: String, // Razorpay plan ID
        duration: Number, // Duration in days
        isRecurring: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Indexes
productMappingSchema.index({ productId: 1 });
productMappingSchema.index({ productType: 1, isActive: 1 });

const ProductMapping = model("ProductMapping", productMappingSchema);

export default ProductMapping;