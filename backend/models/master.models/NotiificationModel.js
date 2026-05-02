import mongoose from "mongoose";

export const NotificationSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
        },

        type: {
            type: String,
            enum: [
                "TENANT_OPERATION",
                "FORM_SUBMITTED",
                "NEW_PATIENT",
                "BRANCH_CREATED",
                "BRANCH_UPDATED",
                "DOCTOR_CREATED",
                "DOCTOR_UPDATED",
                "DEPARTMENT_CREATED",
                "DEPARTMENT_UPDATED",
                "PATIENT_CREATED",
                "PATIENT_UPDATED",
                "APPOINTMENT_CREATED",
                "BILL_UPDATED",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        data: {
            type: Object,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        // If specific users are targeted, otherwise it's global for superadmin/admin
        createdFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AdminAgentSchema",
            },
        ],
    },
    {
        timestamps: true,
    }
);
