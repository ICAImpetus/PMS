import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider
} from "@mui/material";


export default function UsersCard({ label = "total", count = 0, option = {}, onClick, pointer = true }) {
    return (
        <Card
            onClick={onClick}
            sx={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                minWidth: 150,
                minHeight: 120,
                border: "none",
                borderRadius: "12px",
                borderLeft: "6px solid #0f172a",
                cursor: pointer ? "pointer" : "default"
            }}
        >

            <CardContent sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%"
            }}>
                {/* Header */}
                <Typography variant="subtitle2" color="text.secondary">
                    {label}
                </Typography>

                <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ mb: Object.keys(option).length > 0 ? 1 : 0 }}
                >
                    {count}
                </Typography>

                {/* Roles List */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "start",
                        mt: "auto",
                        pt: 1
                    }}
                >
                    {Object.keys(option).length > 0 && Object.entries(option).map(([role, count]) => (
                        <Box
                            key={role}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {role}:
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="primary"
                            >
                                {count}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card >
    );
}