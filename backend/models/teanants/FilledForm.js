import mongoose from "mongoose";

// Attendant
const attendantSchema = new mongoose.Schema(
  {
    attendantName: String,
    attendantMobile: String,
  },
  { _id: false }
);

// Feedback Question
const feedbackQuestionSchema = new mongoose.Schema(
  {
    question: String,
    rating: Number,
  },
  { _id: false }
);

export const FilledFormSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },

    // hospitalId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Hospital",
    // },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminAndAgents",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    agentName: String,
    purpose: String,
    callStatus: {
      type: String,
      trim: true,
      lowercase: true
    },
    useForFollowup: {
      type: Boolean,
      default: false
    },
    followupStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: null
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
        ref: "Patient", // same connection me resolve hoga
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

      // Detailed Feedback
      feedback: {
        feedbackType: String,
        ipdNumber: String,
        opdNumber: String,
        questions: [feedbackQuestionSchema],
      },
      appointmentSlot: {
        date: {
          type: String,
          // required: true,
          // index: true,
        },

        slotId: {
          type: mongoose.Schema.Types.ObjectId,
          // required: true,
        },

        start: {
          type: String,
          // required: true,
        },

        end: {
          // type: String,
          // required: true,
        },
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,

  }
);

// const FilledFormsModel = mongoose.model("filledForms", filledFormSchema);

// export default FilledFormsModel;