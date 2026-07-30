import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import AutoAwesomeMotionRounded from "@mui/icons-material/AutoAwesomeMotionRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import DraftsRounded from "@mui/icons-material/DraftsRounded";
import BusinessRounded from "@mui/icons-material/BusinessRounded";

const FlowStatistics = ({ flows = [] }) => {
    const cards = [
        { label: "Total Flows", value: String(flows.length), icon: <AutoAwesomeMotionRounded fontSize="small" />, color: "primary.main" },
        { label: "Published Flows", value: String(flows.filter((flow) => flow.status === "Published").length), icon: <RocketLaunchRounded fontSize="small" />, color: "success.main" },
        { label: "Draft Flows", value: String(flows.filter((flow) => flow.status === "Draft").length), icon: <DraftsRounded fontSize="small" />, color: "warning.main" },
        { label: "Active Hospitals", value: String(new Set(flows.map((flow) => flow.hospitalName)).size), icon: <BusinessRounded fontSize="small" />, color: "secondary.main" },
    ];

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {cards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.label}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            p: 2.25,
                            height: "100%",
                            boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
                            transition: "transform 180ms ease, box-shadow 180ms ease",
                            "&:hover": { transform: "translateY(-3px)", boxShadow: "0 20px 50px rgba(15,23,42,0.12)" },
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.4 }}>{card.value}</Typography>
                            </Box>
                            <Box sx={{ bgcolor: `${card.color}15`, color: card.color, p: 1.25, borderRadius: 2.5 }}>
                                {card.icon}
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default FlowStatistics;
