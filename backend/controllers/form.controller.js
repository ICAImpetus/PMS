import mongoose from "mongoose";
import { getConnection, getDoctorModel, getFilledFormsModel, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
import { calculateFilterRange } from "./hospitalController.js";
import { auditLog } from "../middlewares/apiLogger.middleware.js";

const HospitalModel = getHospitalModel(MasterConn)

export const createFilledForm = async (req, res) => {
  let session;
  let isNewPatient = false;

  try {
    const { hosId, branchId } = req.query;

    const user = req.user;

    const data = req.body;

    console.log("req.body", data);

    if (
      !hosId ||
      !branchId ||
      !mongoose.isValidObjectId(hosId) ||
      !mongoose.isValidObjectId(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid hospitalId and branchId are required",
      });
    }

    const mobile =
      data?.formData?.patientDetails?.patientMobile?.trim();

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message:
          "Patient mobile number is required",
      });
    }

    if (!data?.formType) {
      return res.status(400).json({
        success: false,
        message: "formType is required",
      });
    }

    const hospital = await HospitalModel.findById(
      hosId
    )
      .select("trimmedName name")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(
      hospital.trimmedName
    );

    const FilledFormsModel =
      getFilledFormsModel(conn);

    const PatientModel = getPatientModel(conn);

    const DoctorModel = getDoctorModel(conn);

    session = await conn.startSession();

    session.startTransaction();

    data.agentId = user.id;

    data.agentName = user.name;

    // =========================
    // Convert fields
    // =========================

    if (data?.formData?.dateTime) {
      data.formData.dateTime = new Date(
        data.formData.dateTime
      );
    }

    if (
      data?.formData?.patientDetails
        ?.patientAge
    ) {
      data.formData.patientDetails.patientAge =
        Number(
          data.formData.patientDetails
            .patientAge
        );
    }

    // =========================
    // Find or create patient
    // =========================

    let patient = await PatientModel.findOne({
      patientMobile: mobile,
    }).session(session);

    if (!patient) {
      isNewPatient = true;

      const patientPayload = {
        ...data.formData.patientDetails,

        branchId,

        hospitalId: {
          hospitalId: hosId,
          name: hospital.name,
        },

        agentDetails: {
          agentId: user.id,
          name: user.name,
        },
      };

      patient = await PatientModel.create(
        [patientPayload],
        { session }
      );

      patient = patient[0];
    }

    // =========================
    // Followup update
    // =========================

    const isFollowupCall =
      data.formType === "outbound" &&
      data?.purpose?.toLowerCase() ===
      "followup" &&
      data?.callStatus?.toLowerCase() !==
      "call-drop";

    if (isFollowupCall) {
      await FilledFormsModel.findOneAndUpdate(
        {
          "formData.patientDetails":
            patient._id,

          followupStatus: "pending",
        },

        {
          $set: {
            followupStatus: "completed",
          },
        },

        {
          sort: { createdAt: -1 },

          session,
        }
      );
    }

    // =========================
    // Followup status
    // =========================

    const followupStatus =
      data?.formData?.useForFollowup ===
        true
        ? "pending"
        : null;

    // =========================
    // Create form payload
    // =========================

    const filledFormPayload = {
      formType: data.formType,

      hospitalId: hosId,

      branchId,

      callStatus: data.callStatus,

      agentId: user.id,

      agentName: user.name,

      doctor: data.doctor,

      department: data.department,

      purpose: data.purpose,

      followupStatus,

      formData: {
        ...data.formData,

        patientDetails: patient._id,
      },
    };

    // =========================
    // Create filled form
    // =========================

    const [filledForm] =
      await FilledFormsModel.create(
        [filledFormPayload],
        { session }
      );

    // =========================
    // Update patient visit
    // =========================

    await PatientModel.updateOne(
      {
        _id: patient._id,
      },

      {
        $inc: {
          totalVisit: 1,
        },

        $set: {
          lastVisit: filledForm._id,

          lastVisitAt: new Date(),
        },
      },

      { session }
    );

    // =========================
    // Book appointment slot
    // =========================

    if (
      filledForm?.formType === "inbound" &&
      filledForm?.purpose ===
      "appointment" &&
      data?.formData?.appointmentSlot?._id
    ) {
      const updatedDoctor =
        await DoctorModel.findOneAndUpdate(
          {
            _id: filledForm?.doctor,

            "slots._id":
              data.formData
                .appointmentSlot._id,

            "slots.isBooked": false,
          },

          {
            $inc: {
              totalBookedPatients: 1,
            },

            $set: {
              "slots.$.isBooked": true,
            },
          },

          {
            new: true,

            session,
          }
        );

      if (!updatedDoctor) {
        throw new Error(
          "Slot already booked or doctor not found"
        );
      }
    }

    // =========================
    // Commit transaction
    // =========================

    await session.commitTransaction();

    await session.endSession();

    // =========================
    // Audit log
    // =========================

    setImmediate(() => {
      auditLog({
        action: `NEW_${data.formType.toUpperCase()}_FORM_INSERT`,

        event: "ADD",

        module: "FORM_SUBMISSION",

        role: user?.type || "Unknown",

        customMessage: `${user?.type || "User"
          } "${user?.name}" created a new ${data.formType.toUpperCase()} form.`,

        name: user?.name,

        userId: user?.id,

        newData: filledForm,

        ip: req.userIp,

        userAgent:
          req.headers["user-agent"],
      });
    });

    return res.status(201).json({
      success: true,

      message:
        "Form submitted successfully",

      data: filledForm,
    });
  } catch (error) {
    console.error(
      "Error creating filled form:",
      error
    );

    if (session) {
      await session.abortTransaction();

      await session.endSession();
    }

    return res.status(500).json({
      success: false,

      message: error.message ||
        "Internal server error",

      error: error.message,
    });
  }
};
// export const getFilledForms = async (req, res) => {
//   try {
//     const {
//       hospitalId,
//       branchId,
//       filter,
//       page
//     } = req.query;

//     const pagelimit = 10
//     const pageNum = parseInt(page) || 1;
//     const skip = (pageNum - 1) * pagelimit

//     const user = req.user;
//     const role = user?.type?.toLowerCase();
//     const connections = req.dbs

//     const matchStage = {};
//     const dateRange = calculateFilterRange(filter);



//     // STEP 1: ROLE BASED ACCESS (FIXED ObjectId)
//     if (role === "admin") {
//       matchStage.hospitalId = {
//         $in: (user.hospitals || []).map(id => new mongoose.Types.ObjectId(id))
//       };
//     }

//     else if (role === "supermanager") {
//       matchStage.branchId = {
//         $in: (user.branches || []).map(id => new mongoose.Types.ObjectId(id))
//       };
//     }

//     else if (role === "executive") {
//       matchStage.branchId = {
//         $in: (user.branches || []).map(id => new mongoose.Types.ObjectId(id))
//       };
//       matchStage.agentId = new mongoose.Types.ObjectId(user.id);
//     }

//     // STEP 2: FILTER OVERRIDE (SAFE)
//     if (hospitalId) {
//       matchStage.hospitalId = new mongoose.Types.ObjectId(hospitalId);
//     }

//     if (branchId) {
//       matchStage.branchId = new mongoose.Types.ObjectId(branchId);
//     }

//     // STEP 3: DATE FILTER (FIXED)
//     if (dateRange) {
//       matchStage.createdAt = {
//         $gte: dateRange.start,
//         $lte: dateRange.end,
//       };
//     }

//     // console.log("FINAL matchStage", matchStage);

//     // QUERY
//     const [result, totalDocument] = await Promise.all([
//       FilledFormsModel.aggregate([
//         { $match: matchStage },

//         {
//           $facet: {
//             // INBOUND COUNT (FIXED)
//             inboundCount: [

//               { $match: { formType: "inbound" } },
//               { $count: "count" }
//             ],

//             // OUTBOUND COUNT (FIXED)
//             outboundCount: [
//               { $match: { formType: "outbound" } },
//               { $count: "count" }
//             ],

//             // APPOINTMENT COUNT
//             appointmentForms: [
//               { $match: { purpose: "Appointment" } },
//               {
//                 $group: {
//                   _id: "$formType",
//                   count: { $sum: 1 }
//                 }
//               }
//             ],

//             // FOLLOWUP COUNT
//             followupForms: [
//               { $match: { followupStatus: "pending" } },
//               {
//                 $group: {
//                   _id: "$formType",
//                   count: { $sum: 1 }
//                 }
//               }
//             ],

//             // TODAY FORMS
//             todayForms: [
//               { $sort: { createdAt: -1 } },
//               { $skip: skip },
//               { $limit: pagelimit },
//               {
//                 $lookup: {
//                   from: "doctors",
//                   localField: "doctor",
//                   foreignField: "_id",
//                   as: "doctor"
//                 }
//               },
//               { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

//               {
//                 $lookup: {
//                   from: "departments",
//                   localField: "department",
//                   foreignField: "_id",
//                   as: "department"
//                 }
//               },
//               { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

//               {
//                 $project: {
//                   _id: 1,
//                   purpose: 1,
//                   formType: 1,
//                   createdAt: 1,
//                   agentName: 1,
//                   callStatus: 1,
//                   callerType: "$formData.callerType",
//                   patientName: "$formData.patientDetails.patientName",
//                   remarks: "$formData.remarks",
//                   patientMobile: "$formData.patientDetails.patientMobile",
//                   referenceFrom: "$formData.referenceFrom",
//                   doctorName: "$doctor.name",
//                   departmentName: "$department.name"
//                 }
//               }
//             ],

//             // APPOINTMENT DATA
//             appointmentData: [
//               { $match: { purpose: "Appointment" } },
//               { $sort: { createdAt: -1 } },
//               { $skip: skip },
//               { $limit: pagelimit },

//               {
//                 $lookup: {
//                   from: "doctors",
//                   localField: "doctor",
//                   foreignField: "_id",
//                   as: "doctor"
//                 }
//               },
//               { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

//               {
//                 $lookup: {
//                   from: "departments",
//                   localField: "department",
//                   foreignField: "_id",
//                   as: "department"
//                 }
//               },
//               { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

//               {
//                 $project: {
//                   _id: 1,
//                   purpose: 1,
//                   formType: 1,
//                   callStatus: 1,
//                   createdAt: 1,
//                   agentName: 1,
//                   callerType: "$formData.callerType",
//                   remarks: "$formData.remarks",
//                   patientName: "$formData.patientDetails.patientName",
//                   patientMobile: "$formData.patientDetails.patientMobile",
//                   referenceFrom: "$formData.referenceFrom",
//                   doctorName: "$doctor.name",
//                   departmentName: "$department.name"
//                 }
//               }
//             ],

//             // FOLLOWUP DATA
//             followupData: [
//               { $match: { followupStatus: "pending" } },
//               { $sort: { createdAt: -1 } },
//               { $skip: skip },
//               { $limit: pagelimit },

//               {
//                 $lookup: {
//                   from: "doctors",
//                   localField: "doctor",
//                   foreignField: "_id",
//                   as: "doctor"
//                 }
//               },
//               { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

//               {
//                 $lookup: {
//                   from: "departments",
//                   localField: "department",
//                   foreignField: "_id",
//                   as: "department"
//                 }
//               },
//               { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

//               {
//                 $project: {
//                   _id: 1,
//                   purpose: 1,
//                   formType: 1,
//                   callStatus: 1,
//                   createdAt: 1,
//                   agentName: 1,
//                   callerType: "$formData.callerType",
//                   remarks: "$formData.remarks",
//                   patientName: "$formData.patientDetails.patientName",
//                   patientMobile: "$formData.patientDetails.patientMobile",
//                   referenceFrom: "$formData.referenceFrom",
//                   doctorName: "$doctor.name",
//                   departmentName: "$department.name"
//                 }
//               }
//             ]
//           }
//         }
//       ]),

//       // FIXED totalDocument (COUNT instead of full data)
//       FilledFormsModel.countDocuments(matchStage),
//     ]);

//     const data = result[0] || {};

//     const appointmentMap = Object.fromEntries(
//       (data.appointmentForms || []).map(i => [i._id, i.count])
//     );

//     const followupMap = Object.fromEntries(
//       (data.followupForms || []).map(i => [i._id, i.count])
//     );

//     const inbound = data.inboundCount?.[0]?.count || 0;
//     const outbound = data.outboundCount?.[0]?.count || 0;

//     const Formsdata = {
//       metrics: {

//         pagination: {
//           totalDocument,
//           page,
//           totalPages: Math.ceil(totalDocument / pagelimit)
//         },

//         totalForms: {
//           total: inbound + outbound,
//           inbound,
//           outbound
//         },
//         appointments: {
//           total: (appointmentMap.inbound || 0) + (appointmentMap.outbound || 0),
//           inbound: appointmentMap.inbound || 0,
//           outbound: appointmentMap.outbound || 0
//         },
//         followupsPending: {
//           total: (followupMap.inbound || 0) + (followupMap.outbound || 0),
//           inbound: followupMap.inbound || 0,
//           outbound: followupMap.outbound || 0
//         }
//       },
//       forms: {
//         today: data.todayForms || [],
//         appointments: data.appointmentData || [],
//         followups: data.followupData || [],
//       }
//     };

//     res.status(200).json({
//       success: true,
//       data: Formsdata
//     });

//   } catch (error) {
//     console.error("Error fetching filled forms:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const getFilledForms = async (req, res) => {
  try {
    const { hospitalId, branchId, filter, page = 1 } = req.query;

    const PAGE_LIMIT = 10;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * PAGE_LIMIT;

    //  Validate hospitalId
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Hospital Id is required",
      });
    }

    //  Get hospital
    const hospital = await HospitalModel.findById(hospitalId)
      .select("trimmedName")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    //  Multi-tenant connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn)

    //  Build match stage
    const matchStage = { isDeleted: false };

    if (branchId && mongoose.isValidObjectId(branchId)) {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    //  Date filter
    if (filter) {
      const { start, end } = calculateFilterRange(filter);
      if (start && end) {
        matchStage.createdAt = {
          $gte: new Date(start),
          $lte: new Date(end),
        };
      }
    }

    //  Aggregation
    const [data] = await FilledFormsModel.aggregate([
      { $match: matchStage },

      {
        $facet: {
          inboundCount: [
            { $match: { formType: "inbound" } },
            { $count: "count" },
          ],
          outboundCount: [
            { $match: { formType: "outbound" } },
            { $count: "count" },
          ],
          appointmentForms: [
            { $match: { purpose: "Appointment" } },
            {
              $group: {
                _id: "$formType",
                count: { $sum: 1 },
              },
            },
          ],
          followupForms: [
            { $match: { followupStatus: "pending" } },
            {
              $group: {
                _id: "$formType",
                count: { $sum: 1 },
              },
            },
          ],
          appointmentData: [
            { $match: { purpose: "Appointment" } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: PAGE_LIMIT },

            {
              $lookup: {
                from: "doctors",
                localField: "doctor",
                foreignField: "_id",
                as: "doctor"
              }
            },
            { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

            {
              $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "department"
              }
            },
            { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

            {
              $project: {
                _id: 1,
                purpose: 1,
                formType: 1,
                callStatus: 1,
                createdAt: 1,
                agentName: 1,
                callerType: "$formData.callerType",
                remarks: "$formData.remarks",
                patientName: "$formData.patientDetails.patientName",
                patientMobile: "$formData.patientDetails.patientMobile",
                referenceFrom: "$formData.referenceFrom",
                doctorName: "$doctor.name",
                departmentName: "$department.name"
              }
            }
          ],

          // FOLLOWUP DATA
          followupData: [
            { $match: { followupStatus: "pending" } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: PAGE_LIMIT },

            {
              $lookup: {
                from: "doctors",
                localField: "doctor",
                foreignField: "_id",
                as: "doctor"
              }
            },
            { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

            {
              $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "department"
              }
            },
            { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

            {
              $project: {
                _id: 1,
                purpose: 1,
                formType: 1,
                callStatus: 1,
                createdAt: 1,
                agentName: 1,
                callerType: "$formData.callerType",
                remarks: "$formData.remarks",
                patientName: "$formData.patientDetails.patientName",
                patientMobile: "$formData.patientDetails.patientMobile",
                referenceFrom: "$formData.referenceFrom",
                doctorName: "$doctor.name",
                departmentName: "$department.name"
              }
            }
          ],
          forms: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: PAGE_LIMIT },

            {
              $lookup: {
                from: "doctors",
                localField: "doctor",
                foreignField: "_id",
                as: "doctor",
              },
            },
            { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

            {
              $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "department",
              },
            },
            {
              $unwind: {
                path: "$department",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                _id: 1,
                purpose: 1,
                formType: 1,
                createdAt: 1,
                agentName: 1,
                callStatus: 1,
                callerType: "$formData.callerType",
                patientName: "$formData.patientDetails.patientName",
                patientMobile: "$formData.patientDetails.patientMobile",
                remarks: "$formData.remarks",
                referenceFrom: "$formData.referenceFrom",
                doctorName: "$doctor.name",
                departmentName: "$department.name",
              },
            },
          ],

          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    //  Safe extraction
    const inbound = data.inboundCount?.[0]?.count || 0;
    const outbound = data.outboundCount?.[0]?.count || 0;
    const totalDocument = data.totalCount?.[0]?.count || 0;

    const appointmentMap = { inbound: 0, outbound: 0 };
    const followupMap = { inbound: 0, outbound: 0 };

    (data.appointmentForms || []).forEach((i) => {
      appointmentMap[i._id] = i.count;
    });

    (data.followupForms || []).forEach((i) => {
      followupMap[i._id] = i.count;
    });

    //  Final response
    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          pagination: {
            totalDocument,
            page: pageNum,
            totalPages: Math.ceil(totalDocument / PAGE_LIMIT),
          },
          totalForms: {
            total: inbound + outbound,
            inbound,
            outbound,
          },
          appointments: {
            total: appointmentMap.inbound + appointmentMap.outbound,
            inbound: appointmentMap.inbound,
            outbound: appointmentMap.outbound,
          },
          followupsPending: {
            total: followupMap.inbound + followupMap.outbound,
            inbound: followupMap.inbound,
            outbound: followupMap.outbound,
          },
        },
        forms: {
          today: data.forms || [],
          appointments: data.appointmentData || [],
          followups: data.followupData || [],
        }
      },
    });
  } catch (error) {
    console.error("Error fetching filled forms:", error);

    return res.status(500).json({
      success: false,
      message: error || "Internal Server Error",
    });
  }
};