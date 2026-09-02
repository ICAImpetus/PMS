import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import axios from 'axios';

const WhatsAppConnect = ({ hospitalId }) => {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const handleSessionMessage = (event) => {
            setLoading(false);
            console.log("event", event);

            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                console.log("data", data);

                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                    const { code, waba_id, phone_number_id } = data.data;
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

        // Env Variable se Config ID fetch karein
        const configId = import.meta.env.VITE_META_CONFIG_ID || '1573764420725733';

        window.FB.login(
            function (response) {
                if (!response.authResponse) {
                    setLoading(false);
                    setStatusMessage({ type: 'error', text: 'User cancelled login or authorization failed.' });
                }
            },
            {
                config_id: String(configId), // Ensure string type
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
            const res = await axios.post('/api/whatsapp/connect-whatsapp', {
                hospitalId,
                code,
                wabaId,
                phoneNumberId
            });

            setLoading(false);
            setIsConnected(true);
            setStatusMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setLoading(false);
            setStatusMessage({ type: 'error', text: err.response?.data?.error || 'Connection failed' });
        }
    };

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
                        disabled={loading || isConnected}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : isConnected ? "Connected" : "Connect WhatsApp"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default WhatsAppConnect;