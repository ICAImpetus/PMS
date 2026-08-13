import { Box, Card, Chip, Divider, Stack, Typography } from "@mui/material";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import SendRounded from "@mui/icons-material/SendRounded";

const MobilePreview = ({ flow }) => {
    const preview = flow?.preview || {
        title: "Flow Preview",
        messages: [
            { type: "bot", text: "Hello! Let’s help with your request." },
            { type: "user", text: "Book an appointment" },
            { type: "bot", text: "Choose a doctor", options: ["Dr. Rao", "Dr. Nair"] },
        ],
    };

    return (
        <Card sx={{ borderRadius: 4, p: 2.25, boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={800}>Mobile Live Preview</Typography>
                    <Typography variant="caption" color="text.secondary">WhatsApp-style patient view</Typography>
                </Box>
                <Chip icon={<PhoneIphoneRounded />} label="Live Demo" color="primary" variant="outlined" />
            </Stack>

            <Box sx={{ maxWidth: 320, mx: "auto", borderRadius: 4, border: 1, borderColor: "divider", overflow: "hidden", bgcolor: "#f8fbff" }}>
                <Box sx={{ bgcolor: "primary.main", color: "white", p: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{preview.title}</Typography>
                </Box>
                <Box sx={{ p: 1.5, minHeight: 320, bgcolor: "#f3f6fb" }}>
                    {preview.messages.map((message, index) => (
                        <Box key={`${message.text}-${index}`} sx={{ mb: 1.2 }}>
                            <Box sx={{ display: "flex", justifyContent: message.type === "user" ? "flex-end" : "flex-start" }}>
                                <Box sx={{ maxWidth: "78%", p: 1, borderRadius: 2, bgcolor: message.type === "user" ? "primary.main" : "white", color: message.type === "user" ? "white" : "text.primary", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" }}>
                                    <Typography variant="body2">{message.text}</Typography>
                                    {message.options && (
                                        <Stack spacing={0.6} sx={{ mt: 0.8 }}>
                                            {message.options.map((option) => (
                                                <Chip key={option} label={option} size="small" variant="outlined" />
                                            ))}
                                        </Stack>
                                    )}
                                    {message.card && (
                                        <Box sx={{ mt: 0.8, p: 1, borderRadius: 2, bgcolor: "#f8f5ff" }}>
                                            <Typography variant="caption" fontWeight={700}>Appointment Confirmed</Typography>
                                            <Typography variant="caption" display="block">Dr. Rao • 11:30 AM</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Divider />
                <Box sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 1, bgcolor: "white" }}>
                    <Typography variant="body2" color="text.secondary">Type a reply…</Typography>
                    <Box sx={{ marginLeft: "auto" }}>
                        <SendRounded color="primary" />
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

export default MobilePreview;
