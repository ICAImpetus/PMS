import razorpay from "../config/razorpay.js";
import crypto from 'crypto';
import Subscription from "../models/master.models/Subscription.js";

export const createOrder = async (req, res) => {
    try {
        const { ammount } = req.body;
        console.log('reach', ammount)
        const options = {
            amount: ammount * 100,
            currency: 'INR',
            receipt: `reciept${Date.now()}`
        }

        const order = await razorpay.orders.create(options);
        if (order) {
            res.status(200).json(order);
        }
    } catch (error) {
        console.log('While creating order', error);
    }
}

export const verifyPayment = async (req, res) => {
    try {

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, ammount, userId } = req.body;
        console.log('verify', userId);
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature =
            crypto.createHmac(
                'sha256',
                process.env.RAZORPAY_KEY_SECRET
            ).update(body)
                .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({
                success: false
            })
        }

        await Subscription.create({
            userId,
            amount: ammount,
            paymentId: razorpay_payment_id
        });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.log('while verify payment', error);
    }
}