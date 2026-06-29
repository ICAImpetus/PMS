import cron from "node-cron";
import { runBackup } from "../services/backupService.js";
import { getConnection, getDepartmentModel, getDoctorModel, getFilledFormsModel, getHospitalModel, getPatientModel, MasterConn } from "../utils/db.manager.js";
import csv from "csv-parser"
import fs from "fs";
import mongoose from "mongoose";
import axios from "axios";

const HospitalModel = getHospitalModel(MasterConn)

// Every Sunday 2 AM
cron.schedule(
    "0 2 * * 0",
    async () => {
        console.log("Starting weekly backup...");
        await runBackup();
    },
    {
        timezone: "Asia/Kolkata",
    }
);

cron.schedule(
    "0 2 * * 0",
    async () => {
        console.log("Starting Weekly Medical Director Report...");

        try {
            await sendWeeklyMedicalDirectorReports();
            console.log("Weekly reports sent successfully.");
        } catch (err) {
            console.error(err);
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);


// await runBackup();

// const STATUSMAP = {
//     "": "other",
//     "New Patient": "new",
//     "Old Patient": "old",
//     "Non-Patient": "other"
// };

// const STATUSMAP = {
//     "Prefer not to say": "Other",
//     "New Patient": "new",
//     "Old Patient": "old",
// };

// export const uploadDatabaseBackup = async (req, res) => {
//     try {
//         console.log("Starting database backup...");


//         const { hosId, branchId } = req.query;
//         const { type } = req.body;

//         const file = req.files?.csv?.[0];

//         if (!file) {
//             return res.status(400).json({ message: "CSV file required" });
//         }

//         if (!type) {
//             return res.status(400).json({ message: "Type is required" });
//         }

//         if (
//             !hosId ||
//             !branchId ||
//             !mongoose.Types.ObjectId.isValid(hosId) ||
//             !mongoose.Types.ObjectId.isValid(branchId)
//         ) {
//             return res.status(400).json({ message: "Invalid IDs" });
//         }

//         const hospital = await HospitalModel.findById(hosId).lean();
//         if (!hospital) {
//             return res.status(404).json({ message: "Hospital not found" });
//         }

//         const conn = await getConnection(hospital.trimmedName);

//         //  Start Transaction
//         session = await conn.startSession();
//         session.startTransaction();

//         if (!req.csvFilePath) {
//             return res.status(400).json({ message: "CSV file path not found" });
//         }

//         //Read CSV
//         const rows = [];

//         await new Promise((resolve, reject) => {
//             fs.createReadStream(req.csvFilePath)
//                 .pipe(csv())
//                 .on("data", (data) => {
//                     //  Clean row
//                     const cleanedRow = {};

//                     Object.keys(data).forEach((key) => {
//                         let value = data[key];

//                         // 
//                         if (value === null || value === undefined) {
//                             cleanedRow[key] = "";
//                         } else {
//                             // trim + remove extra spaces
//                             cleanedRow[key] = value.toString().trim();
//                         }
//                     });

//                     // 
//                     const isEmpty = Object.values(cleanedRow).every(
//                         (val) => val === ""
//                     );

//                     if (!isEmpty) {
//                         rows.push(cleanedRow);
//                     }
//                 })
//                 .on("end", resolve)
//                 .on("error", reject);
//         });
//         const normalize = (val) => val?.trim();

//         let result; // uploadBranchCSV FIX (let instead of const)

//         console.log("CSV Rows:", rows);

//         console.log("type", type);


//         const conn = await getConnection(hospital.trimmedName);

//         const FilledFormsModel = getFilledFormsModel(conn);
//         const PatientModel = getPatientModel(conn);
//         const DoctorModel = getDoctorModel(conn);
//         const DepartmentModel = getDepartmentModel(conn)

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


//             console.log("patient", data)
//             if (!patient) {
//                 patient = await PatientModel.create({
//                     hospitalId: {
//                         hospitalId: hospital._id,
//                         name: hospital.name,
//                     },
//                     branchId: new mongoose.Types.ObjectId(
//                         "6a2270606f164344a2644a8f"
//                     ),
//                     gender: data.gender || "Other",
//                     patientName: data.patientName,
//                     status: STATUSMAP[data.status] || "",
//                     patientMobile: mobile,
//                     patientAge: parseInt(data.patientAge, 10) || 0,
//                     location: data.location,
//                     category: data.category,

//                 });
//             }

//             console.log("patient", patient)


//             // ======================
//             // DOCTOR VALIDATION
//             // ======================
//             let doctor = null;
//             let department = null;
//             if (
//                 data.doctor &&
//                 mongoose.Types.ObjectId.isValid(data.doctor)
//             ) {
//                 doctor = await DoctorModel.findById(
//                     data.doctor
//                 ).lean();
//                 // continue;
//             }

//             if (
//                 data.department &&
//                 mongoose.Types.ObjectId.isValid(data.department)
//             ) {
//                 department = await DepartmentModel.findById(
//                     data.department
//                 ).lean();
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
//                 department: department ? (department?._id || doctor.department) : null,
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
//         console.error(" MIGRATION FAILED:");
//         console.error(error);
//     }
// };


// await uploadDatabaseBackup()

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

//         const conn = await getConnection(hospital.trimmedName);        // const PatientModel = getPatientModel(conn);

//         const FilledFormsModel = getFilledFormsModel(conn);
//         // const PatientModel = getPatientModel(conn);

//         await FilledFormsModel.updateMany(
//             {},
//             {
//                 $set: {
//                     createdAt: new Date("2026-06-08T13:18:08.460+00:00"),
//                 },
//             },
//             {
//                 timestamps: false,
//             }
//         );
//         // const patients = await PatientModel.find();

//         // console.log("statging");

//         // for (const patient of patients) {
//         //     const lastForm = await FilledFormsModel
//         //         .findOne({
//         //             "formData.patientDetails": patient._id,
//         //         })
//         //         .sort({ createdAt: -1 });

//         //     if (lastForm) {
//         //         await PatientModel.findByIdAndUpdate(
//         //             patient._id,
//         //             {
//         //                 $set: {
//         //                     lastVisit: lastForm._id,
//         //                 },
//         //             }
//         //         );
//         //     }
//         //     count++;
//         //     console.log("process", count);
//         // }

//         console.log("Done");
//     } catch (error) {
//         console.error(error);
//     }
// };

// changePatienStatus()
// uploadDatabaseBackup();




export const sendWeeklyMedicalDirectorReports = async () => {
    try {
        const hospitals = await HospitalModel.find({
            isDeleted: false,
            isActive: true,
        }).lean();

        for (const hospital of hospitals) {
            try {
                await processHospitalReport(hospital);
            } catch (err) {
                console.error(
                    `Failed for hospital ${hospital.name}`,
                    err.message
                );
            }
        }
    } catch (err) {
        console.error(err);
    }
};

const processHospitalReport = async (hospital) => {

    const conn = await getConnection(hospital.trimmedName);

    // Calculate last week's report
    const report = await generateWeeklyReport(conn);

    // Find Medical Director
    const medicalDirector = hospital.managementDetails.find(
        (member) =>
            member.memberType?.toLowerCase() === "medical director"
    );

    if (!medicalDirector) {
        console.log(`${hospital.name} has no Medical Director`);
        return;
    }

    const payload = {
        type: "1",

        reportDate: report.reportDate,

        hospitalName: hospital.name,

        branchName: hospital.name,

        summary: report.summary,

        receiver: {
            name: medicalDirector.name,
            phone: medicalDirector.phoneNumber
        }
    };

    await axios.post(
        process.env.WHATSAPP_AUTOMATION_URL,
        payload
    );

    console.log(`Report sent to ${medicalDirector.name}`);
};

export const generateWeeklyReport = async (conn) => {
    try {
        const FilledFormsModel = getFilledFormsModel(conn);

        // Previous week (Monday - Sunday)
        const startDate = moment()
            .subtract(1, "week")
            .startOf("isoWeek")
            .startOf("day")
            .toDate();

        const endDate = moment()
            .subtract(1, "week")
            .endOf("isoWeek")
            .endOf("day")
            .toDate();

        // Total Leads
        const totalNewLeadsReceived = await FilledFormsModel.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        // Contacted Leads
        const contactedLeads = await FilledFormsModel.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
            status: {
                $in: [
                    "Contacted",
                    "Converted",
                    "Follow Up",
                    "Not Interested",
                ],
            },
        });

        // Converted Patients
        const convertedToPatients = await FilledFormsModel.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
            status: "Converted",
        });

        // Pending Follow Ups
        const pendingFollowUps = await FilledFormsModel.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
            status: "Follow Up",
        });

        // Not Interested
        const notInterested = await FilledFormsModel.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
            status: "Not Interested",
        });

        const conversionRate =
            totalNewLeadsReceived === 0
                ? 0
                : Number(
                    (
                        (convertedToPatients / totalNewLeadsReceived) *
                        100
                    ).toFixed(2)
                );

        return {
            reportDate: moment(endDate).format("DD/MM/YYYY"),

            summary: {
                totalNewLeadsReceived,
                contactedLeads,
                convertedToPatients,
                pendingFollowUps,
                notInterested,
                conversionRate,
            },
        };
    } catch (error) {
        console.error("Weekly Report Error:", error);
        throw error;
    }
};