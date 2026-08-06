import mongoose from "mongoose";

// Attendant
const attendantSchema = new mongoose.Schema(
  {
    attendantName: String,
    attendantMobile: String,
  },
  { _id: false }
);

// Dynamic Feedback Question Response Schema
const feedbackQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number, // Use Number since ratings are numeric (1, 2, 3, 4, 5)
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);

export const FilledFormSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      // enum: ["inbound", "outbound"],
      // required: true,
      index: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminAgentSchema",
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      index: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    agentName: String,
    purpose: { type: String, index: true },
    callStatus: {
      type: String,
      trim: true,
      lowercase: true,
    },
    useForFollowup: {
      type: Boolean,
      default: false,
    },
    appointmentStatus: {
      type: String,
      default: "",
    },
    followupStatus: {
      type: String,
      lowercase: true,
      enum: ["pending", "completed"],
      default: null,
    },

    formData: {
      callerType: String,
      referenceFrom: String,
      refDoctorName: String,
      refHospitalName: String,
      refHospitalLocation: String,
      location: String,

      bookSlot: {
        type: Object,
        default: null,
      },
      patientDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },

      attendantDetails: attendantSchema,
      missedConnectionStatus: String,

      informativeTopic: String,
      informativeDetailsShared: String,

      feedbackType: String,
      noFeedbackRemarks: String,
      notConnectedRemarks: String,

      opdNumber: String,
      marketingCampaignName: String,
      marketingDetailsShared: String,

      remarks: String,
      callBack: String,
      callDropReason: String,
      connected: String,
      disconnectionReason: String,

      surgeryName: String,
      healthPackageName: String,
      healthSchemeName: String,
      reportName: String,
      issue: String,

      ambulanceLocation: String,
      ambulanceShared: String,

      govertHealthSchemeName: String,
      nonGovtHealthSchemeName: String,

      followupType: String,
      status: String,
      detailsShared: String,

      dateTime: Date,

      // Lead / Source tracking
      source: String,
      lead: String,
      connectionStatus: String,

      // Dynamic Feedback Block
      feedback: {
        feedbackType: String,
        ipdNumber: String,
        opdNumber: String,
        questions: [feedbackQuestionSchema], // Dynamic array of question responses
      },

      appointmentSlot: {
        date: {
          type: Date,
          index: true,
        },
        slotId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        start: String,
        end: String,
      },
      patientArrivalTime: {
        type: String,
        default: "",
      },

      isCancelApp: {
        type: Boolean,
      },
      cancelReason: String,
    },

    isDeleted: { type: Boolean, index: true, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);