import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
    {
        from: { type: String },
        to: { type: String },
    },
    { _id: false }
);

export const InchargeSchema = new mongoose.Schema(
    {
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        extensionNo: {
            type: String,
            trim: true,
        },

        contactNo: {
            type: String,
            required: true,
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suggestion",
            required: true,
        },
        serviceType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suggestion",
            required: true,
        },

        timeSlot: timeSlotSchema,

        customId: {
            type: String,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// const InchargeModel = mongoose.model("Incharge", inchargeSchema);

// export default InchargeModel;