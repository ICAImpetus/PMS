import mongoose from "mongoose";

export const CodeAlertsSchema = new mongoose.Schema({
    AgentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminAndAgents",
    },
    HospitalId: {
        type: {
            hospitalId: mongoose.Schema.Types.ObjectId,
            name: String
        },
        default: null
    },
    BranchId: {
        branchId: mongoose.Schema.Types.ObjectId,
        name: String,
        hospitalId: mongoose.Schema.Types.ObjectId,
    },
    depertmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    code_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodeAnnouncement",

    },
    floor: {
        type: String,
        default: null
    },
    room: {
        type: String,
        default: null
    },
    bed: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

})

// const CodeAlertsModel = mongoose.model("CodeAlerts", CodeAlertsSchema);
// export default CodeAlertsModel;