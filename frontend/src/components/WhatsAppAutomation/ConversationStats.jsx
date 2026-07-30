import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { AutoAwesome, ChatBubbleOutline, ForumOutlined, SupportAgentOutlined } from "@mui/icons-material";

const iconMap = {
    Forum: ForumOutlined,
    Chat: ChatBubbleOutline,
    SupportAgent: SupportAgentOutlined,
    AutoAwesome,
};

const getColor = (color) => ({
    primary: { bgcolor: "rgba(3, 169, 244, 0.12)", color: "primary.main" },
    success: { bgcolor: "rgba(76, 175, 80, 0.12)", color: "success.main" },
    warning: { bgcolor: "rgba(255, 152, 0, 0.12)", color: "warning.main" },
    secondary: { bgcolor: "rgba(132, 91, 245, 0.12)", color: "secondary.main" },
});

const ConversationStats = ({ stats }) => {
    return (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
            {stats.map((stat) => {
                const Icon = iconMap[stat.icon];
                const variant = getColor(stat.color);
                return (
                    <Card key={stat.label} sx={{ flex: 1, borderRadius: 4, boxShadow: "0 14px 40px rgba(15, 23, 42, 0.07)", transition: "transform 220ms ease, box-shadow 220ms ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 48px rgba(15, 23, 42, 0.12)" } }}>
                        <CardContent sx={{ p: 2.4 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{stat.value}</Typography>
                                </Box>
                                <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", ...variant }}>
                                    <Icon />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
};

export default ConversationStats;
