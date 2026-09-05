import mongoose from "mongoose";
export const messageSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
            index: true
        },
        phoneNumberId: {
            type: String,
            required: true
        },
        patientPhoneNumber: {
            type: String,
            required: true,
            index: true
        },
        direction: {
            type: String,
            enum: ['INBOUND', 'OUTBOUND'],
            required: true
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'document', 'interactive', 'template', 'location', 'audio', 'video'],
            default: 'text'
        },
        content: {
            type: String,
            required: true
        },
        metaMessageId: {
            type: String,
            sparse: true,
            index: true
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read', 'failed', 'received'],
            default: 'received'
        },
        // Optional payload store for raw Meta interactive objects or media URLs
        rawMediaUrl: { type: String, default: null }
    },
    { timestamps: true, versionKey: false }
);