// jobs/dailyLeadSummaryCron.js
import cron from "node-cron";
import HospitalModel from "../models/HospitalModel.js";
import { getConnection } from "../config/dbConnection.js";
import { getLeadModel } from "../models/Lead.js";
import { getWhatsAppAccountModel } from "../models/WhatsAppAccount.js";
import axios from "axios";

// Run every day at 8:00 PM (20:00)
cron.schedule("0 20 * * *", async () => {
    console.log("[CRON] Generating daily lead summary report for hospitals...");

    try {
        const hospitals = await HospitalModel.find({ isDeleted: false }).lean();

        for (const hospital of hospitals) {
            if (!hospital.ownerPhoneNumber) continue; // Owner phone number saved in Hospital settings

            const conn = await getConnection(hospital.trimmedName);
            const LeadModel = getLeadModel(conn);
            const WAAccountModel = getWhatsAppAccountModel(conn);

            const waAccount = await WAAccountModel.findOne({ hospitalId: hospital._id, isConnected: true }).lean();
            if (!waAccount) continue;

            // Calculate start and end of current day
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            // Aggregate metrics
            const totalLeadsToday = await LeadModel.countDocuments({
                hospitalId: hospital._id,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            const appointmentRequests = await LeadModel.countDocuments({
                hospitalId: hospital._id,
                leadType: "APPOINTMENT_BOOKING",
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            const callbackRequests = await LeadModel.countDocuments({
                hospitalId: hospital._id,
                leadType: "CALLBACK_REQUEST",
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            // Summary Message Template
            const reportMessage =
                `📊 *Daily WhatsApp Lead Summary Report*
🏥 *${hospital.hospitalName}*
📅 Date: ${new Date().toLocaleDateString('en-GB')}

• *Total Enquiries Today:* ${totalLeadsToday}
• *Appointment Requests:* ${appointmentRequests}
• *Callback Requests:* ${callbackRequests}

 Please check your Admin Dashboard for complete lead details and follow-ups.`;

            // Dispatch WhatsApp Notification to Hospital Owner
            await axios.post(
                `https://graph.facebook.com/v20.0/${hospital.whatsAppPhoneNumberId}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: hospital.ownerPhoneNumber,
                    text: { body: reportMessage }
                },
                {
                    headers: { Authorization: `Bearer ${waAccount.accessToken}` }
                }
            );

            console.log(`[CRON] Summary sent to owner of ${hospital.hospitalName}`);
        }
    } catch (error) {
        console.error("[CRON Error] Failed to send daily summaries:", error.message);
    }
});