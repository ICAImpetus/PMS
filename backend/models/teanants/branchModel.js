import mongoose from "mongoose";

export const BranchSchema = new mongoose.Schema(
  {
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      }
    ],
    // assignedToAdmin: {
    //   userId: {
    //     type: mongoose.Schema.Types.ObjectId,

    //   },
    //   // cached data (fast access)
    //   name: String,
    //   email: String,
    // },
    // assignedToManager: {
    //   type: {
    //     userId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //     },
    //     name: String,
    //     email: String,
    //   },
    //   default: null
    // },
    assignedToTeamLeader: {
      type: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: String,
        email: String,
      },
      default: null
    },
    assignedToExecutive: {
      type: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: String,
        email: String,
      },
      default: null
    },

    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },

    code: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    beds: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },

    contact: {
      type: String,
      trim: true,
    },
    contactNumbers: [
      {
        type: String,
        trim: true,
      },
    ],

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// const BranchModel = mongoose.model("Branch", branchSchema);
// export default BranchModel;
