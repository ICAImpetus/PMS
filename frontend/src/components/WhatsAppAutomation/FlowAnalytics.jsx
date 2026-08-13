import { Box, Card, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";

const FlowAnalytics = ({ flow }) => {
    const analytics = flow?.analytics || {
        totalExecutions: 0,
        successRate: 0,
        humanHandoverRate: 0,
        averageCompletionTime: "0m 00s",
        dropOffRate: 0,
        mostClickedButtons: [],
    };

    const metrics = [
        { label: "Total Executions", value: analytics.totalExecutions.toLocaleString() },
        { label: "Success Rate", value: `${analytics.successRate}%` },
        { label: "Human Handover Rate", value: `${analytics.humanHandoverRate}%` },
        { label: "Average Completion", value: analytics.averageCompletionTime },
        { label: "Drop-off Rate", value: `${analytics.dropOffRate}%` },
    ];

    return (
        <Card sx={{ borderRadius: 4, p: 2.25, boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={800}>Flow Analytics</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Performance insights with dummy enterprise data.</Typography>

            <Grid container spacing={1.5}>
                {metrics.map((metric) => (
                    <Grid item xs={12} sm={6} key={metric.label}>
                        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                            <Typography variant="h6" fontWeight={800}>{metric.value}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Most Clicked Buttons</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    {(analytics.mostClickedButtons || []).map((button) => (
                        <Chip key={button} label={button} color="primary" variant="outlined" />
                    ))}
                </Stack>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={700}>Completion Health</Typography>
                <LinearProgress variant="determinate" value={analytics.successRate} sx={{ height: 10, borderRadius: 999, mt: 1 }} />
            </Box>
        </Card>
    );
};

export default FlowAnalytics;
