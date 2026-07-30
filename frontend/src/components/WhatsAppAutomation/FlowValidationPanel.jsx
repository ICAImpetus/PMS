import { Box, Card, Chip, Grid, Stack, Typography } from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";

const FlowValidationPanel = ({ flow }) => {
    const validation = flow?.validation || {
        missingConnections: 0,
        orphanNodes: 0,
        duplicateNodeNames: 0,
        unreachablePaths: 0,
        missingEndNodes: 0,
        invalidConfigurations: 0,
    };

    const checks = [
        { label: "Missing connections", value: validation.missingConnections, color: validation.missingConnections === 0 ? "success" : "warning" },
        { label: "Orphan nodes", value: validation.orphanNodes, color: validation.orphanNodes === 0 ? "success" : "warning" },
        { label: "Duplicate node names", value: validation.duplicateNodeNames, color: validation.duplicateNodeNames === 0 ? "success" : "warning" },
        { label: "Unreachable paths", value: validation.unreachablePaths, color: validation.unreachablePaths === 0 ? "success" : "warning" },
        { label: "Missing end nodes", value: validation.missingEndNodes, color: validation.missingEndNodes === 0 ? "success" : "warning" },
        { label: "Invalid configurations", value: validation.invalidConfigurations, color: validation.invalidConfigurations === 0 ? "success" : "warning" },
    ];

    return (
        <Card sx={{ borderRadius: 4, p: 2.25, mt: 3, boxShadow: "0 18px 50px rgba(15,23,42,0.08)" }}>
            <Typography variant="subtitle1" fontWeight={800}>Flow Validation Panel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Automated checks highlight issues before publication.</Typography>
            <Grid container spacing={1.5}>
                {checks.map((check) => (
                    <Grid item xs={12} sm={6} md={4} key={check.label}>
                        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={700}>{check.label}</Typography>
                                {check.value === 0 ? <CheckCircleRounded color="success" /> : <WarningAmberRounded color="warning" />}
                            </Stack>
                            <Chip label={check.value} color={check.color} size="small" sx={{ mt: 1 }} />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
};

export default FlowValidationPanel;
