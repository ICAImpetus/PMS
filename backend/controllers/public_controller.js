import mongoose from "mongoose";
import { getConnection, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
import moment from "moment";


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