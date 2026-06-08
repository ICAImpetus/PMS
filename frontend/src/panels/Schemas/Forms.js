export const formsValidation = {
    formType: {
        type: "string",
        allowedValues: ["inbound", "outbound"],
    },

    branchId: {
        type: "string",
    },

    agentId: {
        type: "string",
    },

    doctor: {
        type: "string",

    },

    department: {
        type: "string",
    },

    agentName: {
        type: "string",
    },

    purpose: {
        type: "string",
    },

    callStatus: {
        type: "string",
    },

    appointmentStatus: {
        type: "string",
    },

    followupStatus: {
        type: "string",
        allowedValues: ["pending", "completed"],
    },

    callerType: {
        type: "string",
    },

    referenceFrom: {
        type: "string",
    },

    refDoctorName: {
        type: "string",
    },

    refHospitalName: {
        type: "string",
    },

    refHospitalLocation: {
        type: "string",
    },

    location: {
        type: "string",
    },

    patientDetails: {
        type: "string",
    },

    attendantName: {
        type: "string",
    },

    attendantMobile: {
        type: "string",
    },

    remarks: {
        type: "string",
    },

    connectionStatus: {
        type: "string",
    },

    followupType: {
        type: "string",
    },

    status: {
        type: "string",
    },

    source: {
        type: "string",
    },

    lead: {
        type: "string",
    },

    dateTime: {
        type: "date",
    },

    patientArrivalTime: {
        type: "string",
    },

    isCancelApp: {
        type: "boolean",
    },

    cancelReason: {
        type: "string",
    },

    useForFollowup: {
        type: "boolean",
    }
};


export const getRequiredHeaders = (type) => {
    const map = {
        forms: [
            "formType",
            "branchId",
            "agentId",
            "doctor",
            "department",
            "agentName",
            "purpose",
            "callStatus",
            "appointmentStatus",
            "followupStatus",

            "callerType",
            "referenceFrom",
            "refDoctorName",
            "refHospitalName",
            "refHospitalLocation",
            "location",

            "patientDetails",

            "attendantName",
            "attendantMobile",

            "remarks",
            "connectionStatus",
            "followupType",
            "status",

            "source",
            "lead",

            "dateTime",
            "patientArrivalTime",

            "isCancelApp",
            "cancelReason",

            "useForFollowup"
        ]
    };

    return map[type] || [];
};

export const getDummyData = (type) => {
    const map = {
        forms: [
            // formType
            "inbound",

            // branchId
            "BR001",

            // agentId
            "AG001",

            // doctor
            "6a227d1b2c0a86d69e7f535a",

            // department
            "Cardiology",

            // agentName
            "Amit Kumar",

            // purpose
            "Appointment",

            // callStatus
            "connected",

            // appointmentStatus
            "booked",

            // followupStatus
            "pending",

            // callerType
            "New Patient",

            // referenceFrom
            "Google",

            // refDoctorName
            "Dr Verma",

            // refHospitalName
            "ABC Hospital",

            // refHospitalLocation
            "Jaipur",

            // location
            "Jaipur",

            // patientDetails
            "PAT001",

            // attendantName
            "Ramesh",

            // attendantMobile
            "9876543210",

            // remarks
            "Patient interested in consultation",

            // connectionStatus
            "Connected",

            // followupType
            "Call Back",

            // status
            "Open",

            // source
            "Website",

            // lead
            "Organic",

            // dateTime
            "2026-06-08 10:30:00",

            // patientArrivalTime
            "10:15 AM",

            // isCancelApp
            "false",

            // cancelReason
            "",

            // useForFollowup
            "true"
        ]
    };

    return map[type] || [];
};