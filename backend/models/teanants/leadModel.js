// models/Lead.js
import mongoose from "mongoose";

export const leadSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true
        },
        patientName: { type: String, required: true },
        patientPhoneNumber: { type: String, required: true, index: true },
        patientAge: { type: String, default: "" },

        leadType: {
            type: String,
            enum: ["APPOINTMENT_BOOKING", "CALLBACK_REQUEST"],
            required: true
        },

        // Dynamic Booking Details
        departmentName: { type: String, default: "" },
        doctorName: { type: String, default: "" },
        appointmentDate: { type: String, default: "" },
        appointmentSlot: { type: String, default: "" },
        branchName: { type: String, default: "" },

        leadStatus: {
            type: String,
            enum: ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"],
            default: "NEW"
        },
        source: {
            type: String,
            enum: ["WHATSAPP_DIRECT", "WEBSITE", "FACEBOOK_ADS", "INSTAGRAM_ADS"],
            default: "WHATSAPP_DIRECT"
        }
    },
    { timestamps: true }
);

leadSchema.index({ createdAt: -1 });
