import mongoose from "mongoose";
export const messageSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true
        },
        phoneNumberId: {
            type: String,
            required: true
        },
        patientPhoneNumber: {
            type: String,
            required: true
        },
        direction: {
            type: String,
            enum: ['INBOUND', 'OUTBOUND'],
            required: true
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'document', 'interactive', 'template'],
            default: 'text'
        },
        content: {
            type: String,
            required: true
        },
        metaMessageId: {
            type: String,
            sparse: true
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read', 'failed', 'received'],
            default: 'received'
        }
    },
    { timestamps: true, versionKey: false }
);

