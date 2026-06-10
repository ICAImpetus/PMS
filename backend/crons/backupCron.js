import cron from "node-cron";
import { runBackup } from "../services/backupService.js";
import { getConnection, getDoctorModel, getFilledFormsModel, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
import csv from "csv-parser"
import fs from "fs";
import mongoose from "mongoose";

const HospitalModel = getHospitalModel(MasterConn)

// Every Sunday 2 AM
cron.schedule("0 2 * * 0", async () => {
    console.log("Starting weekly backup...");
    await runBackup();
});
// await runBackup();

// const STATUSMAP = {
//     "Non-Patient": "other",
//     "New Patient": "new",
//     "Old Patient": "old",
// };
// export const uploadDatabaseBackup = async () => {
//     try {
//         console.log("Starting database backup...");

//         const hospital = await HospitalModel.findById(
//             "6a22705f6f164344a2644a8a"
//         );

//         if (!hospital) throw new Error("Hospital not found");

//         const conn = await getConnection(hospital.trimmedName);

//         const FilledFormsModel = getFilledFormsModel(conn);
//         const PatientModel = getPatientModel(conn);
//         const DoctorModel = getDoctorModel(conn);

//         const results = [];
//         const processedRows = new Set();
//         let count = 0;

//         const stream = fs
//             .createReadStream("backend/crons/in.csv")
//             .pipe(csv());

//         for await (const data of stream) {
//             // if (count >= 3500) break;

//             const mobile = String(data.patientMobile || "").trim();
//             if (!mobile) continue;

//             const rowKey = `${mobile}-${data.purpose}-${data.formType}`;

//             if (processedRows.has(rowKey)) continue;
//             processedRows.add(rowKey);

//             // ======================
//             // PATIENT (NO SESSION)
//             // ======================
//             let patient = await PatientModel.findOne({
//                 patientMobile: mobile,
//             });

//             if (!patient) {
//                 patient = await PatientModel.create({
//                     hospitalId: {
//                         hospitalId: hospital._id,
//                         name: hospital.name,
//                     },
//                     branchId: new mongoose.Types.ObjectId(
//                         "6a2270606f164344a2644a8f"
//                     ),
//                     patientName: data.patientName,
//                     status: STATUSMAP[data.status] || "",
//                     patientMobile: mobile,
//                     patientAge:
//                         parseInt(data.patientAge, 10) || undefined,
//                     location: data.location,
//                     category: data.category,
//                 });
//             }

//             // ======================
//             // DOCTOR VALIDATION
//             // ======================
//             let doctor = null;
//             if (
//                 data.doctor &&
//                 mongoose.Types.ObjectId.isValid(data.doctor)
//             ) {
//                 doctor = await DoctorModel.findById(
//                     data.doctor
//                 );
//                 // continue;
//             }





//             // if (!doctor) {
//             //     throw new Error(
//             //         `Doctor not found: ${data.doctor}`
//             //     );
//             // }

//             // ======================
//             // FORM BUILD
//             // ======================
//             results.push({
//                 formType: data.formType?.toLowerCase(),
//                 agentName: "Sandeep",
//                 branchId: new mongoose.Types.ObjectId(
//                     "6a2270606f164344a2644a8f"
//                 ),
//                 agentId: new mongoose.Types.ObjectId(
//                     "64a1c9e5f0c2b8b1d9e7c456"
//                 ),
//                 callStatus: "connected",
//                 doctor: doctor ? doctor._id : null,
//                 department: doctor ? doctor.department : null,
//                 formData: {
//                     referenceFrom: data.referenceFrom,
//                     callerType: data.callerType,
//                     patientDetails: patient._id,
//                     remarks: data.remarks,
//                 },
//                 purpose: data.purpose,
//             });

//             count++;

//             if (count % 100 === 0) {
//                 console.log(
//                     `Processed: ${count}, Forms Ready: ${results.length}`
//                 );
//             }
//         }

//         console.log(
//             `Preparing to insert ${results.length} forms`
//         );

//         if (results.length > 0) {
//             await FilledFormsModel.insertMany(results, {
//                 ordered: true, // IMPORTANT: stop on error
//             });
//         }

//         console.log(
//             `Successfully inserted ${results.length} forms`
//         );
//     } catch (error) {
//         console.error("🔥 MIGRATION FAILED:");
//         console.error(error);
//     }
// };


// export const changePatienStatus = async () => {
//     try {
//         let count = 0;
//         console.log("Starting update...");

//         const hospital = await HospitalModel.findById(
//             "6a22705f6f164344a2644a8a"
//         );

//         if (!hospital) {
//             throw new Error("Hospital not found");
//         }

//         const conn = await getConnection(hospital.trimmedName);

//         const FilledFormsModel = getFilledFormsModel(conn);
//         const PatientModel = getPatientModel(conn);

//         const patients = await PatientModel.find();

//         console.log("statging");

//         for (const patient of patients) {
//             const lastForm = await FilledFormsModel
//                 .findOne({
//                     "formData.patientDetails": patient._id,
//                 })
//                 .sort({ createdAt: -1 });

//             if (lastForm) {
//                 await PatientModel.findByIdAndUpdate(
//                     patient._id,
//                     {
//                         $set: {
//                             lastVisit: lastForm._id,
//                         },
//                     }
//                 );
//             }
//             count++;
//             console.log("process", count);
//         }

//         console.log("Done");
//     } catch (error) {
//         console.error(error);
//     }
// };

// changePatienStatus()
// uploadDatabaseBackup();

