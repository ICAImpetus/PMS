import axios from "axios";

import {
    getHospitalModel, MasterConn,
    getWhatsAppAccountModel,
    getWhatsAppFlowModel,
    getPatientStateModel, getConnection,
    getMessageModel
} from '../utils/db.manager.js';
import { getCachedNode, invalidateHospitalNodeCache, interpolateTemplate } from '../utils/nodeCache.js';
import mongoose from "mongoose";

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

        console.log(`[Webhook] Incoming message from ${patientNumber} for Phone ID: ${recipientPhoneId}`);

        // 2. Fetch Tenant Hospital
        const hospital = await HospitalModel.findOne({
            whatsAppPhoneNumberId: recipientPhoneId,
            isDeleted: false
        }).lean();

        if (!hospital) {
            console.error(`[Webhook Error] No hospital matched for phone ID: ${recipientPhoneId}`);
            return;
        }

        // Get Multi-tenant DB Models
        const conn = await getConnection(hospital.trimmedName);
        const NodeModel = getWhatsAppFlowModel(conn);
        const StateModel = getPatientStateModel(conn);
        const WAAccountModel = getWhatsAppAccountModel(conn);

        // Extract Inbound Content & Type
        let inboundText = "";
        const msgType = incomingMsg.type;

        if (msgType === "text") {
            inboundText = incomingMsg.text.body;
        } else if (msgType === "interactive") {
            inboundText = incomingMsg.interactive.list_reply?.title || incomingMsg.interactive.button_reply?.title || "Interactive Option Selected";
        } else {
            inboundText = `[Media Message: ${msgType}]`;
        }

        // =========================================================================
        // STEP A: SAVE INBOUND MESSAGE FIRST (Guaranteed Storage)
        // =========================================================================
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

        // Fetch WhatsApp Account credentials
        const waAccount = await WAAccountModel.findOne({
            hospitalId: hospital._id,
            phoneNumberId: recipientPhoneId,
            isConnected: true
        }).lean();

        if (!waAccount) {
            console.error(`[Webhook Error] Active WhatsApp Account credentials missing for: ${hospital.trimmedName}`);
            return;
        }

        // 3. Fetch / Init Patient Session State
        let session = await StateModel.findOne({ patientPhoneNumber: patientNumber });
        if (!session) {
            session = await StateModel.create({
                patientPhoneNumber: patientNumber,
                hospitalId: hospital._id,
                currentNodeId: "START_NODE",
                context: {}
            });
        }

        // 4. TRIGGER MATCHING LOGIC ("hi", "hello", "menu")
        const userMessage = msgType === "text" ? incomingMsg.text.body.trim().toLowerCase() : "";
        const defaultTriggers = ["hi", "hii", "hello", "menu", "start", "namaste"];

        if (msgType === "text" && defaultTriggers.includes(userMessage)) {
            console.log(`[Webhook] Trigger keyword '${userMessage}' matched. Resetting session to START_NODE.`);

            session.currentNodeId = "START_NODE";
            session.context = new Map();
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
                console.error(`[Webhook Error] START_NODE document not found in DB for hospital: ${hospital.trimmedName}`);
            }
            return;
        }

        // 5. FETCH CURRENT ACTIVE NODE FROM CACHE
        const currentNode = await getCachedNode(NodeModel, hospital._id, session.currentNodeId);

        if (!currentNode) {
            console.error(`[Webhook Error] Current Node '${session.currentNodeId}' not found.`);
            return;
        }

        let targetNextNodeId = null;

        // CASE A: Interactive List or Button Response
        if (msgType === "interactive") {
            const selectedOptionId = incomingMsg.interactive.list_reply?.id || incomingMsg.interactive.button_reply?.id;

            let matchedOption = currentNode.options?.find(opt => opt.optionId === selectedOptionId);
            let activeNode = currentNode;

            // Fallback: Global search across all nodes if session out-of-sync
            if (!matchedOption) {
                const globalMatchedNode = await NodeModel.findOne({
                    hospitalId: hospital._id,
                    "options.optionId": selectedOptionId
                }).lean();

                if (globalMatchedNode) {
                    activeNode = globalMatchedNode;
                    matchedOption = globalMatchedNode.options.find(opt => opt.optionId === selectedOptionId);
                    session.currentNodeId = globalMatchedNode.nodeId;
                    console.log(`[Webhook Auto-Correct] Re-synced active node to: ${globalMatchedNode.nodeId}`);
                }
            }

            if (matchedOption) {
                session.context.set(activeNode.nodeId, matchedOption.title);
                targetNextNodeId = matchedOption.nextNodeId;
            } else {
                console.warn(`[Webhook Warning] Option ID '${selectedOptionId}' not found in any registered node.`);
            }
        }
        // CASE B: User Text Input
        else if (msgType === "text" && currentNode.type === "TEXT_INPUT") {
            if (currentNode.inputVariable) {
                session.context.set(currentNode.inputVariable, incomingMsg.text.body.trim());
            }
            targetNextNodeId = currentNode.nextNodeId;
        }

        console.log("msgType", msgType);
        console.log("targetNextNodeId", targetNextNodeId);

        // 6. EXECUTE NEXT TARGET NODE
        if (targetNextNodeId) {
            session.currentNodeId = targetNextNodeId;
            await session.save();

            const nextNodeDoc = await getCachedNode(NodeModel, hospital._id, targetNextNodeId);
            console.log("nextNodeDoc", nextNodeDoc);
            console.log("session.context", session.context);

            if (nextNodeDoc) {
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
        }

    } catch (err) {
        console.error("Webhook Handling Exception:", err);
    }
};

/**
 * Universal Node Render Helper (Meta API Post Request)
 */
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

const saveChatMessage = async ({
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
        const NodeModel = getWhatsAppFlowModel(conn);

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