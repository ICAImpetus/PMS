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

    // console.log("filledForm", filledForm);

    if (
      filledForm?.formType?.toLowerCase() === "inbound" &&
      filledForm?.purpose?.toLowerCase() ===
      "appointment"

    ) {
      // console.log("call");

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
              "formData.patientDetails.patientAge": "$patientInfo.patientAge",
              "formData.patientDetails.patientCategory": "$patientInfo.category",
              "formData.patientDetails.patientlocation": "$patientInfo.location",
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

      // console.log("doctorId", doctorId);
      // console.log("date", date);


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
    // console.log("csvBranchNames", csvBranchNames);
    // console.log("csvBranchNames", branches);

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
    // console.log("doctors", doctors);


    const doctorMap = new Map(
      doctors.map(d => [cleanDoctorName(d.name), d])
    );
    // console.log("csvDoctorNames", csvDoctorNames);
    // console.log("doctorMap", doctorMap);
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

    // console.log("csvDeptNames", csvDeptNames);
    // console.log("deptMap", deptMap);
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
      // console.log("doctorMap", doctorMap);

      if (row.doctor) {
        const matchedDoctor = doctorMap.get(cleanDoctorName(row.doctor));

        // console.log("cleanDoctorName", normalize(row.doctor));
        // console.log("doctorMap", doctorMap);
        // console.log("matchedDoctor", matchedDoctor);

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

      // console.log("patietn detaik", row);


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