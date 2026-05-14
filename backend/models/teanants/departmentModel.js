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

export const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      set: toTitleCase,
    },
    // hospital: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Hospital",
    //   required: true,
    // },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      }
    ],
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    description: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// const DepartmentModel = mongoose.model("Department", departmentSchema);
// export default DepartmentModel;
