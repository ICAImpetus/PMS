import mongoose from "mongoose";

export const whatsappAccountSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
            unique: true
        },
        wabaId: {
            type: String,
            required: true,
            trim: true
        },
        phoneNumberId: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        accessToken: {
            type: String,
            required: true
        },
        displayPhoneNumber: {
            type: String,
            trim: true
        },
        businessName: {
            type: String,
            trim: true
        },
        qualityRating: {
            type: String,
            trim: true
        },
        profile: {
            profilePictureUrl: { type: String, default: "" },
            description: { type: String, default: "" },
            address: { type: String, default: "" },
            email: { type: String, default: "" },
            websites: [{ type: String }],
            category: { type: String, default: "" }
        },
        isConnected: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true, versionKey: false }
);