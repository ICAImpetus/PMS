import mongoose from "mongoose";

export const campFeedSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: true,
            trim: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',

        },
        patientGender: {
            type: String,
            required: true,
        },
        patientAddress: {
            type: String,
            trim: true,
        },
        patientPhone: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const sanitizeCampFeedInput = (body = {}) => {
    const stripHtml = (str) =>
        typeof str === 'string'
            ? str.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
            : '';

    return {
        patientName: stripHtml(body.patientName),
        doctorId: typeof body.doctorId === 'string' ? body.doctorId.trim() : '',
        patientGender: stripHtml(body.patientGender),
        patientAddress: stripHtml(body.patientAddress),
        patientPhone:
            typeof body.patientPhone === 'string'
                ? body.patientPhone.replace(/\D/g, '')
                : '',
    };
};
