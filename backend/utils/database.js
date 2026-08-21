import mongoose from 'mongoose';
import env from '../config/env.js';


const DoctorScheduleSchema = new mongoose.Schema(
  {
    Department: {
      type: String,
      trim: true,
    },
    DoctorName: {
      type: String,
      required: true,
      trim: true,
    },
    OPD_Timings: {
      type: String,
      trim: true,
    },
    Days: {
      type: String,
      trim: true,
    },
    Fees: {
      type: Number,
      default: 0,
    },
    hospital: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    collection: "DoctorSchedule",
    timestamps: true
  }
);


/**
 * Database utility functions for Mongoose
 */

/**
 * Check if a value is a valid ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId if valid
 */
export const toObjectId = (id) => {
  if (typeof id === 'string' && isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * Generate a unique ID (for custom ID fields)
 */
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Standardized response format
 */
export const createResponse = (success, data = null, message = '', error = null) => {
  return {
    success,
    message,
    data,
    ...(error && { error: error.message || error })
  };
};

/**
 * Pagination helper
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

/**
 * Build pagination response
 */
export const buildPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  };
};


export const connecttoAca = async (data) => {
  const URL = "mongodb+srv://kanhaiyamali_db_user:vNQw585DWl0PDqnF@cluster0.kssemtr.mongodb.net/ACA"
  if (!URL) {
    //console.log("ACA Connection String is Missing.");
    return;
  }

  let conn;

  try {
    //console.log("urk", URL);

    conn = await mongoose.createConnection(URL).asPromise();

    // Reuse model if already registered, otherwise create it
    const DoctorSchedule =
      conn.models.DoctorSchedule ||
      conn.model("DoctorSchedule", DoctorScheduleSchema);

    //console.log("After Register:", conn.modelNames());

    const normalizedName = data.DoctorName
      .replace(/^dr\.?\s*/i, "")
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const updatedDoctor = await DoctorSchedule.findOneAndUpdate(
      {
        DoctorName: {
          $regex: `^(dr\\.?\\s*)?${normalizedName}$`,
          $options: "i",
        },
      },
      {
        $set: {
          Department: data.Department,
          DoctorName: data.DoctorName,
          OPD_Timings: data.OPD_Timings,
          Days: data.Days,
          Fees: data.Fees,
          hospital: data.hospital,
        },
      },
      {
        new: true,
      }
    );

    //console.log("Updated Doctor:", updatedDoctor);
  } catch (err) {
    console.error("ACA Update Error:", err);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
};