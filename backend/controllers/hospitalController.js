import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import { sanitizeHospitalPayload } from "../models/master.models/HospitalModel.js";
import { getAdminAgentModel, getAuditLogModel, getBranchModel, getCodeAlertModel, getCodeAnnoucementModel, getConnection, getDepartmentModel, getDoctorModel, getEmpanelmentModel, getFilledFormsModel, getHospitalModel, getInchargeModel, getIPDAndDayCareModel, getLabTestModel, getPatientModel, getProcedureModel, getSuggestionsModel, MasterConn } from "../utils/db.manager.js";
import { auditLog } from "../middlewares/apiLogger.middleware.js";
import { updateSuggestions } from "../utils/updateSuggestions.js";
import { toObjectId } from "../utils/toObjectId.js";
import cloudinary from "../utils/cloudinary.js";
import { NotificationSchema } from "../models/master.models/NotiificationModel.js";


const HospitalModel = getHospitalModel(MasterConn)
const AdminAndAgentModel = getAdminAgentModel(MasterConn)
const AuditLog = getAuditLogModel(MasterConn)

const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "object") return value;
    if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
      return JSON.parse(value);
    }
    return value;
  } catch {
    return fallback;
  }
};



function generateSlots(start, end, slotMinutes = 20, maxPatients = 10) {
  if (!start || !end || start === "00:00" || end === "00:00") {
    return [];
  }

  const slots = [];

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startDate = new Date();
  startDate.setHours(sh, sm, 0, 0);

  const endDate = new Date();
  endDate.setHours(eh, em, 0, 0);

  let current = new Date(startDate);
  let count = 0;

  while (current < endDate && count < maxPatients) {
    const slotStart = current.toTimeString().slice(0, 5);

    const next = new Date(current.getTime() + slotMinutes * 60000);

    if (next > endDate) break;

    const slotEnd = next.toTimeString().slice(0, 5);

    slots.push({
      start: slotStart,
      end: slotEnd,
    });

    current = next;
    count++;
  }

  return slots;
}

function generateDoctorSlots(doctor) {
  if (!doctor?.timings) return [];

  const slotMinutes = parseInt(doctor?.averagePatientTime || 10)

  const maxPatients = doctor?.maxPatientsHandled || 10;

  const allSlots = [];

  // Morning slots
  if (
    doctor.timings?.morning?.start &&
    doctor.timings?.morning?.end
  ) {
    allSlots.push(
      ...generateSlots(
        doctor.timings.morning.start,
        doctor.timings.morning.end,
        slotMinutes,
        maxPatients
      )
    );
  }

  // Evening slots
  if (
    doctor.timings?.evening?.start &&
    doctor.timings?.evening?.end
  ) {
    allSlots.push(
      ...generateSlots(
        doctor.timings.evening.start,
        doctor.timings.evening.end,
        slotMinutes,
        maxPatients
      )
    );
  }

  return allSlots;
}

export const getLogs = async (req, res) => {
  try {
    const { page } = req.query

    const PAGE_LIMIT = 10;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * PAGE_LIMIT;

    const [data, totalDocument] = await Promise.all([
      AuditLog.find({ level: "audit" }).skip(skip)
        .limit(PAGE_LIMIT).sort({ createdAt: -1 }),
      AuditLog.countDocuments()
    ])

    res.json({
      success: true,
      message: "Audit logs successfully fetched",
      data: data,
      pagination: {
        totalDocument,
        page: pageNum,
        totalPages: Math.ceil(totalDocument / PAGE_LIMIT),
      },
    });
  } catch (error) {
    console.error("Audit log fetch error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching audit logs",
    });
  }
};

export const AddHospital = async (req, res) => {
  let createdHospital = null;
  let uploadedPublicId = null;
  let uploadedImageUrl = null;

  try {
    let hospitalData = sanitizeHospitalPayload(req.body || {});

    // =========================
    //  PARSE JSON FIELDS (IMPORTANT)
    // =========================
    if (typeof hospitalData.branches === "string") {
      hospitalData.branches = JSON.parse(hospitalData.branches);
    }

    if (typeof hospitalData.accondDetails === "string") {
      hospitalData.accondDetails = JSON.parse(hospitalData.accondDetails);
    }

    if (typeof hospitalData.managementDetails === "string") {
      hospitalData.managementDetails = JSON.parse(hospitalData.managementDetails);
    }

    // =========================
    //  VALIDATION
    // =========================
    if (!hospitalData?.name) {
      return res.status(400).json({
        success: false,
        message: "Hospital name required",
      });
    }

    // check duplicate hospital code
    const existingHospital = await HospitalModel.findOne({
      hospitalCode: hospitalData.hospitalCode,
    });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital code already exists",
      });
    }

    // =========================
    //  FILE UPLOAD
    // =========================
    if (req.imageUrl) {
      uploadedPublicId = req.publicId;
      uploadedImageUrl = req.imageUrl;
    }

    // =========================
    //  GENERATE DB NAME
    // =========================
    const trimmedName = hospitalData.name.replace(/\s/g, "").toLowerCase();
    const dbName = `${trimmedName}-${hospitalData.hospitalCode}`;

    // =========================
    //  STEP 1: CREATE HOSPITAL (MASTER DB)
    // =========================
    createdHospital = await HospitalModel.create({
      name: hospitalData.name,
      itsBranch: hospitalData?.itsBranch,
      trimmedName: dbName,
      hospitallogo: uploadedImageUrl,
      hospitallogoPublicId: uploadedPublicId,
      hospitalCode: hospitalData.hospitalCode,
      city: hospitalData.city,
      state: hospitalData.state,
      beds: hospitalData?.beds,
      contact: hospitalData?.contact,
      contactNumbers: hospitalData.contactNumbers || [],
      corporateAddress: hospitalData.corporateAddress,
      accondDetails: hospitalData.accondDetails,
      managementDetails: hospitalData.managementDetails,
      email: hospitalData.email,
      website: hospitalData.website,
    });

    // =========================
    //  STEP 2: CONNECT TENANT DB
    // =========================
    const conn = await getConnection(dbName);
    const BranchModel = getBranchModel(conn);

    // =========================
    //  STEP 3: CREATE BRANCH(ES)
    // =========================
    console.log("hospitalData", hospitalData);

    if (!hospitalData?.itsBranch) {
      //  Parent hospital → multiple branches
      const branches = hospitalData.branches || [];

      for (const branch of branches) {
        const existingBranch = await BranchModel.findOne({
          code: branch?.code,
        });

        if (existingBranch) {
          throw new Error(`Branch code already exists: ${branch.code}`);
        }

        await BranchModel.create({
          city: branch.city,
          state: branch.state,
          name: branch.name,
          location: branch.location,
          contact: branch.contact,
          contactNumbers: branch.contactNumbers || [],
          email: branch.email,
          code: branch?.code,
          beds: branch?.beds,
        });
      }
    } else {
      //  Single branch hospital
      const existingBranch = await BranchModel.findOne({
        code: hospitalData?.hospitalCode,
      });

      if (existingBranch) {
        throw new Error(
          `Branch code already exists: ${hospitalData?.hospitalCode}`
        );
      }

      await BranchModel.create({
        city: hospitalData?.city,
        state: hospitalData?.state,
        name: hospitalData?.name,
        contact: hospitalData?.contact,
        location: hospitalData?.corporateAddress,
        contactNumbers: hospitalData?.cont || [],
        email: hospitalData?.email,
        code: hospitalData?.hospitalCode,
        beds: hospitalData?.beds,
      });
    }

    // =========================
    //  STEP 4: UPDATE SUGGESTIONS (Master DB)
    // =========================
    if (hospitalData.managementDetails && Array.isArray(hospitalData.managementDetails)) {
      const memberTypes = hospitalData.managementDetails
        .map((m) => m.memberType)
        .filter((val) => typeof val === "string" && val.trim() !== "");

      if (memberTypes.length > 0) {
        await updateSuggestions(MasterConn, "membertype", memberTypes);
      }
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message: "Hospital & branches created successfully",
      data: createdHospital,
    });

  } catch (error) {
    console.error("Error:", error.message);

    // =========================
    //  ROLLBACK
    // =========================
    if (createdHospital) {
      try {
        await HospitalModel.findByIdAndDelete(createdHospital._id);

        if (uploadedPublicId) {
          await cloudinary.uploader.destroy(uploadedPublicId);
        }

        console.log("Rollback successful");
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
export const updateHospitalById = async (req, res) => {
  let uploadedPublicId = null;
  let uploadedImageUrl = null;

  const { id } = req.params;
  let hospitalData = sanitizeHospitalPayload(req.body || {});

  // =========================
  //  VALIDATION
  // =========================
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: "Valid ID is required",
      success: false,
    });
  }

  if (!hospitalData || Object.keys(hospitalData).length === 0) {
    return res.status(400).json({
      message: "No fields provided for update",
      success: false,
    });
  }

  try {
    // =========================
    //  PARSE JSON FIELDS
    // =========================
    if (typeof hospitalData.branches === "string") {
      hospitalData.branches = JSON.parse(hospitalData.branches);
    }

    if (typeof hospitalData.accondDetails === "string") {
      hospitalData.accondDetails = JSON.parse(hospitalData.accondDetails);
    }

    if (typeof hospitalData.managementDetails === "string") {
      hospitalData.managementDetails = JSON.parse(hospitalData.managementDetails);
    }

    // =========================
    //  FIND EXISTING HOSPITAL
    // =========================
    const hospital = await HospitalModel.findOne({
      _id: id,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital Not Found",
        success: false,
      });
    }

    // =========================
    //  HANDLE IMAGE UPLOAD
    // =========================
    if (req.imageUrl) {
      uploadedPublicId = req.publicId;
      uploadedImageUrl = req.imageUrl;

      // delete old image using publicId (correct way)
      if (hospital?.hospitallogoPublicId) {
        await cloudinary.uploader.destroy(hospital.hospitallogoPublicId);
      }
    }

    // =========================
    //  REMOVE IMAGE (if requested)
    // =========================
    if (hospitalData?.removeHospitalLogo === true || hospitalData?.removeHospitalLogo === "true") {
      if (hospital?.hospitallogoPublicId) {
        await cloudinary.uploader.destroy(hospital.hospitallogoPublicId);
      }
      hospitalData.hospitallogo = null;
      hospitalData.hospitallogoPublicId = null;
    }

    // =========================
    //  PREPARE UPDATE OBJECT
    // =========================
    const updatePayload = {
      ...hospitalData,
    };

    if (uploadedImageUrl) {
      updatePayload.hospitallogo = uploadedImageUrl;
      updatePayload.hospitallogoPublicId = uploadedPublicId;
    }

    // =========================
    //  UPDATE
    // =========================
    const result = await HospitalModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updatePayload },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        message: "Hospital Not Found",
        success: false,
      });
    }

    // =========================
    //  UPDATE SUGGESTIONS (Master DB)
    // =========================
    if (hospitalData.managementDetails && Array.isArray(hospitalData.managementDetails)) {
      const memberTypes = hospitalData.managementDetails
        .map((m) => m.memberType)
        .filter((val) => typeof val === "string" && val.trim() !== "");

      if (memberTypes.length > 0) {
        await updateSuggestions(MasterConn, "membertype", memberTypes);
      }
    }

    // =========================
    //  RESPONSE
    // =========================
    return res.status(200).json({
      message: "Hospital updated successfully",
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Error in updating hospital:", error);

    // rollback new upload if error
    if (uploadedPublicId) {
      await cloudinary.uploader.destroy(uploadedPublicId);
    }

    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
    });
  }
};
export const createBranch = async (req, res) => {
  try {
    const user = req.user;
    const hospitalId = req.params.id;

    const {
      city,
      state,
      name,
      location,
      contact,
      contactNumbers,
      email,
      code,
      beds,
    } = req.body;

    //  Validate hospital
    const hospital = await HospitalModel.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    //  Tenant DB connection
    const conn = await getConnection(hospital.trimmedName);
    const BranchModel = getBranchModel(conn);

    //  Duplicate check
    const existingBranch = await BranchModel.findOne({ code });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: "Branch code already exists",
      });
    }

    //  Step 1: Create branch
    const createdBranch = await BranchModel.create({
      hospital: hospital._id,
      city,
      state,
      name,
      location,
      contact,
      contactNumbers,
      email,
      code,
      beds,
    });

    auditLog({
      action: "BRANCH_INSERT",
      event: "ADD",
      module: "Branch",
      role: req.user?.type,
      name: req.user?.name,
      userId: req.user?.id,
      customMessage: `Branch "${name}" created for hospital "${hospital.name}"`,
      newData: createdBranch,
      ip: req.userIp,
    });

    try {
      //  Step 2: Update master DB
      await HospitalModel.findByIdAndUpdate(hospital._id, {
        $inc: { branchCount: 1 },
      });
    } catch (err) {
      // Rollback (manual)
      await BranchModel.findByIdAndDelete(createdBranch._id);

      throw new Error("Failed to update hospital, branch rolled back");
    }
    //  Audit log (non-blocking)
    auditLog({
      name: user?.name,
      userId: user?.id,
      ip: req.userIp,
      action: "CREATE_BRANCH",
      userId: user?._id,
      role: user?.type,
      module: "Branch",
      customMessage: `Branch ${name} created`,
    });

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: {
        ...createdBranch.toObject(),
        hospital,
      },
    });
  } catch (error) {
    console.error("Create Branch Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
export const updateBranch = async (req, res) => {
  try {

    const user = req.user;

    let {
      city,
      state,
      name,
      location,
      contact,
      contactNumbers,
      email,
      code,
      beds,
    } = req.body;

    const { hosId, branchId } = req.query
    //  Validate ObjectIds
    if (!hosId || !branchId || !mongoose.Types.ObjectId.isValid(hosId) || !mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branchId or Invalid hospitalId ",
      });
    }


    // Check hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Get tenant DB connection
    const conn = await getConnection(hospital.trimmedName);

    //  Get Branch Model
    const BranchModel = await getBranchModel(conn);

    const branch = await BranchModel.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (name !== undefined) branch.name = name;
    if (city !== undefined) branch.city = city;
    if (state !== undefined) branch.state = state;
    if (location !== undefined) branch.location = location;
    if (contact !== undefined) branch.contact = contact;
    if (contactNumbers !== undefined) branch.contactNumbers = contactNumbers;
    if (email !== undefined) branch.email = email;
    if (beds !== undefined) branch.beds = beds;

    const savedBranch = await branch.save();

    //  Audit log
    await auditLog({
      name: user?.name || "Unknown",
      userId: user?.id,
      ip: req.userIp,
      action: "UPDATE_BRANCH",
      role: user?.type,
      module: "Branch",
      customMessage: `Branch ${branch.name} updated by ${user?.type}`,
    });

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: savedBranch,
    });
  } catch (error) {
    console.error("Update Branch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// * Updates hospital details from the hospital admin side.
// * Requires 'keyToUpdate' and 'trimmedName' in the request body.
// ! Returns error if required fields are missing or no update fields are provided.
// * Updates hospital details by hospital ID.
// * Requires 'ID' in req.params and update fields in req.body.
// ! Returns error if ID or update fields are missing, or if no hospital is found.
export const updateHospital = async (req, res) => {
  try {
    const hospitalData = sanitizeHospitalPayload(req.body || {});
    if (!hospitalData || Object.keys(hospitalData).length === 0) {
      return res
        .status(400)
        .json({ message: "Missing request body", success: false });
    }

    const { keyToUpdate, trimmedName, ...updateDoc } = hospitalData;
    console.log(
      "keyToUpdate ,trimmednmae,updatedoc",
      keyToUpdate,
      trimmedName,
      updateDoc,
    );

    if (!keyToUpdate) {
      return res
        .status(400)
        .json({ message: "Missing keyToUpdate", success: false });
    }
    if (!trimmedName) {
      return res
        .status(400)
        .json({ message: "Missing trimmedName", success: false });
    }

    if (Object.keys(updateDoc).length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided for update", success: false });
    }

    const result = await Hospital.updateOne(
      { trimmedName, isDeleted: { $ne: true } },
      { $set: updateDoc },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No hospital found with this name", success: false });
    }
    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message:
          "Document matched but no changes were made (maybe the new value is the same).",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "Hospital updated successfully", success: true });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const getAllHospitalBranches = async (req, res) => {
  try {
    const { id } = req.params;
    const userType = req.user?.type?.toLowerCase();
    let query = { isDeleted: false };

    // Validate hospitalId
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID",
      });
    }

    // Check hospital exists (master DB)
    const hospital = await HospitalModel.findOne({
      _id: id,
      isDeleted: false,
    }).lean();


    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    // const conn = await getConnection(hospital?.trimmedName)
    // const BranchModel = await getBranchModel(conn)

    //  TEAM LEADER FLOW
    if (userType === "teamleader") {
      const userBranches = req.user?.branches;

      if (!userBranches || userBranches.length === 0) {
        return res.status(400).json({
          message: "No branches assigned to this team leader",
          success: false,
        });
      }

      query._id = { $in: userBranches };
    }

    // COMMON QUERY
    const conn = await getConnection(hospital?.trimmedName)
    const BranchModel = await getBranchModel(conn)

    const result = await BranchModel.find(query)
      .sort({ createdAt: -1 })
      .lean(); // performance boost

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "No branches found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Branches fetched successfully",
      data: result || [],
      success: true,
    });

  } catch (error) {
    console.error("getAllHospitalBranches error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};
export const getSingleBranch = async (req, res) => {
  try {
    const { id, hosId } = req.params;

    // Validate IDs
    if (
      !id ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Check hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Get tenant DB connection
    const conn = await getConnection(hospital.trimmedName);


    const Suggestion = getSuggestionsModel(conn);
    const Department = getDepartmentModel(conn);
    const Doctor = getDoctorModel(conn);
    const Empanelment = getEmpanelmentModel(conn);
    const LabTest = getLabTestModel(conn);
    const IPDAndDayCare = getIPDAndDayCareModel(conn);
    const Procedure = getProcedureModel(conn);
    const Incharge = getInchargeModel(conn);
    const CodeAnnouncement = getCodeAnnoucementModel(conn);
    const Branch = getBranchModel(conn);

    // helper (clean code)
    const pop = (path, model) => ({ path, model });

    const [
      branch,
      departments,
      doctors,
      empanelmentList,
      labtestList,
      ipdList,
      dayCareList,
      procedureList,
      inchargeList,
      codeAlertsList,
      suggestion
    ] = await Promise.all([

      // Branch
      Branch.findOne({ _id: id, isDeleted: false }).lean(),

      // Departments
      Department.find({ branch: id, isDeleted: false })
        .populate(pop("doctors", Doctor))
        .sort({ createdAt: -1 })
        .lean(),

      // Doctors (MAIN FIX HERE)
      Doctor.find({ branch: id, isDeleted: false })
        .populate(pop("empanelmentList.treatableAreas", Suggestion))
        .populate(pop("department", Department))
        .populate(pop("specialties", Suggestion))
        .populate(pop("surgeries", Suggestion))
        .sort({ createdAt: -1 })
        .lean(),

      // Empanelment
      Empanelment.find({ branch: id, isDeleted: false })
        .populate(pop("coverageOptions.treatableAreas", Suggestion))
        .sort({ createdAt: -1 })
        .lean(),

      // Lab Tests
      LabTest.find({ branch: id, isDeleted: false })
        .populate(pop("serviceGroup", Suggestion)) //  change if different model
        .sort({ createdAt: -1 })
        .lean(),

      // IPD
      IPDAndDayCare.find({
        branch: id,
        type: "ipd",
        isDeleted: false,
      })
        .populate(pop("category", Suggestion)) //  change if different model
        .sort({ createdAt: -1 })
        .lean(),

      // DayCare
      IPDAndDayCare.find({
        branch: id,
        type: "dayCare",
        isDeleted: false,
      })
        .populate(pop("category", Suggestion))
        .sort({ createdAt: -1 })
        .lean(),

      // Procedure
      Procedure.find({ branch: id, isDeleted: false })
        .populate(pop("doctorIds", Doctor))
        .populate(pop("category", Suggestion)) //  adjust if needed
        .populate(pop("empanelmentType", Suggestion)) //  adjust
        .sort({ createdAt: -1 })
        .lean(),

      // Incharge
      Incharge.find({ branch: id, isDeleted: false })
        .populate(pop("department", Department))
        .populate(pop("serviceType", Suggestion)) //  adjust if needed
        .sort({ createdAt: -1 })
        .lean(),

      // Code Alerts
      CodeAnnouncement.find({ branch: id, isDeleted: false })
        .sort({ createdAt: -1 })
        .lean(),
      Suggestion.find({ isDeleted: false }).sort({ createdAt: -1 })
        .lean()
    ]);

    // Check branch exists
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        branch,
        departments,
        doctors,
        empanelmentList,
        labtestList,
        ipdList,
        dayCareList,
        procedureList,
        inchargeList,
        codeAlertsList,
        suggestion
      },
    });
  } catch (error) {
    console.error("getSingleBranch error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const getBranchesByRole = async (req, res) => {
  try {
    const userId = req.user.id; // auth middleware se aa raha hoga
    const { hosId } = req.query;
    // Validate IDs
    if (
      !userId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Check hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const user = await AdminAndAgentModel.findById(userId)
      .select("branches")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get tenant DB connection
    const conn = await getConnection(hospital.trimmedName);

    const BranchModel = getBranchModel(conn);

    console.log("user.branches", user.branches);

    const branchIds = user.branches?.map(item => item.branchId) || [];

    const branches = await BranchModel.find({
      _id: { $in: branchIds },
      isDeleted: false
    }).lean();

    return res.status(200).json({
      data: branches
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getDoctorsByDepId = async (req, res) => {
  try {
    const { depId } = req.params;

    // 1. Validation: Check if depId is provided or valid
    if (!depId || depId === "undefined" || depId === "null") {
      return res.status(400).json({
        success: false,
        message: "Department ID is required to fetch doctors.",
      });
    }

    // 2. Database Query
    const doctors = await Doctor.find({ departmentId: depId });

    // 3. Handle Empty Results
    if (!doctors || doctors.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No doctors assigned to this department.",
      });
    }

    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    // 4. Catch unexpected server/DB errors
    console.error("SYSTEM ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};


export const getDoctorFullProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId } = req.query

    // Validate IDs
    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const DoctorModel = await getDoctorModel(conn)
    const ProcedureModel = await getProcedureModel(conn)
    const EmpanelmentModel = await getEmpanelmentModel(conn)
    const DepartmentModel = await getDepartmentModel(conn)
    const BranchModel = await getBranchModel(conn)
    const Suggestion = getSuggestionsModel(conn);
    const pop = (path, model) => ({ path, model });
    // Doctor basic info
    const doctor = await DoctorModel.findById(id)
      .populate(pop("specialties", Suggestion))
      .populate(pop("surgeries", Suggestion))
      .populate(pop("department", DepartmentModel))
      .populate(pop("branch", BranchModel))
      .lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    //  Procedures assigned to doctor
    const procedures = await ProcedureModel.find({
      doctorIds: id,
      isDeleted: false,
    })

      .populate(pop("department", DepartmentModel))

      .populate(pop("category", Suggestion))
      .populate(pop("empanelmentType", Suggestion))
      .select("name duration ratesCharges empanelmentType department category")
      .lean();

    //  Empanelments where doctor exists in coverageOptions
    const empanelments = await EmpanelmentModel.find({
      "coverageOptions.doctor._id": id,
      isDeleted: false,
    })
      .populate(pop("coverageOptions.doctor", DoctorModel))
      .populate(pop("coverageOptions.department", DepartmentModel))
      .populate(pop("coverageOptions.treatableAreas", Suggestion))
      .select("policyName typeOfCoverage coverageOptions")
      .lean();

    // Filter only that doctor's coverage options
    const filteredEmpanelments = empanelments.map((emp) => ({
      ...emp,
      coverageOptions: emp.coverageOptions.filter(
        (opt) => opt?.doctor?._id?.toString() === id
      ),
    }));

    //  Attach data
    doctor.procedures = procedures;
    doctor.empanelments = filteredEmpanelments;

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Doctor full profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const addDoctor = async (req, res) => {
  let uploadedPublicId = null;
  let uploadedImageUrl = null;
  try {
    const { branchId, hosId } = req.query;
    console.log(req.body);


    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Upload handling
    if (req.imageUrl) {
      uploadedPublicId = req.publicId;
      uploadedImageUrl = req.imageUrl;
    }

    // Tenant connection
    const conn = await getConnection(hospital.trimmedName);

    const BranchModel = getBranchModel(conn);
    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    // Validate branch
    const branch = await BranchModel.findOne({
      _id: branchId,
      isDeleted: false,
    })

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const body = req.body;


    const specialties = parseJSON(body.specialties, []);
    const surgeries = parseJSON(body.surgeries, []);
    const degrees = parseJSON(body.degrees, []);
    const customDegrees = parseJSON(body.customDegrees, []);
    const timings = parseJSON(body.timings, {});
    const videoConsultation = parseJSON(body.videoConsultation, {});
    const departmentObj = parseJSON(body.department, null);

    let depId = null;

    if (departmentObj?._id) {
      depId = departmentObj._id;
    } else if (
      typeof body.department === "string" &&
      mongoose.Types.ObjectId.isValid(body.department)
    ) {
      depId = body.department;
    }

    // Validate department
    if (depId) {
      const departmentExists = await DepartmentModel.findOne({
        _id: depId,
        branch: branchId,
        isDeleted: false,
      })

      if (!departmentExists) depId = null;
    }

    const doctorData = {
      hospital: branch.hospital,
      branch: branchId,
      department: depId,
      name: body.name,
      type: body?.type,
      designation: body.designation,
      masters: body?.masters,
      title: body.title,
      opdNo: body.opdNo,
      averagePatientTime: body?.averagePatientTime,
      maxPatientsHandled: body?.maxPatientsHandled,
      profilePicture: uploadedImageUrl
        ? {
          imagePath: uploadedImageUrl,
          imageId: uploadedPublicId,
        }

        : null,
      degrees,
      customDegrees,
      specialties,
      surgeries,
      experience: Number(body.experience) || 0,
      paName: body.paName,
      paContactNumber: body.paContactNumber,
      extensionNumber: body.extensionNumber,
      consultationCharges: Number(body.consultationCharges) || 0,
      contactNumber: body.contactNumber,
      whatsappNumber: body.whatsappNumber,
      countryCode: body.countryCode || "+91",
      additionalInfo: body.additionalInfo,
      floor: body.floor,
      opdDays: body.opdDays
        ? body.opdDays.split(",").map((d) => d.trim())
        : [],
      isEnabled: body.isEnabled === true || body.isEnabled === "true",
      teleMedicine: body?.teleMedicine,
      timings: {
        morning: {
          start: timings?.morning?.from || "",
          end: timings?.morning?.to || "",
        },
        evening: {
          start: timings?.evening?.from || "",
          end: timings?.evening?.to || "",
        },
        custom: {
          start: timings?.custom?.from || "",
          end: timings?.custom?.to || "",
        }
      },
      videoConsultation: {
        enabled: videoConsultation?.enabled === true,
        charges: Number(videoConsultation?.charges) || 0,
        days: videoConsultation?.days,
        timeSlot: videoConsultation?.timeSlot || "",
        startTime: videoConsultation?.startTime || "",
        endTime: videoConsultation?.endTime || "",
      },
    };

    // Suggestions

    doctorData.surgeries = await updateSuggestions(conn, "surgery", doctorData.surgeries);
    doctorData.specialties = await updateSuggestions(conn, "speciality", doctorData.specialties);
    doctorData.slots = generateDoctorSlots(doctorData)

    // Create doctor
    // console.log("doctor", doctorData);

    const createdDoctor = await DoctorModel.create(doctorData);

    // Update department
    if (depId) {
      await DepartmentModel.findByIdAndUpdate(
        depId,
        { $addToSet: { doctors: createdDoctor._id } },
      );
    }

    auditLog({
      action: "Doctor_INSERT",
      event: "ADD",
      module: "Doctor",
      role: req.user?.type,
      name: req.user?.name,
      userId: req.user?.id,
      customMessage: `Doctor "${doctorData.name}" created`,
      ip: req.userIp,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      data: createdDoctor,
    });
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch { }
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const updateDoctor = async (req, res) => {

  let uploadedPublicId = null;
  let uploadedImageUrl = null;

  console.log(req.body);

  try {
    const { id } = req.params;
    const { hosId } = req.query;


    if (!id) {

      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    const doctor = await DoctorModel.findById(id)
    if (!doctor || doctor.isDeleted) {

      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const body = req.body;

    // =============================
    // SAFE JSON PARSER
    // =============================
    const parseJSON = (value, fallback) => {
      try {
        if (!value) return fallback;
        if (typeof value === "object") return value;
        return typeof value === "string" &&
          (value.startsWith("{") || value.startsWith("["))
          ? JSON.parse(value)
          : value;
      } catch (e) {
        return fallback;
      }
    };

    const specialties = parseJSON(body.specialties, doctor.specialties);
    const surgeries = parseJSON(body.surgeries, doctor.surgeries);
    const degrees = parseJSON(body.degrees, doctor.degrees);
    const customDegrees = parseJSON(body.customDegrees, doctor.customDegrees);
    const timings = parseJSON(body.timings, doctor.timings);
    const videoConsultation = parseJSON(
      body.videoConsultation,
      doctor.videoConsultation,
    );

    // =============================
    // IMAGE HANDLING
    // =============================

    console.log(" req.imageUrl", req.file);

    if (req.imageUrl) {
      uploadedPublicId = req.publicId;
      uploadedImageUrl = req.imageUrl;

      // delete old image
      if (doctor.profilePicture?.imageId) {
        await cloudinary.uploader.destroy(doctor.profilePicture.imageId);
      }

      doctor.profilePicture = {
        imagePath: uploadedImageUrl,
        imageId: uploadedPublicId,
      };
    }

    if (body.removeProfilePicture === "true") {
      if (doctor.profilePicture?.imageId) {
        await cloudinary.uploader.destroy(doctor.profilePicture.imageId);
      }
      doctor.profilePicture = null;
    }

    // =============================
    // DEPARTMENT CHANGE HANDLING
    // =============================

    let newDepId = body.department;

    if (newDepId && mongoose.isValidObjectId(newDepId)) {
      if (doctor.department?.toString() !== newDepId) {
        // Remove from old department
        if (doctor.department) {
          await DepartmentModel.findByIdAndUpdate(
            doctor.department,
            { $pull: { doctors: doctor._id } },
          );
        }

        // Add to new department
        await DepartmentModel.findByIdAndUpdate(
          newDepId,
          { $addToSet: { doctors: doctor._id } },
        );

        doctor.department = newDepId;
      }
    }

    // =============================
    // UPDATE BASIC FIELDS
    // =============================

    const surgeryIds = await updateSuggestions(conn, "surgery", surgeries);
    const specialityIds = await updateSuggestions(conn, "speciality", specialties);


    doctor.surgeries = surgeryIds;
    doctor.specialties = specialityIds;

    doctor.name = body.name ?? doctor.name;
    doctor.title = body.title ?? doctor.title;
    doctor.designation = body.designation ?? doctor.designation;
    doctor.opdNo = body.opdNo ?? doctor.opdNo;
    doctor.masters = body.masters ?? doctor.masters;
    doctor.subDepartment = body.subDepartment ?? doctor.subDepartment;
    doctor.type = body.type ?? doctor.type;
    doctor.averagePatientTime = body?.averagePatientTime ?? doctor?.averagePatientTime,
      doctor.maxPatientsHandled = body?.maxPatientsHandled ?? doctor?.maxPatientsHandled,
      doctor.experience =
      body.experience !== undefined
        ? Number(body.experience)
        : doctor.experience;

    doctor.consultationCharges =
      body.consultationCharges !== undefined
        ? Number(body.consultationCharges)
        : doctor.consultationCharges;

    doctor.floor = body.floor ?? doctor.floor;

    doctor.contactNumber = body.contactNumber ?? doctor.contactNumber;
    doctor.whatsappNumber = body.whatsappNumber ?? doctor.whatsappNumber;
    doctor.countryCode = body.countryCode ?? doctor.countryCode;
    doctor.extensionNumber = body.extensionNumber ?? doctor.extensionNumber;
    doctor.paName = body.paName ?? doctor.paName;
    doctor.paContactNumber = body.paContactNumber ?? doctor.paContactNumber;
    doctor.additionalInfo = body.additionalInfo ?? doctor.additionalInfo;
    doctor.teleMedicine = body.teleMedicine ?? doctor.teleMedicine;

    // doctor.specialties = specialties;
    // doctor.surgeries = surgeries;
    doctor.degrees = degrees;
    doctor.customDegrees = customDegrees;

    // Video Consultation Mapping
    doctor.videoConsultation = {
      enabled: videoConsultation?.enabled === true,
      timeSlot: videoConsultation?.timeSlot || doctor.videoConsultation?.timeSlot,
      charges: Number(videoConsultation?.charges) || 0,
      startTime: videoConsultation?.startTime || doctor.videoConsultation?.startTime,
      endTime: videoConsultation?.endTime || doctor.videoConsultation?.endTime,
      days: videoConsultation?.days
        ? Array.isArray(videoConsultation.days)
          ? videoConsultation.days
          : videoConsultation.days.split(",").map((d) => d.trim())
        : [],
    };

    // Timings Mapping
    doctor.timings = {
      morning: {
        start: timings?.morning?.from || timings?.morning?.start || "",
        end: timings?.morning?.to || timings?.morning?.end || "",
      },
      evening: {
        start: timings?.evening?.from || timings?.evening?.start || "",
        end: timings?.evening?.to || timings?.evening?.end || "",
      },
      custom: {
        start: timings?.custom?.from || timings?.custom?.start || "",
        end: timings?.custom?.to || timings?.custom?.end || "",
      },
    };

    doctor.isEnabled = body.isEnabled === "true" || body.isEnabled === true;

    doctor.slots = generateDoctorSlots(doctor)
    //  Actor Info
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    //  Audit Log
    auditLog({
      action: "UPDATE_DOCTOR",
      module: "DoctorManagement",
      event: "UPDATE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" Update doctor "${doctor.name}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    await doctor.save();

    const populatedDoctor =
      await DoctorModel.findById(id).populate("department");

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: populatedDoctor,
    });
  } catch (error) {

    if (uploadedPublicId) {
      await cloudinary.uploader.destroy(uploadedPublicId);
    }

    console.error("Update Doctor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId, currentStatus } = req.query;

    console.log("id", id);
    console.log("hosId", hosId);
    console.log("currentStatus", currentStatus);


    if (!id || !currentStatus) {

      return res.status(400).json({
        success: false,
        message: "Doctor ID and  currentStatus is required",
      });
    }

    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const DoctorModel = getDoctorModel(conn);

    const doctor = await DoctorModel.findByIdAndUpdate(id, {
      $set: {
        isEnabled: currentStatus
      }
    }, {
      new: true
    })
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }


    //  Actor Info
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    //  Audit Log
    auditLog({
      action: "UPDATE_DOCTOR",
      module: "DoctorManagement",
      event: "UPDATE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" Update doctor "${doctor.name}" Status.`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    const populatedDoctor =
      await DoctorModel.findById(id).populate("department");

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: populatedDoctor,
    });

  } catch (error) {
    console.error("Doctor full profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export const removeDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital.trimmedName);

    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    const doctor = await DoctorModel.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    await DepartmentModel.updateMany(
      { doctors: id },
      { $pull: { doctors: id } },
    );

    //  Actor Info
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    //  Audit Log
    auditLog({
      action: "DELETE_DOCTOR",
      module: "DoctorManagement",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted doctor "${doctor.name}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Remove Doctor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const addDepartment = async (req, res) => {
  try {


    const { branchId, hosId } = req.query;
    const { name, doctors = [] } = req.body;


    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Department name is required",
        success: false,
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);

    const BranchModel = getBranchModel(conn);
    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    const branch = await BranchModel.findOne({
      _id: branchId,
      isDeleted: false,
    });

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
        success: false,
      });
    }

    // Duplicate Department Check (same branch)
    const existingDepartment = await DepartmentModel.findOne({
      name: name.trim(),
      branch: branchId,
      isDeleted: false,
    });

    if (existingDepartment) {
      return res.status(400).json({
        message: "Department already exists in this branch",
        success: false,
      });
    }

    //Create Department
    const dep = await DepartmentModel.create({
      name,
      branch: branch._id,
      hospital: branch.hospital,
      doctors: [],
    });

    let docIds = [];

    if (doctors.length > 0) {
      for (let doc of doctors) {
        const updatedDoc = await DoctorModel.findByIdAndUpdate(
          doc.id,
          {
            department: dep._id,
          },
          { new: true },
        );

        if (updatedDoc) {
          docIds.push(updatedDoc._id);
        }
      }

      //Update department doctor list
      dep.doctors = docIds;
      await dep.save();
    }

    auditLog({
      action: "DEPARTMENT_INSERT",
      event: "ADD",
      module: "AdminAndAgentModel",
      role: req.user.type,
      customMessage: `${req.user.type} "${req.user.name}" created a new Department "${dep?.name}".`,
      name: req.user.name,
      userId: req.user.id,
      newData: dep,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      message: "Department saved successfully",
      success: true,
      data: dep,
    });
  } catch (error) {
    console.error("Department Save Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, doctors = [] } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid Department ID is required",
      });
    }
    const { hosId } = req.query;

    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);

    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    const departmentObjectId = new mongoose.Types.ObjectId(id);

    const department = await DepartmentModel.findOne({
      _id: departmentObjectId,
      isDeleted: false,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    //  Update Name
    if (name) {
      department.name = name;
    }

    //  Doctor Sync Logic
    if (Array.isArray(doctors)) {
      const newDoctorIds = doctors
        .map((doc) => doc.id) // frontend se id aa raha hai
        .filter((docId) => mongoose.Types.ObjectId.isValid(docId))
        .map((docId) => new mongoose.Types.ObjectId(docId));

      //  Remove department from doctors not in new list
      await DoctorModel.updateMany(
        {
          department: departmentObjectId,
          _id: { $nin: newDoctorIds },
        },
        { $set: { department: null } },
      );

      //  Assign department to selected doctors
      const updateResult = await DoctorModel.updateMany(
        { _id: { $in: newDoctorIds } },
        { $set: { department: departmentObjectId } },
      );

      console.log("Doctors updated:", updateResult.modifiedCount);

      department.doctors = newDoctorIds;
    }

    await department.save();

    //  Audit Log
    auditLog({
      action: "UPDATE_DEPARTMENT",
      event: "UPDATE",
      module: "DepartmentManagement",
      role: req.user?.type,
      customMessage: `${req.user?.type} "${req.user?.name}" updated department "${department.name}".`,
      name: req.user?.name,
      userId: req.user?.id,
      newData: department,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Department Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const removeDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const { hosId } = req.query;

    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid  hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);
    const department = await DepartmentModel.findById(id);

    if (!department || department.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Unlink doctors
    await DoctorModel.updateMany(
      { department: id },
      { $set: { department: null } },
    );

    department.isDeleted = true;
    await department.save();

    auditLog({
      action: "DELETE_DEPARTMENT",
      event: "DELETE",
      module: "DepartmentManagement",
      role: req.user?.type,
      customMessage: `${req.user?.type} "${req.user?.name}" deleted department "${department.name}".`,
      name: req.user?.name,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      data: department,
    });
  } catch (error) {
    console.error("Department Delete Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const addEmpanelment = async (req, res) => {


  const currentEmpanelment = req.body;
  // Tenant connection

  try {


    const { branchId, hosId } = req.query;

    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital.trimmedName);

    const BranchModel = getBranchModel(conn);
    const EmpanelmentModel = getEmpanelmentModel(conn);

    const branch = await BranchModel.findOne({
      _id: branchId,
      isDeleted: false,
    })

    if (!branch) {

      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (!currentEmpanelment?.policyName) {

      return res.status(400).json({
        success: false,
        message: "Policy name is required",
      });
    }

    let coverageOptions =
      typeof currentEmpanelment.coverageOptions === "string"
        ? JSON.parse(currentEmpanelment.coverageOptions)
        : currentEmpanelment.coverageOptions || [];

    let allTreatableAreas = [];

    coverageOptions.forEach((option) => {
      if (Array.isArray(option.treatableAreas)) {
        allTreatableAreas.push(...option.treatableAreas);
      }
    });

    // Remove duplicates
    allTreatableAreas = [...new Set(allTreatableAreas)];

    let treatableAreaIdsMap = {};

    if (allTreatableAreas.length) {

      const ids = await updateSuggestions(conn, "speciality", allTreatableAreas);

      // create map value -> id
      allTreatableAreas.forEach((val, index) => {
        treatableAreaIdsMap[val] = ids[index];
      });
    }

    // replace strings with ids inside coverageOptions
    coverageOptions = coverageOptions.map((option) => {
      if (Array.isArray(option.treatableAreas)) {
        option.treatableAreas = option.treatableAreas.map((area) => {

          const key =
            typeof area === "string"
              ? area
              : area?.label;

          return treatableAreaIdsMap[key] || area?.value;
        });
      }
      return option;
    });


    // Create Empanelment Master

    const empanelmentDoc = await EmpanelmentModel.create(
      [
        {
          policyName: currentEmpanelment.policyName.trim(),
          hospital: branch.hospital,
          branch: branch._id,
          typeOfCoverage: currentEmpanelment.typeOfCoverage,
          coverageOptions,
          additionalRemarks: currentEmpanelment.additionalRemarks?.trim(),
          validFrom: currentEmpanelment.validFrom,
          validTill: currentEmpanelment.validTill,

        },
      ],

    );

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "Empanelment_INSERT",
      event: "ADD",
      module: "EmpanelmentManagement",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created a new Empanelment "${currentEmpanelment?.policyName}".`,
      name: actorName,
      userId: req.user.id,
      // newData: empanelmentDoc,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      message: "Empanelment created successfully",
      data: empanelmentDoc,
    });
  } catch (error) {

    console.error("Add Empanelment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const updateEmpanelment = async (req, res) => {

  const empanelmentId = req.params.id;
  const body = req.body;

  try {


    const { hosId } = req.query;

    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid  hospitalId are required",
      });
    }

    if (!empanelmentId) {

      return res.status(400).json({
        success: false,
        message: "Empanelment id is required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const EmpanelmentModel = await getEmpanelmentModel(conn)

    const existingEmpanelment =
      await EmpanelmentModel.findById(empanelmentId)
    if (!existingEmpanelment) {

      return res.status(404).json({
        success: false,
        message: "Empanelment not found",
      });
    }

    //  Parse coverageOptions if coming from FormData
    let coverageOptions =
      typeof body.coverageOptions === "string"
        ? JSON.parse(body.coverageOptions)
        : body.coverageOptions || [];

    let allTreatableAreas = [];

    coverageOptions.forEach((option) => {
      if (Array.isArray(option.treatableAreas)) {
        allTreatableAreas.push(...option.treatableAreas);
      }
    });

    // Remove duplicates
    allTreatableAreas = [...new Set(allTreatableAreas)];

    let treatableAreaIdsMap = {};

    if (allTreatableAreas.length) {
      const ids = await updateSuggestions(conn, "speciality", allTreatableAreas);

      // create map value -> id
      allTreatableAreas.forEach((val, index) => {
        treatableAreaIdsMap[val] = ids[index];
      });
    }

    // replace string values with ids
    coverageOptions = coverageOptions.map((option) => {
      if (Array.isArray(option.treatableAreas)) {
        option.treatableAreas = option.treatableAreas.map(
          (area) => treatableAreaIdsMap[area] || area
        );
      }
      return option;
    });


    // ============================
    // 1 Update Empanelment Master
    // ============================

    existingEmpanelment.policyName =
      body.policyName || existingEmpanelment.policyName;

    existingEmpanelment.typeOfCoverage =
      body.typeOfCoverage || existingEmpanelment.typeOfCoverage;

    existingEmpanelment.coverageOptions = coverageOptions;

    existingEmpanelment.additionalRemarks =
      body.additionalRemarks

    await existingEmpanelment.save();

    // =============================
    // 2 Sync Doctors Snapshot
    // =============================

    return res.status(200).json({
      success: true,
      message: "Empanelment updated successfully",
      data: existingEmpanelment,
    });
  } catch (error) {

    console.error("Update Empanelment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const removeEmpanelment = async (req, res) => {

  try {
    const { id } = req.params;
    const { hosId } = req.query;

    if (!id) {

      return res.status(400).json({
        success: false,
        message: "Empanelment ID is required",
      });
    }

    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid  hospitalId are required",
      });
    }


    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const EmpanelmentModel = await getEmpanelmentModel(conn)


    const empanelment = await EmpanelmentModel.findById(id)

    if (!empanelment || empanelment.isDeleted) {

      return res.status(404).json({
        success: false,
        message: "Empanelment not found",
      });
    }

    // Soft delete empanelment
    empanelment.isDeleted = true;
    await empanelment.save();

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "DELETE_EMPANELMENT",
      module: "EmpanelmentManagement",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted empanelment "${empanelment.policyName}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "Empanelment removed successfully",
    });
  } catch (error) {

    console.error("Remove Empanelment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createLabTest = async (req, res, next) => {
  try {
    const {
      // location,
      // testCode,
      // testName,
      // testType,
      // department,
      // serviceGroup,
      // serviceCharge,
      // floor,
      // description,
      categoryApplicability,
      department,
      description,
      floor,
      location,
      packageTests,
      precaution,
      remarks,
      serviceCharge,
      serviceGroup,
      serviceTime,
      source,
      tatReport,
      testCode,
      testName,
      testType,
    } = req.body;


    const { branchId, hosId } = req.query;

    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital.trimmedName);

    const BranchModel = getBranchModel(conn);
    const LabTestModel = getLabTestModel(conn);

    const branch = await BranchModel.findOne({
      _id: branchId,
      isDeleted: false,
    })

    if (!branch) {

      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    // Validate required fields
    if (!location || !testCode || !testName || !department || !serviceCharge) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Validate department ObjectId
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    // Check duplicate testCode (soft delete safe)
    const existingTest = await LabTestModel.findOne({
      testCode: testCode.trim(),
      branch: branchId,
      isDeleted: false,
    }).lean();

    if (existingTest) {
      return res.status(409).json({
        success: false,
        message: "Test code already exists",
      });
    }

    // Convert serviceCharge to number
    const numericCharge = Number(serviceCharge);

    if (isNaN(numericCharge)) {
      return res.status(400).json({
        success: false,
        message: "Service charge must be a valid number",
      });
    }

    const serviceGroupIds = await updateSuggestions(conn, "serviceGroup", serviceGroup);
    const serviceGroupId = Array.isArray(serviceGroupIds) ? serviceGroupIds[0] : serviceGroupIds;

    // Create lab test
    const newLabTest = await LabTestModel.create({
      branch: branchId,
      location,
      testCode,
      testName,
      testType,
      department,
      serviceGroup: serviceGroupId,
      serviceCharge: numericCharge,
      floor,
      description,
      categoryApplicability,
      packageTests,
      precaution,
      remarks,
      serviceTime,
      source,
      tatReport,
    });

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "Lab_Test_INSERT",
      event: "ADD",
      module: "Lab Test",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created a new Lab Test "${newLabTest?.testName}".`,
      name: actorName,
      userId: req.user.id,
      newData: newLabTest,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      message: "Lab test created successfully",
      data: newLabTest,
    });
  } catch (error) {
    next(error);
    console.error("Create Lab Test Error:", error);
  }
};

export const updateLabTest = async (req, res, next) => {
  try {
    const { id } = req.params; // lab test id
    const { hosId } = req.query;

    const {
      categoryApplicability,
      department,
      description,
      floor,
      location,
      packageTests,
      precaution,
      remarks,
      serviceCharge,
      serviceGroup,
      serviceTime,
      source,
      tatReport,
      testCode,
      testName,
      testType,
    } = req.body;

    //  id check
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lab test id is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const LabTestModel = await getLabTestModel(conn)
    const labTest = await LabTestModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found",
      });
    }

    //  department validation (if provided)
    if (department && !mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    //  duplicate testCode check (ignore self)
    if (testCode) {
      const existingTest = await LabTestModel.findOne({
        testCode: testCode.trim(),
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existingTest) {
        return res.status(409).json({
          success: false,
          message: "Test code already exists",
        });
      }
    }

    //  serviceCharge conversion (if provided)
    let numericCharge;
    if (serviceCharge !== undefined) {
      numericCharge = Number(serviceCharge);

      if (isNaN(numericCharge)) {
        return res.status(400).json({
          success: false,
          message: "Service charge must be a valid number",
        });
      }
    }

    //  build update object (only provided fields update honge)
    const updateData = {
      ...(location && { location }),
      ...(testCode && { testCode }),
      ...(testName && { testName }),
      ...(testType && { testType }),
      ...(department && { department }),
      ...(serviceGroup && { serviceGroup }),
      ...(floor && { floor }),
      ...(description && { description }),
      ...(categoryApplicability && { categoryApplicability }),
      ...(packageTests && { packageTests }),
      ...(precaution && { precaution }),
      ...(remarks && { remarks }),
      ...(serviceTime && { serviceTime }),
      ...(source && { source }),
      ...(tatReport && { tatReport }),
    };

    if (numericCharge !== undefined) {
      updateData.serviceCharge = numericCharge;
    }


    // update suggestions + get ids
    if (updateData.serviceGroup) {
      const serviceGroupIds = await updateSuggestions(
        conn,
        "serviceGroup",
        updateData.serviceGroup
      );

      updateData.serviceGroup = Array.isArray(serviceGroupIds)
        ? serviceGroupIds[0]
        : serviceGroupIds;
    }


    // update
    const updatedLabTest = await LabTestModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Lab test updated successfully",
      data: updatedLabTest,
    });
  } catch (error) {
    console.error("Update Lab Test Error:", error);
    next(error);
  }
};
export const removeLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId } = req.query
    //  id check
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lab test id is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const LabTestModel = await getLabTestModel(conn)
    // Find lab test
    const labTest = await LabTestModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found or already deleted",
      });
    }

    // Soft delete
    labTest.isDeleted = true;
    await labTest.save();

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "DELETE_LAB_TEST",
      module: "LAB_TEST",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted a lab test "${labTest?.testName}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });
    return res.status(200).json({
      success: true,
      message: "Lab test deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lab Test Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const createIPDAndDayCare = async (req, res, next) => {
  try {
    const { noOfBeds, charges, location, category, serviceType, department } =
      req.body;

    const { branchId, hosId, type } = req.query;

    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital.trimmedName);
    const IPDAndDayCareModel = getIPDAndDayCareModel(conn);

    // Validate required fields
    if (!noOfBeds || !charges || !location || !category || !department) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Validate department ObjectId
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    // Convert numeric values
    const bedsNumber = Number(noOfBeds);
    const chargesNumber = Number(charges);

    if (isNaN(bedsNumber) || isNaN(chargesNumber)) {
      return res.status(400).json({
        success: false,
        message: "Beds and charges must be valid numbers",
      });
    }

    const categoryValue = (() => {
      if (!category) return "";
      if (typeof category === "object") {
        return (category.value || category.label || category._id || category.name || "").toString();
      }
      return String(category).trim();
    })();

    let categoryId = null;

    if (categoryValue) {
      const ids = await updateSuggestions(conn, "bedCategory", categoryValue);
      categoryId = ids[0]; // single value
    }

    const newIPD = await IPDAndDayCareModel.create({
      type,
      branch: branchId,
      noOfBeds: bedsNumber,
      charges: chargesNumber,
      location: location.trim(),
      category: categoryId,
      serviceType,
      department,
    });

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "IPD_INSERT",
      event: "ADD",
      module: "IPD",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created a new IPD "${newIPD?.type}".`,
      name: actorName,
      userId: req.user.id,
      newData: newIPD,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      message: "IPD created successfully",
      data: newIPD,
    });
  } catch (error) {
    console.error("Create IPD Error:", error);
    next(error);
    // return res.status(500).json({
    //   success: false,
    //   message: "Internal server error",
    //   error: error.message,
    // });
  }
};
export const updateIPDAndDayCare = async (req, res, next) => {
  try {
    const { id } = req.params; // IPD record id
    const { noOfBeds, charges, location, category, serviceType, department } =
      req.body;

    const { hosId, type } = req.query
    console.log("hos", hosId);


    //  id & type check
    if (!id || !type) {
      return res.status(400).json({
        success: false,
        message: "IPD id and type is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const IPDAndDayCareModel = await getIPDAndDayCareModel(conn)



    //  find existing record
    const existingIPD = await IPDAndDayCareModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingIPD) {
      return res.status(404).json({
        success: false,
        message: "IPD record not found",
      });
    }

    //  required fields validation
    if (!noOfBeds || !charges || !location || !category || !department) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    //  validate department ObjectId
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    //  convert numbers
    const bedsNumber = Number(noOfBeds);
    const chargesNumber = Number(charges);

    if (isNaN(bedsNumber) || isNaN(chargesNumber)) {
      return res.status(400).json({
        success: false,
        message: "Beds and charges must be valid numbers",
      });
    }

    const categoryValue = (() => {
      if (!category) return "";
      if (typeof category === "object") {
        return (category.value || category.label || category._id || category.name || "").toString();
      }
      return String(category).trim();
    })();

    let categoryId = undefined;

    if (categoryValue) {
      const ids = await updateSuggestions(conn, "bedCategory", categoryValue);
      categoryId = ids[0]; // single value
    }

    const updateData = {
      type,
      noOfBeds: bedsNumber,
      charges: chargesNumber,
      location: location.trim(),
      ...(categoryId && { category: categoryId }),
      serviceType,
      department,
    };

    // update
    const updatedIPD = await IPDAndDayCareModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "IPD updated successfully",
      data: updatedIPD,
    });
  } catch (error) {
    console.error("Update IPD Error:", error);
    next(error);
  }
};
export const removeIPDAndDayCare = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId, type } = req.query


    if (!id || !type) {
      return res.status(400).json({
        success: false,
        message: "ID and type are required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const IPDAndDayCareModel = await getIPDAndDayCareModel(conn)



    if (!["ipd", "dayCare"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'ipd' or 'dayCare'",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const record = await IPDAndDayCareModel.findOne({
      _id: id,
      type,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${type} record not found or already deleted`,
      });
    }

    await IPDAndDayCareModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "DELETE_IPD",
      module: "IPDManagement",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted IPD "${record?.type}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: `${type} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete IPD/DayCare Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createProcedure = async (req, res, next) => {
  console.log(req.body);

  try {
    const {
      name,
      description,
      department,
      duration,
      category,
      doctorName,
      empanelmentType,
      ratesCharges,
      coordinatorName,
    } = req.body;

    const { branchId, hosId } = req.query;

    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital.trimmedName);

    const BranchModel = getBranchModel(conn);
    const ProcedureModel = getProcedureModel(conn);

    const branch = await BranchModel.findOne({
      _id: branchId,
      isDeleted: false,
    })

    if (!branch) {

      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    // Required field validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Procedure name is required.",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (!ratesCharges || isNaN(ratesCharges)) {
      return res.status(400).json({
        success: false,
        message: "Valid rates/charges are required.",
      });
    }

    if (!doctorName || doctorName.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one doctor must be selected.",
      });
    }

    // Duplicate check
    const existingProcedure = await ProcedureModel.findOne({
      name: name.trim(),
      department,
      isDeleted: false,
    });

    if (existingProcedure) {
      return res.status(409).json({
        success: false,
        message: "Procedure with this name already exists in this department.",
      });
    }

    // get suggestion ids
    const categoryIds = await updateSuggestions(conn, "procedureCategory", category);
    const empanelmentTypeIds = await updateSuggestions(
      "empanelmentType",
      empanelmentType
    );

    console.log('empanelmentTypeIds', empanelmentTypeIds);

    const newProcedure = new ProcedureModel({
      branch: branchId,
      name: name.trim(),
      description: description?.trim(),
      department,
      duration,
      category: categoryIds[0], // single value
      ratesCharges: Number(ratesCharges),
      doctorIds: doctorName.map((doc) => doc.id),
      coordinatorIds: coordinatorName?.map((doc) => doc.id) || [],
      empanelmentType: empanelmentTypeIds,
    });

    const savedProcedure = await newProcedure.save();

    const populatedProcedure = await savedProcedure.populate("doctorIds");
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "Procedure_INSERT",
      event: "ADD",
      module: "Procedure",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created a new Procedure "${populatedProcedure?.name}".`,
      name: actorName,
      userId: req.user.id,
      newData: savedProcedure,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });
    return res.status(201).json({
      success: true,
      message: "Procedure created successfully.",
      data: populatedProcedure,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating procedure.",
    });
  }
};

export const updateProcedure = async (req, res, next) => {
  try {
    const procedureId = req.params.id;
    const { hosId } = req.query;
    const {
      name,
      description,
      department,
      duration,
      category,
      doctorName,
      empanelmentType,
      ratesCharges,
      coordinatorName,
    } = req.body;


    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    //  id check
    if (!procedureId) {
      return res.status(400).json({
        success: false,
        message: "Procedure id is required",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const ProcedureModel = await getProcedureModel(conn)

    //  existing procedure
    const procedure = await ProcedureModel.findOne({
      _id: procedureId,
      isDeleted: false,
    });

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message: "Procedure not found",
      });
    }

    //  validations (same as create)
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Procedure name is required.",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (!ratesCharges || isNaN(ratesCharges)) {
      return res.status(400).json({
        success: false,
        message: "Valid rates/charges are required.",
      });
    }

    if (!doctorName || doctorName.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one doctor must be selected.",
      });
    }

    //  duplicate check (IMPORTANT — self exclude)
    const duplicate = await ProcedureModel.findOne({
      name: name.trim(),
      department,
      _id: { $ne: procedureId },
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Procedure with this name already exists in this department.",
      });
    }

    console.log(req.body);

    // get suggestion ids
    const categoryIds = await updateSuggestions(conn, "procedureCategory", category);
    const empanelmentTypeIds = await updateSuggestions(
      conn,
      "empanelmentType",
      empanelmentType
    );

    // update fields
    procedure.name = name.trim();
    procedure.description = description?.trim();
    procedure.department = department;
    procedure.duration = duration;
    procedure.category = categoryIds[0]; // single value
    procedure.ratesCharges = Number(ratesCharges);
    procedure.doctorIds = doctorName.map((doc) => doc.id || doc?._id);
    procedure.coordinatorIds = coordinatorName?.map((doc) => doc.id) || [];
    procedure.empanelmentType = empanelmentTypeIds || []; // array

    const savedProcedure = await procedure.save();

    const populatedProcedure = await savedProcedure.populate("doctorIds");

    return res.status(200).json({
      success: true,
      message: "Procedure updated successfully.",
      data: populatedProcedure,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating procedure.",
    });
  }
};
export const removeProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Procedure ID",
      });
    }



    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const ProcedureModel = await getProcedureModel(conn)

    const procedure = await ProcedureModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!procedure) {
      return res.status(404).json({
        success: false,
        message: "Procedure not found or already deleted",
      });
    }

    // Soft delete
    await ProcedureModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "DELETE_PROCEDURE",
      module: "ProcedureManagement",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted procedure "${procedure.name}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      success: true,
      message: "Procedure deleted successfully",
    });
  } catch (error) {
    console.error("Delete Procedure Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting procedure.",
    });
  }
};

export const createIncharge = async (req, res) => {
  try {
    const {
      name,
      extensionNo,
      contactNo,
      department,
      timeSlot,
      serviceType,
      id,
    } = req.body;

    const { branchId, hosId } = req.query;

    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital?.trimmedName);
    const InchargeModel = await getInchargeModel(conn)
    // Required validations
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!contactNo) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: "Service type is required",
      });
    }

    // Duplicate check (same branch + same name)
    const existing = await InchargeModel.findOne({
      name: name.trim(),
      branch: branchId,
      isDeleted: false,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Incharge with this name already exists in this branch",
      });
    }

    const serviceTypeIds = await updateSuggestions(conn, "serviceType", serviceType);
    const departmentIds = await updateSuggestions(conn, "department", department);

    const newIncharge = new InchargeModel({
      branch: branchId,
      name: name.trim(),
      extensionNo,
      contactNo,
      department: departmentIds[0], // single value
      timeSlot,
      serviceType: serviceTypeIds[0], // single value
      customId: id,
    });

    await newIncharge.save();

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "Incharge_INSERT",
      event: "ADD",
      module: "Incharge",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created a new Incharge "${newIncharge?.name}".`,
      name: actorName,
      userId: req.user.id,
      newData: newIncharge,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      message: "Incharge created successfully",
      data: newIncharge,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating incharge",
    });
  }
};
export const updateIncharge = async (req, res) => {
  try {
    const inchargeId = req.params.id; // update id

    const {
      name,
      extensionNo,
      contactNo,
      department,
      timeSlot,
      serviceType,
      id,
    } = req.body;

    const { hosId } = req.query
    //  id check
    if (!inchargeId) {
      return res.status(400).json({
        success: false,
        message: "Lab test id is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const InchargeModel = await getInchargeModel(conn)
    //  Check incharge exists
    const existingIncharge = await InchargeModel.findOne({
      _id: inchargeId,
      isDeleted: false,
    });

    if (!existingIncharge) {
      return res.status(404).json({
        success: false,
        message: "Incharge not found",
      });
    }

    //  Required validations
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!contactNo) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: "Service type is required",
      });
    }

    const serviceTypeIds = await updateSuggestions(conn, "serviceType", serviceType);
    const departmentIds = await updateSuggestions(conn, "department", department);

    //  Update
    const updatedIncharge = await InchargeModel.findByIdAndUpdate(
      inchargeId,
      {
        name: name.trim(),
        extensionNo,
        contactNo,
        department: departmentIds[0], // single value
        timeSlot,
        serviceType: serviceTypeIds[0], // single value
        customId: id,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Incharge updated successfully",
      data: updatedIncharge,
    });
  } catch (error) {
    console.log("Error", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating incharge",
    });
  }
};
export const removeIncharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { hosId } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Missing  Incharge ID",
      });
    }

    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid HospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }
    const conn = await getConnection(hospital.trimmedName);
    const InchargeModel = await getInchargeModel(conn)
    const incharge = await InchargeModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: "Incharge not found",
      });
    }

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "DELETE_Incharge",
      module: "Incharge",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted Incharge "${incharge?.name}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });
    return res.status(200).json({
      success: true,
      message: "Incharge deleted successfully",
    });
  } catch (error) {
    console.error("Delete Incharge Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createCodeAnnouncement = async (req, res) => {
  try {

    const {
      name,
      color,
      description,
      concernedPerson,
      staff,
      shortCode,
      timeAvailability,
      enabled,
      id,
    } = req.body;


    const { branchId, hosId } = req.query;

    // Validate IDs
    if (
      !branchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(branchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital?.trimmedName);
    const CodeAnnouncementModel = await getCodeAnnoucementModel(conn)
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!color) {
      return res.status(400).json({
        success: false,
        message: "Color is required",
      });
    }

    if (!concernedPerson || !concernedPerson.trim()) {
      return res.status(400).json({
        success: false,
        message: "Concerned person is required",
      });
    }

    if (!shortCode || !shortCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Short code is required",
      });
    }

    // ============================
    // Duplicate ShortCode Check
    // ============================

    const duplicate = await CodeAnnouncementModel.findOne({
      branch: branchId,
      shortCode: shortCode.trim(),
      isDeleted: false,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Short code already exists in this branch",
      });
    }

    // ============================
    // Format Staff Object
    // ============================

    const formattedStaff =
      staff?.map((s) => ({
        staffId: s.id?.toString(),
        name: s.name,
        shift: s.shift,
        contactNo: s.contactNo,
      })) || [];

    // ============================
    // Create Record
    // ============================

    const newCode = new CodeAnnouncementModel({
      branch: branchId,
      hospital: hosId,
      name: name.trim(),
      color,
      description: description?.trim(),
      concernedPerson: concernedPerson.trim(),
      staff: formattedStaff,
      shortCode: shortCode.trim(),
      timeAvailability,
      enabled: enabled ?? true,
      customId: id,
    });

    await newCode.save();

    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "Code_Announcement_INSERT",
      event: "ADD",
      module: "Code announcement",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" created a new Code announcement "${newCode?.name}".`,
      name: actorName,
      userId: req.user.id,
      newData: newCode,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      message: "Code announcement created successfully",
      data: newCode,
    });
  } catch (error) {
    console.log("ERROR", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating code announcement",
    });
  }
};

export const createCodeAlert = async (req, res) => {
  try {
    const {
      BranchId,
      depertmentId,
      doctorId,
      code_id,
      floor,
      room,
      bed,
      description,
    } = req.body;


    if (!code_id) {
      return res.status(400).json({
        success: false,
        message: "Code ID (code_id) is required",
      });
    }
    const { hosId } = req.query;
    console.log(req.body);


    // Validate IDs
    if (
      !BranchId ||
      !hosId ||
      !mongoose.Types.ObjectId.isValid(BranchId) ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid branchId and hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    //  Multi-tenant connection
    const conn = await getConnection(hospital.trimmedName);

    const CodeAlertsModel = await getCodeAlertModel(conn)
    const AdminAgentModel = await getAdminAgentModel(conn)
    const DepartmentModel = await getDepartmentModel(conn)
    const DoctorModel = await getDoctorModel(conn)
    const BranchModel = await getBranchModel(conn)
    const CodeAnnouncementModel = await getCodeAnnoucementModel(conn)

    const pop = (path, model) => ({ path, model });


    const newAlert = new CodeAlertsModel({
      AgentId: req.user.id,
      HospitalId: { hospitalId: hospital?._id, name: hospital?.name },
      BranchId,
      depertmentId,
      doctorId,
      code_id,
      floor,
      room,
      bed,
      description,
      status: true,
    });

    await newAlert.save();



    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";

    auditLog({
      action: "Code_Alert_INSERT",
      event: "ADD",
      module: "Code Alert",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" triggered a new Code Alert with ID "${code_id}".`,
      name: actorName,
      userId: req.user.id,
      newData: newAlert,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });


    return res.status(201).json({
      success: true,
      message: "Code alert triggered successfully",
      data: newAlert,
    });
  } catch (error) {
    console.error("Create Code Alert Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating code alert",
    });
  }
};


export const getCreatedCodeAlerts = async (req, res) => {
  try {
    const user = req.user;
    const userRole = user?.type?.toLowerCase();
    const { hospitalId, branchId } = req.query
    console.log(req.query);

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

    const CodeAlertsModel = await getCodeAlertModel(conn)
    const BranchModel = await getBranchModel(conn)
    const AdminAgentModel = await getAdminAgentModel(conn)
    const DepartmentModel = await getDepartmentModel(conn)
    const DoctorModel = await getDoctorModel(conn)
    const CodeAnnouncementModel = await getCodeAnnoucementModel(conn)
    const pop = (path, model) => ({ path, model });


    let filter = {
      status: true, // only active alerts
      "HospitalId.hospitalId": hospital?._id,
      AgentId: { $ne: null },
      code_id: { $ne: null }
    };

    // Superadmin → fetch all alerts
    if (userRole === "superadmin" || userRole === "admin" || userRole === "supermanager") {
      // no additional filter
    } else {
      // Other users → only their branch alert

      if (!branchId || !mongoose.isValidObjectId(branchId)) {
        return res.status(400).json({
          success: false,
          message: "Valid branch Id is required",
        });
      }

      const BranchModel = await getBranchModel(conn)
      const branch = await BranchModel.findOne({
        _id: branchId,
        isDeleted: false,
      }).lean();

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "branch not found",
        });
      }
      filter["BranchId"] = new mongoose.Types.ObjectId(branchId);
    }


    const alerts = await CodeAlertsModel.find(filter)
      .populate(pop("BranchId", BranchModel))
      .populate(pop("AgentId", AdminAgentModel))
      .populate(pop("depertmentId", DepartmentModel))
      .populate(pop("doctorId", DoctorModel))
      .populate(pop("code_id", CodeAnnouncementModel))
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Code alerts fetched successfully",
      data: alerts,
    });
  } catch (error) {
    console.error("Get Code Alerts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching code alerts",
    });
  }
};

export const toggleCodeAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;


    const { hosId } = req.query
    //  id check
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Code Alert id is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const CodeAlertsModel = await getCodeAlertModel(conn)

    const alert = await CodeAlertsModel.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });
    }

    // Toggle status
    // console.log("alert", alert);

    alert.status = !alert.status;
    await alert.save();

    // console.log("alert", alert);
    return res.json({
      success: true,
      message: `Alert ${alert.status ? "Activated" : "Deactivated"} successfully`,
      data: alert
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const updateCodeAnnouncement = async (req, res) => {
  try {

    const {
      name,
      color,
      description,
      concernedPerson,
      staff,
      shortCode,
      timeAvailability,
      enabled,
    } = req.body;

    const codeId = req.params.id;

    const { hosId } = req.query
    //  id check
    if (!codeId || !mongoose.isValidObjectId(codeId)) {
      return res.status(400).json({
        success: false,
        message: "Code Alert id is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const CodeAnnouncementModel = await getCodeAnnoucementModel(conn)

    // ============================
    // Find existing record
    // ============================

    const existingCode = await CodeAnnouncementModel.findOne({
      _id: codeId,
      isDeleted: false,
    });

    if (!existingCode) {
      return res.status(404).json({
        success: false,
        message: "Code announcement not found",
      });
    }

    // ============================
    // Required Field Validation
    // ============================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!color) {
      return res.status(400).json({
        success: false,
        message: "Color is required",
      });
    }

    if (!concernedPerson || !concernedPerson.trim()) {
      return res.status(400).json({
        success: false,
        message: "Concerned person is required",
      });
    }

    if (!shortCode || !shortCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Short code is required",
      });
    }

    // ============================
    // Format Staff
    // ============================

    const formattedStaff =
      staff?.map((s) => ({
        staffId: s.id?.toString(),
        name: s.name,
        shift: s.shift,
        contactNo: s.contactNo,
      })) || [];

    // ============================
    // Update fields
    // ============================

    existingCode.name = name.trim();
    existingCode.color = color;
    existingCode.description = description?.trim();
    existingCode.concernedPerson = concernedPerson.trim();
    existingCode.staff = formattedStaff;
    existingCode.shortCode = shortCode.trim();
    existingCode.timeAvailability = timeAvailability;
    existingCode.enabled = enabled ?? existingCode.enabled;

    await existingCode.save();

    return res.status(200).json({
      success: true,
      message: "Code announcement updated successfully",
      data: existingCode,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating code announcement",
    });
  }
};
export const removeCodeAnnouncement = async (req, res) => {
  try {
    const codeId = req.params.id;

    const { hosId } = req.query
    //  id check
    if (!codeId || !mongoose.isValidObjectId(codeId)) {
      return res.status(400).json({
        success: false,
        message: "Code Alert id is required",
      });
    }
    // Validate IDs
    if (
      !hosId ||
      !mongoose.Types.ObjectId.isValid(hosId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid hospitalId are required",
      });
    }

    // Validate hospital (master DB)
    const hospital = await HospitalModel.findOne({
      _id: hosId,
      isDeleted: false,
    }).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }


    const conn = await getConnection(hospital.trimmedName);
    const CodeAnnouncementModel = await getCodeAnnoucementModel(conn)

    const code = await CodeAnnouncementModel.findOneAndUpdate(
      { _id: codeId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code announcement not found or already deleted",
      });
    }
    const actorRole = req.user?.type || "Unknown";
    const actorName = req.user?.name || "Unknown User";
    auditLog({
      action: "DELETE_CODE_ANNOUNCEMENT",
      module: "CodeAnnouncementManagement",
      event: "DELETE",
      role: actorRole,
      customMessage: `${actorRole} "${actorName}" deleted code announcement "${code.name}".`,
      name: actorName,
      userId: req.user?.id,
      ip: req.userIp,
      userAgent: req.headers["user-agent"],
    });
    return res.status(200).json({
      success: true,
      message: "Code announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete Code Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting code announcement",
    });
  }
};

export const getBranchesByHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.query;
    console.log("req.wuery", req.query);

    const user = req.user;
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Hospital Id is Required",

      })
    }
    const hospital = await HospitalModel.findById(hospitalId).select("trimmedName").lean()

    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital Not Found",
      })
    }

    const conn = await getConnection(hospital?.trimmedName)

    const BranchModel = await getBranchModel(conn)
    const branches = await BranchModel.find({
      isDeleted: false,
    })
      .lean();

    return res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    console.error("Get Branches By Hospital Error:", error);
    next(error);
  }
};

// * Fetches all hospital names from the database.
// * Returns an array of hospital names.
export const getHospitalsNames = async (req, res) => {
  try {
    const dataFromDb = await HospitalModel.find({ isDeleted: { $ne: true } })
      .select("name")
      .lean();
    const hospitalNames = dataFromDb?.map((item) => item.name) || [];
    res.json({
      message: "Hospitals names successfully fetched",
      data: hospitalNames,
      success: true,
    });
  } catch (error) {
    console.log("error in fetching data", error);
    res.json({ message: "Error occurred while fetching", success: false });
  }
};

// * Fetches a single hospital by its name (from req.params).
// * Returns the hospital document if found, or an error if not found.
export const getHospitalByName = async (req, res) => {
  const { hospitalName } = req.params;
  if (!hospitalName)
    return res.json({ message: "empty request", success: false });
  try {
    const dataFromDb = await HospitalModel.findOne({
      name: hospitalName,
      isDeleted: { $ne: true },
    }).lean();
    if (!dataFromDb) {
      return res.json({
        message: "No hospital found with this name",
        success: false,
      });
    }
    res.json({
      message: "Hospital successfully fetched",
      data: dataFromDb,
      success: true,
    });
  } catch (error) {
    console.log("error in fetching data", error);
    res.json({ message: "Error occurred while fetching", success: false });
  }
};

export const getAllHospitals = async (req, res) => {
  try {
    const user = req.user;
    let hospitals = [];

    const userType = user?.type

    // SUPERADMIN → all hospitals
    if (userType === "superadmin") {
      hospitals = await HospitalModel.find({ isDeleted: { $ne: true } })
        .select("-__v")
        .sort({ createdAt: -1 })
        .lean();
    }

    // ADMIN / MANAGER / TL → assigned hospitals
    else if (["admin", "supermanager", "teamleader"].includes(userType)) {
      const profile = await AdminAndAgentModel.findOne({
        _id: user.id,
        isDeleted: false,
      }).lean();

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      const hospitalIds = profile.hospitals?.map((hs) => hs?.hospitalId) || [];

      hospitals = await HospitalModel.find({
        _id: { $in: hospitalIds },
        isDeleted: false,
      })
        .select("-__v")
        .sort({ createdAt: -1 })
        .lean();
    }

    //Unauthorized
    else {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospitals fetched successfully",
      data: hospitals,
      branchCount: 0,
    });
  } catch (error) {
    console.error("getAllHospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// * Fetches all hospitals with basic info (ID, trimmedName, name, city).
// * Returns an array of hospital objects.
export const hospitalsWithBasicInfo = async (req, res) => {
  try {
    const dataFromDbWithProjection = await HospitalModel.find({
      isDeleted: { $ne: true },
    })
      .select({
        _id: 0,
        ID: 1,
        trimmedName: 1,
        name: 1,
        city: 1,
        contactNumbers: 1,
        accondDetails: 1,
        managementDetails: 1,
        corporateAddress: 1,
        hospitalCode: 1,
      })
      .lean();
    res.json({
      message: "Hospitals basic info successfully fetched",
      data: dataFromDbWithProjection || [],
      success: true,
    });
  } catch (error) {
    console.error("Error in fetching data:", error);
    res.json({ message: "Error occurred while fetching", success: false });
  }
};

// * get branch doctors and departments by hospitalTimmed Name and branchId
export const getDoctorsAndDepartmentsNames = async (req, res) => {
  const { hospitalName, branchId } = req.params;
  if (!hospitalName || !branchId) {
    return res.status(400).json({
      message: "Hospital name and branch ID are required",
      success: false,
    });
  }
  const trimmedName = hospitalName.trim().toLowerCase().replace(/\s+/g, "");
  try {
    const result = await mongo.findDoctorsAndDepartmentsByBranch(
      trimmedName,
      branchId,
      "hospitals",
      process.env.database,
    );
    const responseObject = {
      message: "Doctors and departments fetched successfully",
      success: true,
      data: result,
    };
    res.json(responseObject);
  } catch (error) {
    console.error("Error fetching doctors and departments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// * Updates an existing branch in a hospital by hospitalId (from req.params).
// * Expects updated branch data in req.body.
// ! Returns error if hospitalId or branch data is missing.
export const updateBranchInHospital = async (req, res) => {
  const { hospitalId } = req.params;
  if (!hospitalId)
    return res.status(400).json({
      message: "Hospital ID is required",
      success: false,
    });
  const newBranch = req.body;
  // const isBranchValid = validateBranch(newBranch);

  if (!newBranch || Object.keys(newBranch).length === 0) {
    return res
      .status(400)
      .json({ error: "Branch data is required in the request body." });
  }

  if (!newBranch?.name) {
    return res
      .status(400)
      .json({ error: "Branch name is required in the request body." });
  }

  try {
    const result = await mongo.updateBranchInHospital(
      process.env.database,
      "hospitals",
      hospitalId,
      newBranch,
    );
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error adding branch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// * Fetches a branch by hospitalId and branchId (from req.params).
// * Returns the branch object if found, or an error if not found.
export const getBranchById = async (req, res) => {
  const { hospitalId, branchId } = req.params;
  if (!hospitalId || !branchId) {
    return res.status(400).json({
      message: "Hospital ID and Branch ID are required",
      success: false,
    });
  }
  try {
    const result = await mongo.findBranchById(
      hospitalId,
      branchId,
      "hospitals",
      process.env.database,
    );
    const responseObject = {
      message: "Branch fetched successfully",
      success: true,
      data: result,
    };
    res.json(responseObject);
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteBranchById = async (req, res) => {
  const { hospitalId, branchId } = req.params;
  const user = req.user;

  if (!hospitalId || !branchId) {
    return res.status(400).json({
      message: "Hospital ID and Branch ID are required",
      success: false,
    });
  }

  try {
    const branchQuery = [{ ID: branchId }];
    if (mongoose.Types.ObjectId.isValid(branchId)) {
      branchQuery.push({ _id: branchId });
    }

    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Hospital Id is Required",

      })
    }
    let hospital = await HospitalModel.findById(hospitalId).select("trimmedName").lean()

    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital Not Found",
      })
    }

    const conn = await getConnection(hospital?.trimmedName)

    const BranchModel = await getBranchModel(conn)

    await BranchModel.findOneAndUpdate({ $or: branchQuery }, { $set: { isDeleted: true } });
    const hospitalQuery = [{ ID: hospitalId }];
    if (mongoose.Types.ObjectId.isValid(hospitalId)) {
      hospitalQuery.push({ _id: hospitalId });
    }
    hospital = await HospitalModel.findOne({ $or: hospitalQuery, isDeleted: { $ne: true } });
    if (hospital && hospital.branches) {
      let modified = false;
      hospital.branches.forEach((branch) => {
        if (
          branch.ID === branchId ||
          (branch._id && branch._id.toString() === branchId)
        ) {
          branch.isDeleted = true;
          branch.deletedAt = new Date();
          modified = true;
        }
      });
      if (modified) {
        hospital.markModified("branches");
        await hospital.save();
      }
    }

    // 3. Audit Log
    try {
      const actorRole = req.user?.type || "Unknown";
      const actorName = req.user?.name || "Unknown User";
      await auditLog({
        name: actorName,
        userId: req.user?.id || req.user?._id,
        ip: req.userIp,
        action: "DELETE_BRANCH",
        role: actorRole,
        module: "Branch Management",
        customMessage: `Branch soft deleted by ${actorRole}. BranchID: ${branchId}`,
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError.message);
    }

    // console.log(qu);


    return res.status(200).json({
      success: true,
      message: "Branch soft deleted successfully",
      data: { branchId },
    });
  } catch (error) {
    console.error("CRITICAL ERROR in deleteBranchById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during branch deletion",
      error: error.message,
    });
  }
};

// * Fetches all branches for a hospital by hospitalName (from req.params).
// * Returns an array of branch objects (not marked as deleted).
export const getBranchesByHosptialName = async (req, res) => {
  console.log("hospita", req.params);

  // const { hospitalName } = req.params;
  // if (!hospitalName)
  //   return res.status(400).json({
  //     message: "Hospital name is required",
  //     success: false,
  //   });
  // const trimmedName = hospitalName.trim().toLowerCase().replace(/\s+/g, "");
  // console.log("trimmedName is :", trimmedName);

  try {
    // const fieldsToKeep = ["ID", "name", "isDeleted"];

    // const hospital = await HospitalModel.findOne({ name: trimmedName })
    const data = await BranchModel.find();
    return res.json({
      message: "success",
      data,
      success: true,
    });
  } catch (error) {
    console.log("error in fetching data", error);
    return res.json({
      message: "error during fetching branches",
      success: false,
    });
  }
};

// * Soft deletes a hospital by its unique ID (from req.params).
// * Marks the hospital as deleted in the database.
// ! Returns error if ID is missing or hospital is already deleted.
export const deleteHospitalById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({
      message: "ID is required",
      success: false,
    });
  }
  try {
    const result = await HospitalModel.updateOne(
      { ID: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
    );
    if (result.matchedCount === 0) {
      return res.json({
        message: "No hospital found with this ID or already deleted",
        success: false,
      });
    }
    if (result.modifiedCount === 0) {
      return res.json({
        message: "Hospital already marked as deleted",
        success: false,
      });
    }
    return res.json({
      message: "Hospital deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in /deleteHospitalById API:", error);
    return res.json({ success: false, message: "Internal server error" });
  }
};

// export const getSuggestions = async (req, res) => {
//   try {

//     const [
//       department,
//       serviceType,
//       empanelmentType,
//       procedureCategory,
//       bedCategory,
//       serviceGroup,
//       specialties,
//       surgery
//     ] = await Promise.all([
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//       SuggestionModel.find(),
//     ]);

//     // console.log('empanelment type', empanelmentType);

//     return res.status(200).json({
//       success: true,
//       data: {
//         department,
//         serviceType,
//         empanelmentType,
//         procedureCategory,
//         bedCategory,
//         serviceGroup,
//         specialties,
//         surgery,
//       },
//     });

//   } catch (error) {
//     console.error("Error fetching suggestions:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

export const getCodeAlerts = async (req, res) => {
  try {

    const { branchId, hospitalId } = req.query

    if (!branchId || !hospitalId || !mongoose.isValidObjectId(branchId) || !mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Valid branch id and Hospital id is required",
      });
    }

    // Check hospital exists (master DB)
    const hospital = await HospitalModel.findById({
      _id: hospitalId,
      isDeleted: false,
    }).lean();


    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const conn = await getConnection(hospital?.trimmedName)
    const CodeAnnouncementModel = await getCodeAnnoucementModel(conn)
    const DepartmentModel = await getDepartmentModel(conn)
    const DoctorModel = await getDoctorModel(conn)

    // Parallel queries (fast)
    const [codeAlerts, departments, doctors] = await Promise.all([
      CodeAnnouncementModel.find({
        isDeleted: false,
        branch: branchId,
        hospital: req.user?.hospital,
      }).select("name color description shortCode branch hospital").lean(),

      DepartmentModel.find({
        isDeleted: false,
        branch: branchId,
      }).select("name").lean(),

      DoctorModel.find({
        isDeleted: false,
        branch: branchId,
      }).select("name specialization").lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        codeAlerts,
        departments,
        doctors,
      },
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const role = user.type?.toLowerCase(); //
    const { branch, hospitalId } = req.query;

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

    let dashboardData;
    const bfPage = parseInt(req.query.bfPage) || 1;
    const bfLimit = parseInt(req.query.bfLimit) || 10;

    switch (role) {
      case "executive":

        dashboardData = await executiveDashboardService(conn, branch, user, bfPage, bfLimit);
        break;

      case "teamleader": // single clean case superManagerDashboardService
        dashboardData = await teamLeaderDashboardService(conn, branch, user, bfPage, bfLimit);
        break;

      case "supermanager": // single clean case superManagerDashboardService
        dashboardData = await superManagerDashboardService(conn, branch);
        break;

      case "superadmin": // single clean case superManagerDashboardService
        dashboardData = await superAdminDashboardService(conn, hospitalId, user);
        break;

      case "admin": // single clean case superManagerDashboardService
        dashboardData = await superAdminDashboardService(conn, hospitalId, user);
        break;
      default:
        return res.status(403).json({
          success: false,
          message: "Unauthorized role"
        });
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export function calculateFilterRange(filter) {
  const now = new Date();

  let start = null;
  let end = null;

  switch (filter) {
    case "today": {
      start = new Date();
      start.setHours(0, 0, 0, 0);

      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "yesterday": {
      start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "last7": {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = now;
      break;
    }

    case "last30": {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
      break;
    }

    case "last3M": {
      start = new Date();
      start.setMonth(start.getMonth() - 3);
      end = now;
      break;
    }

    default:
      return null;
  }

  return { start, end };
}
//  month mapping
const getLast3Months = () => {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const currentMonth = new Date().getMonth(); // 0-11

  const result = [];

  for (let i = 2; i >= 0; i--) {
    const index = (currentMonth - i + 12) % 12;
    result.push({
      key: months[index],
      index: index + 1 // mongo month (1-12)
    });
  }

  return result;
};

export const executiveDashboardService = async (conn, branchId, user, bfPage = 1, bfLimit = 10) => {
  try {

    // const startDate = calculateFilter(filter);
    const agentId = user.id;
    const matchStage = {
      agentId: new mongoose.Types.ObjectId(agentId),
      isDeleted: false
    };

    // if (startDate) {
    //   matchStage.createdAt = {
    //     $gte: startDate
    //   };
    // }

    // Branch-scoped pending follow-ups (all executives in same branch)
    const FilledFormsModel = await getFilledFormsModel(conn)
    const skip = (bfPage - 1) * bfLimit;

    const branchFollowupsQuery = branchId
      ? FilledFormsModel.aggregate([
        {
          $match: {
            branchId: new mongoose.Types.ObjectId(branchId),
            followupStatus: "pending",
            isDeleted: false,
          },
        },
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
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            agentId: 1,
            purpose: 1,
            formType: 1,
            callStatus: 1,
            createdAt: 1,
            agentName: 1,
            followupStatus: 1,
            callerType: "$formData.callerType",
            remarks: "$formData.remarks",
            patientName: "$formData.patientDetails.patientName",
            patientMobile: "$formData.patientDetails.patientMobile",
            referenceFrom: "$formData.referenceFrom",
            followupType: "$formData.followupType",
            doctorName: "$doctor.name",
            departmentName: "$department.name",
          },
        },
        {
          $addFields: {
            isMine: { $eq: ["$agentId", new mongoose.Types.ObjectId(agentId)] },
          },
        },
        { $sort: { isMine: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: bfLimit },
      ])
      : Promise.resolve([]);

    const [result, branchFollowups, branchFollowupsTotal] = await Promise.all([
      FilledFormsModel.aggregate([
        { $match: matchStage },

        {
          $facet: {
            // TOP INBOUND PURPOSE
            topInboundPurpose: [
              { $match: { formType: "inbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            // TOP OUTBOUND PURPOSE
            topOutboundPurpose: [
              { $match: { formType: "outbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            // TOP REFERENCE
            topReference: [
              {
                $group: {
                  _id: "$formData.referenceFrom",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  reference: "$_id",
                  count: 1
                }
              }
            ]

          }
        }
      ]),
      branchFollowupsQuery,
    ]);

    const data = result[0] || {};

    return {
      analytics: {
        topInboundPurpose: data.topInboundPurpose || [],
        topOutboundPurpose: data.topOutboundPurpose || [],
        topReference: data.topReference || []
      },
      branchFollowups: {
        data: branchFollowups || [],
        total: Math.max(branchFollowupsTotal || 0, (branchFollowups?.length || 0) + (bfPage - 1) * bfLimit),
        page: bfPage,
        limit: bfLimit
      }
    };

  } catch (error) {
    console.log("error", error);

    throw new Error(error.message);
  }
};

export const teamLeaderDashboardService = async (conn, branchId = null, user, bfPage = 1, bfLimit = 10) => {
  try {

    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    const agentId = user.id;
    const skip = (bfPage - 1) * bfLimit;
    const matchStage = {
      isDeleted: false,
      branchId: branchObjectId
    };

    const agentFilter = {
      type: "executive",
      isDeleted: false,
      "branches.branchId": { $in: [branchObjectId] }
    };
    // console.log("agentfilter", agentFilter);
    const FilledFormsModel = await getFilledFormsModel(conn)
    const branchFollowupsQuery = branchId
      ? FilledFormsModel.aggregate([
        {
          $match: {
            branchId: new mongoose.Types.ObjectId(branchId),
            followupStatus: "pending",
            isDeleted: false,
          },
        },
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
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            agentId: 1,
            purpose: 1,
            formType: 1,
            callStatus: 1,
            createdAt: 1,
            agentName: 1,
            followupStatus: 1,
            callerType: "$formData.callerType",
            remarks: "$formData.remarks",
            patientName: "$formData.patientDetails.patientName",
            patientMobile: "$formData.patientDetails.patientMobile",
            referenceFrom: "$formData.referenceFrom",
            followupType: "$formData.followupType",
            doctorName: "$doctor.name",
            departmentName: "$department.name",
          },
        },
        {
          $addFields: {
            isMine: { $eq: ["$agentId", new mongoose.Types.ObjectId(agentId)] },
          },
        },
        { $sort: { isMine: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: bfLimit },
      ])
      : Promise.resolve([]);

    const [totalAgents, result, branchFollowups, branchFollowupsTotal] = await Promise.all([
      AdminAndAgentModel.countDocuments(agentFilter),
      FilledFormsModel.aggregate([
        { $match: matchStage },
        {
          $facet: {
            // TOP INBOUND PURPOSE
            topInboundPurpose: [
              { $match: { formType: "inbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],
            topOutboundPurpose: [
              { $match: { formType: "outbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            connectionStatus: [
              {
                $match: {
                  callStatus: { $exists: true, $ne: "" }
                }
              },
              {
                $group: {
                  _id: {
                    $switch: {
                      branches: [
                        {
                          // Connected
                          case: {
                            $regexMatch: {
                              input: { $toLower: "$callStatus" },
                              regex: "connect"
                            }
                          },
                          then: "connected"
                        },
                        {

                          case: {
                            $regexMatch: {
                              input: { $toLower: "$callStatus" },
                              regex: "drop"
                            }
                          },
                          then: "call-drop"
                        }
                      ],
                      //  baaki sab Not Connected
                      default: "not connected"
                    }
                  },
                  count: { $sum: 1 }
                }
              },
              {
                $project: {
                  _id: 0,
                  callStatus: "$_id",
                  count: 1
                }
              }
            ],
            topReference: [
              {
                $group: {
                  _id: "$formData.referenceFrom",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  reference: "$_id",
                  count: 1
                }
              }
            ],
            teamOverview: [
              {
                $group: {
                  _id: "$agentId",
                  count: { $sum: 1 }
                }
              },
              {
                $lookup: {
                  from: "adminandagents",
                  localField: "_id",
                  foreignField: "_id",
                  as: "agent"
                }
              },
              {
                $unwind: {
                  path: "$agent",
                  preserveNullAndEmptyArrays: true
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 },
              {
                $project: {
                  _id: 0,
                  agentId: "$_id",
                  name: "$agent.name",
                  count: 1
                }
              }
            ],
            callsDistribution:
              [
                {
                  $group: {
                    _id: "$purpose",
                    count: { $sum: 1 }
                  }
                },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                  $project: {
                    _id: 0,
                    purpose: "$_id",
                    count: 1
                  }
                }
              ],



          }
        }
      ]),
      branchFollowupsQuery

    ])
    const data = result[0] || {}
    const calls = data.callsDistribution || [];

    const labels = calls.map(item => item.purpose || "Other");
    const callData = calls.map(item => item.count || 0);
    return {
      analytics: {

        totalAgents,
        topInboundPurpose: data.topInboundPurpose || [],
        topOutboundPurpose: data.topOutboundPurpose || [],
        connectionStatus: data.connectionStatus || [],
        topReference: data.topReference || [],
        teamOverview: data.teamOverview || [],
        callsDistribution: {
          labels,
          callData
        },
      },
      branchFollowups: {
        data: branchFollowups || [],
        total: Math.max(branchFollowupsTotal || 0, (branchFollowups?.length || 0) + (bfPage - 1) * bfLimit),
        page: bfPage,
        limit: bfLimit
      }
    };

  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}
export const superManagerDashboardService = async (conn, branchId) => {
  try {

    const DoctorModel = await getDoctorModel(conn)
    const DepartmentModel = await getDepartmentModel(conn)
    const FilledFormsModel = await getFilledFormsModel(conn)
    const BranchModel = await getBranchModel(conn)

    //  Validate hospitalId
    if (!branchId || !mongoose.isValidObjectId(branchId)) {
      throw new Error("Valid branch Id is required")
    }

    //  Get hospital
    const branch = await BranchModel.findById(branchId).lean();

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }



    const notAre = ["superadmin", "admin", "supermanager"];
    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    const [totalDoctors, totalDepartment, totalUsers, aggResult] = await Promise.all([
      DoctorModel.countDocuments({ branch: branchId }),

      DepartmentModel.countDocuments({ branch: branchId }),

      AdminAndAgentModel.countDocuments({
        "branches.branchId": branchObjectId,
        type: { $nin: notAre }
      }),

      FilledFormsModel.aggregate([
        { $match: { branchId: branchObjectId } },
        {
          $facet: {

            totalForms: [
              { $count: "total" }
            ],

            //  Appointment Total Count (fastest)
            appointmentForms: [
              { $match: { purpose: "Appointment" } },
              { $count: "total" }
            ],
            topInboundPurpose: [
              { $match: { formType: "inbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            // TOP OUTBOUND PURPOSE
            topOutboundPurpose: [
              { $match: { formType: "outbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            topReference: [
              {
                $group: {
                  _id: "$formData.referenceFrom",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  reference: "$_id",
                  count: 1
                }
              }
            ],
            callCategorization: [
              {
                $lookup: {
                  from: "doctors",
                  localField: "doctor",
                  foreignField: "_id",
                  as: "doctor"
                }
              },
              {
                $unwind: {
                  path: "$doctor",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  month: { $month: "$createdAt" },

                  // ⚡ lightweight fields
                  location: "$formData.location",
                  age: "$formData.patientDetails.patientAge",

                  gender: {
                    $ifNull: ["$formData.patientDetails.gender", "Unknown"]
                  },

                  doctor: {
                    $ifNull: ["$doctor.name", "Unknown"]
                  },

                  poc: {
                    $ifNull: ["$purpose", ""]
                  },

                  //  Appointment (fast + safe)
                  appointment: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$purpose", null] },
                          { $ne: ["$purpose", ""] },
                          { $eq: ["$purpose", "Appointment"] }
                        ]
                      },
                      1,
                      0
                    ]
                  },

                  //  New Patient (inline normalize)
                  newPatient: {
                    $cond: [
                      {
                        $eq: [
                          {
                            $toLower: {
                              $trim: {
                                input: {
                                  $ifNull: ["$formData.patientDetails.status", ""]
                                }
                              }
                            }
                          },
                          "new"
                        ]
                      },
                      1,
                      0
                    ]
                  },

                  //  Old Patient
                  oldPatient: {
                    $cond: [
                      {
                        $eq: [
                          {
                            $toLower: {
                              $trim: {
                                input: {
                                  $ifNull: ["$formData.patientDetails.status", ""]
                                }
                              }
                            }
                          },
                          "old"
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            ]
          }
        }
      ])
    ]);

    const raw = aggResult[0] || {};



    const last3Months = getLast3Months();
    const allowedMonths = last3Months.map(m => m.index);
    const allowedMonthKeys = last3Months.map(m => m.key);

    const categories = {
      location: {},
      age: {},
      gender: {},
      doctor: {},
      poc: {},
      appointment: {},
      newPatient: {},
      oldPatient: {},

    };

    (raw.callCategorization || []).forEach(item => {
      //skip unwanted months
      if (!allowedMonths.includes(item.month)) return;

      const monthKey = last3Months.find(m => m.index === item.month)?.key;
      if (!monthKey) return;

      Object.keys(categories).forEach(key => {
        if (["appointment", "newPatient", "oldPatient"].includes(key)) {
          // Boolean flags: only count when true (1)
          if (item[key] === 1) {
            if (!categories[key]["count"]) {
              categories[key]["count"] = Object.fromEntries(allowedMonthKeys.map(m => [m, 0]));
            }
            categories[key]["count"][monthKey]++;
          }
        } else {
          // Categorical fields: group by value
          const value = item[key] || "Unknown";

          if (!categories[key][value]) {
            // only last 3 months keys
            categories[key][value] = {
              name: value,
              ...Object.fromEntries(allowedMonthKeys.map(m => [m, 0]))
            };
          }

          categories[key][value][monthKey]++;
        }
      });
    });
    const callCategorizationFinal = {};

    Object.keys(categories).forEach(key => {
      callCategorizationFinal[key] = Object.values(categories[key]).filter(
        item =>
          item.name !== "Unknown" &&
          item.name !== "" &&
          item.name !== null
      );
    });


    return {
      analytics: {
        totalUsers,
        totalDoctors,
        totalDepartment,
        totalForms: raw?.totalForms[0] || 0,
        appointmentForms: raw?.appointmentForms[0] || 0,
        topInboundPurpose: raw.topInboundPurpose || [],
        topOutboundPurpose: raw.topOutboundPurpose,
        topReference: raw.topReference || [],
        callCategorization: callCategorizationFinal
      }
    };

  } catch (error) {
    console.log(error);

    throw new Error(error.message);
  }
};
export const superAdminDashboardService = async (conn, hospitalId, user) => {
  try {
    console.log("hospitalId", hospitalId);

    const FilledFormsModel = getFilledFormsModel(conn)
    const BranchModel = getBranchModel(conn)
    const profile = await AdminAndAgentModel.findById(user.id).lean();
    if (!profile) throw new Error("User not found");
    const hospitalObjectId = new mongoose.Types.ObjectId(hospitalId);
    const role = profile.type?.toLowerCase();

    // Base match
    const matchStage = { isDeleted: false };

    // User Query
    let userQuery = {
      isDeleted: false,
      "hospitals.hospitalId": {
        $in: Array.isArray(hospitalObjectId) ? hospitalObjectId : [hospitalObjectId]
      }
    };

    // console.log("userQuery", userQuery);


    if (role === "admin") {
      userQuery.type = { $nin: ["superadmin", "admin"] };

    } else if (role === "superadmin") {
      userQuery.type = { $nin: ["superadmin", "admin"] };
    }

    // Parallel execution
    const [totalUsers, totalBranches, recentActivity, agg] = await Promise.all([
      AdminAndAgentModel.countDocuments(userQuery),

      BranchModel.countDocuments({ isDeleted: false }),
      // optimized recent activity
      AuditLog.aggregate([
        ...(role === "admin"
          ? [
            {
              $match: {
                userId: { $in: [user.id] } //  avoid heavy query
              }
            }
          ]
          : []),
        { $sort: { createdAt: -1 } },
        { $limit: 5 }
      ]),

      // Main aggregation
      FilledFormsModel.aggregate([
        { $match: matchStage },

        {
          $facet: {
            genderCount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  male: {
                    $sum: {
                      $cond: [
                        { $eq: ["$formData.patientDetails.gender", "Male"] },
                        1, 0
                      ]
                    }
                  },
                  female: {
                    $sum: {
                      $cond: [
                        { $eq: ["$formData.patientDetails.gender", "Female"] },
                        1, 0
                      ]
                    }
                  },
                  unknown: {
                    $sum: {
                      $cond: [
                        {
                          $in: [
                            "$formData.patientDetails.gender",
                            [null, ""]
                          ]
                        },
                        1, 0
                      ]
                    }
                  }
                }
              },
              { $project: { _id: 0 } }
            ],
            topInboundPurpose: [
              { $match: { formType: "inbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            // TOP OUTBOUND PURPOSE
            topOutboundPurpose: [
              { $match: { formType: "outbound", purpose: { $ne: "" } } },
              {
                $group: {
                  _id: "$purpose",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 0,
                  purpose: "$_id",
                  count: 1
                }
              }
            ],

            teamOverview: [
              { $group: { _id: "$agentId", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],

            callCategorization: [
              {
                $lookup: {
                  from: "doctors",
                  localField: "doctor",
                  foreignField: "_id",
                  as: "doctor"
                }
              },
              {
                $unwind: {
                  path: "$doctor",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  month: { $month: "$createdAt" },
                  //  Appointment (fast + safe)
                  appointment: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$purpose", null] },
                          { $ne: ["$purpose", ""] },
                          { $eq: ["$purpose", "Appointment"] }
                        ]
                      },
                      1,
                      0
                    ]
                  },

                  //  New Patient (inline normalize)
                  newPatient: {
                    $cond: [
                      {
                        $eq: [
                          {
                            $toLower: {
                              $trim: {
                                input: {
                                  $ifNull: ["$formData.patientDetails.status", ""]
                                }
                              }
                            }
                          },
                          "new"
                        ]
                      },
                      1,
                      0
                    ]
                  },

                  //  Old Patient
                  oldPatient: {
                    $cond: [
                      {
                        $eq: [
                          {
                            $toLower: {
                              $trim: {
                                input: {
                                  $ifNull: ["$formData.patientDetails.status", ""]
                                }
                              }
                            }
                          },
                          "old"
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            ]
          }
        }
      ])
    ]);

    const data = agg[0] || {};

    const last3Months = getLast3Months();
    const allowedMonths = last3Months.map(m => m.index);
    const allowedMonthKeys = last3Months.map(m => m.key);

    const categories = {
      appointment: {},
      newPatient: {},
      oldPatient: {},

    };

    (data.callCategorization || []).forEach(item => {
      //skip unwanted months
      if (!allowedMonths.includes(item.month)) return;

      const monthKey = last3Months.find(m => m.index === item.month)?.key;
      if (!monthKey) return;

      Object.keys(categories).forEach(key => {
        if (["appointment", "newPatient", "oldPatient"].includes(key)) {
          // Boolean flags: only count when true (1)
          if (item[key] === 1) {
            if (!categories[key]["count"]) {
              categories[key]["count"] = Object.fromEntries(allowedMonthKeys.map(m => [m, 0]));
            }
            categories[key]["count"][monthKey]++;
          }
        } else {
          // Categorical fields: group by value
          const value = item[key] || "Unknown";

          if (!categories[key][value]) {
            // only last 3 months keys
            categories[key][value] = {
              name: value,
              ...Object.fromEntries(allowedMonthKeys.map(m => [m, 0]))
            };
          }

          categories[key][value][monthKey]++;
        }
      });
    });
    const callCategorizationFinal = {};

    Object.keys(categories).forEach(key => {
      callCategorizationFinal[key] = Object.values(categories[key]).filter(
        item =>
          item.name !== "Unknown" &&
          item.name !== "" &&
          item.name !== null
      );
    });

    return {
      analytics: {
        totalUsers,
        totalBranches,
        genderCount: data.genderCount?.[0] || {},
        topInboundPurpose: data.topInboundPurpose || [],
        topOutboundPurpose: data.topOutboundPurpose || [],
        teamOverview: data.teamOverview || [],
        callCategorization: callCategorizationFinal || [],
        recentActivity
      }
    };

  } catch (error) {
    console.error("Dashboard Error:", error);
    throw new Error(error.message);
  }
};
export const uploadBranchCSV = async (req, res) => {
  let session;

  try {
    const { hosId, branchId } = req.query;
    const { type } = req.body;

    const file = req.files?.csv?.[0];

    if (!file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }

    if (
      !hosId ||
      !branchId ||
      !mongoose.Types.ObjectId.isValid(hosId) ||
      !mongoose.Types.ObjectId.isValid(branchId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const hospital = await HospitalModel.findById(hosId).lean();
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const conn = await getConnection(hospital.trimmedName);

    //  Start Transaction
    session = await conn.startSession();
    session.startTransaction();

    if (!req.csvFilePath) {
      return res.status(400).json({ message: "CSV file path not found" });
    }

    //Read CSV
    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.csvFilePath)
        .pipe(csv())
        .on("data", (data) => {
          //  Clean row
          const cleanedRow = {};

          Object.keys(data).forEach((key) => {
            let value = data[key];

            // 
            if (value === null || value === undefined) {
              cleanedRow[key] = "";
            } else {
              // trim + remove extra spaces
              cleanedRow[key] = value.toString().trim();
            }
          });

          // 
          const isEmpty = Object.values(cleanedRow).every(
            (val) => val === ""
          );

          if (!isEmpty) {
            rows.push(cleanedRow);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });
    const normalize = (val) => val?.trim();

    let result; // uploadBranchCSV FIX (let instead of const)

    console.log("CSV Rows:", rows);

    console.log("type", type);

    switch (type.toLowerCase()) {
      case "doctor":
        result = await uploadDoctorCSV({
          conn,
          branchId,
          rows,
          normalize,
          session,
        });
        break;

      case "department":
        result = await uploadDoctorCSV({
          conn,
          branchId,
          rows,
          normalize,
          session,
        });
        break;

      case "empanelment":
        result = await uploadEmpanelmentCSV({
          conn,
          branchId,
          rows,
          normalize,
          session,
        });
        break;

      case "testlab":
        result = await uploadLabTestCSV({
          conn,
          branchId,
          rows,
          normalize,
          session,
        });
        break;

      default:
        throw new Error("Invalid type provided");
    }

    //  Commit Transaction
    await session.commitTransaction();
    session.endSession();

    fs.unlinkSync(req.csvFilePath);

    return res.status(200).json({
      success: true,
      message: `${type} bulk upload successful`,
      result,
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (req.file?.path) {
      fs.unlink(req.csvFilePath, () => { });
    }

    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Bulk upload failed",
      error: error.message,
    });
  }
};

const uploadDoctorCSV = async ({ conn, branchId, rows, normalize, session }) => {
  try {
    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    const branchObjectId = toObjectId(branchId);

    const splitComma = (val) =>
      val ? val.split(",").map((v) => v.trim()) : [];

    //  STEP 0: Existing Doctors (for duplicate check)
    const doctorNamesSet = new Set(
      rows.map((r) => normalize(r.name)).filter(Boolean)
    );

    const existingDoctors = await DoctorModel.find({
      branch: branchObjectId,
      isDeleted: false,
      name: { $in: Array.from(doctorNamesSet) },
    }).select("name").lean();

    const existingDoctorSet = new Set(
      existingDoctors.map((d) => normalize(d.name))
    );

    //  STEP 1: Departments fetch
    const departments = await DepartmentModel.find({
      branch: branchObjectId,
      isDeleted: false,
    }).session(session);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[normalize(d.name)] = d._id;
    });

    const newDepartments = [];
    const doctorsToInsert = [];

    //  STEP 2: Collect new departments
    for (const row of rows) {
      const deptName = normalize(row.department);

      if (row.department && !deptMap[deptName]) {
        deptMap[deptName] = "PENDING";

        newDepartments.push({
          name: row.department.trim(),
          branch: branchObjectId,
        });
      }
    }

    //  STEP 3: Insert new departments
    if (newDepartments.length) {
      const created = await DepartmentModel.insertMany(newDepartments, {
        session,
      });

      created.forEach((d) => {
        deptMap[normalize(d.name)] = d._id;
      });
    }

    //  STEP 4: Process doctors (with duplicate check)
    for (const row of rows) {
      if (!row.name) continue;

      const nameNorm = normalize(row.name);

      //  Duplicate skip (DB + same CSV)
      if (existingDoctorSet.has(nameNorm)) {
        continue;
      }

      existingDoctorSet.add(nameNorm);

      const surgeries = await updateSuggestions(
        conn,
        "surgery",
        row?.surgeries || []
      );

      const specialties = await updateSuggestions(
        conn,
        "speciality",
        row?.specialties || []
      );

      doctorsToInsert.push({
        branch: branchObjectId,
        department: deptMap[normalize(row?.department)] || null,
        name: row?.name,
        masters: row?.masters,
        title: row?.title,
        opdNo: row?.opdNo,
        type: row?.type,
        contactNumber: row?.contactNumber,
        whatsappNumber: row?.whatsappNumber,
        designation: row?.designation,
        additionalInfo: row?.additionalInfo,
        floor: row?.floor,

        //  FIX (duplicate field removed)
        degrees: splitComma(row?.degrees),

        specialties,
        surgeries,
        experience: Number(row?.experience) || 0,
        consultationCharges: Number(row?.consultationCharges) || 0,
        teleMedicine: row?.teleMedicine === "TRUE" ? "Yes" : "No",

        timings: {
          morning: {
            start: row?.morningStart || "",
            end: row?.morningEnd || "",
          },
          evening: {
            start: row?.eveningStart || "",
            end: row?.eveningEnd || "",
          },
          custom: {
            start: row?.customStart || "",
            end: row?.customEnd || "",
          },
        },

        videoConsultation: {
          enabled: row?.videoEnabled === "TRUE",
          charges: Number(row?.videoCharges) || 0,
          days: row?.videoDays,
          timeSlot: row?.videoTimeSlot || "",
          startTime: row?.videoStartTime || "",
          endTime: row?.videoEndTime || "",
        },

        opdDays: row?.opdDays
          ? row.opdDays.split(",").map((d) => d.trim())
          : [],
      });
    }

    //  STEP 5: Insert doctors
    const insertedDoctors = await DoctorModel.insertMany(doctorsToInsert, {
      session,
      ordered: false,
    });

    //  STEP 6: Map department → doctors
    const deptDoctorMap = {};

    insertedDoctors.forEach((doc) => {
      if (!doc.department) return;

      const deptId = doc.department.toString();

      if (!deptDoctorMap[deptId]) {
        deptDoctorMap[deptId] = [];
      }

      deptDoctorMap[deptId].push(doc._id);
    });

    //  STEP 7: Update departments
    const updates = Object.entries(deptDoctorMap).map(
      ([deptId, doctorIds]) =>
        DepartmentModel.updateOne(
          { _id: deptId },
          {
            $addToSet: {
              doctors: { $each: doctorIds },
            },
          },
          { session }
        )
    );

    await Promise.all(updates);

    return {
      inserted: insertedDoctors.length,
      skipped: rows.length - doctorsToInsert.length, //  useful
      doctors: insertedDoctors,
    };
  } catch (error) {
    throw Error(error.message || "Error To Upload Doctors");
  }
};

const uploadEmpanelmentCSV = async ({ conn, branchId, rows, normalize, session }) => {
  try {
    const EmpanelmentModel = getEmpanelmentModel(conn);
    const DepartmentModel = getDepartmentModel(conn);
    const DoctorModel = getDoctorModel(conn);

    const branchObjectId = toObjectId(branchId);

    const splitComma = (val) =>
      val?.split(",").map((v) => v.trim()).filter(Boolean) || [];

    const doctorsSet = new Set();
    const deptSet = new Set();
    const treatableSet = new Set();

    //  STEP 1: Normalize + Validate
    const processedRows = rows.map((row, index) => {
      if (!row.policyName || !row.typeOfCoverage) {
        throw new Error(`Row ${index + 1}: Policy Name & Type of Coverage required`);
      }

      if (!row.doctor && !row.department) {
        throw new Error(`Row ${index + 1}: Doctor or Department required`);
      }

      const doctorNorm = row.doctor ? row.doctor.trim() : null;
      const deptNorm = row.department ? row.department.trim() : null;
      const policyNorm = normalize(row.policyName);

      if (doctorNorm) doctorsSet.add(doctorNorm);
      if (deptNorm) deptSet.add(deptNorm);

      const treatableArr = splitComma(row.treatableAreas);
      treatableArr.forEach((t) => treatableSet.add(t));

      return {
        ...row,
        doctorNorm,
        deptNorm,
        policyNorm,
        treatableArr,
      };
    });

    //  STEP 2: Fetch Doctors & Departments
    const [doctors, departments] = await Promise.all([
      DoctorModel.find({
        name: { $in: Array.from(doctorsSet) },
        branch: branchObjectId,
        isDeleted: false,
      }).session(session),

      DepartmentModel.find({
        name: { $in: Array.from(deptSet) },
        branch: branchObjectId,
        isDeleted: false,
      }).session(session),
    ]);

    //  STEP 3: Create Maps (normalized)
    const doctorMap = {};
    doctors.forEach((d) => {
      doctorMap[normalize(d.name)] = d._id;
    });

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[normalize(d.name)] = d._id;
    });

    if (!Object.keys(doctorMap).length && !Object.keys(deptMap).length) {
      throw new Error("No doctors or departments found in the branch.");
    }

    //  STEP 4: Treatable Areas
    let treatableMap = {};
    if (treatableSet.size) {
      const allTreatables = Array.from(treatableSet);

      const treatableIds = await updateSuggestions(
        conn,
        "speciality",
        allTreatables
      );

      allTreatables.forEach((t, i) => {
        treatableMap[t] = treatableIds[i];
      });
    }

    //  STEP 5: Group by Policy
    const empanelmentMap = {};

    for (const row of processedRows) {
      const key = row.policyNorm;

      if (!empanelmentMap[key]) {
        empanelmentMap[key] = {
          typeOfCoverage: row.typeOfCoverage,
          policyName: row.policyName,
          branch: branchObjectId,
          coveringAreasOfSpeciality: splitComma(row.coveringAreasOfSpeciality),
          additionalRemarks: row.additionalRemarks,
          coverageOptions: [],
        };
      }

      const treatableAreaIds = row.treatableArr
        .map((t) => treatableMap[t])
        .filter(Boolean);

      empanelmentMap[key].coverageOptions.push({
        doctor: doctorMap[row.doctorNorm] || null,
        department: deptMap[row.deptNorm] || null,
        service: splitComma(row.service),
        treatableAreas: treatableAreaIds,
        coverageLimit: row.coverageLimit,
        notes: row.notes,
      });
    }

    let finalData = Object.values(empanelmentMap);

    //  STEP 6: POLICY DUPLICATE CHECK 
    const existingPolicies = await EmpanelmentModel.find({
      branch: branchObjectId,
      isDeleted: false,
      policyName: { $in: finalData.map(d => d.policyName) }
    }).select("policyName").lean();

    const existingPolicySet = new Set(
      existingPolicies.map(p => normalize(p.policyName))
    );

    const filteredData = finalData.filter(emp => {
      const key = normalize(emp.policyName);

      if (existingPolicySet.has(key)) {
        return false; //  skip duplicate policy
      }

      existingPolicySet.add(key);
      return true;
    });

    //  STEP 7: Insert
    const chunkSize = 500;
    let insertedDocs = [];

    for (let i = 0; i < filteredData.length; i += chunkSize) {
      const chunk = filteredData.slice(i, i + chunkSize);

      const inserted = await EmpanelmentModel.insertMany(chunk, {
        session,
        ordered: false,
      });

      insertedDocs.push(...inserted);
    }

    return {
      inserted: insertedDocs.length,
      skipped: finalData.length - filteredData.length, //  useful info
      data: insertedDocs,
    };

  } catch (error) {
    throw Error(error.message || "Error To Upload Empanelment");
  }
};

const uploadLabTestCSV = async ({ conn, branchId, rows, normalize, session }) => {
  try {
    const LabTestModel = getLabTestModel(conn);
    const DepartmentModel = getDepartmentModel(conn);

    const branchObjectId = toObjectId(branchId);

    const splitComma = (val) =>
      val ? val.split(",").map((v) => v.trim()).filter(Boolean) : [];

    //  STEP 1: Fetch Departments
    const departments = await DepartmentModel.find({
      branch: branchObjectId,
      isDeleted: false,
    }).session(session);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d._id.toString()] = d._id;
    });

    //  STEP 2: Collect serviceGroups
    const serviceGroupSet = new Set();
    rows.forEach((r) => {
      if (r.serviceGroup) serviceGroupSet.add(r.serviceGroup);
    });

    //  STEP 3: Create/Get serviceGroup IDs
    let serviceGroupMap = {};
    if (serviceGroupSet.size) {
      const allGroups = Array.from(serviceGroupSet);

      const ids = await updateSuggestions(conn, "serviceGroup", allGroups);

      allGroups.forEach((g, i) => {
        serviceGroupMap[g] = ids[i];
      });
    }

    //  STEP 4: Existing LabTests (duplicate check)
    const testCodes = rows.map((r) => r.testCode).filter(Boolean);

    const existingTests = await LabTestModel.find({
      branch: branchObjectId,
      testCode: { $in: testCodes },
    })
      .select("testCode")
      .lean();

    const existingSet = new Set(existingTests.map((t) => t.testCode));

    //  STEP 5: Prepare Data
    const testsToInsert = [];
    const testCodeToIndex = {}; // for package mapping

    for (const row of rows) {
      if (!row.testName) continue;

      if (existingSet.has(row.testCode)) {
        continue; // 🔥 skip duplicate
      }

      existingSet.add(row.testCode);

      const doc = {
        branch: branchObjectId,
        location: row.location,
        testCode: row.testCode,
        testName: row.testName,
        testType: row.testType,
        department: deptMap[row.department] || null,
        serviceGroup: serviceGroupMap[row.serviceGroup] || null,
        serviceCharge: Number(row.serviceCharge) || 0,
        floor: row.floor,
        description: row.description,
        categoryApplicability: splitComma(row.categoryApplicability),
        packageTests: [], // 🔥 later fill
        precaution: row.precaution,
        remarks: row.remarks,
        serviceTime: row.serviceTime,
        source: row.source,
        tatReport: row.tatReport,
      };

      testCodeToIndex[row.testCode] = testsToInsert.length;
      testsToInsert.push(doc);
    }

    //  STEP 6: Insert Tests
    const insertedTests = await LabTestModel.insertMany(testsToInsert, {
      session,
      ordered: false,
    });

    //  STEP 7: Create Map (testCode → _id)
    const codeToIdMap = {};
    insertedTests.forEach((t) => {
      codeToIdMap[t.testCode] = t._id;
    });

    //  STEP 8: Update packageTests
    const updateOps = [];

    for (const row of rows) {
      if (!row.packageTests) continue;

      const currentTestId = codeToIdMap[row.testCode];
      if (!currentTestId) continue;

      const packageCodes = splitComma(row.packageTests);

      const packageIds = packageCodes
        .map((code) => codeToIdMap[code])
        .filter(Boolean);

      if (packageIds.length) {
        updateOps.push(
          LabTestModel.updateOne(
            { _id: currentTestId },
            { $set: { packageTests: packageIds } },
            { session }
          )
        );
      }
    }

    await Promise.all(updateOps);

    return {
      inserted: insertedTests.length,
      skipped: rows.length - testsToInsert.length,
      data: insertedTests,
    };
  } catch (error) {
    throw Error(error.message || "Error uploading Lab Tests");
  }
};

export const getMasterSuggestions = async (req, res) => {
  try {
    const { type } = req.query;
    const SuggestionModel = getSuggestionsModel(MasterConn);

    const query = { isDeleted: false };
    if (type) {
      query.type = type;
    }

    const suggestions = await SuggestionModel.find(query).sort({ value: 1 }).lean();

    return res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error in getMasterSuggestions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const NotificationModel = MasterConn.model("Notification", NotificationSchema);
    const notifications = await NotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const NotificationModel = MasterConn.model("Notification", NotificationSchema);
    await NotificationModel.updateMany({ isRead: false }, { $set: { isRead: true } });

    res.json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ success: false, message: "Error marking notifications as read" });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    const NotificationModel = MasterConn.model("Notification", NotificationSchema);
    // Delete notifications that are already read
    await NotificationModel.deleteMany({ isRead: true });

    res.json({
      success: true,
      message: "Read notifications cleared"
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ success: false, message: "Error clearing notifications" });
  }
};


export const getPatientByRole = async (req, res) => {
  try {
    const { hospitalId, branchId, filter, page = 1 } = req.query;

    // console.log("call", req.query);


    const PAGE_LIMIT = 10;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * PAGE_LIMIT;

    // Validate hospitalId
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Hospital Id is required",
      });
    }

    // Get hospital
    const hospital = await HospitalModel.findById(hospitalId)
      .select("trimmedName")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Multi-tenant connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);
    const PatientModel = getPatientModel(conn);
    const DoctorModel = getDoctorModel(conn)
    const DepartmentModel = getDepartmentModel(conn)



    let match = {
      isDeleted: false,
      "hospitalId.hospitalId": hospitalId,
    };

    if (branchId && mongoose.isValidObjectId(branchId)) {
      match.branchId = branchId;
    }

    // Fetch data
    const [patients, totalDocument] = await Promise.all([
      PatientModel.find(match)
        .populate({
          path: "lastVisit",
          model: FilledFormsModel,
          populate: [
            {
              path: "department",
              model: DepartmentModel,
              select: "name",
            },
            {
              path: "doctor",
              model: DoctorModel,
              select: "name",
            },
          ],
        })
        .skip(skip)
        .limit(PAGE_LIMIT)
        .lean(),

      PatientModel.countDocuments(match),
    ]);

    return res.status(200).json({
      success: true,

      pagination: {
        totalDocument,
        page: pageNum,
        totalPages: Math.ceil(totalDocument / PAGE_LIMIT),
      },

      data: patients,
    });

  } catch (error) {
    console.error("Error fetching patients:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const singlePatientHistory = async (req, res) => {
  try {

    const { hospitalId, page, patientId } = req.query

    const PAGE_LIMIT = 10;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * PAGE_LIMIT;

    // Validate hospitalId
    if (!hospitalId || !patientId || !mongoose.isValidObjectId(hospitalId) || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Hospital Id  And Patient Id is required",
      });
    }

    // Get hospital
    const hospital = await HospitalModel.findById(hospitalId)
      .select("trimmedName")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Multi-tenant connection
    const conn = await getConnection(hospital.trimmedName);
    const FilledFormsModel = getFilledFormsModel(conn);
    const DoctorModel = getDoctorModel(conn)
    const DepartmentModel = getDepartmentModel(conn)



    let match = {
      isDeleted: false,
      "formData.patientDetails": patientId,
      isDeleted: false
    };



    // Fetch data
    const [forms, totalDocument] = await Promise.all([
      FilledFormsModel.find(match)
        .populate({
          path: "department",
          model: DepartmentModel,
          select: "name",
        }).
        populate(
          {
            path: "doctor",
            model: DoctorModel,
            select: "name",
          })
        .skip(skip)
        .limit(PAGE_LIMIT)
        .lean(),

      FilledFormsModel.countDocuments(match),
    ]);

    return res.status(200).json({
      success: true,

      pagination: {
        totalDocument,
        page: pageNum,
        totalPages: Math.ceil(totalDocument / PAGE_LIMIT),
      },

      data: forms,
    });

  } catch (error) {
    console.error("Error fetching patients:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

