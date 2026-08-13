import { Box, Button, Card, Divider, Stack, Typography } from "@mui/material";

const VersionHistory = ({ flow }) => {
    return (
        <Card sx={{ borderRadius: 4, p: 2.25, boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={800}>Version History</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Recover previous versions with confidence.</Typography>
            <Stack spacing={1.5}>
                {(flow?.versions || []).map((version) => (
                    <Box key={`${version.version}-${version.updatedAt}`} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>v{version.version}</Typography>
                                <Typography variant="caption" color="text.secondary">{version.updatedAt}</Typography>
                            </Box>
                            <Button size="small" variant="outlined">Restore</Button>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.75 }}>{version.note}</Typography>
                    </Box>
                ))}
            </Stack>
        </Card>
    );
};

export default VersionHistory;
