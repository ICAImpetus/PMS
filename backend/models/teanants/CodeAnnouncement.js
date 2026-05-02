import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        staffId: {
            type: String,
            required: true,
        },
        name: String,
        shift: String,
        contactNo: String,
    },
    { _id: false }
);

export const CodeAnnouncementSchema = new mongoose.Schema(
    {
        // hospital: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Hospital",
        //     default: null
        //     // required: true,
        // },
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

        color: {
            type: String,
            required: true,
        },

        description: String,

        concernedPerson: {
            type: String,
            required: true,
        },

        staff: [staffSchema],   // FULL OBJECT STORE

        shortCode: {
            type: String,
            required: true,
        },

        timeAvailability: String,

        enabled: {
            type: Boolean,
            default: true,
        },

        customId: String,

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// const CodeAnnouncementModel = mongoose.model("CodeAnnouncement", codeAnnouncementSchema);
// export default CodeAnnouncementModel