import axios from "axios";
import { getBranchModel, getDepartmentModel, getDoctorModel, getFilledFormsModel, getMessageModel } from "./db.manager.js";
import { interpolateTemplate } from "./nodeCache.js";
import mongoose from "mongoose";


export function generateNext7DaysOptions() {
    const options = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        // Day label: "Today", "Tomorrow", or Day Name ("Monday", "Tuesday", etc.)
        const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()];

        // Date in DD/MM/YYYY format for backend context and DB queries (e.g., 12/09/2026)
        const dateFormattedStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

        // Human-readable display label for WhatsApp UI (e.g., "Today, 12 Sep")
        const displayLabel = `${dayLabel}, ${d.getDate()} ${months[d.getMonth()]}`;

        options.push({
            // Prefix matching ID used by webhook controller: DATE_12/09/2026
            optionId: `DATE_${dateFormattedStr}`,

            // Meta Limit: Max 24 characters
            title: `📅 ${displayLabel}`.substring(0, 24),

            // Meta Limit: Max 72 characters
            description: `Book consultation for ${dateFormattedStr}`.substring(0, 72),

            // Target next node for slot querying
            nextNodeId: "NODE_FETCH_SLOTS"
        });
    }

    return options;
}


export async function resolveHospitalBranches({ tenantConnection, hospitalId }) {
    try {
        const BranchModel = getBranchModel(tenantConnection);

        // Fetch all active branches for this hospital tenant
        const branches = await BranchModel.find({
            // hospitalId,
            isDeleted: false
        }).lean();

        console.log("branches", branches);

        // SCENARIO 0: No Branches Configured (Fallback safely)
        if (!branches || branches.length === 0) {
            return {
                isMultiBranch: false,
                singleBranch: null,
                options: []
            };
        }

        // SCENARIO 1: Single Branch (Bypass selection screen)
        if (branches.length === 1) {
            return {
                isMultiBranch: false,
                singleBranch: branches[0],
                options: []
            };
        }

        // SCENARIO 2: Multiple Branches (2 or more - Generate interactive options)
        const branchOptions = branches.map((b) => ({
            optionId: `BRANCH_${b._id?.toString()}`,
            title: `${b?.name?.substring(0, 24)}`,          // Meta limit: 24 characters max
            // description: b?.location?.substring(0, 72),        // Meta limit: 72 characters max
            nextNodeId: "NODE_SELECT_DEPT"                 // Target node after branch selection
        }));

        return {
            isMultiBranch: true,
            branchesCount: branches.length,
            singleBranch: null,
            options: branchOptions
        };

    } catch (error) {
        console.error("[resolveHospitalBranches Error]:", error.message);
        return {
            isMultiBranch: false,
            singleBranch: null,
            options: []
        };
    }
}
export async function fetchDepartmentsFromDb({ tenantConnection, hospitalId, context }) {
    try {
        const DeptModel = getDepartmentModel(tenantConnection);
        console.log("---------------- [DEBUG: fetchDepartmentsFromDb] ----------------");
        console.log("Raw context type:", context instanceof Map ? "Map" : typeof context);

        // Map Object ko plain JavaScript Object me print karne ke liye
        const debugContextObj = context instanceof Map ? Object.fromEntries(context) : context;
        const raw_branch = context.get ? context.get("selected_branch_id") || context.get("NODE_SELECT_BRANCH") : context?.selected_branch_id || context?.NODE_SELECT_BRANCH;
        console.log("Parsed Context Variables:", JSON.stringify(debugContextObj, null, 2));

        // 2. String.prototype.replace() use karke exact ObjectId nikalein
        const branchId = typeof raw_branch === "string" ? raw_branch.replace("BRANCH_", "").trim() : null;

        console.log("---------------- [DEBUG: fetchDepartmentsFromDb] ----------------");
        console.log("Raw Branch Context:", raw_branch);
        console.log("Cleaned ObjectId branchId:", branchId);

        const query = { isDeleted: false };
        if (branchId) query.branch = branchId;

        console.log("MongoDB Query Payload:", JSON.stringify(query, null, 2));

        const departments = await DeptModel.find(query).lean();

        console.log("Fetched Departments Count:", departments?.length || 0);
        console.log("Fetched Departments List:", departments);

        if (!departments || departments.length === 0) {
            return { hasData: false, options: [] };
        }

        const options = departments.slice(0, 10).map((d) => ({
            optionId: `DEPT_${d?._id.toString()}`,
            title: d?.name.substring(0, 24),
            description: "Department",
            nextNodeId: "NODE_SELECT_DOC"
        }));

        return { hasData: true, options };
    } catch (error) {
        console.error("[fetchDepartmentsFromDb Error]:", error.message);
        return { hasData: false, options: [] };
    }
}
export async function fetchDoctorsFromDb({ tenantConnection, hospitalId, context }) {
    try {
        const DocModel = getDoctorModel(tenantConnection);
        const deptId = context.get ? context.get("selected_dept_id") : context?.selected_dept_id;

        const query = { isDeleted: false };
        if (deptId) query.department = deptId;

        const doctors = await DocModel.find(query).lean();

        if (!doctors || doctors.length === 0) {
            return { hasData: false, options: [] };
        }

        const options = doctors.slice(0, 10).map((doc) => ({
            optionId: `DOC_${doc._id.toString()}`,
            title: doc?.name.substring(0, 24),
            description: (doc.specialization || "Consultant").substring(0, 72),
            nextNodeId: "NODE_ASK_DATE"
        }));

        return { hasData: true, options };
    } catch (error) {
        console.error("[fetchDoctorsFromDb Error]:", error.message);
        return { hasData: false, options: [] };
    }
}
export async function handleCentralizedDbSlots({ tenantConnection, hospitalId, context }) {
    try {
        // 1. Extract raw parameters from Context Map/Object
        const rawDoctorId = context.get
            ? context.get("selected_doctor_id") || context.get("NODE_SELECT_DOC")
            : context?.selected_doctor_id || context?.NODE_SELECT_DOC;

        const appointmentDate = context.get
            ? context.get("appointment_date")
            : context?.appointment_date;

        // 2. Clean doctorId string if it contains the "DOC_" prefix
        const doctorId = typeof rawDoctorId === "string"
            ? rawDoctorId.replace("DOC_", "").trim()
            : null;

        console.log("---------------- [DEBUG: handleCentralizedDbSlots] ----------------");
        console.log("Raw Doctor Context:", rawDoctorId);
        console.log("Cleaned Doctor ID:", doctorId);
        console.log("Appointment Date Context:", appointmentDate);

        if (!doctorId || !appointmentDate || !mongoose.isValidObjectId(doctorId)) {
            console.warn("[handleCentralizedDbSlots Warning] Missing or invalid doctorId or appointmentDate in context.");
            return { hasData: false, options: [] };
        }

        // =========================================================================
        // FIX: SAFE DATE PARSING FOR "DD/MM/YYYY" FORMAT
        // =========================================================================
        let parsedDate;
        if (typeof appointmentDate === "string" && appointmentDate.includes("/")) {
            const [day, month, year] = appointmentDate.split("/").map(Number);
            // JavaScript Month 0-indexed hota hai (0 = Jan, 8 = Sep)
            parsedDate = new Date(year, month - 1, day);
        } else {
            parsedDate = new Date(appointmentDate);
        }

        // Validation Check
        if (isNaN(parsedDate.getTime())) {
            console.error(`[handleCentralizedDbSlots Error] Invalid date string received: '${appointmentDate}'`);
            return { hasData: false, options: [] };
        }

        // Use tenantConnection passed from arguments
        const conn = tenantConnection;
        const FilledFormsModel = getFilledFormsModel(conn);
        const DoctorModel = getDoctorModel(conn);

        // 3. Format Target Date Strings & Objects safely
        const yearStr = parsedDate.getFullYear();
        const monthStr = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(parsedDate.getDate()).padStart(2, '0');

        // "YYYY-MM-DD" format for doctor.unavailableDates comparison
        const formattedDateString = `${yearStr}-${monthStr}-${dayStr}`;

        // Range query for MongoDB ($gte / $lte)
        const startDate = new Date(parsedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(parsedDate);
        endDate.setHours(23, 59, 59, 999);

        console.log("Formatted Date YYYY-MM-DD:", formattedDateString);
        console.log("Start Date (ISO):", startDate.toISOString());
        console.log("End Date (ISO):", endDate.toISOString());

        // 4. Fetch Booked Slot IDs from FilledForms
        const bookedSlots = await FilledFormsModel.find(
            {
                doctor: new mongoose.Types.ObjectId(doctorId),
                "formData.appointmentSlot.date": {
                    $gte: startDate,
                    $lte: endDate,
                },
                isDeleted: false,
            },
            {
                "formData.appointmentSlot.slotId": 1,
                _id: 0,
            }
        ).lean();

        // Map booked slot IDs into a Set of String IDs for O(1) fast lookup
        const bookedSlotIdsSet = new Set(
            bookedSlots
                .map((item) => item?.formData?.appointmentSlot?.slotId?.toString())
                .filter(Boolean)
        );

        // 5. Fetch Doctor Slots from Database
        const doctor = await DoctorModel.findById(doctorId).select("slots unavailableDates").lean();

        if (!doctor || !Array.isArray(doctor.slots) || doctor.slots.length === 0) {
            console.warn("[handleCentralizedDbSlots Warning] Doctor or slots not found.");
            return { hasData: false, options: [] };
        }

        // Check if the doctor is globally unavailable on this date
        if (doctor.unavailableDates && doctor.unavailableDates.includes(formattedDateString)) {
            console.log(`Doctor is marked unavailable on ${formattedDateString}`);
            return { hasData: false, options: [] };
        }

        // 6. Filter open/available slots
        const openSlots = doctor.slots.filter((slot) => {
            const slotIdStr = slot._id ? slot._id.toString() : null;

            // Filter out slots marked as statically booked in Schema
            if (slot.isBooked) return false;

            // Filter out slots that are already booked in FilledForms for this date
            if (slotIdStr && bookedSlotIdsSet.has(slotIdStr)) return false;

            // Filter out slots that have date-specific unavailability
            if (Array.isArray(slot.unavailableDates)) {
                const isUnavailableOnDate = slot.unavailableDates.some(
                    (unavail) => unavail.date === formattedDateString
                );
                if (isUnavailableOnDate) return false;
            }

            return true;
        });

        console.log("Available Unbooked Slots Count:", openSlots.length);
        console.log("-------------------------------------------------------------------");

        if (openSlots.length === 0) {
            return { hasData: false, options: [] };
        }

        // 7. Format slots into interactive options (Max 10 options)
        const options = openSlots.slice(0, 10).map((s, index) => {
            const slotTimeText = `${s.start} - ${s.end}`;
            return {
                optionId: `SLOT_${s._id ? s._id.toString() : index}`,
                title: slotTimeText.substring(0, 24),          // Meta 24-character limit
                description: s.session ? `${s.session} Session` : "Available Consultation Slot", // Meta 72-character limit
                nextNodeId: "NODE_CONFIRMATION",
            };
        });

        return { hasData: true, options };

    } catch (error) {
        console.error("[handleCentralizedDbSlots Error]:", error.message);
        return { hasData: false, options: [] };
    }
}
export async function renderNode({
    node,
    waAccount,
    recipientPhoneId,
    patientNumber,
    tenantConnection,
    hospitalId,
    context
}) {
    // 1. String Interpolation
    const textBody = interpolateTemplate(node.messageText, context);

    // 2. Clone Options & Inject Default "Call Executive" Option for Interactive Nodes
    let optionsToRender = node.options ? [...node.options] : [];

    if (node.type !== "END" && node.type !== "TEXT_INPUT") {
        const hasCallback = optionsToRender.some(
            (opt) => opt.optionId === "OPT_REQUEST_CALLBACK" || opt.optionId === "OPT_CALL_EXECUTIVE"
        );

        if (!hasCallback) {
            optionsToRender.push({
                optionId: "OPT_REQUEST_CALLBACK",
                title: "📞 Call Executive",
                description: "Request direct callback from executive",
                nextNodeId: "NODE_CALLBACK_CONFIRMATION"
            });
        }
    }

    // 3. Determine Message Type & Meta Layout Controls
    const optionsCount = optionsToRender.length;

    // Reply Buttons strictly allow max 3 options (including injected callback)
    const isReplyButton = node.type === "REPLY_BUTTONS" && optionsCount > 0 && optionsCount <= 3;
    const isInteractiveList = node.type === "INTERACTIVE_LIST" || (node.type === "REPLY_BUTTONS" && optionsCount > 3);

    // 4. Construct Meta Graph API Payload
    let payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: patientNumber
    };

    if (isInteractiveList) {
        payload.type = "interactive";
        payload.interactive = {
            type: "list",
            header: { type: "text", text: "Select Option" },
            body: { text: textBody },
            footer: { text: "Sr Kalla Hospital Support" },
            action: {
                button: "Choose Option",
                sections: [
                    {
                        title: "Available Options",
                        rows: optionsToRender.slice(0, 10).map((opt) => ({
                            id: opt.optionId,
                            title: (opt.title || "").substring(0, 24),
                            description: (opt.description || "").substring(0, 72)
                        }))
                    }
                ]
            }
        };
    } else if (isReplyButton) {
        payload.type = "interactive";
        payload.interactive = {
            type: "button",
            body: { text: textBody },
            action: {
                buttons: optionsToRender.slice(0, 3).map((opt) => ({
                    type: "reply",
                    reply: {
                        id: opt.optionId,
                        title: (opt.title || "").substring(0, 20)
                    }
                }))
            }
        };
    } else {
        payload.type = "text";
        payload.text = { body: textBody };
    }

    try {
        // 5. Dispatch Post Request to Meta Graph API
        const metaResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${recipientPhoneId}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${waAccount.accessToken}`,
                    "Content-Type": "application/json"
                },
                timeout: 5000 // 5-second strict timeout for outbound requests
            }
        );

        const sentMetaId = metaResponse.data?.messages?.[0]?.id || null;

        // 6. Asynchronous Non-Blocking Database Write Operation
        setImmediate(() => {
            saveChatMessage({
                tenantConnection,
                hospitalId,
                phoneNumberId: recipientPhoneId,
                patientPhoneNumber: patientNumber,
                direction: "OUTBOUND",
                messageType: isInteractiveList || isReplyButton ? "interactive" : "text",
                content: textBody,
                metaMessageId: sentMetaId,
                status: "sent"
            }).catch((dbErr) => {
                console.error("[Async DB Store Error]:", dbErr.message);
            });
        });

    } catch (apiError) {
        const errorDetails = apiError.response?.data || apiError.message;

        console.log("apiError", apiError);
        console.error(`[Meta API Dispatch Error] Target: ${patientNumber} | Node: ${node.nodeId}`, errorDetails);

        // Async Non-Blocking Failure Logging
        setImmediate(() => {
            saveChatMessage({
                tenantConnection,
                hospitalId,
                phoneNumberId: recipientPhoneId,
                patientPhoneNumber: patientNumber,
                direction: "OUTBOUND",
                messageType: "text",
                content: `[FAILED TO SEND]: ${textBody}`,
                status: "failed"
            }).catch((dbErr) => {
                console.error("[Async Failure DB Store Error]:", dbErr.message);
            });
        });
    }
}
export const saveChatMessage = async ({
    tenantConnection,
    hospitalId,
    phoneNumberId,
    patientPhoneNumber,
    direction,
    messageType = "text",
    content,
    metaMessageId = null,
    status = "received",
    rawMediaUrl = null
}) => {
    try {
        const MessageModel = getMessageModel(tenantConnection);

        const newMessage = await MessageModel.create({
            hospitalId,
            phoneNumberId,
            patientPhoneNumber,
            direction, // 'INBOUND' or 'OUTBOUND'
            messageType,
            content,
            metaMessageId,
            status,
            rawMediaUrl
        });

        return newMessage;
    } catch (error) {
        console.error(`[Message Store Error] Failed to save ${direction} message:`, error.message);
        return null;
    }
};
export const sendInteractiveListMessage = async ({
    phoneNumberId,
    accessToken,
    recipientPhone,
    welcomeText,
    buttonText,
    sections
}) => {
    return await axios.post(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: recipientPhone,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "Main Menu" },
                body: { text: welcomeText },
                footer: { text: "Tap button below to select" },
                action: {
                    button: buttonText,
                    sections: sections
                }
            }
        },
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
};
