import mongoose from "mongoose";

export const Suggestion = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);
