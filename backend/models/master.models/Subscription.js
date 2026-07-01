import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        paymentId: {
            type: String,
            required: true,
            unique: true,
        },

        // orderId: {
        //   type: String,
        //   required: true,
        // },

        // status: {
        //   type: String,
        //   enum: ["paid", "failed", "pending"],
        //   default: "paid",
        // },

        // plan: {
        //   type: String,
        //   enum: ["monthly", "quarterly", "yearly"],
        //   default: "monthly",
        // },

        // paymentMethod: {
        //   type: String,
        //   default: "razorpay",
        // },
    },
    {
        timestamps: true,
    }
);

const Subscription = new mongoose.model('Subscription', subscriptionSchema)

export default Subscription;