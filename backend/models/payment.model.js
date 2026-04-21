import { model, Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_subscription_id: {
      type: String,
      required: false, // removed required
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      default: 500, // Default amount in INR
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: false, // Optional for subscription payments
    }
  },
  {
    timestamps: true,
  }
);

const Payment = model("Payments", paymentSchema);

export default Payment;
