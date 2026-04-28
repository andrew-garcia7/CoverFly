import mongoose, { Schema } from "mongoose";
const PaymentSchema = new Schema({
    rideId: { type: String, required: true, index: true },
    riderUserId: { type: String, required: true, index: true },
    method: { type: String, required: true, enum: ["CASH", "UPI", "CARD"] },
    status: {
        type: String,
        required: true,
        enum: ["PENDING", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"],
        index: true
    },
    provider: { type: String, required: true, enum: ["mock", "stripe", "razorpay"] },
    amountPaise: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["INR"] },
    providerRef: { type: String, required: false }
}, { timestamps: true });
PaymentSchema.index({ rideId: 1, status: 1 });
export const PaymentModel = mongoose.model("Payment", PaymentSchema);
