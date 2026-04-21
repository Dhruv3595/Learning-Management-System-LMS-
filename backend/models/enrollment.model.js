import { Schema, model } from "mongoose";

const enrollmentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    enrollmentType: {
        type: String,
        enum: ['purchase', 'subscription', 'admin_grant', 'free'],
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: false // Optional for admin grants or free courses
    },
    expiryDate: {
        type: Date,
        required: false // For subscription-based or time-limited access
    },
    accessDetails: {
        grantedBy: {
            type: Schema.Types.ObjectId,
            ref: "User", // Admin who granted access
            required: false
        },
        reason: String, // Reason for admin grant
        subscriptionId: String // For subscription-based enrollments
    }
}, {
    timestamps: true
});

// Compound index to ensure unique enrollment per user per course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Indexes for performance
enrollmentSchema.index({ userId: 1, isActive: 1 });
enrollmentSchema.index({ courseId: 1, isActive: 1 });
enrollmentSchema.index({ enrollmentType: 1 });

// Method to check if enrollment is valid (not expired)
enrollmentSchema.methods.isValid = function() {
    if (!this.isActive) return false;
    if (this.expiryDate && this.expiryDate < new Date()) return false;
    return true;
};

const Enrollment = model("Enrollment", enrollmentSchema);

export default Enrollment;