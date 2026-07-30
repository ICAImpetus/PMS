import { Avatar, Box, Chip, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Close, PersonOutline, SwapHoriz, OpenInNew } from "@mui/icons-material";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ conversation, onOpenPatientDrawer, onTransferToHuman, onCloseConversation }) => {
    return (
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ p: 2, bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", width: 46, height: 46 }}>
                            {conversation.patient.name
                                .split(" ")
                                .slice(0, 2)
                                .map((item) => item[0])
                                .join("")}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {conversation.patient.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                UHID {conversation.patient.uhid} • {conversation.patient.age} yrs • {conversation.patient.gender} • {conversation.patient.mobile}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={0.75}>
                        <Chip label={conversation.status} color={conversation.status === "Closed" ? "default" : "primary"} />
                        <IconButton onClick={onTransferToHuman} size="small">
                            <SwapHoriz />
                        </IconButton>
                        <IconButton onClick={onCloseConversation} size="small">
                            <Close />
                        </IconButton>
                        <IconButton onClick={onOpenPatientDrawer} size="small">
                            <PersonOutline />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ p: 2.25, bgcolor: "#f8fafc", minHeight: 520, maxHeight: 680, overflowY: "auto" }}>
                <Stack spacing={1.25}>
                    {conversation.messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                </Stack>
            </Box>

            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Assigned Doctor: {conversation.doctor} • Hospital: {conversation.hospital}
                    </Typography>
                    <Chip icon={<OpenInNew />} label="View Patient Profile" variant="outlined" onClick={onOpenPatientDrawer} />
                </Stack>
            </Box>
        </Paper>
    );
};

export default ChatWindow;
