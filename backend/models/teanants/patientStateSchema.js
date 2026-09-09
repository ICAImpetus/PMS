// models/PatientState.js
import mongoose from "mongoose";
export const patientStateSchema = new mongoose.Schema(
    {
        patientPhoneNumber: { type: String, required: true, index: true },
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
        currentNodeId: { type: String, default: "START_NODE" },

        // Dynamic Session Variables (e.g., { patient_name: "Rahul", selected_doctor_id: "DOC_1" })
        context: {
            type: Map,
            of: String,
            default: {}
        },

        // Auto-expire inactive session after 30 mins
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 60 * 1000)
        }
    },
    { timestamps: true }
);

// Compound Index for fast session resolution
patientStateSchema.index({ hospitalId: 1, patientPhoneNumber: 1 }, { unique: true });