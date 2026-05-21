
export const doctorValidation = {
    name: {
        required: true,
        type: "string",
    },

    morningStart: {
        required: true,
        type: "string",
    },
    morningEnd: {
        required: true,
        type: "string",
    },
    specialization: {
        required: true,
        type: "string",
    },
    type: {
        required: true,
        type: "string",
    },
    department: {
        required: true,
        type: "string",
    },
    contactNumber: {
        required: true,
        type: "number",
        min: 10,
        max: 12,
    },

    experience: {
        required: true,
        type: "number",
        min: 18,
        max: 60,
    },

    consultationCharges: {
        required: true,
        type: "number",
        min: 100,
        max: 5000,
    },
    opdNo: {
        required: true,
        type: "number",
        min: 0,
    },

    age: {
        required: true,
        type: "number",
        min: 18,
        max: 60,
    },

    isActive: {
        type: "boolean",
    },

    opdDays: {
        required: true,
        type: "array",
        allowedValues: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ],
    },


    email: {
        validate: (value) => {
            if (!value.includes("@")) {
                return "Invalid email";
            }
        },
    }
};