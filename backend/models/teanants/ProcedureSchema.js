import mongoose from "mongoose";

export const ProcedureSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suggestion",
            required: true,
        },

        duration: {
            type: String,
        },

        ratesCharges: {
            type: Number,
            required: true,
        },

        doctorIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Doctor",
            },
        ],

        coordinatorIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Doctor",
            },
        ],

        empanelmentType: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Suggestion",
            },
        ],

        customId: {
            type: String, // your proc-1772100060695
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// const ProcedureModel = mongoose.model("Procedure", procedureSchema);
// export default ProcedureModel;