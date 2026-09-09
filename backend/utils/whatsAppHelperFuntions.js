import axios from "axios";
import { getBranchModel, getDepartmentModel, getDoctorModel, getMessageModel } from "./db.manager.js";
import { interpolateTemplate } from "./nodeCache.js";
import { getFilledForms } from "../controllers/form.controller.js";



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
            title: `${b?.name?.substring(0, 24)} (${(b?.location?.substring(0, 72))})`,          // Meta limit: 24 characters max
            description: b?.location?.substring(0, 72),        // Meta limit: 72 characters max
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
            optionId: `DEPT_${d._id.toString()}`,
            title: d.departmentName.substring(0, 24),
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

        if (!doctorId || !appointmentDate) {
            console.warn("[handleCentralizedDbSlots Warning] Missing doctorId or appointmentDate in context.");
            return { hasData: false, options: [] };
        }


        const FilledFormsModel =
            getFilledForms(conn);



        const DoctorModel = getDoctorModel(conn);
        const startDate = new Date(appointmentDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(appointmentDate);
        endDate.setHours(23, 59, 59, 999);

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


        const bookedSlotIds =
            bookedSlots.map(
                (item) =>
                    item?.formData
                        ?.appointmentSlot?.slotId
            );


        const doctor = await DoctorModel.findById(doctorId).select("slots")?.lean()

        const slotRecord = doctor?.slots.filter((id) => id != bookedSlotIds)

        console.log("Slot Record Found:", slotRecord ? "YES" : "NO");

        if (!slotRecord || !slotRecord.availableSlots || slotRecord.availableSlots.length === 0) {
            return { hasData: false, options: [] };
        }

        // 4. Filter out already booked slots
        const openSlots = slotRecord.availableSlots.filter((slot) => !slot.isBooked);

        console.log("Available Unbooked Slots Count:", openSlots.length);
        console.log("-------------------------------------------------------------------");

        if (openSlots.length === 0) {
            return { hasData: false, options: [] };
        }

        // 5. Format slots into Meta interactive list/button options (Max 10 options)
        const options = openSlots.slice(0, 10).map((s, index) => ({
            optionId: `SLOT_${s._id ? s._id.toString() : index}`,
            title: s.slotTime.substring(0, 24),          // Meta 24-char limit
            description: "Available Consultation Slot",  // Meta 72-char limit
            nextNodeId: "NODE_CONFIRMATION"
        }));

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

    // 2. Determine Message Type & Fallbacks
    const optionsCount = node.options?.length || 0;
    const isReplyButton = node.type === "REPLY_BUTTONS" && optionsCount > 0 && optionsCount <= 3;
    const isInteractiveList = node.type === "INTERACTIVE_LIST" || (node.type === "REPLY_BUTTONS" && optionsCount > 3);

    // 3. Construct Meta Graph API Payload
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
            footer: { text: "Tap button below to select" },
            action: {
                button: "Choose Option",
                sections: [
                    {
                        title: "Options",
                        rows: node.options.map((opt) => ({
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
                buttons: node.options.slice(0, 3).map((opt) => ({
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
        // 4. Dispatch Post Request to Meta Graph API
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

        // 5. Asynchronous Non-Blocking Database Write Operation
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
