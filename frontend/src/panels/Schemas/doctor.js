
export const doctorValidation = {
    name: {
        // required: true,
        type: "string",
    },

    type: {
        type: "string",
    },
    department: {
        //  // required: true,
        type: "string",
    },
    contactNumber: {
        // required: true,
        type: "number",
        // min: 10,
        // max: 12,
    },

    experience: {
        // required: true,
        type: "number",
    },

    consultationCharges: {
        // required: true,
        type: "number",
        min: 100,
        max: 5000,
    },

    age: {
        // required: true,
        type: "number",
        min: 18,
        max: 60,
    },

    isActive: {
        type: "boolean",
    },

    opdDays: {
        // required: true,
        type: "array",
        allowedValues: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],
    },


    morningStart: {
        // required: true,
        type: "string",
    },
    morningEnd: {
        // required: true,
        type: "string",
    },
    specialization: {
        // required: true,
        type: "string",
    },
};
export const getRequiredHeaders = (type) => {
    const map = {
        doctor: [
            "specialization",
            "type",
            "name",
            "department",
            "opdDays",
            "opdNo",
            "specialties",
            "surgeries",
            "degrees",
            "averagePatientTime",
            "maxPatientsHandled",
            "countryCode",
            "contactNumber",
            "whatsappNumber",
            // Timings
            "morningStart",
            "morningEnd",
            "eveningStart",
            "eveningEnd",
            "customStart",
            "customEnd",

            "paName",
            "paContactNumber",
            "extensionNumber",
            "experience",
            "consultationCharges",
            "floor",
            "customDegrees",
            "teleConsultation",
            "title",
            "designation",
            "teleMedicine",
            "additionalInfo",
            "isEnabled",


            // Video Consultation
            "videoConsultationEnabled",
            "videoConsultationTimeSlot",
            "videoConsultationStartTime",
            "videoConsultationEndTime",
            "videoConsultationCharges",
            "videoConsultationDays",


        ]
    };

    return map[type] || [];
};
export const getDummyData = (type) => {
    const map = {
        doctor: [
            // specialization
            "surgeon",

            "fulltime",

            // name
            "Dr Raj Sharma",

            // department
            "Cardiology",

            // opdDays
            "Monday|Tuesday|Wednesday|Thursday|Friday",

            // opdNo
            "OPD-12",

            // specialties
            "Heart Specialist|BP Specialist",

            // surgeries
            "Bypass Surgery|Angioplasty",

            // degrees
            "MBBS|MD",

            // averagePatientTime
            "15",

            // maxPatientsHandled
            "40",

            // countryCode
            "+91",

            // contactNumber
            "9876543210",

            // whatsappNumber
            "9876543210",

            // morningStart
            "09:00 AM",

            // morningEnd
            "01:00 PM",

            // eveningStart
            "05:00 PM",

            // eveningEnd
            "08:00 PM",

            // customStart
            "",

            // customEnd
            "",

            // paName
            "Ramesh",

            // paContactNumber
            "9988776655",

            // extensionNumber
            "101",

            // experience
            "12",

            // consultationCharges
            "500",

            // floor
            "2nd Floor",

            // customDegrees
            "DM Cardiology",

            // teleConsultation
            "Yes",

            // title
            "dr",

            // designation
            "consultant",

            // teleMedicine
            "Yes",

            // additionalInfo
            "Senior Heart Specialist",

            // isEnabled
            "true",

            // videoConsultationEnabled
            "true",

            // videoConsultationTimeSlot
            "30 mins",

            // videoConsultationStartTime
            "10:00 AM",

            // videoConsultationEndTime
            "01:00 PM",

            // videoConsultationCharges
            "800",

            // videoConsultationDays
            "Monday,Tuesday,Wednesday,Thursday,Friday"
        ]
    };

    return map[type] || [];
};;
