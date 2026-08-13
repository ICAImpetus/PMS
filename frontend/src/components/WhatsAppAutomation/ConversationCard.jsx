import { Avatar, Box, Chip, ListItemButton, Stack, Typography } from "@mui/material";
import { Circle } from "@mui/icons-material";

const statusColorMap = {
    "Bot Handling": "info",
    "Human Handling": "secondary",
    Closed: "default",
};

const ConversationCard = ({ conversation, selected, onSelect }) => {
    const { patient, lastMessage, lastMessageTime, unreadCount, status } = conversation;

    return (
        <ListItemButton
            onClick={onSelect}
            sx={{
                borderRadius: 3,
                mb: 1.25,
                px: 1.5,
                py: 1.25,
                alignItems: "flex-start",
                border: selected ? "1px solid" : "1px solid transparent",
                borderColor: selected ? "primary.main" : "transparent",
                bgcolor: selected ? "primary.50" : "background.paper",
                boxShadow: selected ? 3 : 0,
                transition: "all 180ms ease",
                "&:hover": {
                    bgcolor: selected ? "primary.50" : "grey.50",
                    transform: "translateY(-1px)",
                },
            }}
        >
            <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                <Avatar
                    sx={{
                        width: 46,
                        height: 46,
                        bgcolor: selected ? "primary.main" : "secondary.main",
                        fontWeight: 700,
                    }}
                >
                    {patient.name
                        .split(" ")
                        .slice(0, 2)
                        .map((item) => item[0])
                        .join("")}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                            {patient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {lastMessageTime}
                        </Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }} noWrap>
                        {patient.mobile} • {conversation.hospital}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                        {lastMessage}
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.8 }}>
                        <Chip
                            label={status}
                            size="small"
                            color={statusColorMap[status] || "default"}
                            variant={status === "Closed" ? "outlined" : "filled"}
                        />
                        {unreadCount > 0 && (
                            <Box
                                sx={{
                                    minWidth: 24,
                                    height: 24,
                                    borderRadius: "999px",
                                    bgcolor: "primary.main",
                                    color: "common.white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            >
                                {unreadCount}
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Stack>
        </ListItemButton>
    );
};

export default ConversationCard;
