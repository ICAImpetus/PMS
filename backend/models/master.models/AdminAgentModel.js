import mongoose, { model } from "mongoose";
import bcrypt from "bcrypt";

export const AdminAgentSchema = new mongoose.Schema(
  {
    hospitals: [
      {
        hospitalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HospitalSchema",
        },
        name: String,
      },
    ], 

    branches: [
      {
        branchId: mongoose.Schema.Types.ObjectId,
        name: String,
        hospitalId: mongoose.Schema.Types.ObjectId,
      },
    ],
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include in queries by default for security
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    type: {
      type: String,
      trim: true,
      lowercase: true,
      enum: {
        values: [
          "superadmin",
          "admin",
          "teamleader",
          "executive",
          "supermanager",
        ],
        message: "{VALUE} is not a valid user type",
      },
      required: [true, "User type is required"],
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    userCreatedBy: {
      type: String,
    },

    dailyAccumulatedTime: {
      type: Number,
      default: 0,
    },

    dailyLoginDate: Date,

    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    sessionStart: Date,

    lastLoginTime: Date,

    lastLogoutTime: Date,

    lastSessionDuration: {
      type: Number,
      default: 0,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    canDelete: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);


AdminAgentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with hashed password
 * Used during login to verify credentials
 *
 * @param {string} candidatePassword - Password to check
 * @returns {Promise<boolean>} - True if password matches
 */
AdminAgentSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * Get user object without sensitive data
 * Removes password and other sensitive fields
 *
 * @returns {Object} - Safe user object for responses
 */
AdminAgentSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.phonePass;
  delete userObject.__v;

  return userObject;
};

// let AdminAgentModel = null;

// /**
//  * Get or create the AdminAgent model
//  * Singleton pattern ensures only one model instance
//  */
// export function getAdminAgentModel() {
//   if (!AdminAgentModel) {
//     const dbName =
//       mongoose.connection.db?.databaseName || process.env.database || "crms";
//     const db = mongoose.connection.useDb(dbName);

//     try {
//       AdminAgentModel = db.model("adminAndAgents");
//     } catch (err) {
//       AdminAgentModel = db.model("adminAndAgents", AdminAgentSchema);
//     }
//   }

//   return AdminAgentModel;
// }

const ADMIN_AGENT_FIELDS = [
  "ID",
  "username",
  "password",
  "name",
  "email",
  "type",
  "isAdmin",
  "userCreatedBy",
  "hospitalName",
  "hospitalNames",
  "hospitals",
  "name",
  "names",
  "branches",
  "phoneUser",
  "phonePass",
  "parentUser",
  "parentUsers",
  "dailyAccumulatedTime",
  "dailyLoginDate",
  "isLoggedIn",
  "sessionStart",
  "lastLoginTime",
  "lastLogoutTime",
  "lastSessionDuration",
  "loginCount",
  "isDeleted",
  "canDelete",
  "isActive",
  "createdAt",
  "updatedAt",
];

/**
 * Sanitize user input to only include allowed fields
 * Prevents clients from injecting unwanted data
 *
 * @param {Object} raw - Raw user input
 * @returns {Object} - Sanitized object with only allowed fields
 */
export function sanitizeAdminAgentPayload(raw = {}) {
  const cleaned = {};
  for (const key of ADMIN_AGENT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      cleaned[key] = raw[key];
    }
  }
  return cleaned;
}
export { ADMIN_AGENT_FIELDS };
