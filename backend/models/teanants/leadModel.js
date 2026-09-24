import mongoose from "mongoose";

export const leadSchema = new mongoose.Schema(
    {
        // hospitalId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Hospital",
        //     required: true,
        //     index: true
        // },

        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            // required: true,
            // index: true
        },
        patientName: { type: String, required: true },
        patientPhoneNumber: { type: String, required: true, index: true },
        patientAge: { type: String, default: "" },
        patientGender: { type: String, default: "" },
        patientLocation: { type: String, default: "" },
        illnessDescription: { type: String, default: "" },

        leadType: {
            type: String,
            enum: ["APPOINTMENT_BOOKING", "CALLBACK_REQUEST"],
            required: true
        },

        // Dynamic Booking Details
        departmentName: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
        doctorName: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
        appointmentDate: { type: String },
        appointmentSlot: { type: String },
        branchName: { type: String },
        rejectReason: { type: String },

        leadStatus: {
            type: String,
            enum: ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"],
            default: "NEW"
        },
        patientStatus: {
            type: String,
            // enum: ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"],
            // default: "NEW"
        },
        source: {
            type: String,
            enum: ["WHATSAPP_DIRECT", "WEBSITE", "FACEBOOK_ADS", "INSTAGRAM_ADS"],
            default: "WHATSAPP_DIRECT"
        },

        // Delivery Tracking Fields
        isSent: {
            type: Boolean,
            default: false,
            index: true
        },
        sentAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

leadSchema.index({ createdAt: -1 });

