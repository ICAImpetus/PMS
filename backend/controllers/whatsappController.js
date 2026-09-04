import axios from "axios";

import {
    getHospitalModel, MasterConn,
    getWhatsAppAccountModel,
    getWhatsAppFlowModel,
    getPatientStateModel, getConnection
} from '../utils/db.manager.js';
import mongoose from "mongoose";
/**
 * @desc    Connect WhatsApp Account via Meta Embedded Signup Code
 * @route   POST /api/whatsapp/connect-whatsapp
 */

const HospitalModel = getHospitalModel(MasterConn)
import mongoose from 'mongoose';
import axios from 'axios';

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


// controllers/webhookController.js

export const handleWebhook = async (req, res) => {
    res.status(200).send("EVENT_RECEIVED");

    try {
        const change = req.body.entry?.[0]?.changes?.[0]?.value;
        if (!change?.messages?.[0]) return;

        const incomingMsg = change.messages[0];
        const recipientPhoneId = change.metadata.phone_number_id;
        const patientNumber = incomingMsg.from;

        // 1. Fetch Hospital Tenant
        const hospital = await HospitalModel.findOne({ whatsAppPhoneNumberId: recipientPhoneId }).lean();
        if (!hospital) return;

        const conn = await getConnection(hospital.trimmedName);
        const FlowModel = getWhatsAppFlowModel(conn);
        const StateModel = getPatientStateModel(conn);
        const WAAccountModel = getWhatsAppAccountModel(conn);

        const [flowConfig, waAccount] = await Promise.all([
            FlowModel.findOne({ hospitalId: hospital._id, isActive: true }).lean(),
            WAAccountModel.findOne({ hospitalId: hospital._id, phoneNumberId: recipientPhoneId }).lean()
        ]);

        if (!flowConfig || !waAccount) return;

        // Fetch / Init Patient Session
        let session = await StateModel.findOne({ patientPhoneNumber: patientNumber });
        if (!session) {
            session = await StateModel.create({
                patientPhoneNumber: patientNumber,
                hospitalId: hospital._id,
                currentNodeId: "START_NODE",
                context: {}
            });
        }

        // 2. TRIGGER RESET (e.g., "hi", "menu", "start")
        if (incomingMsg.type === "text" && incomingMsg.text.body.trim().toLowerCase() === flowConfig.triggerKeyword) {
            session.currentNodeId = "START_NODE";
            session.context = new Map();
            await session.save();

            // Render First Node dynamically
            await renderNode({
                nodeId: "START_NODE",
                flowConfig,
                waAccount,
                recipientPhoneId,
                patientNumber
            });
            return;
        }

        // Fetch Current Active Node from Graph
        const currentNode = flowConfig.nodes.find(n => n.nodeId === session.currentNodeId);
        if (!currentNode) return;

        let targetNextNodeId = null;

        // 3. CASE A: User selected option from Interactive Menu/Buttons
        if (incomingMsg.type === "interactive") {
            const selectedOptionId = incomingMsg.interactive.list_reply?.id || incomingMsg.interactive.button_reply?.id;
            const matchedOption = currentNode.options?.find(opt => opt.optionId === selectedOptionId);

            if (matchedOption) {
                // Save selected title into session context dynamically
                session.context.set(currentNode.nodeId, matchedOption.title);
                targetNextNodeId = matchedOption.nextNodeId;
            }
        }
        // 4. CASE B: User provided Text Input (e.g., Date, Name, Symptoms)
        else if (incomingMsg.type === "text" && currentNode.type === "TEXT_INPUT") {
            const userInput = incomingMsg.text.body.trim();

            // Save input value to key name defined in DB Node
            if (currentNode.inputVariable) {
                session.context.set(currentNode.inputVariable, userInput);
            }
            targetNextNodeId = currentNode.nextNodeId;
        }

        // 5. EXECUTE NEXT NODE IN GRAPH
        if (targetNextNodeId) {
            session.currentNodeId = targetNextNodeId;
            await session.save();

            // Render Next Target Node
            await renderNode({
                nodeId: targetNextNodeId,
                flowConfig,
                waAccount,
                recipientPhoneId,
                patientNumber,
                context: session.context
            });
        }

    } catch (err) {
        console.error("Scalable Engine Execution Error:", err.message);
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
async function renderNode({ nodeId, flowConfig, waAccount, recipientPhoneId, patientNumber, context }) {
    const node = flowConfig.nodes.find(n => n.nodeId === nodeId);
    if (!node) return;

    // Dynamic Variable Replacement (e.g. "Hello {{patient_name}}, choose date")
    let renderedText = node.messageText;
    if (context) {
        for (const [key, val] of context.entries()) {
            renderedText = renderedText.replace(new RegExp(`{{${key}}}`, 'g'), val);
        }
    }

    // Render Interactive List Node
    if (node.type === "INTERACTIVE_LIST") {
        await sendInteractiveListMessage({
            phoneNumberId: recipientPhoneId,
            accessToken: waAccount.accessToken,
            recipientPhone: patientNumber,
            welcomeText: renderedText,
            buttonText: "Choose Option",
            sections: [{
                title: "Menu",
                rows: node.options.map(opt => ({
                    id: opt.optionId,
                    title: opt.title,
                    description: opt.description || ""
                }))
            }]
        });
    }
    // Render Plain Text / Input Prompt Node
    else if (node.type === "TEXT_INPUT" || node.type === "END") {
        await sendTextMessage({
            phoneNumberId: recipientPhoneId,
            accessToken: waAccount.accessToken,
            recipientPhone: patientNumber,
            messageText: renderedText
        });
    }
}