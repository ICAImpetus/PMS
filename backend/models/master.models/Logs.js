import mongoose from "mongoose";

export const AuditLogSchema = new mongoose.Schema({
    level: String,
    message: String,
    action: String,
    module: String,
    customMessage: String,
    name: String,
    userId: String,
    oldData: mongoose.Schema.Types.Mixed,
    newData: mongoose.Schema.Types.Mixed,
    ip: String,
}, { timestamps: true });
