import React from "react";
import { Card, CardContent, Typography, Box, Chip, Paper, Divider } from "@mui/material";

export default function UsersCard({
    label = "total",
    count = 0,
    option = {},
    badgeText = "",
    badgeColor = "primary", // "primary" | "success" | "default"
    subtitle = "",
    onClick,
    pointer = true,
}) {
    const hasOptions = Object.keys(option).length > 0;

    return (
        <Paper
            elevation={0}
            component={Card}
            onClick={onClick}
            sx={{
                width: "100%",
                height: 160, // Fixed height for exact alignment
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
                cursor: pointer ? "pointer" : "default",
                transition: "all 0.2s ease-in-out",
                boxSizing: "border-box",
                "&:hover": {
                    boxShadow: pointer ? "0px 10px 25px rgba(0, 0, 0, 0.06)" : "none",
                    borderColor: pointer ? "#CBD5E1" : "#E2E8F0",
                    transform: pointer ? "translateY(-2px)" : "none",
                },
            }}
        >
            <CardContent
                sx={{
                    p: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    "&:last-child": { pb: 2.5 },
                }}
            >
                {/* TOP LABEL */}
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="#94A3B8"
                    sx={{
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        fontSize: "10px",
                        display: "block",
                    }}
                >
                    {label}
                </Typography>

                {/* MIDDLE SECTION: MAIN COUNT + BADGE */}
                <Box display="flex" alignItems="baseline" gap={1} my={0.5}>
                    <Typography
                        variant="h4"
                        fontWeight={900}
                        color="#0F172A"
                        sx={{ fontSize: "28px", lineHeight: 1 }}
                    >
                        {count ?? 0}
                    </Typography>

                    {/* Inline Percentage or Status Pill */}
                    {badgeText && (
                        <Chip
                            label={badgeText}
                            size="small"
                            sx={{
                                height: "20px",
                                fontSize: "10px",
                                fontWeight: 800,
                                bgcolor:
                                    badgeColor === "success"
                                        ? "#ECFDF5"
                                        : badgeColor === "primary"
                                            ? "#EFF6FF"
                                            : "#F1F5F9",
                                color:
                                    badgeColor === "success"
                                        ? "#059669"
                                        : badgeColor === "primary"
                                            ? "#0256E8"
                                            : "#64748B",
                                borderRadius: "12px",
                                px: 0.5,
                                "& .MuiChip-label": { px: 1 },
                            }}
                        />
                    )}
                </Box>

                {/* BOTTOM SECTION: SUBTITLE OR INBOUND / OUTBOUND SPLIT */}
                <Box>
                    {hasOptions ? (
                        <>
                            <Divider sx={{ mb: 1.5, borderColor: "#F1F5F9" }} />
                            <Box display="flex" gap={3} alignItems="center">
                                {Object.entries(option).map(([role, val], idx) => (
                                    <Box key={role}>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={900}
                                            color="#0F172A"
                                            sx={{ fontSize: "16px", lineHeight: 1 }}
                                        >
                                            {val ?? 0}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            fontWeight={800}
                                            color={idx === 0 ? "#0256E8" : "#94A3B8"}
                                            sx={{
                                                fontSize: "9px",
                                                letterSpacing: "0.5px",
                                                textTransform: "uppercase",
                                                display: "block",
                                                mt: 0.5,
                                            }}
                                        >
                                            {role}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    ) : (
                        <Typography
                            variant="caption"
                            fontWeight={800}
                            color="#94A3B8"
                            sx={{
                                fontSize: "9px",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                display: "block",
                            }}
                        >
                            {subtitle || "VERIFIED PRACTITIONERS"}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Paper>
    );
}