// models/IPDModel.js

import mongoose from "mongoose";

export const IPDAndDayCareSchema = new mongoose.Schema(
    {
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },
        noOfBeds: {
            type: Number,
            required: true,
            min: 0,
        },

        charges: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suggestion",
            required: true,
        },

        serviceType: {
            type: String,
            // enum: ["General", "Semi-Private", "Private", "ICU", "Deluxe"],
            default: "General",
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// const IPDAndDayCareModel = mongoose.model("IPDAndDayCareModel", IPDAndDayCareSchema);

// export default IPDAndDayCareModel;