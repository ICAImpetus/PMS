import axios from "axios";

import {
    getHospitalModel, MasterConn,
    getWhatsAppAccountModel,
    getWhatsAppNodeModel,
    getPatientStateModel, getConnection,
    getMessageModel,
    getLeadModel,
    getBranchModel
} from '../utils/db.manager.js';
import { getCachedNode, invalidateHospitalNodeCache, interpolateTemplate } from '../utils/nodeCache.js';
import mongoose from "mongoose";
import { fetchDepartmentsFromDb, fetchDoctorsFromDb, generateNext7DaysOptions, handleCentralizedDbSlots, renderNode, resolveHospitalBranches, saveChatMessage } from "../utils/whatsAppHelperFuntions.js";

const HospitalModel = getHospitalModel(MasterConn)


export const connectWhatsApp = async (req, res) => {
    let session = null;
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
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // 5. FETCH PHONE NUMBER & DISPLAY NAME
        const phoneDetailsResponse = await axios.get(
            `https://graph.facebook.com/v20.0/${phoneNumberId}`,
            {
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
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            console.log("Phone Number successfully registered on WhatsApp Cloud API");
        } catch (regError) {
            console.error("Registration Error:", regError.response?.data || regError.message);
        }

        // ==========================================
        // 9. START DATABASE TRANSACTION FOR ATOMIC SAVES
        // ==========================================
        session = await mongoose.startSession();
        session.startTransaction();

        // Central Model DB Update (Pass session)
        await HospitalModel.findByIdAndUpdate(
            hospitalId,
            { whatsAppPhoneNumberId: phoneNumberId },
            { session }
        );

        // Tenant Model DB Update (Pass session)
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
            { upsert: true, new: true, runValidators: true, session }
        );

        // Commit transaction if both DB updates succeeded
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'WhatsApp Business API connected, registered, and DB updated successfully!',
            whatsappAccount
        });

    } catch (error) {
        // Rollback DB changes if session active
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

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

        // 3. Extract Message & Lead Source Tracking (Ads / Website / Direct)
        const msgType = incomingMsg.type;
        let inboundText = "";
        let leadSource = "WHATSAPP_DIRECT"; // Default Source

        // Identify Meta Ad Referral Source
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

        // Debug Log Current Context
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
                    hospitalId: hospital._id
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

            // 0. GLOBAL CALLBACK ESCAPE INTERCEPTOR (Mid-Flow Call Executive Support)
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
                    leadType: "CALLBACK_REQUEST",
                    source: contextObj.source || "WHATSAPP_DIRECT",
                    leadStatus: "NEW"
                });

                await renderNode({
                    node: callbackNode || {
                        type: "END",
                        messageText: "📞 *CALLBACK REQUEST RECEIVED*\n───────────────────────────\nHamari patient support team ke executive jald hi aap se is number par sampark karenge.\n\nThank you for contacting *Sr Kalla Hospital*! 🙏"
                    },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context
                });
                return;
            }

            // 1. DYNAMIC PREFIX MATCHING (Handles DB-Driven Options & Dynamic Dates)
            if (selectedOptionId.startsWith("BRANCH_")) {
                const cleanBranchId = selectedOptionId.replace("BRANCH_", "").trim();
                session.context.set("selected_branch_id", cleanBranchId);
                session.context.set("selected_branch_name", selectedTitle);
                session.context.set("NODE_SELECT_BRANCH", selectedTitle);

                targetNextNodeId = "NODE_SELECT_DEPT";
                console.log(`[Webhook Debug Dynamic] Branch Selected -> ID: '${cleanBranchId}' | Name: '${selectedTitle}' -> Next Node: '${targetNextNodeId}'`);
            }
            else if (selectedOptionId.startsWith("DEPT_")) {
                const cleanDeptId = selectedOptionId.replace("DEPT_", "").trim();
                session.context.set("selected_dept_id", cleanDeptId);
                session.context.set("selected_dept_name", selectedTitle);
                session.context.set("NODE_SELECT_DEPT", selectedTitle);

                targetNextNodeId = "NODE_SELECT_DOC";
                console.log(`[Webhook Debug Dynamic] Department Selected -> ID: '${cleanDeptId}' | Name: '${selectedTitle}' -> Next Node: '${targetNextNodeId}'`);
            }
            else if (selectedOptionId.startsWith("DOC_")) {
                const cleanDocId = selectedOptionId.replace("DOC_", "").trim();
                session.context.set("selected_doctor_id", cleanDocId);
                session.context.set("selected_doctor_name", selectedTitle);
                session.context.set("NODE_SELECT_DOC", selectedTitle);

                targetNextNodeId = "NODE_ASK_PATIENT_NAME";
                console.log(`[Webhook Debug Dynamic] Doctor Selected -> ID: '${cleanDocId}' | Name: '${selectedTitle}' -> Next Node: '${targetNextNodeId}'`);
            }
            else if (selectedOptionId.startsWith("DATE_")) {
                const cleanDate = selectedOptionId.replace("DATE_", "").trim();
                session.context.set("appointment_date", cleanDate);
                session.context.set("NODE_SELECT_DATE", selectedTitle);

                targetNextNodeId = "NODE_FETCH_SLOTS";
                console.log(`[Webhook Debug Dynamic] Date Selected -> Date: '${cleanDate}' | Label: '${selectedTitle}' -> Next Node: '${targetNextNodeId}'`);
            }
            else if (selectedOptionId.startsWith("SLOT_")) {
                const cleanSlotId = selectedOptionId.replace("SLOT_", "").trim();
                session.context.set("selected_slot_id", cleanSlotId);
                session.context.set("NODE_FETCH_SLOTS", selectedTitle);

                targetNextNodeId = "NODE_CONFIRMATION";
                console.log(`[Webhook Debug Dynamic] Slot Selected -> ID: '${cleanSlotId}' | Time: '${selectedTitle}' -> Next Node: '${targetNextNodeId}'`);
            }
            // 2. STATIC OPTIONS MATCHING (Handles Nodes with hardcoded options in DB)
            else {
                let matchedOption = currentNode.options?.find(opt => opt.optionId === selectedOptionId);
                let activeNode = currentNode;

                // Global Node Sync Fallback
                if (!matchedOption) {
                    console.log(`[Webhook Debug] Option '${selectedOptionId}' not found in node '${currentNode.nodeId}'. Performing global query...`);
                    const globalMatchedNode = await NodeModel.findOne({
                        hospitalId: hospital._id,
                        "options.optionId": selectedOptionId
                    }).lean();

                    if (globalMatchedNode) {
                        activeNode = globalMatchedNode;
                        matchedOption = globalMatchedNode.options.find(opt => opt.optionId === selectedOptionId);
                        session.currentNodeId = globalMatchedNode.nodeId;
                        console.log(`[Webhook Debug Auto-Correct] Synced session active node to '${globalMatchedNode.nodeId}'.`);
                    }
                }

                if (matchedOption) {
                    // Save context using Node ID as Key
                    session.context.set(activeNode.nodeId, selectedTitle);
                    console.log(`[Webhook Debug] Saved Context -> Key: '${activeNode.nodeId}' = Value: '${selectedTitle}'`);

                    // --- BRANCH CHECK ROUTING (Before Dept Selection) ---
                    if (selectedOptionId === "OPT_BOOK_APPOINTMENT") {
                        console.log(`[Webhook Debug] Checking hospital branches...`);
                        const branchData = await resolveHospitalBranches({ tenantConnection: conn, hospitalId: hospital._id });
                        console.log(`[Webhook Debug] Branch Resolution Result:`, JSON.stringify(branchData, null, 2));

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
                                waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context
                            });
                            return;
                        } else if (branchData.singleBranch) {
                            session.context.set("selected_branch_name", branchData.singleBranch.branchName);
                            session.context.set("selected_branch_id", branchData.singleBranch._id.toString());
                            console.log(`[Webhook Debug] Auto-selected Single Branch: '${branchData.singleBranch.branchName}'`);
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
        // CASE B: TEXT INPUTS (Patient Name, Age)
        // =========================================================================
        else if (msgType === "text" && currentNode.type === "TEXT_INPUT") {
            const userInputValue = incomingMsg.text.body.trim();
            if (currentNode.inputVariable) {
                session.context.set(currentNode.inputVariable, userInputValue);
                console.log(`[Webhook Debug] Captured Text Input -> Variable: '${currentNode.inputVariable}' = Value: '${userInputValue}'`);
            }
            targetNextNodeId = currentNode.nextNodeId;
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

            // --- TYPE 1: DYNAMIC DEPARTMENT LOOKUP FROM MONGO DB ---
            if (nextNodeDoc.nodeId === "NODE_SELECT_DEPT") {
                console.log("[Webhook Debug] Fetching Departments dynamically from DB...");
                const { hasData, options } = await fetchDepartmentsFromDb({
                    tenantConnection: conn,
                    hospitalId: hospital._id,
                    context: session.context
                });

                console.log(`[Webhook Debug] Departments Fetched -> Has Data: ${hasData} | Count: ${options.length}`);

                if (!hasData) {
                    await renderNode({
                        node: { type: "END", messageText: "⚠️ Abhi koi department available nahi hai. Reset karne ke liye *hi* type karein." },
                        waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id
                    });
                    return;
                }

                await renderNode({
                    node: { ...nextNodeDoc, type: options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST", options },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context
                });
                return;
            }

            // --- TYPE 2: DYNAMIC DOCTOR LOOKUP FROM MONGO DB ---
            if (nextNodeDoc.nodeId === "NODE_SELECT_DOC") {
                console.log("[Webhook Debug] Fetching Doctors dynamically from DB...");
                const { hasData, options } = await fetchDoctorsFromDb({
                    tenantConnection: conn,
                    hospitalId: hospital?._id,
                    context: session.context
                });

                console.log(`[Webhook Debug] Doctors Fetched -> Has Data: ${hasData} | Count: ${options.length}`);

                if (!hasData) {
                    await renderNode({
                        node: { type: "END", messageText: "⚠️ Selected department ke liye koi doctor available nahi hai. Wapas start karne ke liye *hi* type karein." },
                        waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id
                    });
                    return;
                }

                await renderNode({
                    node: { ...nextNodeDoc, type: options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST", options },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context
                });
                return;
            }

            // --- TYPE 3: DYNAMIC NEXT 7 DAYS DATE SELECTION MENU ---
            if (nextNodeDoc.nodeId === "NODE_SELECT_DATE") {
                console.log("[Webhook Debug] Generating Dynamic Next 7 Days Date Options...");
                const dateOptions = generateNext7DaysOptions();

                await renderNode({
                    node: { ...nextNodeDoc, type: "INTERACTIVE_LIST", options: dateOptions },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context
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

                console.log(`[Webhook Debug] Slots Fetched -> Has Data: ${hasData} | Count: ${options.length}`);

                if (!hasData) {
                    await renderNode({
                        node: { type: "END", messageText: "⚠️ Selected doctor/date par koi slot available nahi hai. Reset karne ke liye *hi* type karein." },
                        waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id
                    });
                    return;
                }

                await renderNode({
                    node: { ...nextNodeDoc, type: options.length <= 3 ? "REPLY_BUTTONS" : "INTERACTIVE_LIST", options },
                    waAccount, recipientPhoneId, patientNumber, tenantConnection: conn, hospitalId: hospital._id, context: session.context
                });
                return;
            }

            // --- TYPE 5: FINAL CONFIRMATION & LEAD CREATION (END NODE) ---
            if (nextNodeDoc.type === "END") {
                const contextObj = session.context instanceof Map
                    ? Object.fromEntries(session.context)
                    : (session.context || {});

                console.log("[Webhook Debug] Executing END Node. Final Context State:", JSON.stringify(contextObj, null, 2));

                // A. APPOINTMENT BOOKING LEAD CREATION
                if (session.context.get("START_NODE")?.includes("Appointment") || contextObj.appointment_date) {
                    console.log("[Webhook Debug] Creating Lead Document: APPOINTMENT_BOOKING...");
                    const createdLead = await LeadModel.create({
                        hospitalId: hospital._id,
                        patientName: contextObj.patient_name || "Patient",
                        patientPhoneNumber: patientNumber,
                        patientAge: contextObj.patient_age || "",
                        leadType: "APPOINTMENT_BOOKING",
                        departmentName: contextObj.selected_dept_name || contextObj.NODE_SELECT_DEPT || "",
                        doctorName: contextObj.selected_doctor_name || contextObj.NODE_SELECT_DOC || "",
                        appointmentDate: contextObj.appointment_date || "",
                        appointmentSlot: contextObj.NODE_FETCH_SLOTS || "",
                        branchName: contextObj.selected_branch_name || "",
                        source: contextObj.source || "WHATSAPP_DIRECT",
                        leadStatus: "NEW"
                    });
                    console.log(`[Webhook Debug Success] Appointment Lead Created ID: ${createdLead._id}`);
                }
                // B. CALLBACK SUPPORT LEAD CREATION
                else if (session.context.get("START_NODE")?.includes("Callback")) {
                    console.log("[Webhook Debug] Creating Lead Document: CALLBACK_REQUEST...");
                    const newLead = await LeadModel.create({
                        hospitalId: hospital._id,
                        patientName: contextObj.patient_name || "Enquirer",
                        patientPhoneNumber: patientNumber,
                        leadType: "CALLBACK_REQUEST",
                        source: contextObj.source || "WHATSAPP_DIRECT",
                        leadStatus: "NEW"
                    });
                    console.log(`[Webhook Debug Success] Callback Lead Created ID: ${newLead._id}`);
                }
            }

            // Render Standard Node (Interactive List, Buttons, Text Input, Confirmation)
            console.log(`[Webhook Debug] Invoking renderNode for '${nextNodeDoc.nodeId}'...`);
            await renderNode({
                node: nextNodeDoc,
                waAccount,
                recipientPhoneId,
                patientNumber,
                tenantConnection: conn,
                hospitalId: hospital._id,
                context: session.context
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
        const hospital = await HospitalModel.findById("6a8d6e97049af6500e262fa7").select("trimmedName").lean();
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