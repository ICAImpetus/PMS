import mongoose from "mongoose";
import { getConnection, getDepartmentModel, getDoctorModel, getFilledFormsModel, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
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
      branchId: branchId
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
      useForFollowup: data.useForFollowup,

      department: data.department,

      purpose: data.purpose,

      followupStatus,

      formData: {
        ...data.formData,

        patientDetails: patient._id,

        appointmentSlot: data.formData.appointmentSlot
          ? {
            ...data.formData.appointmentSlot,
            date: new Date(
              data.formData.appointmentSlot.date
            ),
          }
          : null,
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


export const getFilledForms = async (req, res) => {
  try {
    const {
      hospitalId,
      branchId,
      startDate,
      endDate,
      page = 1,
      searchName,
      isExport,
      purpose,
      formsModalOpen,
      formsTypeFilter
    } = req.query;

    const isExportMode = isExport === "true";
    const PAGE_LIMIT = 10;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = isExportMode ? 0 : (pageNum - 1) * PAGE_LIMIT;

    // console.log("req.query", req.query);

    // ================= VALIDATION =================
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Hospital Id is required",
      });
    }

    const hospital = await HospitalModel.findById(hospitalId)
      .select("trimmedName")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);
    const DoctorModel = getDoctorModel(conn);
    const DepartmentModel = getDepartmentModel(conn);

    // ================= BASE MATCH STAGE =================
    const matchStage = { isDeleted: false };

    if (branchId && mongoose.isValidObjectId(branchId)) {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    // if (purpose && purpose !== "All") {
    //   matchStage.purpose = purpose;
    // }

    if (formsModalOpen && formsModalOpen !== "all") {

      if (formsModalOpen === "Appointments") {
        matchStage.purpose = {
          $regex: "appointment",
          $options: "i",
        };
      }

      if (formsModalOpen === "Followups") {
        matchStage.useForFollowup = true
      }

    }

    if (formsTypeFilter && formsTypeFilter !== "all") {

      if (formsTypeFilter === "inbound") {
        matchStage.formType = {
          $regex: "inbound",
          $options: "i",
        };
      }

      if (formsTypeFilter === "outbound") {
        matchStage.formType = {
          $regex: "outbound",
          $options: "i",
        };
      }


    }


    // ================= START PIPELINE =================
    const pipeline = [
      { $match: matchStage },

      // ================= PATIENT JOIN =================
      {
        $lookup: {
          from: PatientModel.collection.name,
          localField: "formData.patientDetails",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      {
        $unwind: {
          path: "$patientInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // ================= DOCTOR JOIN =================
      {
        $lookup: {
          from: DoctorModel.collection.name, // Safely matches dynamic tenant collection
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: {
          path: "$doctorInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // ================= DEPARTMENT JOIN =================
      {
        $lookup: {
          from: DepartmentModel.collection.name, // Safely matches dynamic tenant collection
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $unwind: {
          path: "$departmentInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // ================= SEARCH FILTER (Agent, Patient, or Doctor) =================
    if (searchName && searchName.trim()) {
      const safeSearch = searchName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(safeSearch, "i");

      // Now we can search across all joined fields perfectly!
      pipeline.push({
        $match: {
          $or: [
            { agentName: searchRegex },
            { "patientInfo.patientName": searchRegex },
            { "patientInfo.patientMobile": searchRegex },
            { "doctorInfo.name": searchRegex },
            { "departmentInfo.name": searchRegex }
          ],
        },
      });
    }

    // ================= FACET FOR DATA & COUNT =================
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { createdAt: -1 } },
          ...(isExportMode ? [] : [{ $skip: skip }, { $limit: PAGE_LIMIT }]),
          {
            $project: {
              _id: 1,
              formType: 1,
              purpose: 1,
              agentName: 1,
              callStatus: 1,
              createdAt: 1,
              followupStatus: 1,

              referenceFrom: "$formData.referenceFrom",
              // Flattened patient mapping
              "formData.patientDetails.patientName": "$patientInfo.patientName",
              "formData.patientDetails.patientMobile": "$patientInfo.patientMobile",
              "formData.patientDetails.patientStatus": "$patientInfo.status",
              gender: "$patientInfo.gender",
              // Raw/Nested fields from form
              appointmentSlot: "$formData.appointmentSlot",
              "formData.patientArrivalTime": "$formData.patientArrivalTime",
              // Doctor mapping

              "doctor.name": "$doctorInfo.name",

              // Department mapping

              "department.name": "$departmentInfo.name",
              "formData.surgeryName": "$formData.surgeryName",
              "formData.healthPackageName": "$formData.healthPackageName",
              "formData.govertHealthSchemeName": "$formData.govertHealthSchemeName",
              "formData.nonGovtHealthSchemeName": "$formData.nonGovtHealthSchemeName",
              "formData.reportName": "$formData.reportName",
              "formData.referenceFrom": "$formData.referenceFrom",
              "formData.callerType": "$formData.callerType",
              "formData.remarks": "$formData.remarks",
            },
          },
        ],
      },
    });

    const aggregationResult = await FilledFormsModel.aggregate(pipeline);

    const data = aggregationResult[0]?.data || [];
    const total = aggregationResult[0]?.metadata[0]?.total || 0;

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        pageSize: PAGE_LIMIT,
        totalPages: Math.ceil(total / PAGE_LIMIT),
      },
    });
  } catch (error) {
    console.error("Error fetching filled forms:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getBookedSlotsController =
  async (req, res) => {
    try {
      const { doctorId, date } = req.body;
      const { hosId, branchId } = req.query;

      console.log("doctorId", doctorId);
      console.log("date", date);


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


      if (!doctorId || !date) {
        return res.status(400).json({
          success: false,
          message:
            "doctorId and date required",
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
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const bookedSlots = await FilledFormsModel.find(
        {
          doctor: new mongoose.Types.ObjectId(doctorId),

          "formData.appointmentSlot.date": {
            $gte: startDate,
            $lte: endDate,
          },

          isDeleted: false,
        },
        {
          "formData.appointmentSlot.slotId": 1,
          _id: 0,
        }
      ).lean();


      const bookedSlotIds =
        bookedSlots.map(
          (item) =>
            item?.formData
              ?.appointmentSlot?.slotId
        );

      return res.status(200).json({
        success: true,
        data: bookedSlotIds,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch booked slots",
      });
    }
  };

// Controller
export const updateFormAppointmentController = async (
  req,
  res
) => {

  try {

    const {
      hosId,
      branchId
    } = req.query;

    const {
      formId,
      doctor,
      department,
      dateTime,
      patientArrivalTime,
      status,
      cancelReason
    } = req.body;

    if (!formId) {
      return res.status(400).json({
        success: false,
        message: "Form ID is required"
      });
    }

    const updateData = {};

    // Update doctor only
    if (doctor) {
      updateData.doctor = doctor;
    }

    // Update department only
    if (department) {
      updateData.department =
        department;
    }

    // Update appointment date only
    if (dateTime) {
      updateData[
        "formData.dateTime"
      ] = dateTime;
    }

    // Update arrival time only
    if (patientArrivalTime) {
      updateData[
        "formData.patientArrivalTime"
      ] = patientArrivalTime;
    }

    // Cancel appointment
    if (status) {
      updateData[
        "formData.status"
      ] = status;
    }

    if (cancelReason) {
      updateData.cancelReason =
        cancelReason;
    }

    const updatedForm =
      await FilledFormsModel.findOneAndUpdate(
        {
          _id: formId,
          hospital: hosId,
          branch: branchId,
          isDeleted: false,
        },
        {
          $set: updateData
        },
        {
          new: true
        }
      );

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "Cancelled"
          ? "Appointment cancelled successfully"
          : "Appointment updated successfully",

      data: updatedForm
    });

  } catch (error) {

    console.log(
      "updateFormAppointmentController error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message
    });
  }
};
