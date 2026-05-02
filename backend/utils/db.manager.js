import mongoose from "mongoose";
import { CodeAlertsSchema } from "../models/teanants/CodeAlertsModel.js";
import { CodeAnnouncementSchema } from "../models/teanants/CodeAnnouncement.js";
import { DepartmentSchema } from "../models/teanants/departmentModel.js";
import { DoctorSchema } from "../models/teanants/doctorModel.js";
import { EmpanelmentSchema } from "../models/teanants/Empanelment.js";
import { FilledFormSchema } from "../models/teanants/FilledForm.js";
import { InchargeSchema } from "../models/teanants/InchargeModel.js";
import { IPDAndDayCareSchema } from "../models/teanants/IPDAndDayCareModel.js";
import { LabTestSchema } from "../models/teanants/LabTestModel.js";
import { ProcedureSchema } from "../models/teanants/ProcedureSchema.js";
import { BranchSchema } from "../models/teanants/branchModel.js";
import env from "../config/env.js";
import { HospitalSchema } from "../models/master.models/HospitalModel.js";
import { AuditLogSchema } from "../models/master.models/Logs.js";
import { Suggestion } from "../models/master.models/suggestionsModel.js";
import { AdminAgentSchema } from "../models/master.models/AdminAgentModel.js";
import { PatientSchema } from "../models/teanants/PatientModel.js";

const connections = {};

let masterConnection = null;

export const getMasterConnection = async () => {
    if (masterConnection) return masterConnection;

    const uri = `${env.mongoUrl}/crms?retryWrites=true&w=majority`; // master DB

    masterConnection = await mongoose.createConnection(uri).asPromise();

    console.log("Master DB Connected");


    return masterConnection;
};

export const MasterConn = await getMasterConnection()

export const getConnection = async (dbName) => {
    if (!dbName) {
        throw new Error("DB name is required");
    }

    if (connections[dbName]) {
        return connections[dbName];
    }

    const baseUrl = env.mongoUrl.replace(/\/$/, "");

    const uri = `${baseUrl}/${dbName}?retryWrites=true&w=majority`;

    const conn = await mongoose.createConnection(uri).asPromise();

    conn.on("connected", () => {
        console.log(`Connected: ${dbName}`);
    });

    conn.on("error", (err) => {
        console.error(`Error (${dbName}):`, err.message);
    });

    connections[dbName] = conn;

    return conn;
};

export const getAdminAgentModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }
    return conn.models.AdminAgentSchema || conn.model("AdminAgentSchema", AdminAgentSchema);
};

export const getHospitalModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }
    return conn.models.HospitalSchema || conn.model("HospitalSchema", HospitalSchema);
};

export const getAuditLogModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }
    return conn.models.AuditLogSchema || conn.model("AuditLogSchema", AuditLogSchema);
};

export const getSuggestionsModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return (
        conn.models.Suggestion ||
        conn.model("Suggestion", Suggestion) // FIXED
    );
};
//  Teanant Models

export const getBranchModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.model("Branch", BranchSchema);
};

export const getPatientModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.Patient || conn.model("Patient", PatientSchema);
};

export const getCodeAlertModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.CodeAlerts || conn.model("CodeAlerts", CodeAlertsSchema);
};

export const getCodeAnnoucementModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.CodeAnnouncement || conn.model("CodeAnnouncement", CodeAnnouncementSchema);
};

export const getDepartmentModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.Department || conn.model("Department", DepartmentSchema);
};
export const getDoctorModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.Doctor || conn.model("Doctor", DoctorSchema);
};
export const getEmpanelmentModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.Empanelment || conn.model("Empanelment", EmpanelmentSchema);
};
export const getFilledFormsModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.FilledForms || conn.model("FilledForms", FilledFormSchema);
};

export const getInchargeModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.Incharge || conn.model("Incharge", InchargeSchema);
};
export const getIPDAndDayCareModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.IPDAndDayCareModel || conn.model("IPDAndDayCareModel", IPDAndDayCareSchema);
};
export const getLabTestModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.LabTest || conn.model("LabTest", LabTestSchema);
};
export const getProcedureModel = (conn) => {
    if (!conn) {
        throw new Error("DB Connection not found");
    }

    return conn.models.Procedure || conn.model("Procedure", ProcedureSchema);
};