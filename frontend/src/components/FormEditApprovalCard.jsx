import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Divider,
    Stack,
    Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import StorefrontIcon from "@mui/icons-material/Storefront";
const approvalData = {
    success: true,
    message: "Form updated successfully with change history.",
    changesSummary: {
        branchName: "city branch",
        agentName: "dansdeep",
        role: "teamleader",
        totalChanges: 2,
        changes: [
            {
                field: "formData.remarks",
                oldValue: "Patient requested callback in morning",
                newValue: "Patient confirmed appointment for evening"
            },
            {
                field: "callStatus",
                oldValue: "pending",
                newValue: "completed"
            }
        ]
    }
};
const FormEditApprovalCard = ({ onApprove, onReject }) => {
    const summary = approvalData?.changesSummary;
    const changes = summary?.changes || [];
    const totalChanges = summary?.totalChanges || 0;

    if (changes.length === 0) return null;

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                mb: 2,
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                {/* Header Section */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                bgcolor: "#EFF6FF",
                                color: "#0256E8",
                                p: 1,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <EditNoteIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                                Form Change Request
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                                {totalChanges} field(s) modified • Immediate approval required
                            </Typography>
                        </Box>
                    </Box>

                    <Chip
                        label="Pending Approval"
                        size="small"
                        sx={{
                            bgcolor: "#FEF3C7",
                            color: "#D97706",
                            fontWeight: 800,
                            fontSize: "10px",
                            borderRadius: "8px",
                        }}
                    />
                </Box>

                {/* User & Branch Info Badges */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    flexWrap="wrap"
                    mb={2}
                    p={1.2}
                    bgcolor="#F8FAFC"
                    borderRadius="12px"
                    border="1px solid #F1F5F9"
                >
                    {summary?.agentName && (
                        <Chip
                            icon={<PersonIcon sx={{ fontSize: "14px !important" }} />}
                            label={`Agent: ${summary.agentName}`}
                            size="small"
                            sx={{
                                bgcolor: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                fontWeight: 700,
                                fontSize: "11px",
                                color: "#334155",
                            }}
                        />
                    )}

                    {summary?.role && (
                        <Chip
                            icon={<BadgeIcon sx={{ fontSize: "14px !important" }} />}
                            label={`Role: ${summary.role}`}
                            size="small"
                            sx={{
                                bgcolor: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                fontWeight: 700,
                                fontSize: "11px",
                                color: "#0256E8",
                                textTransform: "capitalize",
                            }}
                        />
                    )}

                    {summary?.branchName && (
                        <Chip
                            icon={<StorefrontIcon sx={{ fontSize: "14px !important" }} />}
                            label={`Branch: ${summary.branchName}`}
                            size="small"
                            sx={{
                                bgcolor: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                fontWeight: 700,
                                fontSize: "11px",
                                color: "#475569",
                            }}
                        />
                    )}
                </Box>

                <Divider sx={{ mb: 2, borderColor: "#F1F5F9" }} />

                {/* Changes Summary List */}
                <Stack spacing={1.5} mb={2.5}>
                    {changes.map((item, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                                p: 1.5,
                                bgcolor: "#F8FAFC",
                                borderRadius: "12px",
                                border: "1px solid #E2E8F0",
                            }}
                        >
                            <Typography
                                variant="caption"
                                fontWeight={800}
                                color="#0256E8"
                                sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
                                display="block"
                                mb={1}
                            >
                                FIELD: {item.field}
                            </Typography>

                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                {/* Old Value */}
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                                        OLD:
                                    </Typography>
                                    <Chip
                                        label={item.oldValue || "Empty"}
                                        size="small"
                                        sx={{
                                            bgcolor: "#FEF2F2",
                                            color: "#EF4444",
                                            fontWeight: 600,
                                            fontSize: "11px",
                                            borderRadius: "6px",
                                            textDecoration: "line-through",
                                        }}
                                    />
                                </Box>

                                <ArrowForwardIcon sx={{ fontSize: 14, color: "#94A3B8" }} />

                                {/* New Value */}
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                                        NEW:
                                    </Typography>
                                    <Chip
                                        label={item.newValue || "Empty"}
                                        size="small"
                                        sx={{
                                            bgcolor: "#F0FDF4",
                                            color: "#16A34A",
                                            fontWeight: 700,
                                            fontSize: "11px",
                                            borderRadius: "6px",
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Stack>

                {/* Action Buttons */}
                <Box display="flex" justifyContent="flex-end" gap={1.5}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={onReject}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "12px",
                            px: 2,
                            borderColor: "#FECDD3",
                            color: "#E11D48",
                            "&:hover": {
                                borderColor: "#E11D48",
                                bgcolor: "#FFF1F2",
                            },
                        }}
                    >
                        Reject Request
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={onApprove}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 800,
                            fontSize: "12px",
                            px: 2.5,
                            bgcolor: "#0256E8",
                            color: "#FFFFFF",
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: "#0143B8",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Approve Changes
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
export default FormEditApprovalCard;