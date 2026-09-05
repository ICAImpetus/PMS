import axios from "axios";

import {
    getHospitalModel, MasterConn,
    getWhatsAppAccountModel,
    getWhatsAppFlowModel,
    getPatientStateModel, getConnection
} from '../utils/db.manager.js';
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
    // 1. Meta Webhook Acknowledgment
    res.status(200).send("EVENT_RECEIVED");

    try {
        const change = req.body.entry?.[0]?.changes?.[0]?.value;
        if (!change?.messages?.[0]) return;

        const incomingMsg = change.messages[0];
        const recipientPhoneId = change.metadata.phone_number_id;
        const patientNumber = incomingMsg.from;

        console.log(`[Webhook] Incoming message from ${patientNumber} for Phone ID: ${recipientPhoneId}`);

        // 2. Fetch Hospital Tenant
        const hospital = await HospitalModel.findOne({
            whatsAppPhoneNumberId: recipientPhoneId,
            isDeleted: false
        }).lean();

        if (!hospital) {
            console.error(`[Webhook Error] No hospital matched for phone ID: ${recipientPhoneId}`);
            return;
        }

        // 3. Multi-tenant DB Models
        const conn = await getConnection(hospital.trimmedName);
        const NodeModel = getWhatsAppFlowModel(conn);
        const StateModel = getPatientStateModel(conn);
        const WAAccountModel = getWhatsAppAccountModel(conn);

        // Fetch WhatsApp Account credentials
        const waAccount = await WAAccountModel.findOne({
            hospitalId: hospital._id,
            phoneNumberId: recipientPhoneId,
            isConnected: true
        }).lean();

        if (!waAccount) {
            console.error(`[Webhook Error] Active WhatsApp Account credentials not found for hospital: ${hospital.trimmedName}`);
            return;
        }

        // 4. Fetch or Init Patient Session State
        let session = await StateModel.findOne({ patientPhoneNumber: patientNumber });
        if (!session) {
            session = await StateModel.create({
                patientPhoneNumber: patientNumber,
                hospitalId: hospital._id,
                currentNodeId: "START_NODE",
                context: {}
            });
        }

        // 5. TRIGGER MATCHING LOGIC
        const userMessage = incomingMsg.type === "text" ? incomingMsg.text.body.trim().toLowerCase() : "";
        const defaultTriggers = ["hi", "hii", "hello", "menu", "start", "namaste"];

        if (incomingMsg.type === "text" && defaultTriggers.includes(userMessage)) {
            console.log(`[Webhook] Trigger keyword '${userMessage}' matched. Resetting session to START_NODE.`);

            // Session Reset
            session.currentNodeId = "START_NODE";
            session.context = new Map();
            await session.save();

            // Fetch START_NODE document from Single Node Collection
            const startNode = await NodeModel.findOne({
                hospitalId: hospital._id,
                nodeId: "START_NODE"
            }).lean();

            if (startNode) {
                await renderNode({
                    node: startNode,
                    waAccount,
                    recipientPhoneId,
                    patientNumber
                });
            } else {
                console.error(`[Webhook Error] START_NODE document not found in DB for hospital: ${hospital.trimmedName}`);
            }
            return;
        }

        // 6. FETCH CURRENT ACTIVE NODE
        const currentNode = await NodeModel.findOne({
            hospitalId: hospital._id,
            nodeId: session.currentNodeId
        }).lean();

        if (!currentNode) {
            console.error(`[Webhook Error] Current Node '${session.currentNodeId}' not found.`);
            return;
        }

        let targetNextNodeId = null;

        console.log(`[Webhook] Current Node:incomingMsg.type ${incomingMsg.type} ${currentNode.nodeId}, Type: ${currentNode.type}`);
        // CASE A: Interactive List or Button Response
        if (incomingMsg.type === "interactive") {
            const selectedOptionId = incomingMsg.interactive.list_reply?.id || incomingMsg.interactive.button_reply?.id;
            const matchedOption = currentNode.options?.find(opt => opt.optionId === selectedOptionId);

            console.log(`[Webhook] Matched Option: ${matchedOption?.matchedOption}`);
            console.log(`[Webhook] Matched Option: ${JSON.stringify(incomingMsg.interactive)}`);
            if (matchedOption) {
                session.context.set(currentNode.nodeId, matchedOption.title);
                targetNextNodeId = matchedOption.nextNodeId;
            }
        }
        // CASE B: User Text Input
        else if (incomingMsg.type === "text" && currentNode.type === "TEXT_INPUT") {
            if (currentNode.inputVariable) {
                session.context.set(currentNode.inputVariable, incomingMsg.text.body.trim());
            }
            targetNextNodeId = currentNode.nextNodeId;
        }

        console.log("targetNextNodeId", targetNextNodeId);
        // 7. EXECUTE NEXT TARGET NODE
        if (targetNextNodeId) {
            session.currentNodeId = targetNextNodeId;
            await session.save();

            const nextNodeDoc = await NodeModel.findOne({
                hospitalId: hospital._id,
                nodeId: targetNextNodeId
            }).lean();

            console.log("nextNodeDoc", nextNodeDoc);

            if (nextNodeDoc) {
                await renderNode({
                    node: nextNodeDoc,
                    waAccount,
                    recipientPhoneId,
                    patientNumber,
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
async function renderNode({ node, waAccount, recipientPhoneId, patientNumber, context }) {
    try {
        let textBody = node.messageText;

        // Variable Interpolation (e.g., {{appointment_date}})
        if (context) {
            for (const [key, val] of context.entries()) {
                textBody = textBody.replace(new RegExp(`{{${key}}}`, 'g'), val);
            }
        }

        if (node.type === "INTERACTIVE_LIST") {
            await axios.post(
                `https://graph.facebook.com/v20.0/${recipientPhoneId}/messages`,
                {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: patientNumber,
                    type: "interactive",
                    interactive: {
                        type: "list",
                        header: { type: "text", text: "Menu Options" },
                        body: { text: textBody },
                        footer: { text: "Select an option below" },
                        action: {
                            button: "Choose Option",
                            sections: [
                                {
                                    title: "Options",
                                    rows: node.options.map(opt => ({
                                        id: opt.optionId,
                                        title: opt.title,
                                        description: opt.description || ""
                                    }))
                                }
                            ]
                        }
                    }
                },
                {
                    headers: { Authorization: `Bearer ${waAccount.accessToken}` }
                }
            );
        } else if (node.type === "TEXT_INPUT" || node.type === "END") {
            await axios.post(
                `https://graph.facebook.com/v20.0/${recipientPhoneId}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: patientNumber,
                    text: { body: textBody }
                },
                {
                    headers: { Authorization: `Bearer ${waAccount.accessToken}` }
                }
            );
        }
        console.log(`[Webhook] Reply successfully sent to ${patientNumber}`);
    } catch (apiError) {
        console.error("[Meta API Send Error]:", apiError.response?.data || apiError.message);
    }
}
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