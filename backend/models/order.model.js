import { Schema, model } from "mongoose";

const orderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseIds: [{
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }],
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'completed', 'canceled', 'refunded'],
        default: 'processing'
    },
    paymentDetails: {
        transactionId: String,
        paymentMethod: String,
        razorpay_payment_id: String,
        razorpay_order_id: String,
        razorpay_signature: String,
        gatewayResponse: Schema.Types.Mixed
    },
    pricing: {
        subtotal: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        },
        couponCode: String,
        currency: {
            type: String,
            default: 'INR'
        }
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    orderType: {
        type: String,
        enum: ['course_purchase', 'subscription'],
        default: 'course_purchase'
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Find the last order of today to generate sequential number
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const lastOrder = await this.constructor.findOne({
            createdAt: { $gte: todayStart, $lt: todayEnd }
        }).sort({ createdAt: -1 });
        
        let sequenceNumber = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop());
            sequenceNumber = lastSequence + 1;
        }
        
        this.orderNumber = `ORD-${year}${month}${day}-${String(sequenceNumber).padStart(4, '0')}`;
    }
    next();
});

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = model("Order", orderSchema);

export default Order;