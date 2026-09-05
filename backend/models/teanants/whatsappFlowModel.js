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
        nodeId: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["INTERACTIVE_LIST", "REPLY_BUTTONS", "TEXT_INPUT", "API_CALL", "END"],
            required: true
        },
        messageText: {
            type: String,
            required: true
        },
        options: [
            {
                optionId: { type: String, required: true },
                title: { type: String, required: true },
                description: { type: String, default: "" },
                nextNodeId: { type: String, required: true } // Points to another Node document's nodeId
            }
        ],
        inputVariable: { type: String, default: null }, // e.g., "appointment_date"
        nextNodeId: { type: String, default: null },    // Used for TEXT_INPUT or API_CALL
        isStartNode: { type: Boolean, default: false }  // Marks "START_NODE"
    },
    { timestamps: true }
);

// Compound index for O(1) direct node lookup
whatsappNodeSchema.index({ nodeId: 1 });

