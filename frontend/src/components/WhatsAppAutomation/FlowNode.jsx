import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import MessageRounded from "@mui/icons-material/MessageRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import AudiotrackRounded from "@mui/icons-material/AudiotrackRounded";
import SmartButtonRounded from "@mui/icons-material/SmartButtonRounded";
import ListRounded from "@mui/icons-material/ListRounded";
import QuestionAnswerRounded from "@mui/icons-material/QuestionAnswerRounded";
import ContactMailRounded from "@mui/icons-material/ContactMailRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import ApiRounded from "@mui/icons-material/ApiRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import TimerRounded from "@mui/icons-material/TimerRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";

const iconMap = {
    "Start Node": <PlayArrowRounded fontSize="small" />,
    "Welcome Message": <MessageRounded fontSize="small" />,
    "Text Message": <MessageRounded fontSize="small" />,
    "Image": <ImageRounded fontSize="small" />,
    "PDF": <PictureAsPdfRounded fontSize="small" />,
    "Audio": <AudiotrackRounded fontSize="small" />,
    "Button Message": <SmartButtonRounded fontSize="small" />,
    "List Message": <ListRounded fontSize="small" />,
    "Ask Question": <QuestionAnswerRounded fontSize="small" />,
    "Collect Name": <ContactMailRounded fontSize="small" />,
    "Collect Mobile Number": <ContactMailRounded fontSize="small" />,
    "Collect Email": <ContactMailRounded fontSize="small" />,
    "Collect UHID": <ContactMailRounded fontSize="small" />,
    "Department Selection": <CalendarMonthRounded fontSize="small" />,
    "Doctor Selection": <SupportAgentRounded fontSize="small" />,
    "Appointment Booking": <CalendarMonthRounded fontSize="small" />,
    "Date Selection": <CalendarMonthRounded fontSize="small" />,
    "Time Slot Selection": <ScheduleRounded fontSize="small" />,
    "API Request": <ApiRounded fontSize="small" />,
    "Condition Node": <AccountTreeRoundedIcon fontSize="small" />,
    "Delay Node": <TimerRounded fontSize="small" />,
    "Human Handover": <SupportAgentRounded fontSize="small" />,
    "End Conversation": <CheckCircleRounded fontSize="small" />,
    "End Node": <CheckCircleRounded fontSize="small" />,
};

const FlowNode = ({ node, selected, onSelect }) => {
    return (
        <Card
            onClick={() => onSelect(node)}
            sx={{
                width: 220,
                minHeight: 110,
                borderRadius: 3,
                border: selected ? "1px solid" : "1px solid transparent",
                borderColor: selected ? "primary.main" : "divider",
                boxShadow: selected ? "0 14px 36px rgba(3,169,244,0.16)" : "0 12px 24px rgba(15,23,42,0.08)",
                cursor: "pointer",
                transition: "all 180ms ease",
                background: selected ? "linear-gradient(135deg, #f8fbff 0%, #f5f7ff 100%)" : "background.paper",
                transform: selected ? "translateY(-2px)" : "none",
            }}
        >
            <Box sx={{ p: 1.25 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: "primary.main" }}>{iconMap[node.type] || <MessageRounded fontSize="small" />}</Box>
                    <Typography variant="subtitle2" fontWeight={700}>{node.name}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                    {node.type}
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={node.quickReplies?.[0] || "Ready"} variant="outlined" />
                    <Chip size="small" label={node.retryCount > 0 ? `Retry ${node.retryCount}` : "No retry"} variant="outlined" />
                </Stack>
            </Box>
        </Card>
    );
};

export default FlowNode;
