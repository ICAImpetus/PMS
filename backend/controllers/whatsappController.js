import axios from "axios";

import { getHospitalModel, MasterConn, getWhatsAppAccountModel, getConnection } from '../utils/db.manager.js';
import mongoose from "mongoose";
/**
 * @desc    Connect WhatsApp Account via Meta Embedded Signup Code
 * @route   POST /api/whatsapp/connect-whatsapp
 */

const HospitalModel = getHospitalModel(MasterConn)
export const connectWhatsApp = async (req, res) => {
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

        // 2. Multi-tenant database connection
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

        // 6. FETCH WHATSAPP BUSINESS PROFILE DATA (Profile Pic, Description, Address, Email, Websites)
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

        // Token exchange aur Subscribed Apps ke baad call karein
        try {
            await axios.post(
                `https://graph.facebook.com/v20.0/${phoneNumberId}/register`,
                {
                    messaging_product: 'whatsapp',
                    pin: '123456' // 6-digit security PIN
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            console.log("Phone Number successfully registered on WhatsApp Cloud API");
        } catch (regError) {
            console.error("Registration Error:", regError.response?.data || regError.message);
        }

        // 8. Save/Update complete details in DB
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
            message: 'WhatsApp Business API connected, profile fetched, and Webhook subscribed successfully!',
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
/**
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
export const handleWebhook = async (req, res) => {
    const body = req.body;

    console.log('Webhook Event Received:', JSON.stringify(body, null, 2)); // Debugging ke liye log karein
    if (body.object === 'whatsapp_business_account') {
        res.sendStatus(200); // Fast acknowledgment to Meta

        try {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value;

                    if (value.messages && value.messages[0]) {
                        const incomingMsg = value.messages[0];
                        const phoneNumberId = value.metadata.phone_number_id;
                        const patientNumber = incomingMsg.from;
                        const incomingText = incomingMsg.text?.body || '';

                        // 1. Find Hospital Account
                        const account = await whatsAppAccountModel.findOne({ phoneNumberId });
                        if (!account) continue;

                        // 2. Save Inbound Message
                        await Message.create({
                            hospitalId: account.hospitalId,
                            phoneNumberId,
                            patientPhoneNumber: patientNumber,
                            direction: 'INBOUND',
                            content: incomingText,
                            metaMessageId: incomingMsg.id,
                            status: 'received'
                        });

                        // 3. Automated Response
                        const replyText = "Hello! Welcome to our Hospital WhatsApp Service. How can we help you today?";
                        const sendRes = await axios.post(
                            `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
                            {
                                messaging_product: 'whatsapp',
                                to: patientNumber,
                                text: { body: replyText }
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${account.accessToken}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        // 4. Save Outbound Message
                        await Message.create({
                            hospitalId: account.hospitalId,
                            phoneNumberId,
                            patientPhoneNumber: patientNumber,
                            direction: 'OUTBOUND',
                            content: replyText,
                            metaMessageId: sendRes.data?.messages[0]?.id,
                            status: 'sent'
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Webhook Handling Error:', error.response?.data || error.message);
        }
    } else {
        res.sendStatus(404);
    }
};