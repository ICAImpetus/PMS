import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// PATCH /doctor/:id/availability
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;