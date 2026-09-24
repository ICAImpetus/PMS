import axios from "axios";

import {
    getHospitalModel, MasterConn,
    getWhatsAppAccountModel,
    getWhatsAppNodeModel,
    getPatientStateModel, getConnection,
    getMessageModel,
    getLeadModel,
    getBranchModel,
    getDoctorModel,
    getDepartmentModel
} from '../utils/db.manager.js';
import { getCachedNode, invalidateHospitalNodeCache, interpolateTemplate } from '../utils/nodeCache.js';
import mongoose from "mongoose";
import { fetchDepartmentsFromDb, fetchDoctorsFromDb, generateNext7DaysOptions, handleCentralizedDbSlots, renderNode, resolveHospitalBranches, saveChatMessage } from "../utils/whatsAppHelperFuntions.js";

const HospitalModel = getHospitalModel(MasterConn)


export const connectWhatsApp = async (req, res) => {
    // Session variables ki zaroorat nahi hai multi-tenant connection me
    const { hospitalId, code, wabaId, phoneNumberId } = req.body;

    if (!hospitalId || !code || !wabaId || !phoneNumberId) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    if (!mongoose.isValidObjectId(hospitalId)) {
        return res.status(400).json({
            success: false,
            message: "Valid Hospital Id is required",
        });
    }

    try {
        // 1. Get hospital tenant details
        const hospital = await HospitalModel.findById(hospitalId)
            .select("trimmedName")
            .lean();

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        // 2. Get Multi-tenant database connection
        const conn = await getConnection(hospital.trimmedName);
        const whatsAppAccountModel = getWhatsAppAccountModel(conn);

        // 3. CHECK IF ALREADY CONNECTED IN DB
        const existingAccount = await whatsAppAccountModel.findOne({
            $or: [{ hospitalId }, { phoneNumberId }],
            isConnected: true
        });

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: `WhatsApp is already connected for ${existingAccount.businessName || 'this hospital'}.`,
                alreadyConnected: true,
                whatsappAccount: existingAccount
            });
        }

        // 4. Exchange OAuth code for access token
        const tokenResponse = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
            params: {
                client_id: process.env.META_APP_ID,
                client_secret: process.env.META_APP_SECRET,
                code: code
            },
            timeout: 15000, // 15 seconds instead of 5000ms
        });

        const accessToken = tokenResponse.data.access_token;

        // 5. FETCH PHONE NUMBER & DISPLAY NAME
        const phoneDetailsResponse = await axios.get(
            `https://graph.facebook.com/v20.0/${phoneNumberId}`,
            {
                timeout: 15000, // 15 seconds instead of 5000ms
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { fields: 'display_phone_number,verified_name,quality_rating' }
            }
        );

        const displayPhoneNumber = phoneDetailsResponse.data.display_phone_number;
        const businessName = phoneDetailsResponse.data.verified_name || 'WhatsApp Business Account';
        const qualityRating = phoneDetailsResponse.data.quality_rating;

        // 6. FETCH WHATSAPP BUSINESS PROFILE DATA
        let profileData = {};
        try {
            const profileResponse = await axios.get(

                `https://graph.facebook.com/v20.0/${phoneNumberId}/whatsapp_business_profile`,
                {
                    timeout: 15000, // 15 seconds instead of 5000ms
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { fields: 'about,address,description,email,profile_picture_url,websites,vertical' }
                }
            );

            if (profileResponse.data?.data?.[0]) {
                const profile = profileResponse.data.data[0];
                profileData = {
                    profilePictureUrl: profile.profile_picture_url || '',
                    description: profile.description || profile.about || '',
                    address: profile.address || '',
                    email: profile.email || '',
                    websites: profile.websites || [],
                    category: profile.vertical || ''
                };
            }
        } catch (profileErr) {
            console.warn('Profile details fetch skipped:', profileErr.response?.data || profileErr.message);
        }

        // 7. SUBSCRIBE WABA TO WEBHOOK
        await axios.post(
            `https://graph.facebook.com/v20.0/${wabaId}/subscribed_apps`,
            {},

            {
                timeout: 15000, // 15 seconds instead of 5000ms
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        // 8. REGISTER PHONE NUMBER ON WHATSAPP CLOUD API
        try {
            await axios.post(
                `https://graph.facebook.com/v20.0/${phoneNumberId}/register`,
                {
                    messaging_product: 'whatsapp',
                    pin: '123456'
                },
                {
                    timeout: 15000, // 15 seconds instead of 5000ms
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            console.log("Phone Number successfully registered on WhatsApp Cloud API");
        } catch (regError) {
            console.error("Registration Error:", regError.response?.data || regError.message);
        }

        // ==========================================
        // 9. DIRECT DATABASE SAVES (WITHOUT SESSION BUFFERING)
        // ==========================================

        // Central Model DB Update
        await HospitalModel.findByIdAndUpdate(
            hospitalId,
            { whatsAppPhoneNumberId: phoneNumberId }
        );

        // Tenant Model DB Update
        const whatsappAccount = await whatsAppAccountModel.findOneAndUpdate(
            { hospitalId },
            {
                hospitalId,
                wabaId,
                phoneNumberId,
                accessToken,
                displayPhoneNumber,
                businessName,
                qualityRating,
                profile: profileData,
                isConnected: true
            },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'WhatsApp Business API connected, registered, and DB updated successfully!',
            whatsappAccount
        });

    } catch (error) {
        console.error('Connect WhatsApp Error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to authenticate or subscribe Meta WhatsApp API.',
            details: error.response?.data || error.message
        });
    }
};
/*
 * @desc    Meta Webhook Verification (GET)
 * @route   GET /api/whatsapp/webhook
 */
export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Webhook Verification Request:', { mode, token, challenge }); // Debugging ke liye log karein

    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'your_custom_verify_token';

    if (mode && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
};

/**
 * @desc    Handle Incoming Webhook Events (POST)
 * @route   POST /api/whatsapp/webhook
 */
// export const handleWebhook = async (req, res) => {

//     const body = req.body;

//     console.log('Webhook Event Received:', JSON.stringify(body, null, 2)); // Debugging ke liye log karein
//     if (body.object === 'whatsapp_business_account') {
//         res.sendStatus(200); // Fast acknowledgment to Meta

//         try {
//             for (const entry of body.entry) {
//                 for (const change of entry.changes) {
//                     const value = change.value;

//                     if (value.messages && value.messages[0]) {
//                         const incomingMsg = value.messages[0];
//                         const phoneNumberId = value.metadata.phone_number_id;
//                         const patientNumber = incomingMsg.from;
//                         const incomingText = incomingMsg.text?.body || '';

//                         // 1. Find Hospital Account
//                         const account = await whatsAppAccountModel.findOne({ phoneNumberId });
//                         if (!account) continue;

//                         // 2. Save Inbound Message
//                         await Message.create({
//                             hospitalId: account.hospitalId,
//                             phoneNumberId,
//                             patientPhoneNumber: patientNumber,
//                             direction: 'INBOUND',
//                             content: incomingText,
//                             metaMessageId: incomingMsg.id,
//                             status: 'received'
//                         });

//                         // 3. Automated Response
//                         const replyText = "Hello! Welcome to our Hospital WhatsApp Service. How can we help you today?";
//                         const sendRes = await axios.post(
//                             `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
//                             {
//                                 messaging_product: 'whatsapp',
//                                 to: patientNumber,
//                                 text: { body: replyText }
//                             },
//                             {
//                                 headers: {
//                                     Authorization: `Bearer ${account.accessToken}`,
//                                     'Content-Type': 'application/json'
//                                 }
//                             }
//                         );

//                         // 4. Save Outbound Message
//                         await Message.create({
//                             hospitalId: account.hospitalId,
//                             phoneNumberId,
//                             patientPhoneNumber: patientNumber,
//                             direction: 'OUTBOUND',
//                             content: replyText,
//                             metaMessageId: sendRes.data?.messages[0]?.id,
//                             status: 'sent'
//                         });
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Webhook Handling Error:', error.response?.data || error.message);
//         }
//     } else {
//         res.sendStatus(404);
//     }
// };

const toValidObjectId = (id) => {
    return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
};

export const handleWebhook = async (req, res) => {
    // 1. Meta Webhook Instant Acknowledgment
    res.status(200).send("EVENT_RECEIVED");

    try {
        const change = req.body.entry?.[0]?.changes?.[0]?.value;
        if (!change?.messages?.[0]) return;

        const incomingMsg = change.messages[0];
        const recipientPhoneId = change.metadata.phone_number_id;
        const patientNumber = incomingMsg.from;
        const metaMessageId = incomingMsg.id;

        console.log("\n==================== [WEBHOOK INCOMING EVENT] ====================");
        console.log(`[Webhook] Phone ID: ${recipientPhoneId} | Sender: ${patientNumber} | Message ID: ${metaMessageId}`);

        // 2. Resolve Multi-tenant Hospital Tenant
        const hospital = await HospitalModel.findOne({
            whatsAppPhoneNumberId: recipientPhoneId,
            isDeleted: false
        }).lean();

        if (!hospital) {
            console.error(`[Webhook Debug Error] No hospital record found for Phone ID: ${recipientPhoneId}`);
            return;
        }

        console.log(`[Webhook Debug] Tenant Matched: ${hospital?.hospitalName || hospital?.name} (${hospital.trimmedName}) | Hospital ID: ${hospital._id}`);

        // Obtain Tenant Database Connection Models
        const conn = await getConnection(hospital.trimmedName);
        const NodeModel = getWhatsAppNodeModel(conn);
        const StateModel = getPatientStateModel(conn);
        const WAAccountModel = getWhatsAppAccountModel(conn);
        const LeadModel = getLeadModel(conn);

        // 3. Extract Message & Lead Source Tracking
        const msgType = incomingMsg.type;
        let inboundText = "";
        let leadSource = "WHATSAPP_DIRECT";

        if (incomingMsg.referral) {
            const refSource = incomingMsg.referral.source_type;
            if (refSource === "AD") {
                leadSource = incomingMsg.referral.headline?.includes("FB") ? "FACEBOOK_ADS" : "INSTAGRAM_ADS";
            }
        }

        if (msgType === "text") {
            inboundText = incomingMsg.text.body;
        } else if (msgType === "interactive") {
            inboundText = incomingMsg.interactive.list_reply?.title || incomingMsg.interactive.button_reply?.title || "Interactive Option Selected";
        } else {
            inboundText = `[Media Message: ${msgType}]`;
        }

        console.log(`[Webhook Debug] Msg Type: '${msgType}' | Content: '${inboundText}' | Lead Source: '${leadSource}'`);

        // 4. PERSIST INBOUND MESSAGE IMMEDIATELY
        await saveChatMessage({
            tenantConnection: conn,
            hospitalId: hospital._id,
            phoneNumberId: recipientPhoneId,
            patientPhoneNumber: patientNumber,
            direction: "INBOUND",
            messageType: msgType,
            content: inboundText,
            metaMessageId: metaMessageId,
            status: "received"
        });

        // Resolve Active WhatsApp Credentials
        const waAccount = await WAAccountModel.findOne({
            hospitalId: hospital._id,
            phoneNumberId: recipientPhoneId,
            isConnected: true
        }).lean();

        if (!waAccount) {
            console.error(`[Webhook Debug Error] Connected WA Account credentials missing for Hospital ID: ${hospital._id}`);
            return;
        }

        // 5. Resolve or Initialize Patient Session State
        let session = await StateModel.findOne({ patientPhoneNumber: patientNumber });
        if (!session) {
            console.log(`[Webhook Debug] Creating NEW Patient Session State for ${patientNumber}...`);
            session = await StateModel.create({
                patientPhoneNumber: patientNumber,
                hospitalId: hospital._id,
                currentNodeId: "START_NODE",
                context: { source: leadSource }
            });
        }

        const currentContextObj = session.context instanceof Map ? Object.fromEntries(session.context) : session.context;
        console.log(`[Webhook Debug] Active Session Node: '${session.currentNodeId}'`);
        console.log(`[Webhook Debug] Current Session Context:`, JSON.stringify(currentContextObj, null, 2));

        // 6. TRIGGER MATCHING LOGIC ("hi", "hello", "menu", "start")
        const userText = msgType === "text" ? incomingMsg.text.body.trim().toLowerCase() : "";
        const defaultTriggers = ["hi", "hii", "hello", "menu", "start", "namaste"];

        if (msgType === "text" && defaultTriggers.includes(userText)) {
            console.log(`[Webhook Debug] Trigger Keyword '${userText}' matched. Resetting Session to START_NODE.`);
            session.currentNodeId = "START_NODE";
            session.context = new Map([["source", leadSource]]);
            await session.save();

            const startNode = await getCachedNode(NodeModel, hospital._id, "START_NODE");
            if (startNode) {
                await renderNode({
                    node: startNode,
                    waAccount,
                    recipientPhoneId,
                    patientNumber,
                    tenantConnection: conn,
                    hospitalId: hospital._id,
                    hospitalName: hospital?.name
                });
            } else {
                console.error(`[Webhook Debug Error] START_NODE not found in database for Hospital ID: ${hospital._id}`);
            }
            return;
        }

        // 7. FETCH CURRENT ACTIVE NODE
        const currentNode = await getCachedNode(NodeModel, hospital._id, session.currentNodeId);
        if (!currentNode) {
            console.error(`[Webhook Debug Error] Current node document '${session.currentNodeId}' not found.`);
            return;
        }

        let targetNextNodeId = null;

        // =========================================================================
        // CASE A: INTERACTIVE SELECTION (Buttons / List Reply)
        // =========================================================================
        if (msgType === "interactive") {
            const selectedOptionId = incomingMsg.interactive.list_reply?.id || incomingMsg.interactive.button_reply?.id;
            const selectedTitle = incomingMsg.interactive.list_reply?.title || incomingMsg.interactive.button_reply?.title;

            console.log(`[Webhook Debug] Interactive Reply Received -> Option ID: '${selectedOptionId}' | Title: '${selectedTitle}'`);

            // 0. GLOBAL CALLBACK ESCAPE INTERCEPTOR
            if (selectedOptionId === "OPT_REQUEST_CALLBACK" || selectedOptionId === "OPT_CALL_EXECUTIVE") {
                console.log(`[Webhook Debug Global] Patient requested mid-flow Callback Support!`);

                session.currentNodeId = "NODE_CALLBACK_CONFIRMATION";
                session.context.set("START_NODE", "Callback");
                await session.save();

                const callbackNode = await getCachedNode(NodeModel, hospital._id, "NODE_CALLBACK_CONFIRMATION");
                const contextObj = session.context instanceof Map ? Object.fromEntries(session.context) : session.context;

                await LeadModel.create({
                    hospitalId: hospital._id,
                    patientName: contextObj.patient_name || "Enquirer",
                    patientPhoneNumber: patientNumber,
                    patientLocation: contextObj.patient_location || "",
                    illnessDescription: contextObj.illness_description || "",
                    leadType: "CALLBACK_REQUEST",
                    source: contextObj.source || "WHATSAPP_DIRECT",
                    patientStatus: "NEW"
                });

                await renderNode({
                    node: callbackNode || {
                        type: "END",
                        messageText: "📞 *CALLBACK REQUEST RECEIVED*\n───────────────────────────\nHamari patient support team ke executive jald hi aap se is number par sampark karenge.\n\nThank you for contacting *Medisky Hospital*! 🙏"
                    },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context,
                    hospitalName: hospital?.name
                });
                return;
            }

            // 1. DYNAMIC PREFIX MATCHING
            if (selectedOptionId.startsWith("BRANCH_")) {
                const cleanBranchId = selectedOptionId.replace("BRANCH_", "").trim();
                session.context.set("selected_branch_id", cleanBranchId);
                session.context.set("selected_branch_name", selectedTitle);
                session.context.set("NODE_SELECT_BRANCH", selectedTitle);

                targetNextNodeId = "NODE_SELECT_DEPT";
            }
            else if (selectedOptionId.startsWith("DEPT_")) {
                const cleanDeptId = selectedOptionId.replace("DEPT_", "").trim();
                session.context.set("selected_dept_id", cleanDeptId);
                session.context.set("selected_dept_name", selectedTitle);
                session.context.set("NODE_SELECT_DEPT", selectedTitle);

                targetNextNodeId = "NODE_SELECT_DOC";
            }
            else if (selectedOptionId.startsWith("DOC_")) {
                const cleanDocId = selectedOptionId.replace("DOC_", "").trim();
                session.context.set("selected_doctor_id", cleanDocId);
                session.context.set("selected_doctor_name", selectedTitle);
                session.context.set("NODE_SELECT_DOC", selectedTitle);

                targetNextNodeId = "NODE_ASK_PATIENT_NAME";
            }
            else if (selectedOptionId.startsWith("GENDER_")) {
                const cleanGender = selectedTitle.replace(/[^\w\s]/gi, '').trim();
                session.context.set("patient_gender", cleanGender);
                session.context.set("NODE_ASK_PATIENT_GENDER", cleanGender);

                targetNextNodeId = "NODE_ASK_PATIENT_LOCATION";
            }
            else if (selectedOptionId.startsWith("DATE_")) {
                const cleanDate = selectedOptionId.replace("DATE_", "").trim();
                session.context.set("appointment_date", cleanDate);
                session.context.set("NODE_SELECT_DATE", selectedTitle);

                targetNextNodeId = "NODE_FETCH_SLOTS";
            }
            else if (selectedOptionId.startsWith("SLOT_")) {
                const cleanSlotId = selectedOptionId.replace("SLOT_", "").trim();
                session.context.set("selected_slot_id", cleanSlotId);
                session.context.set("NODE_FETCH_SLOTS", selectedTitle);

                targetNextNodeId = "NODE_CONFIRMATION";
            }
            // 2. STATIC OPTIONS MATCHING
            else {
                let matchedOption = currentNode.options?.find(opt => opt.optionId === selectedOptionId);
                let activeNode = currentNode;

                if (!matchedOption) {
                    const globalMatchedNode = await NodeModel.findOne({
                        hospitalId: hospital._id,
                        "options.optionId": selectedOptionId
                    }).lean();

                    if (globalMatchedNode) {
                        activeNode = globalMatchedNode;
                        matchedOption = globalMatchedNode.options.find(opt => opt.optionId === selectedOptionId);
                        session.currentNodeId = globalMatchedNode.nodeId;
                    }
                }

                if (matchedOption) {
                    session.context.set(activeNode.nodeId, selectedTitle);

                    if (selectedOptionId === "OPT_BOOK_APPOINTMENT") {
                        const branchData = await resolveHospitalBranches({ tenantConnection: conn, hospitalId: hospital._id });

                        if (branchData.isMultiBranch) {
                            session.currentNodeId = "NODE_SELECT_BRANCH";
                            await session.save();

                            await renderNode({
                                node: {
                                    nodeId: "NODE_SELECT_BRANCH",
                                    type: branchData.options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST",
                                    messageText: "📍 *SELECT HOSPITAL BRANCH*\n───────────────────────────\nAap kis branch me consultation chahte hain?\n\nNeeche button par click karke branch chunein 👇",
                                    options: branchData.options
                                },
                                waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context,
                                hospitalName: hospital?.name
                            });
                            return;
                        } else if (branchData.singleBranch) {
                            session.context.set("selected_branch_name", branchData.singleBranch?.name || branchData.singleBranch?.branchName);
                            session.context.set("selected_branch_id", branchData.singleBranch._id.toString());
                        }
                    }

                    targetNextNodeId = matchedOption.nextNodeId;
                } else {
                    console.warn(`[Webhook Debug Warning] Option ID '${selectedOptionId}' did not match any option across the workflow.`);
                }
            }

            await session.save();
        }
        // =========================================================================
        // CASE B: TEXT INPUTS (Captured Data or Incorrect Text Interceptor)
        // =========================================================================
        else if (msgType === "text") {
            const userInputValue = incomingMsg.text.body.trim();

            if (currentNode.type === "TEXT_INPUT") {
                if (currentNode.inputVariable) {
                    session.context.set(currentNode.inputVariable, userInputValue);
                    console.log(`[Webhook Debug] Captured Text Input -> Variable: '${currentNode.inputVariable}' = Value: '${userInputValue}'`);
                    await session.save();
                }
                targetNextNodeId = currentNode.nextNodeId;
            } else {
                // WRONG INPUT INTERCEPTOR: User typed text during an interactive button/list node
                console.warn(`[Webhook Warning] Text received on interactive node '${currentNode.nodeId}'. Re-rendering same node...`);

                let renderOptions = currentNode.options || [];

                // Fetch dynamic options if user typed text during dynamic list nodes
                if (currentNode.nodeId === "NODE_SELECT_DEPT") {
                    const deptRes = await fetchDepartmentsFromDb({ tenantConnection: conn, hospitalId: hospital._id, context: session.context });
                    renderOptions = deptRes.options;
                } else if (currentNode.nodeId === "NODE_SELECT_DOC") {
                    const docRes = await fetchDoctorsFromDb({ tenantConnection: conn, hospitalId: hospital._id, context: session.context });
                    renderOptions = docRes.options;
                } else if (currentNode.nodeId === "NODE_SELECT_DATE") {
                    renderOptions = generateNext7DaysOptions();
                } else if (currentNode.type === "DB_QUERY") {
                    const slotRes = await handleCentralizedDbSlots({ tenantConnection: conn, hospitalId: hospital._id, context: session.context });
                    renderOptions = slotRes.options;
                }

                await renderNode({
                    node: {
                        ...currentNode,
                        messageText: `⚠️ *Kripya option button par click karke select karein!*\n\n${currentNode.messageText}`,
                        options: renderOptions
                    },
                    waAccount,
                    recipientPhoneId,
                    patientNumber,
                    tenantConnection: conn,
                    hospitalId: hospital._id,
                    context: session.context,
                    hospitalName: hospital?.name
                });
                return;
            }
        }

        console.log(`[Webhook Debug] Calculated Target Next Node ID: '${targetNextNodeId}'`);

        // =========================================================================
        // 8. TRANSITION & EXECUTE NEXT TARGET NODE
        // =========================================================================
        if (targetNextNodeId) {
            session.currentNodeId = targetNextNodeId;
            await session.save();

            const nextNodeDoc = await getCachedNode(NodeModel, hospital._id, targetNextNodeId);
            if (!nextNodeDoc) {
                console.error(`[Webhook Debug Error] Target next node '${targetNextNodeId}' document not found in DB.`);
                return;
            }

            console.log(`[Webhook Debug] Executing Next Node -> ID: '${nextNodeDoc.nodeId}' | Type: '${nextNodeDoc.type}'`);

            // --- TYPE 1: DYNAMIC DEPARTMENT LOOKUP WITH GEMINI AI SUGGESTIONS ---
            if (nextNodeDoc.nodeId === "NODE_SELECT_DEPT") {
                console.log("[Webhook Debug] Fetching Departments dynamically from DB...");
                const { hasData, options } = await fetchDepartmentsFromDb({
                    tenantConnection: conn,
                    hospitalId: hospital._id,
                    context: session.context
                });

                if (!hasData) {
                    await renderNode({
                        node: { type: "END", messageText: "⚠️ Abhi koi department available nahi hai. Reset karne ke liye *hi* type karein." },
                        waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id,
                        hospitalName: hospital?.name
                    });
                    return;
                }

                await renderNode({
                    node: { ...nextNodeDoc, type: options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST", options },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context,
                    hospitalName: hospital?.name
                });
                return;
            }

            // --- TYPE 2: DYNAMIC DOCTOR LOOKUP ---
            if (nextNodeDoc.nodeId === "NODE_SELECT_DOC") {
                console.log("[Webhook Debug] Fetching Doctors dynamically from DB...");
                const { hasData, options } = await fetchDoctorsFromDb({
                    tenantConnection: conn,
                    hospitalId: hospital?._id,
                    context: session.context
                });

                if (!hasData) {
                    await renderNode({
                        node: { type: "END", messageText: "⚠️ Selected department ke liye koi doctor available nahi hai. Wapas start karne ke liye *hi* type karein." },
                        waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id,
                        hospitalName: hospital?.name
                    });
                    return;
                }

                await renderNode({
                    node: { ...nextNodeDoc, type: options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST", options },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context,
                    hospitalName: hospital?.name
                });
                return;
            }

            // --- TYPE 3: DYNAMIC NEXT 7 DAYS DATE SELECTION MENU ---
            if (nextNodeDoc.nodeId === "NODE_SELECT_DATE") {
                console.log("[Webhook Debug] Generating Dynamic Next 7 Days Date Options...");
                const dateOptions = generateNext7DaysOptions();

                await renderNode({
                    node: { ...nextNodeDoc, type: "INTERACTIVE_LIST", options: dateOptions },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context,
                    hospitalName: hospital?.name
                });
                return;
            }

            // --- TYPE 4: LOCAL MONGO DB SLOTS LOOKUP ---
            if (nextNodeDoc.type === "DB_QUERY") {
                console.log("[Webhook Debug] Querying Slots dynamically from DB...");
                const { hasData, options } = await handleCentralizedDbSlots({
                    tenantConnection: conn,
                    hospitalId: hospital?._id,
                    context: session.context
                });

                if (!hasData) {
                    await renderNode({
                        node: { type: "END", messageText: "⚠️ Selected doctor/date par koi slot available nahi hai. Reset karne ke liye *hi* type karein." },
                        waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id,
                        hospitalName: hospital?.name
                    });
                    return;
                }

                await renderNode({
                    node: { ...nextNodeDoc, type: options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST", options },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context,
                    hospitalName: hospital?.name
                });
                return;
            }

            // --- TYPE 5: FINAL CONFIRMATION & LEAD CREATION (END NODE) ---
            if (nextNodeDoc.type === "END") {
                const contextObj = session.context instanceof Map
                    ? Object.fromEntries(session.context)
                    : (session.context || {});

                console.log("[Webhook Debug] Executing END Node. Final Context State:", JSON.stringify(contextObj, null, 2));

                if (session.context.get("START_NODE")?.includes("Appointment") || contextObj.appointment_date) {
                    console.log("[Webhook Debug] Creating Lead Document: APPOINTMENT_BOOKING...");
                    const createdLead = await LeadModel.create({
                        hospitalId: hospital._id,
                        patientName: contextObj.patient_name || "Patient",
                        patientPhoneNumber: patientNumber,
                        patientAge: contextObj.patient_age || "",
                        patientGender: contextObj.patient_gender || "",
                        patientLocation: contextObj.patient_location || "",
                        illnessDescription: contextObj.illness_description || "",
                        leadType: "APPOINTMENT_BOOKING",
                        departmentName: toValidObjectId(contextObj.selected_dept_id),
                        doctorName: toValidObjectId(contextObj.selected_doctor_id),
                        appointmentDate: contextObj.appointment_date || "",
                        appointmentSlot: contextObj.NODE_FETCH_SLOTS || "",
                        branchName: contextObj.selected_branch_name || "",
                        source: contextObj.source || "WHATSAPP_DIRECT",
                        patientStatus: "NEW"
                    });
                    console.log(`[Webhook Debug Success] Appointment Lead Created ID: ${createdLead._id}`);
                }
                else if (session.context.get("START_NODE")?.includes("Callback")) {
                    console.log("[Webhook Debug] Creating Lead Document: CALLBACK_REQUEST...");
                    const newLead = await LeadModel.create({
                        hospitalId: hospital._id,
                        patientName: contextObj.patient_name || "Enquirer",
                        patientPhoneNumber: patientNumber,
                        patientLocation: contextObj.patient_location || "",
                        illnessDescription: contextObj.illness_description || "",
                        leadType: "CALLBACK_REQUEST",
                        source: contextObj.source || "WHATSAPP_DIRECT",
                        patientStatus: "NEW"
                    });
                    console.log(`[Webhook Debug Success] Callback Lead Created ID: ${newLead._id}`);
                }
            }

            console.log(`[Webhook Debug] Invoking renderNode for '${nextNodeDoc.nodeId}'...`);
            await renderNode({
                node: nextNodeDoc,
                waAccount,
                recipientPhoneId,
                patientNumber,
                tenantConnection: conn,
                hospitalId: hospital._id,
                context: session.context,
                hospitalName: hospital?.name
            });
        }

        console.log("==================== [WEBHOOK EVENT PROCESSED] ====================\n");

    } catch (err) {
        console.error("[Webhook Exception Caught]:", err);
    }
};

export const saveHospitalNodes = async (req, res) => {
    const { hospitalId, nodes } = req.body;

    if (!hospitalId || !Array.isArray(nodes)) {
        return res.status(400).json({ error: "hospitalId and nodes array are required." });
    }

    try {
        const hospital = await HospitalModel.findById(hospitalId).select("trimmedName").lean();
        console.log("Hospital Details:", hospital); // Debugging ke liye log karein
        console.log("Hospital Details:", hospitalId); // Debugging ke liye log karein
        if (!hospital) return res.status(404).json({ error: "Hospital not found." });

        const conn = await getConnection(hospital.trimmedName);
        const NodeModel = getWhatsAppNodeModel(conn);

        // Prepare bulk operation array for high performance
        const bulkOps = nodes.map((node) => ({
            updateOne: {
                filter: { hospitalId, nodeId: node.nodeId },
                update: {
                    $set: {
                        ...node,
                        hospitalId,
                        isStartNode: node.nodeId === "START_NODE"
                    }
                },
                upsert: true
            }
        }));

        await NodeModel.bulkWrite(bulkOps);


        invalidateHospitalNodeCache(hospitalId);

        return res.status(200).json({
            success: true,
            message: `Successfully saved/updated ${nodes.length} flow nodes for hospital.`
        });
    } catch (error) {
        console.error("Save Nodes Error:", error.message);
        return res.status(500).json({ error: "Failed to save flow nodes." });
    }
};

export const getHospitalNodes = async (req, res) => {
    const { hospitalId } = req.params;

    try {
        const hospital = await HospitalModel.findById(hospitalId)
            .select("trimmedName")
            .lean();

        if (!hospital) {
            return res.status(404).json({ success: false, error: "Hospital not found." });
        }

        const conn = await getConnection(hospital.trimmedName);
        const NodeModel = getWhatsAppNodeModel(conn);

        const nodes = await NodeModel.find({ hospitalId }).lean();

        return res.status(200).json({
            success: true,
            count: nodes.length,
            nodes
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


//  ************** Do not remove becuase he is sample for making flow chart 

// {
//   "hospitalId": "6a8d6e97049af6500e262fa7",
//   "nodes": [
//     {
//       "nodeId": "START_NODE",
//       "type": "REPLY_BUTTONS",
//       "messageText": "🏥 *WELCOME TO SR KALLA HOSPITAL*\n───────────────────────────\nNamaste! Aaj hum aapki kis tarah help kar sakte hain?\n\nKripya neeche diye gaye option me se select karein 👇",
//       "options": [
//         {
//           "optionId": "OPT_BOOK_APPOINTMENT",
//           "title": "📅 Book Appointment",
//           "nextNodeId": "NODE_SELECT_DEPT"
//         },
//         {
//           "optionId": "OPT_REQUEST_CALLBACK",
//           "title": "📞 Call Executive",
//           "nextNodeId": "NODE_CALLBACK_CONFIRMATION"
//         }
//       ],
//       "isStartNode": true
//     },
//     {
//       "nodeId": "NODE_SELECT_BRANCH",
//       "type": "INTERACTIVE_LIST",
//       "messageText": "📍 *SELECT HOSPITAL BRANCH*\n───────────────────────────\nAap kis branch me consultation chahte hain? \n\nNeeche button par click karke branch chunein 👇",
//       "options": [],
//       "nextNodeId": "NODE_SELECT_DEPT"
//     },
//     {
//       "nodeId": "NODE_SELECT_DEPT",
//       "type": "INTERACTIVE_LIST",
//       "messageText": "🩺 *SELECT MEDICAL DEPARTMENT*\n───────────────────────────\nAapko kis specialist department me dikhana hai?\n\nKripya department select karein 👇",
//       "options": [],
//       "nextNodeId": "NODE_SELECT_DOC"
//     },
//     {
//       "nodeId": "NODE_SELECT_DOC",
//       "type": "INTERACTIVE_LIST",
//       "messageText": "👨‍⚕️ *SELECT CONSULTANT DOCTOR*\n───────────────────────────\nSelected department ke available doctors ki list neeche di gayi hai.\n\nApne Doctor choose karein 👇",
//       "options": [],
//       "nextNodeId": "NODE_ASK_PATIENT_NAME"
//     },
//     {
//       "nodeId": "NODE_ASK_PATIENT_NAME",
//       "type": "TEXT_INPUT",
//       "messageText": "✍️ *PATIENT DETAILS (1/2)*\n───────────────────────────\nKripya patient ka **Full Name** (Pura Naam) type karke message bhejein 💬",
//       "inputVariable": "patient_name",
//       "nextNodeId": "NODE_ASK_PATIENT_AGE"
//     },
//     {
//       "nodeId": "NODE_ASK_PATIENT_AGE",
//       "type": "TEXT_INPUT",
//       "messageText": "🔢 *PATIENT DETAILS (2/2)*\n───────────────────────────\nKripya patient ki **Umar (Age in years)** type karke reply karein 💬",
//       "inputVariable": "patient_age",
//       "nextNodeId": "NODE_SELECT_DATE"
//     },
//     {
//       "nodeId": "NODE_SELECT_DATE",
//       "type": "INTERACTIVE_LIST",
//       "messageText": "📅 *SELECT APPOINTMENT DATE*\n───────────────────────────\nAap kis din consultation ke liye aana chahte hain?\n\nAgle 7 dino me se apni preferred date chunein 👇",
//       "options": [],
//       "nextNodeId": "NODE_FETCH_SLOTS"
//     },
//     {
//       "nodeId": "NODE_FETCH_SLOTS",
//       "type": "DB_QUERY",
//       "messageText": "⏰ *SELECT TIME SLOT*\n───────────────────────────\nSelected date par available consultation slots.\n\nApna convenient time slot select karein 👇",
//       "options": [],
//       "nextNodeId": "NODE_CONFIRMATION"
//     },
//     {
//       "nodeId": "NODE_CONFIRMATION",
//       "type": "END",
//       "messageText": "✨ *APPOINTMENT CONFIRMATION REQUEST*\n───────────────────────────\n\n👤 *Patient Name:* {{patient_name}}\n🎂 *Age:* {{patient_age}} Years\n📍 *Branch:* {{selected_branch_name}}\n🩺 *Department:* {{selected_dept_name}}\n👨‍⚕️ *Doctor:* {{selected_doctor_name}}\n📅 *Date:* {{appointment_date}}\n⏰ *Time Slot:* {{NODE_FETCH_SLOTS}}\n\n───────────────────────────\n📞 *Note:* Hamari reception desk jald hi aapko token confirmation ke liye call karegi.\n\nThank you for choosing *Sr Kalla Hospital*! 🙏"
//     },
//     {
//       "nodeId": "NODE_CALLBACK_CONFIRMATION",
//       "type": "END",
//       "messageText": "📞 *CALLBACK REQUEST RECEIVED*\n───────────────────────────\nHamari patient support team ke executive jald hi aap se is number par sampark karenge.\n\n───────────────────────────\nEmergency assistance ke liye hospital direct helpline par call karein.\n\nThank you for contacting *Sr Kalla Hospital*! 🙏"
//     }
//   ]
// }


export const getLeads = async (req, res) => {
    try {
        // const { hospitalId } = req.params;
        const { page = 1, limit = 10, status, leadType, search, hospitalId } = req.query;

        console.log("req.paramas", req.params);
        console.log("req.paramas", req.query);


        if (!hospitalId) {
            return res.status(400).json({ success: false, message: "Hospital ID is required" });
        }

        // 1. Fetch Hospital to get trimmedName for Tenant DB Connection
        const hospital = await HospitalModel.findById(hospitalId).select("trimmedName").lean();
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }

        // 2. Connect to Tenant DB
        const conn = await getConnection(hospital.trimmedName);
        const LeadModel = getLeadModel(conn);
        // const DoctorModel = getDoctorModel(conn)
        // const DepartmentModel = getDepartmentModel(conn)

        // 3. Build Query Filters
        const query = {};

        if (status) query.leadStatus = status;
        if (leadType) query.leadType = leadType;

        if (search) {
            query.$or = [
                { patientName: { $regex: search, $options: "i" } },
                { patientPhoneNumber: { $regex: search, $options: "i" } },
                { departmentName: { $regex: search, $options: "i" } },
                { doctorName: { $regex: search, $options: "i" } }
            ];
        }

        // 4. Execute Paginated Fetch
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const leads = await LeadModel.find(query)
            .sort({ createdAt: -1 })
            .populate({
                path: "doctorName",
                model: getDoctorModel(conn), // Multi-tenant Doctor Model
                select: "name",
                match: { _id: { $exists: true } }
            })
            .populate({
                path: "departmentName",
                model: getDepartmentModel(conn), // Multi-tenant Department Model
                select: "name",
                match: { _id: { $exists: true } }
            })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalLeads = await LeadModel.countDocuments(query);

        return res.status(200).json({
            success: true,
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: parseInt(page),
            data: leads
        });
    } catch (error) {
        console.error("Get Leads Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leads",
            error: error.message
        });
    }
};

export const updateLeadStatus = async (req, res) => {
    try {
        const { leadId, hospitalId } = req.query;
        const { leadStatus, rejectReason } = req.body;

        console.log("aa", req.body);
        console.log("aa", req.params);
        console.log("aa", req.query);

        // 1. Basic Parameter Validation
        if (!leadId || !hospitalId || !leadStatus) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: leadId, hospitalId, and leadStatus are required."
            });
        }

        // 2. Validate MongoDB ObjectIds
        if (!mongoose.isValidObjectId(leadId) || !mongoose.isValidObjectId(hospitalId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leadId or hospitalId format."
            });
        }

        // 3. Validate Allowed Enum Values for leadStatus
        const allowedStatuses = ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"];
        const normalizedStatus = leadStatus.toUpperCase().trim();

        if (!allowedStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid leadStatus value. Must be one of: ${allowedStatuses.join(", ")}`
            });
        }

        // 4. Resolve Tenant Hospital Record
        const hospital = await HospitalModel.findOne({
            _id: hospitalId,
            isDeleted: false
        }).lean();

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital tenant record not found."
            });
        }

        // 5. Connect to Multi-tenant Database Connection
        const tenantConnection = await getConnection(hospital.trimmedName);
        const LeadModel = getLeadModel(tenantConnection);

        let updatePayload = {
            leadStatus: normalizedStatus
        };

        // Add rejectReason to update payload if present
        if (rejectReason && rejectReason.trim() !== "") {
            updatePayload.rejectionReason = rejectReason.trim();
        }

        // 2. Find and Update Lead Status using hospitalId scoping for multi-tenancy
        const updatedLead = await LeadModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(leadId),
                hospitalId: new mongoose.Types.ObjectId(hospitalId)
            },
            {
                $set: updatePayload
            },
            { new: true, runValidators: true }
        )
            // .populate({ path: "departmentName", select: "name" })
            // .populate({ path: "doctorName", select: "name specialization" })
            .lean();

        if (!updatedLead) {
            return res.status(404).json({
                success: false,
                message: "Lead record not found for the given hospitalId."
            });
        }

        console.log(`[Lead Status Updated] Lead ID: ${leadId} | New Status: ${normalizedStatus} | Hospital: ${hospital.trimmedName}`);

        // 7. Send Success Response
        return res.status(200).json({
            success: true,
            message: `Lead status successfully updated to ${normalizedStatus}`,
            data: updatedLead
        });

    } catch (error) {
        console.error("[updateLeadStatus Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating lead status.",
            error: error.message
        });
    }
};