// models/WhatsAppNode.js
import mongoose from "mongoose";

export const whatsappNodeSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true
        },
        nodeId: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["INTERACTIVE_LIST", "REPLY_BUTTONS", "TEXT_INPUT", "API_CALL", "DB_QUERY", "END"],
            required: true
        },
        messageText: { type: String, required: true },

        // Static Options
        options: [
            {
                optionId: { type: String, required: true },
                title: { type: String, required: true },
                description: { type: String, default: "" },
                nextNodeId: { type: String, required: true }
            }
        ],

        // Used when type === "TEXT_INPUT"
        inputVariable: { type: String, default: null }, // e.g. "patient_name", "patient_age"

        // Target Node ID for TEXT_INPUT or API_CALL/DB_QUERY
        nextNodeId: { type: String, default: null },

        isStartNode: { type: Boolean, default: false }
    },
    { timestamps: true }
);

whatsappNodeSchema.index({ nodeId: 1 }, { unique: true });

