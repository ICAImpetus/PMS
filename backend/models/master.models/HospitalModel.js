import mongoose from "mongoose";

export const HospitalSchema = new mongoose.Schema(
  {
    assignedToManager: {
      type: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: String,
        email: String,
      },
      default: null,
    },
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      default: true,
    },
    hospitallogo: { type: String, default: "" },
    hospitallogoPublicId: { type: String, default: "" },
    trimmedName: { type: String },
    hospitalCode: { type: String, trim: true, uppercase: true },
    beds: { type: String, default: "" },
    branchCount: { type: Number, default: 0 },
    itsBranch: { type: Boolean },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    contact: { type: String, trim: true },

    contactNumbers: [{ type: String, trim: true }],
    corporateAddress: { type: String, trim: true },

    accondDetails: {
      nameOfLegalEntityForBilling: String,
      gst: String,
      tan: String,
      bankName: String,
      ifsc: String,
      accountNumber: String,
      modeOfPayment: String,
      cycleOfPayment: String,
    },

    managementDetails: [
      {
        memberType: String,
        name: String,
        phoneNumber: String,
        hospitalDesignation: String,
        eaName: String,
        eaContactNumber: String,
        alignmentOfLocation: String,
      },
    ],

    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },

    // ===== IP ADDRESSES WHITELIST =====
    ipAddresses: [
      {
        ip: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["PUBLIC", "PRIVATE", "CIDR"],
          default: "PUBLIC",
        },
        description: {
          type: String,
          trim: true,
          default: "",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ===== STATUS =====
    isActive: { type: Boolean },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const HOSPITAL_FIELDS = [
  "ID",
  "itsBranch",
  "name",
  "trimmedName",
  "city",
  "state",
  "beds",
  "contactNumbers",
  "accondDetails",
  "managementDetails",
  "corporateAddress",
  "hospitallogo",
  "hospitallogoPublicId",
  "email",
  "contact",
  "website",
  "isActive",
  "hospitalCode",
  "branches",
  "departments",
  "empanelmentList",
  "testLabs",
  "codeAnnouncements",
  "ipdDetails",
  "dayCareDetails",
  "procedureList",
  "departmentIncharge",
  "ipAddresses", // <-- Added here
  "isDeleted",
  "createdAt",
  "updatedAt",
];

export function sanitizeHospitalPayload(raw = {}) {
  const cleaned = {};

  for (const key of HOSPITAL_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      cleaned[key] = raw[key];
    }
  }

  return cleaned;
}
