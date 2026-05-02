import mongoose from "mongoose";

// Patient
export const PatientSchema = new mongoose.Schema(
    {
        hospitalId: {
            hospitalId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hospital",
            },

            name: String,
        },

        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
            index: true,
        },

        agentDetails: {
            name: String,

            agentId: {
                type: mongoose.Schema.Types.ObjectId,
            },
        },

        patientName: {
            type: String,
            trim: true,
        },

        patientMobile: {
            type: String,
            required: true,
            index: true,
        },

        alternateMobile: String,

        patientAge: Number,

        location: String,

        gender: String,

        status: String,

        category: String,

        totalVisit: {
            type: Number,
            default: 0,
        },

        lastVisit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FilledForms",
            default: null
        },
        // optional analytics
        lastVisitAt: {
            type: Date,
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true,
    }
);