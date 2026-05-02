// models/LabTestModel.js

import mongoose from "mongoose";

export const LabTestSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            trim: true,
        },

        testCode: {
            type: String,
            trim: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },

        testName: {
            type: String,

            trim: true,
        },

        testType: {
            type: String,
            //   enum: ["Generic", "Package", "Profile"],
            default: "",
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",

        },
        serviceGroup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suggestion",
        },

        serviceCharge: {
            type: Number,
        },

        floor: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
        categoryApplicability: {
            type: [],
            // trim: true,
        },
        // department: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Department",
        // },
        // description: {
        //     type: String,
        //     trim: true,
        // },
        // floor: {
        //     type: String,
        //     trim: true,
        // },
        // location: {
        //     type: String,
        //     trim: true,
        // },
        packageTests: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabTest",
        }],
        precaution: {
            type: String,
            trim: true,
        },
        remarks: {
            type: String,
            trim: true,
        },
        // serviceCharge: {
        //     type: Number,
        // },
        // serviceGroup: {
        //     type: String,
        //     trim: true,
        // },
        serviceTime: {
            type: String,
            trim: true,
        },
        source: {
            type: String,
            trim: true,
        },
        tatReport: {
            type: String,
            trim: true,
        },
        // testCode: {
        //     type: String,
        //     trim: true,
        // },
        // testName: {
        //     type: String,
        //     trim: true,
        // },
        // testType: {
        //     type: String,
        //     trim: true,
        // },
    },
    { timestamps: true }
);

// const LabTestModel = mongoose.model("LabTest", labTestSchema);

// export default LabTestModel;