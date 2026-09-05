import React, { useEffect, useContext, useState, useRef } from 'react';
import { Button, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HospitalContext from "../contexts/HospitalContexts.jsx";

const WhatsAppConnect = () => {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const { whatsAppConnectMutation, selectedHostpital } = useContext(HospitalContext);
    const { isPending: isWhatsAppLoading, mutateAsync: whatsAppConnect } = whatsAppConnectMutation;

    // waba_id aur phone_number_id ko session storage/ref me preserve karne ke liye
    const embeddedSignupDataRef = useRef({ wabaId: null, phoneNumberId: null });

    useEffect(() => {
        const handleSessionMessage = (event) => {
            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                // Meta postMessage se waba_id aur phone_number_id capture karein
                if (data.type === "WA_EMBEDDED_SIGNUP") {
                    const { waba_id, phone_number_id, code } = data.data || {};

                    if (waba_id && phone_number_id) {
                        embeddedSignupDataRef.current = {
                            wabaId: waba_id,
                            phoneNumberId: phone_number_id
                        };
                    }

                    // Agar rare case me window message se code aa jaye
                    if (code) {
                        sendCodeToBackend(code, waba_id, phone_number_id);
                    }
                }
            } catch (e) {
                // Ignore non-JSON messages
            }
        };

        window.addEventListener('message', handleSessionMessage);
        return () => window.removeEventListener('message', handleSessionMessage);
    }, []);

    const launchWhatsAppSignup = () => {
        if (!window.FB) {
            setStatusMessage({ type: 'error', text: 'Facebook SDK load nahi hua hai. Page refresh karein.' });
            return;
        }

        setStatusMessage(null);
        setLoading(true);

        const configId = import.meta.env.VITE_META_CONFIG_ID || '1573764420725733';

        // Direct standard synchronous function (REMOVE ASYNC FROM HERE)
        window.FB.login(
            function (response) {

                console.log('FB.login response:', response); // Debugging ke liye log karein
                // OAuth Code hamesha response.authResponse.code me milta hai
                if (response.authResponse && response.authResponse.code) {
                    const oauthCode = response.authResponse.code;
                    const { wabaId, phoneNumberId } = embeddedSignupDataRef.current;



                    sendCodeToBackend(oauthCode, wabaId, phoneNumberId);
                } else {
                    setLoading(false);
                    setStatusMessage({ type: 'error', text: 'User cancelled login or authorization failed.' });
                }
            },
            {
                config_id: String(configId),
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    setup: {}
                }
            }
        );
    };

    const sendCodeToBackend = async (code, wabaId, phoneNumberId) => {
        try {
            setLoading(true);

            // React Query Mutation ka upyog
            const res = await whatsAppConnect({
                hospitalId: selectedHostpital,
                code,
                wabaId,
                phoneNumberId
            });

            setLoading(false);
            setIsConnected(true);
            setStatusMessage({
                type: 'success',
                text: res?.data?.message || res?.message || 'WhatsApp Business account connected successfully!'
            });
        } catch (err) {
            setLoading(false);
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.error || err.message || 'Connection failed'
            });
        }
    };

    const isLoadingState = loading || isWhatsAppLoading;

    return (
        <Card sx={{ maxWidth: 500, m: 2, p: 1 }}>
            <CardContent>
                <Typography variant="h6">WhatsApp Business API Integration</Typography>
                {statusMessage && (
                    <Alert severity={statusMessage.type} sx={{ my: 2 }}>
                        {statusMessage.text}
                    </Alert>
                )}
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<WhatsAppIcon />}
                        onClick={launchWhatsAppSignup}
                        disabled={isLoadingState || isConnected}
                    >
                        {isLoadingState ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : isConnected ? (
                            "Connected"
                        ) : (
                            "Connect WhatsApp"
                        )}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default WhatsAppConnect;