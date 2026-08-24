import mongoose from "mongoose";
import { getBranchModel, getConnection, getDepartmentModel, getDoctorModel, getFilledFormsModel, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
import { calculateFilterRange } from "./hospitalController.js";
import { auditLog } from "../middlewares/apiLogger.middleware.js";
import fs from "fs"
import path from "path";
import csv from "csv-parser";
import { Readable } from "stream";
import { sendWhatsAppInBackground } from "../utils/notification.js";
import moment from "moment";
import { FormStatus } from "../models/teanants/FilledForm.js";

const HospitalModel = getHospitalModel(MasterConn)

export const createFilledForm = async (req, res) => {
  let session;
  let isNewPatient = false;
  // //console.log("req.body", req.body?.formData?.feedback?.questions);


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

    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);
    const DoctorModel = getDoctorModel(conn);
    const DepartmentModel = getDepartmentModel(conn)
    const BranchModel = getBranchModel(conn)


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

    else if (patient && patient?.name !== data.formData.patientDetails.patientName) {
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

      ...(data.purpose?.toLowerCase() === "appointment" && {
        status: "pending",
      }),

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

    // //console.log("filledForm", filledForm);

    if (
      filledForm?.formType?.toLowerCase() === "inbound" &&
      filledForm?.purpose?.toLowerCase() ===
      "appointment"

    ) {
      // //console.log("call");

      if (data?.formData?.appointmentSlot?._id) {
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
          ).lean()

        if (!updatedDoctor) {
          throw new Error(
            "Slot already booked or doctor not found"
          );
        }
      }

      else {
        const updatedDoctor =
          await DoctorModel.findById
            (
              filledForm?.doctor,
            ).populate({
              model: DepartmentModel,
              path: "department",
              select: "name"
            }).
            populate({
              model: BranchModel,
              path: "branch",
              select: "name location"
            }).lean()
        sendWhatsAppInBackground({
          Patient_Name: patient?.patientName || "UnKnown Patient",
          Patient_Age: patient?.patientAge || 0,
          Gender: patient?.gender || "",
          Mobile_Number: patient?.patientMobile,
          Appointment_Date: data?.formData?.dateTime,
          Appointment_Time:
            data?.formData?.appointmentSlot?.start ||
            moment().format("hh:mm A"),
          Doctor: updatedDoctor?.name,
          Department: updatedDoctor?.department?.name,
          Branch_Name: updatedDoctor?.branch?.name,
          Branch_Location: updatedDoctor?.branch?.location,
          Message_type: 1,
        });
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

export const getFormById = async (req, res) => {


  try {
    const { formId } = req.params; // Passed in URL e.g., PUT /api/forms/:formId
    const { hosId, branchId } = req.query;
    const user = req.user;
    const data = req.body;

    // 1. Validation
    if (
      !formId ||
      !hosId ||
      !branchId ||
      !mongoose.isValidObjectId(formId) ||
      !mongoose.isValidObjectId(hosId) ||
      !mongoose.isValidObjectId(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid formId, hospitalId, and branchId are required.",
      });
    }

    const hospital = await HospitalModel.findById(hosId)
      .select("trimmedName name")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    // 2. Establish multi-tenant dynamic connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);
    const DoctorModel = getDoctorModel(conn)

    // 3. Fetch existing form to compare previous state
    const existingForm = await FilledFormsModel.findById(formId)
      .populate({ path: "formData.patientDetails", model: PatientModel })
      .populate({ path: "doctor", model: DoctorModel, select: "-slots" })
      .lean();
    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Form record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form fetch successfully.",
      data: existingForm,
    });
  } catch (error) {
    console.error("Error updating filled form:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
      error: error.message,
    });
  }
};

export const getFormEditChanges = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    // 1. Validation
    if (
      !hospitalId ||
      // !branchId ||
      !mongoose.isValidObjectId(hospitalId)
      // !mongoose.isValidObjectId(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId  are required.",
      });
    }

    // 2. Fetch Hospital Details
    const hospital = await HospitalModel.findById(hospitalId)
      .select("trimmedName name")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    // 3. Establish multi-tenant dynamic database connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);
    const BranchModel = getBranchModel(conn)

    // 4. Fetch pending edit forms with populated Agent and Branch info
    const pendingForms = await FilledFormsModel.find({
      // branchId: branchId,
      formStatus: FormStatus.PENDING,
    }).select("changesLog branchId agentName")
      .populate({ path: "branchId", model: BranchModel, select: "name" })
      .sort({ updatedAt: -1 })
      .lean();

    if (!pendingForms || pendingForms.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending form edit requests found.",
        data: [],
      });
    }


    return res.status(200).json({
      success: true,
      message: "Form edit change history fetched successfully.",
      data: pendingForms,
    });
  } catch (error) {
    console.error("Error fetching form edit changes:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
      error: error.message,
    });
  }
};

export const updateFormEditStatus = async (req, res) => {
  try {
    const { formId, hosId, branchId, status } = req.body;

    // console.log("req.body:", req.body);


    // 1. Validation
    if (
      !formId ||
      !hosId ||
      !branchId ||
      !status ||
      // !["APPROVED", "REJECTED"].includes(status.toUpperCase()) ||
      !mongoose.isValidObjectId(formId) ||
      !mongoose.isValidObjectId(hosId) ||
      !mongoose.isValidObjectId(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid formId, hosId, branchId, and status (APPROVED/REJECTED) are required.",
      });
    }

    // 2. Fetch Hospital
    const hospital = await HospitalModel.findById(hosId)
      .select("trimmedName")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    // 3. Dynamic DB Connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);

    // 4. Update Form Status
    const targetStatus =
      status.toUpperCase() === "APPROVED"
        ? FormStatus.APPROVED || "APPROVED"
        : FormStatus.REJECTED || "REJECTED";

    const updatedForm = await FilledFormsModel.findOneAndUpdate(
      { _id: formId, branchId: branchId },
      {
        $set: {
          formStatus: targetStatus,
          reviewedBy: req.user?._id || null,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form record not found.",
      });
    }

    const parentId = updatedForm.oldformId

    if (parentId && mongoose.isValidObjectId(parentId)) {
      if (isApproved) {
        await FilledFormsModel.findByIdAndUpdate(parentId, {
          $set: {
            formStatus: FormStatus.ERRORFORM || "ERRORFORM",
            isArchived: true,
            archivedAt: new Date(),
          },
        });
      } else {
        await FilledFormsModel.findByIdAndUpdate(parentId, {
          $set: {
            formStatus: FormStatus.NOTAPPROVED || "NOTAPPROVED",
            isArchived: false,
          },
        });
      }
    }
    return res.status(200).json({
      success: true,
      message: `Form request successfully ${targetStatus.toLowerCase()}.`,
      // data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating form status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const getObjectDiff = (oldObj = {}, newObj = {}, ignoredKeys = []) => {
  const defaultIgnored = ["_id", "__v", "createdAt", "updatedAt", "isArchived", "version", "oldformId"];
  const allIgnored = new Set([...defaultIgnored, ...ignoredKeys]);
  const changes = [];

  const compare = (v1, v2, path = "") => {
    // Standardize nullish values
    const val1 = v1 ?? null;
    const val2 = v2 ?? null;

    if (val1 === val2) return;

    // Compare Dates
    if (val1 instanceof Date || val2 instanceof Date) {
      const d1 = val1 ? new Date(val1).getTime() : null;
      const d2 = val2 ? new Date(val2).getTime() : null;
      if (d1 !== d2) {
        changes.push({
          field: path,
          oldValue: val1 ? new Date(val1).toISOString() : null,
          newValue: val2 ? new Date(val2).toISOString() : null,
        });
      }
      return;
    }

    // Compare Mongo ObjectIds / Strings
    if (val1?.toString && val2?.toString && (val1._bsontype === 'ObjectID' || val2._bsontype === 'ObjectID')) {
      if (val1.toString() !== val2.toString()) {
        changes.push({ field: path, oldValue: val1.toString(), newValue: val2.toString() });
      }
      return;
    }

    // Deep compare nested Objects
    if (
      typeof val1 === "object" && val1 !== null &&
      typeof val2 === "object" && val2 !== null &&
      !Array.isArray(val1) && !Array.isArray(val2)
    ) {
      const keys = new Set([...Object.keys(val1), ...Object.keys(val2)]);
      keys.forEach((key) => {
        if (allIgnored.has(key)) return;
        compare(val1[key], val2[key], path ? `${path}.${key}` : key);
      });
      return;
    }

    // Primitive values comparison
    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      changes.push({
        field: path,
        oldValue: val1,
        newValue: val2,
      });
    }
  };

  compare(oldObj, newObj);
  return changes;
};
export const updateFilledForm = async (req, res) => {
  let session;

  try {
    const { formId } = req.params;
    const { hosId, branchId } = req.query;
    const user = req.user;
    const data = req.body;

    // 1. Validation
    if (
      !formId ||
      !hosId ||
      !branchId ||
      !mongoose.isValidObjectId(formId) ||
      !mongoose.isValidObjectId(hosId) ||
      !mongoose.isValidObjectId(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid formId, hospitalId, and branchId are required.",
      });
    }

    const hospital = await HospitalModel.findById(hosId)
      .select("trimmedName name")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    // 2. Multi-tenant connection setup
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);

    // 3. Fetch existing form
    const existingForm = await FilledFormsModel.findById(formId).lean();
    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Form record not found.",
      });
    }

    session = await conn.startSession();
    session.startTransaction();

    // 4. Data Type Formatting
    if (data?.formData?.dateTime) {
      data.formData.dateTime = new Date(data.formData.dateTime);
    }

    if (data?.formData?.patientDetails?.patientAge) {
      data.formData.patientDetails.patientAge = Number(
        data.formData.patientDetails.patientAge
      );
    }

    // 5. Update Associated Patient Details
    if (existingForm.formData?.patientDetails && data?.formData?.patientDetails) {
      await PatientModel.findByIdAndUpdate(
        existingForm.formData.patientDetails?._id || existingForm.formData.patientDetails,
        {
          $set: {
            patientName: data.formData.patientDetails.patientName,
            patientAge: data.formData.patientDetails.patientAge,
            gender: data.formData.patientDetails.gender,
            patientMobile: data.formData.patientDetails.patientMobile,
            alternateMobile: data.formData.patientDetails.alternateMobile,
            location: data.formData.patientDetails.location,
            status: data.formData.patientDetails.status,
            category: data.formData.patientDetails.category,
            agentDetails: data.formData.patientDetails.agentDetails,
          },
        },
        { session }
      );
    }

    // 6. DYNAMIC PAYLOAD CREATION (Merge existing document with incoming data dynamically)
    const currentVersion = existingForm.version || 1;

    const mergedPayload = {
      ...existingForm, // Existing document base
      ...data,         // Dynamically merge top-level properties (callStatus, doctor, department, purpose, etc.)
      formData: {
        ...existingForm.formData,
        ...data.formData,
        patientDetails: existingForm.formData?.patientDetails?._id || existingForm.formData?.patientDetails,
        appointmentSlot: data.formData?.appointmentSlot
          ? {
            ...data.formData.appointmentSlot,
            date: new Date(data.formData.appointmentSlot.date),
          }
          : existingForm.formData?.appointmentSlot,
      },
      formStatus: FormStatus.PENDING,
      ...(typeof data.useForFollowup === "boolean" && {
        useForFollowup: data.useForFollowup,
        followupStatus: data.useForFollowup ? "pending" : null,
      }),
    };

    // 7.  FULL DYNAMIC COMPARE (Entire existing record vs Entire incoming payload)
    const changesDiff = getObjectDiff(
      existingForm,
      mergedPayload,
      ["formStatus"] // Add keys you want to skip tracking
    );

    // 8. Archive Old Record
    await FilledFormsModel.findByIdAndUpdate(
      formId,
      {
        $set: {
          isArchived: true,
          formStatus: FormStatus.ARCHIVED,
        },
      },
      { session }
    );

    // 9. Prepare and Create New Active Document Version
    const newFormPayload = {
      ...mergedPayload,
      _id: new mongoose.Types.ObjectId(),
      oldformId: existingForm._id,
      version: currentVersion + 1,
      isArchived: false,
      changesLog: changesDiff, // Dynamic changes automatically logged
      createdAt: undefined,
      updatedAt: undefined,
    };

    const [newFormDocument] = await FilledFormsModel.create([newFormPayload], { session });

    // Commit Transaction
    await session.commitTransaction();
    await session.endSession();

    // 10. Non-blocking Audit Logging
    setImmediate(() => {
      auditLog({
        action: `UPDATE_${existingForm.formType?.toUpperCase() || "FORM"}_FORM`,
        event: "EDIT",
        module: "FORM_SUBMISSION",
        role: user?.type || "Unknown",
        customMessage: `${user?.type || "User"} "${user?.name}" updated form ID ${formId}.`,
        name: user?.name,
        userId: user?.id,
        oldData: existingForm,
        newData: newFormDocument,
        changes: changesDiff,
        ip: req.userIp,
        userAgent: req.headers["user-agent"],
      });
    });

    return res.status(200).json({
      success: true,
      message: "Form updated successfully with dynamic change tracking.",
      data: newFormDocument,
      changesSummary: {
        totalChanges: changesDiff.length,
        changes: changesDiff,
      },
    });
  } catch (error) {
    console.error("Error updating filled form:", error);

    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
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
      formsModalOpen,
      formsTypeFilter,
    } = req.query;

    const isExportMode = isExport === "true";
    const PAGE_LIMIT = 10;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * PAGE_LIMIT;

    const userType = req.user.type?.toLowerCase() || "";

    // Define base fields to select
    const fields = [
      "agentName",
      "formType",
      "gender",
      "callStatus",
      "purpose",
      "followupStatus",
      "createdAt",
      "formData.appointmentSlot",
      "formData.patientDetails",
      "formData.patientArrivalTime",
      "formData.remarks",
      "formData.surgeryName",
      "formData.healthPackageName",
      "formData.healthSchemeName",
      "formData.govertHealthSchemeName",
      "formData.nonGovtHealthSchemeName",
      "formData.reportName",
      "formData.referenceFrom",
      "formData.feedbackType",
      "formData.feedback",
    ];

    // Conditionally append 'formStatus' if user is a teamleader
    if (userType === "teamleader") {
      fields.push("formStatus");
    }

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
    const BranchModel = getBranchModel(conn);
    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);
    const DoctorModel = getDoctorModel(conn);
    const DepartmentModel = getDepartmentModel(conn);
    const pop = (path, model, select = null) => ({
      path,
      model,
      ...(select && { select })
    });

    // ================= BASE MATCH STAGE =================
    const matchStage = {
      isDeleted: false,
      formStatus: {
        $exists: true,
        $ne: null,
        $nin: [FormStatus.PENDING, FormStatus.REJECTED, FormStatus.NOTAPPROVED, FormStatus.ERRORFORM, ""]
      }
    };

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

    if (formsModalOpen && formsModalOpen !== "all") {
      if (formsModalOpen === "Appointments") {
        matchStage.purpose = { $regex: "appointment", $options: "i" };
      }
      if (formsModalOpen === "Followups") {
        matchStage.useForFollowup = true;
      }
    }

    if (formsTypeFilter && formsTypeFilter !== "all") {
      if (formsTypeFilter === "inbound") {
        matchStage.formType = { $regex: "inbound", $options: "i" };
      }
      if (formsTypeFilter === "outbound") {
        matchStage.formType = { $regex: "outbound", $options: "i" };
      }
    }
    const isSearchActive = Boolean(searchName && searchName.trim());

    // 1. Handle Patient Search Filter
    if (isSearchActive) {
      const patient = await PatientModel.findOne({
        patientName: new RegExp(searchName.trim(), "i"),
      }).select("_id");

      if (patient) {
        matchStage["formData.patientDetails"] = patient._id;
      } else {
        // If patient search yields no result, force matchStage to return empty results
        matchStage["formData.patientDetails"] = null;
      }
    }

    // 2. Build Mongoose Query
    let query = FilledFormsModel.find(matchStage)
      .select(fields.join(" "))
      .populate(pop("branchId", BranchModel, "name"))
      .populate(pop("doctor", DoctorModel, "name"))
      .populate(pop("department", DepartmentModel, "name"))
      .populate(
        pop(
          "formData.patientDetails",
          PatientModel,
          "patientName patientMobile status patientAge category location gender"
        )
      )


    // 3. Apply Pagination conditionally if NOT exporting
    if (!isExportMode) {
      query = query.skip(skip).limit(PAGE_LIMIT).sort({ createdAt: -1 })
    }

    // 4. Execute Count and Data Query in Parallel
    const [totalDocs, data] = await Promise.all([
      FilledFormsModel.countDocuments(matchStage),
      query.lean(),
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total: totalDocs,
        page: pageNum,
        pageSize: isExportMode ? totalDocs : PAGE_LIMIT,
        totalPages: isExportMode ? 1 : Math.ceil(totalDocs / PAGE_LIMIT),
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

      // //console.log("doctorId", doctorId);
      // //console.log("date", date);


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
      // //console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch booked slots",
      });
    }
  };

export const unbookSlotController = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { hosId, branchId, formId } = req.query;

    // //console.log("req.query", req.query);
    // //console.log("req.params", req.params);


    // 1. Hospital & Branch ID Validation
    if (
      !hosId ||
      !branchId ||
      !mongoose.isValidObjectId(hosId) ||
      !mongoose.isValidObjectId(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId and branchId are required",
      });
    }

    // 2. Doctor ID & Slot ID Validation
    if (
      !formId ||
      !slotId ||
      !mongoose.isValidObjectId(formId) ||
      !mongoose.isValidObjectId(slotId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid formId and slotId are required",
      });
    }

    // 3. Hospital Check
    const hospital = await HospitalModel.findById(hosId)
      .select("trimmedName name")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // 4. Dynamic DB Connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormModel = getFilledFormsModel(conn)
    const updatedForm = await FilledFormModel.findByIdAndUpdate(
      formId, // Pehla argument directly ID ho sakta hai
      {
        $unset: {
          "formData.appointmentSlot": 1,
        },
        $set: {
          "formData.patientArrivalTime": "",
        },
      },
      { new: true }
    );

    // //console.log("updatedForm", updatedForm)


    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form or Slot not found",
      });
    }



    return res.status(200).json({
      success: true,
      message: "Slot unbooked and reset successfully",
    });
  } catch (error) {
    console.error("Error in unbookSlotController:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unbook slot",
      error: error.message,
    });
  }
};

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

export const uploadFormsCsv = async (req, res) => {
  const { hosId } = req.query;
  const { type } = req.body;

  try {
    const file = req.files?.csv?.[0];

    if (!file) return res.status(400).json({ success: false, message: "CSV file required" });
    if (!type) return res.status(400).json({ success: false, message: "Type is required" });

    if (!hosId || !mongoose.Types.ObjectId.isValid(hosId)) {
      return res.status(400).json({ success: false, message: "Invalid hospital ID" });
    }

    const hospital = await HospitalModel.findById(hosId).lean();
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

    // Establish dynamic tenant connection
    const conn = await getConnection(hospital.trimmedName);

    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);
    const DoctorModel = getDoctorModel(conn);
    const DepartmentModel = getDepartmentModel(conn);
    const BranchModel = getBranchModel(conn);

    const rows = [];
    const validRows = [];
    const errorList = [];


    await new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer);

      stream
        .pipe(csv())
        .on("data", (data) => {
          const cleaned = {};
          Object.keys(data).forEach((k) => {
            cleaned[k.trim()] = (data[k] ?? "").toString().trim();
          });

          // Only push non-empty rows
          if (!Object.values(cleaned).every(v => v === "")) {
            rows.push(cleaned);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "The CSV file is empty" });
    }
    const normalize = (val) =>
      (val || "")
        .toString()
        .trim()
        .toLowerCase();

    const cleanDoctorName = (name) => {
      if (!name) return "";

      return name
        .toString()
        .replace(/^(dr\.?|prof\.?\s*dr\.?|assoc\.?\s*prof\.?\s*dr\.?|asst\.?\s*prof\.?\s*dr\.?)/i, "")
        .trim()
        .toLowerCase();
    };

    // ======================
    // STEP 1: EXTRACT UNIQUE VALUES FOR BULK FETCH
    // ======================
    const csvBranchNames = [
      ...new Set(rows.map(r => normalize(r.branchId)).filter(Boolean)),
    ];

    const csvDoctorNames = [
      ...new Set(
        rows
          .map(r => cleanDoctorName(r.doctor))
          .filter(Boolean)
      ),
    ];

    const csvDeptNames = [
      ...new Set(rows.map(r => normalize(r.department)).filter(Boolean)),
    ];

    const mobiles = [
      ...new Set(rows.map(r => normalize(r.patientMobile)).filter(Boolean)),
    ];

    // ======================
    // STEP 2: BULK FETCH MASTER DATA
    // ======================

    // Branches
    const branches = await BranchModel.find({
      name: {
        $in: csvBranchNames.map(
          name => new RegExp(`^${name}$`, "i")
        ),
      },
    }).lean();
    // //console.log("csvBranchNames", csvBranchNames);
    // //console.log("csvBranchNames", branches);

    const branchMap = new Map(
      branches.map(b => [normalize(b.name), b])
    );



    const doctors = await DoctorModel.find({
      name: {
        $in: csvDoctorNames.map(
          name => new RegExp(`^${name}$`, "i")
        ),
      },
    }).lean();
    // //console.log("doctors", doctors);


    const doctorMap = new Map(
      doctors.map(d => [cleanDoctorName(d.name), d])
    );
    // //console.log("csvDoctorNames", csvDoctorNames);
    // //console.log("doctorMap", doctorMap);
    const departments = await DepartmentModel.find({
      name: {
        $in: csvDeptNames.map(
          name => new RegExp(`^${name}$`, "i")
        ),
      },
    }).lean();

    const deptMap = new Map(
      departments.map(d => [normalize(d.name), d])
    );

    // //console.log("csvDeptNames", csvDeptNames);
    // //console.log("deptMap", deptMap);
    // Existing Patients
    const existingPatients = await PatientModel.find({
      patientMobile: { $in: mobiles },
    }).lean();

    const patientMap = new Map(
      existingPatients.map(p => [normalize(p.patientMobile), p])
    );

    // ======================
    // STEP 3: ROW BY ROW VALIDATION
    // ======================
    // ======================
    // STEP 3: ROW BY ROW VALIDATION
    // ======================
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1; // 1-indexed for user visibility
      const rowErrors = [];

      // Validate Branch
      if (!row.branchId) {
        rowErrors.push({ rowNumber, columnName: "branchId", invalidValue: "Empty", message: "Branch Name is empty" });
      } else {
        const matchedBranch = branchMap.get(normalize(row.branchId));
        if (!matchedBranch) {
          rowErrors.push({ rowNumber, columnName: "branchId", invalidValue: row.branchId, message: `Branch '${row.branchId}' does not exist in database` });
        } else {
          row.dbBranchId = matchedBranch._id; // Attach real ObjectId to row object
        }
      }

      // Validate Doctor (Only if provided in CSV)
      // //console.log("doctorMap", doctorMap);

      if (row.doctor) {
        const matchedDoctor = doctorMap.get(cleanDoctorName(row.doctor));

        // //console.log("cleanDoctorName", normalize(row.doctor));
        // //console.log("doctorMap", doctorMap);
        // //console.log("matchedDoctor", matchedDoctor);

        if (!matchedDoctor) {
          rowErrors.push({ rowNumber, columnName: "doctor", invalidValue: row.doctor, message: `Doctor '${row.doctor}' does not exist in database` });
        } else {
          row.dbDoctorId = matchedDoctor._id;
        }
      }

      // Validate Department (Only if provided in CSV)
      if (row.department) {
        const matchedDept = deptMap.get(normalize(row.department));
        if (!matchedDept) {
          rowErrors.push({ rowNumber, columnName: "department", invalidValue: row.department, message: `Department '${row.department}' does not exist in database` });
        } else {
          row.dbDeptId = matchedDept._id;
        }
      }

      // Validate Patient Name & Mobile
      if (!row.patientName) {
        rowErrors.push({ rowNumber, columnName: "patientName", invalidValue: "Empty", message: "Patient Name is missing" });
      }
      if (!row.patientMobile) {
        rowErrors.push({ rowNumber, columnName: "patientMobile", invalidValue: "Empty", message: "Patient Mobile is missing" });
      }

      // Distribute to valid or invalid groups
      if (rowErrors.length > 0) {
        errorList.push(...rowErrors);
      } else {
        validRows.push(row);
      }
    }

    // If there are validation errors, stop execution and return errors to frontend
    if (errorList.length > 0) {
      return res.status(502).json({
        success: false,
        message: "CSV Validation Failed",
        errors: errorList,
        totalRows: rows.length,
        successCount: validRows.length,
        errorCount: errorList.length
      });
    }

    // ======================
    // STEP 4: BULK CREATE NEW PATIENTS (Only for valid rows)
    // ======================
    const newPatients = [];

    for (const row of validRows) {
      const mobile = row.patientMobile;
      if (patientMap.has(mobile)) continue;

      // //console.log("patietn detaik", row);


      newPatients.push({
        hospitalId: {
          hospitalId: hospital._id,
          name: hospital.name,
        },
        branchId: row.branchId,
        gender: row.gender || "Other",
        patientName: row.patientName,
        status: row.patientStatus || "",
        patientMobile: mobile,
        patientAge: parseInt(row.age || row.patientAge, 10) || 0, // handles both 'age' and 'patientAge' headers
        location: row.location || "",
        category: row.category || "",
      });
    }

    if (newPatients.length) {
      const inserted = await PatientModel.insertMany(newPatients, { ordered: false });
      inserted.forEach(p => patientMap.set(p.patientMobile, p));
    }

    // ======================
    // STEP 5: BUILD & INSERT FORMS
    // ======================
    const forms = [];

    for (const row of validRows) {
      const patient = patientMap.get(row.patientMobile);
      if (!patient) continue;

      forms.push({
        formType: row.formType?.toLowerCase() || "inbound",
        agentName: row.agentName || "System Import",
        branchId: row.dbBranchId,
        doctor: row.dbDoctorId || null,
        department: row.dbDeptId || null,
        callStatus: row.callStatus || "connected",
        purpose: row.purpose || "",
        followupStatus: row.followupStatus || null,
        formData: {
          referenceFrom: row.referenceFrom || "",
          callerType: row.callerType || "",
          patientDetails: patient._id,
          remarks: row.remarks || "",
          surgeryName: row.surgeryName || "",
          healthPackageName: row.healthPackageName || "",
          healthSchemeName: row.healthSchemeName || "",
          govertHealthSchemeName: row.govertHealthSchemeName || "",
          nonGovtHealthSchemeName: row.nonGovtHealthSchemeName || "",
          reportName: row.reportName || "",
          status: row.patientStatus || "",
        },
      });
    }

    const BATCH = 500;
    for (let i = 0; i < forms.length; i += BATCH) {
      const batch = forms.slice(i, i + BATCH);
      await FilledFormsModel.insertMany(batch);
    }

    // ======================
    // AUDIT LOG & RESPONSE
    // ======================
    const user = req.user;
    setImmediate(() => {
      if (typeof auditLog === "function") {
        auditLog({
          action: "BULK_UPLOAD_FORMS",
          event: "ADD",
          module: "FORM_SUBMISSION",
          role: user?.type || "Unknown",
          customMessage: `${user?.type || "User"} "${user?.name}" uploaded ${forms.length} forms successfully.`,
          name: user?.name,
          userId: user?.id,
          ip: req.userIp,
          userAgent: req.headers["user-agent"],
        });
      }
    });

    return res.status(200).json({
      success: true,
      inserted: forms.length,
      message: "CSV uploaded and processed successfully",
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 1. IPD Questions (8 Questions)
const ipdQuestionsList = [
  { questionId: "ipdQ1", questionText: "Are you happy with the treatment provided in the hospital?" },
  { questionId: "ipdQ2", questionText: "Did the Doctor Explain about your problem / disease ?" },
  { questionId: "ipdQ3", questionText: "Did the nursing staff gave solution to your problem ?" },
  { questionId: "ipdQ4", questionText: "Are you happy with the hygiene and cleanliness maintained in the wards ?" },
  { questionId: "ipdQ5", questionText: "Did you receive blood reports / ultrasound / X- Ray reports on time ?" },
  { questionId: "ipdQ6", questionText: "Was the admission / discharge process smooth ?" },
  { questionId: "ipdQ7", questionText: "Was the pharmacy available 24 x 7 ?" },
  { questionId: "ipdQ8", questionText: "Did the dietitian visit you and provide food on time?" }
];

// 2. OPD Questions (10 Questions)
const opdQuestionsList = [
  { questionId: "opdQ1", questionText: "Are OPD timings convenient for you ?" },
  { questionId: "opdQ2", questionText: "Did you find parking facility comfortably in the hospital?" },
  { questionId: "opdQ3", questionText: "Have you faced problems in finding the concerned department?" },
  { questionId: "opdQ4", questionText: "Did you find waiting area clean / sufficient ?" },
  { questionId: "opdQ5", questionText: "Did you wait for long before consultation?" },
  { questionId: "opdQ6", questionText: "Did you wait for long before your tests?" },
  { questionId: "opdQ7", questionText: "Was the Doctor focused about your treatment and your problem?" },
  { questionId: "opdQ8", questionText: "Did you receive reports on time?" },
  { questionId: "opdQ9", questionText: "Doctor explained about your treatment and responded to all your questions?" },
  { questionId: "opdQ10", questionText: "Are you happy with the treatment / services provided in the Hospital?" }
];

// Helper: Random number generator (1 to 5)
const getRandomRating = () => {
  const rand = Math.random();

  if (rand < 0.70) return 5; // 70% probability
  if (rand < 0.80) return 4; // 20% probability
  if (rand < 0.90) return 3; // 20% probability
  if (rand < 0.98) return 2; // 8% probability
  return 1;                  // 1% probability
};
async function updateFeedbackDocuments() {
  try {
    // Database connection string update karein
    const conn = await getConnection("jindalhospital-JH001");
    const FilledFormsModel = getFilledFormsModel(conn);

    // Date range filters (1 May 2026 to 31 July 2026)
    const startDate = new Date("2026-05-01T00:00:00.000Z");
    const endDate = new Date("2026-07-31T23:59:59.999Z");

    const filterQuery = {
      formType: "outbound",
      purpose: "Feedback",
      createdAt: { $gte: startDate, $lte: endDate },
      isDeleted: { $ne: true }
    };

    const formsToUpdate = await FilledFormsModel.find(filterQuery);
    //console.log(`Found ${formsToUpdate.length} documents to update.`);

    if (formsToUpdate.length === 0) {
      //console.log("No matching documents found.");
      process.exit(0);
    }

    const bulkOps = formsToUpdate.map((doc) => {
      // Document ka feedbackType check karein (lowercase match)
      let type = (doc.formData?.feedback?.feedbackType ||
        doc.formData?.feedbackType ||
        ""
      ).toLowerCase();

      //console.log("type", type);

      // Agar feedbackType missing hai, toh random IPD ya OPD select kar lein
      if (type !== "ipd" && type !== "opd") {
        type = Math.random() > 0.5 ? "ipd" : "opd";
      }

      // Selected type ke according questions choose karein
      const targetQuestionsList = type === "ipd" ? ipdQuestionsList : opdQuestionsList;

      // Random ratings attach karein
      const formattedQuestions = targetQuestionsList.map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        rating: getRandomRating()
      }));

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              // "formData.feedbackType": type,
              // "formData.feedback.feedbackType": type.toUpperCase(),
              "formData.feedback.questions": formattedQuestions
            }
          }
        }
      };
    });

    const result = await FilledFormsModel.bulkWrite(bulkOps);
    //console.log(`Successfully updated ${result.modifiedCount} documents!`);

  } catch (error) {
    console.error("Error while updating documents:", error);
  } finally {
    await mongoose.disconnect();
    //console.log("Database disconnected.");
  }
}

// updateFeedbackDocuments();