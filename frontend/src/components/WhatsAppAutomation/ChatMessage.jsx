import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { ImageOutlined, PictureAsPdfOutlined, HeadphonesOutlined, ForumOutlined } from "@mui/icons-material";

const messageStyles = {
    bot: { bgcolor: "#f8fafc", borderRadius: "18px 18px 18px 6px" },
    patient: { bgcolor: "primary.main", color: "white", borderRadius: "18px 18px 6px 18px" },
    executive: { bgcolor: "#ffffff", borderRadius: "18px 18px 18px 6px" },
    system: { bgcolor: "#fff7ed", borderRadius: "999px", px: 1.5, py: 0.75 },
};

const ChatMessage = ({ message }) => {
    const isPatient = message.sender === "patient";
    const isSystem = message.sender === "system";

    const renderBody = () => {
        switch (message.type) {
            case "options":
                return (
                    <Stack spacing={1} sx={{ mt: 0.8 }}>
                        {message.options.map((option) => (
                            <Chip key={option} label={option} variant="outlined" color="primary" />
                        ))}
                    </Stack>
                );
            case "card":
                return (
                    <Paper variant="outlined" sx={{ mt: 0.75, p: 1.2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{message.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{message.description}</Typography>
                    </Paper>
                );
            case "image":
                return (
                    <Box sx={{ mt: 0.75, p: 1, borderRadius: 2.5, bgcolor: "grey.100", width: 220 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ImageOutlined color="primary" />
                            <Typography variant="body2">{message.caption}</Typography>
                        </Stack>
                    </Box>
                );
            case "pdf":
                return (
                    <Box sx={{ mt: 0.75, p: 1, borderRadius: 2.5, bgcolor: "grey.100", width: 240 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PictureAsPdfOutlined color="error" />
                            <Typography variant="body2">{message.caption}</Typography>
                        </Stack>
                    </Box>
                );
            case "audio":
                return (
                    <Box sx={{ mt: 0.75, p: 1, borderRadius: 2.5, bgcolor: "grey.100", width: 220 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <HeadphonesOutlined color="secondary" />
                            <Typography variant="body2">Voice note • 00:31</Typography>
                        </Stack>
                    </Box>
                );
            default:
                return <Typography variant="body2">{message.text}</Typography>;
        }
    };

    return (
        <Stack direction="row" spacing={1.25} alignItems="flex-end" sx={{ mb: 1.25, justifyContent: isPatient ? "flex-end" : "flex-start" }}>
            {!isPatient && !isSystem && (
                <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 12 }}>
                    {message.sender === "bot" ? "AI" : "EX"}
                </Avatar>
            )}

            <Box sx={{ maxWidth: "78%" }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.25,
                        ...messageStyles[message.sender] || messageStyles.bot,
                        border: isSystem ? "1px solid #fed7aa" : "none",
                    }}
                >
                    {renderBody()}
                    <Typography variant="caption" sx={{ mt: 0.7, display: "block", opacity: 0.75 }}>
                        {message.timestamp}
                    </Typography>
                </Paper>
            </Box>
        </Stack>
    );
};

export default ChatMessage;
