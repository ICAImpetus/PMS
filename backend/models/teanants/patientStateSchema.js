// models/PatientState.js
import mongoose from "mongoose";

export const patientStateSchema = new mongoose.Schema(
    {
        patientPhoneNumber: { type: String, required: true, index: true },
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
        currentNodeId: { type: String, default: "START_NODE" },

        // Dynamic Session Variables Collected (e.g., { doctor: "Dr. Sharma", date: "15/09/2026" })
        context: { type: Map, of: String, default: {} },

        expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) }
    },
    { timestamps: true }
);

