import mongoose from "mongoose";
import { getCampFeedDataModel, getConnection, getDepartmentModel, getDoctorModel, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
import moment from "moment";
import { sanitizeCampFeedInput } from "../models/teanants/campfeedModel.js";


const HospitalModel = getHospitalModel(MasterConn)
export const checkPatientIsNewOrOld = async (req, res) => {
    try {
        const { pmsCode, patientName, patientMobile } = req.query;

        // Validate required fields
        if (!patientMobile || !pmsCode || !patientName) {
            return res.status(400).json({
                success: false,
                message: "Patient mobile number, PMS Code, and Patient Name are required.",
            });
        }

        // Multi-tenant connection
        const conn = await getConnection(pmsCode);

        if (!conn) {
            return res.status(403).json({
                success: false,
                message: "Invalid PMS Code.",
            });
        }

        const PatientModel = getPatientModel(conn);

        //console.log("pmsCode", pmsCode)


        // Find patient
        const escapedName = patientName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const patient = await PatientModel.findOne({
            patientMobile: patientMobile.trim(),
            patientName: new RegExp(`^${escapedName}$`, "i"),
            isDeleted: false,
        }).select("status createdAt");



        // Patient not found
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        // Determine patient status
        const patientStatus =
            patient?.status?.toLowerCase() === "old" ? "Old" : "New";


        return res.status(200).json({
            success: true,
            message: "Success",
            status: patientStatus,
            patientRegisterDate: patient?.createdAt
                ? moment(patient.createdAt).format("DD-MM-YYYY hh:mm A")
                : "N/A",
        });
    } catch (error) {
        console.error("Check Patient Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};
export const saveCampFeedData = async (req, res) => {
    try {
        const { hosId } = req.query;

        if (!hosId || !mongoose.isValidObjectId(hosId)) {
            return res.status(400).json({
                success: false,
                message: "Valid hospitalId (hosId) is required",
            });
        }

        const hospital = await HospitalModel.findById(hosId)
            .select("trimmedName name")
            .lean();

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        const conn = await getConnection(hospital.trimmedName);

        const sanitizedData = sanitizeCampFeedInput(req.body);

        const CampFeedModel = getCampFeedDataModel(conn);
        const savedCampFeed = await CampFeedModel.create({
            ...sanitizedData,
        });

        return res.status(201).json({
            success: true,
            message: "Camp feed data saved successfully",
            data: savedCampFeed,
        });
    } catch (error) {
        console.error("Error in saveCampFeedData:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error while saving camp feed data",
        });
    }
};

export const getCampFeedData = async (req, res) => {
    try {
        const { hosId, page = 1, limit = 10, search = "" } = req.query;

        if (!hosId || !mongoose.isValidObjectId(hosId)) {
            return res.status(400).json({
                success: false,
                message: "Valid hospitalId (hosId) is required",
            });
        }


        const hospital = await HospitalModel.findById(hosId)
            .select("trimmedName name")
            .lean();

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        const conn = await getConnection(hospital.trimmedName);

        const CampFeedModel = getCampFeedDataModel(conn);
        const DoctorModel = getDoctorModel(conn);
        // const DepartmentModel = getDepartmentModel(conn);
        const pop = (path, model, select = null) => ({
            path,
            model,
            ...(select && { select })
        });

        // Base filter by hospitalId
        const filter = {};

        // Optional search by patientName or patientPhone
        if (search.trim()) {
            const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { patientName: { $regex: safeSearch, $options: "i" } },
                { patientPhone: { $regex: safeSearch, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [records, totalCount] = await Promise.all([
            CampFeedModel.find(filter)
                .populate(pop("doctorId", DoctorModel, "name specialization"))
                .sort({ createdAt: -1 }) // Latest entries first
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            CampFeedModel.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            totalRecords: totalCount,
            currentPage: Number(page),
            totalPages: Math.ceil(totalCount / Number(limit)),
            data: records,
        });
    } catch (error) {
        console.error("Error in getCampFeedData:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching camp feed data",
        });
    }
};


export const getDoctors = async (req, res) => {
    try {
        const { hosId } = req.query;

        if (!hosId || !mongoose.isValidObjectId(hosId)) {
            return res.status(400).json({
                success: false,
                message: "Valid hospitalId (hosId) is required",
            });
        }


        const hospital = await HospitalModel.findById(hosId)
            .select("trimmedName name")
            .lean();

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        const conn = await getConnection(hospital.trimmedName);


        const DoctorModel = getDoctorModel(conn);
        const DepartmentModel = getDepartmentModel(conn);
        const pop = (path, model, select = null) => ({
            path,
            model,
            ...(select && { select })
        });

        const [records] = await Promise.all([
            DoctorModel.find({ isDeleted: false })
                .select("name")
                .populate(pop("department", DepartmentModel, "name"))
                .lean(),

        ]);
        return res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error("Error in getCampFeedData:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching camp feed data",
        });
    }
};

;