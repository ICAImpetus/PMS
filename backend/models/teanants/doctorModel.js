import mongoose from "mongoose";

const toTitleCase = (str) => {
  if (!str) return str;

  return str
    .toLowerCase()
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};
const SlotSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
    },

    end: {
      type: String,
      required: true,
    },

    session: {
      type: String,
      enum: ["Morning", "Evening", "Custom"],
    },

    isBooked: {
      type: Boolean,
      default: false,
    },
    unavailableDates: [
      {
        date: { type: String, required: true },
        reason: { type: String },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      }
    ],
  },
);


export const DoctorSchema = new mongoose.Schema(
  {
    // hospital: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Hospital",
    //  
    // },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",

    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    name: {
      type: String,
      trim: true,
      set: toTitleCase,
    },
    averagePatientTime: {
      type: String,
      trim: true,
    },
    maxPatientsHandled: {
      type: Number,
    },
    profilePicture: {
      type: {
        imagePath: { type: String },
        imageId: { type: String },
      },
      default: null,
    },

    countryCode: {
      type: String,
      default: "+91",
    },
    type: String,
    contactNumber: String,
    whatsappNumber: String,
    paName: String,
    paContactNumber: String,
    extensionNumber: String,

    experience: Number,

    consultationCharges: Number,

    floor: String,

    opdDays: [String],
    unavailableDates: {
      type: [String],
      default: [],
    },
    slots: {
      type: [SlotSchema],
      default: [],
    },

    totalBookedPatients: {
      type: Number,
      default: 0,
    },
    opdNo: String,

    specialties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Suggestion"
      }
    ],

    surgeries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Suggestion"
      }
    ],
    degrees: [String],
    customDegrees: [String],
    subDepartment: {
      type: String,
      trim: true,
      default: "",
    },

    teleConsultation: {
      type: Boolean,
      default: false,
    },
    empanelmentList: [
      {
        empanelmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Empanelment",
          default: null,
        },
        policyName: String,
        // departmentId: ObjectId,
        treatableAreas: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suggestion",
          }
        ],
        service: [String],
        coverageLimit: {
          maxAmount: Number,
          perVisitLimit: Number,
        },
        coPayPercentage: Number,
        preAuthRequired: Boolean,
        typeOfCoverage: String,
        validFrom: Date,
        validTill: Date,
        isActive: { type: Boolean, default: true },
      },
    ],
    videoConsultation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      timeSlot: String,
      startTime: String,
      endTime: String,
      charges: Number,
      days: [String],
    },

    timings: {
      morning: {
        start: String,
        end: String,
      },
      evening: {
        start: String,
        end: String,
      },
      custom: {
        start: String,
        end: String,
      },
    },

    type: {
      type: String,
    },

    specialization: {
      type: String,
      toLowerCase: true,
    },

    title: {
      type: String,

    },
    designation: {
      type: String,

    },
    teleMedicine: {
      type: String,
      enum: ["Yes", "No"],
    },

    additionalInfo: {
      type: String,
      trim: true,
      default: "",
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);



// const DoctorModel = mongoose.model("Doctor", doctorSchema);
// export default DoctorModel;
