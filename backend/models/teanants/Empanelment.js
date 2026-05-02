import mongoose from "mongoose";

const coverageOptionSchema = new mongoose.Schema(
    {
        doctor: { type: Object, default: {} },
        department: { type: Object, default: {} },
        service: [String],
        treatableAreas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Suggestion",
            }
        ],
        coverageLimit: { type: String },
        notes: { type: String },
    },
    { _id: false }
);

export const EmpanelmentSchema = new mongoose.Schema(
    {
        policyName: { type: String, required: true },

        // hospital: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Hospital",
        //     required: true,
        // },

        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },

        typeOfCoverage: {
            type: String,
            required: true,
        },

        coverageOptions: {
            type: [coverageOptionSchema],
            default: [],
        },

        coveringAreasOfSpeciality: {
            type: [String],
            default: [],
        },

        additionalRemarks: {
            type: String,
        },

        doctorsAvailable: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Doctor",
            default: [],
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// const EmpanelmentModel = mongoose.model("Empanelment", empanelmentSchema);

// export default EmpanelmentModel;