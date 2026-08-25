import React, { useState } from "react";
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
    CircularProgress,
    IconButton,
    Collapse,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { FormStatus } from "./customComponents/PatientHistoryTableBody";

const RenderValue = ({ value, isOld = false }) => {
    // 1. Handling Null, Undefined, or Empty string
    if (value === null || value === undefined || value === "") {
        return (
            <Chip
                label="Empty"
                size="small"
                sx={{
                    bgcolor: isOld ? "#FEF2F2" : "#F0FDF4",
                    color: isOld ? "#EF4444" : "#16A34A",
                    fontSize: "11px",
                    borderRadius: "6px"
                }}
            />
        );
    }

    // 2. Handling Array
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return (
                <Chip
                    label="Empty Array"
                    size="small"
                    sx={{
                        bgcolor: isOld ? "#FEF2F2" : "#F0FDF4",
                        color: isOld ? "#EF4444" : "#16A34A",
                        fontSize: "11px",
                        borderRadius: "6px"
                    }}
                />
            );
        }

        return (
            <Box display="flex" flexDirection="column" gap={0.5} my={0.5} width="100%">
                {value.map((val, index) => (
                    <Box key={index} sx={{ borderLeft: "2px solid #cbd5e1", pl: 1 }}>
                        <RenderValue value={val} isOld={isOld} />
                    </Box>
                ))}
            </Box>
        );
    }

    // 3. Handling Nested Objects (Strict Check)
    if (typeof value === "object") {
        return (
            <Box
                display="flex"
                flexDirection="column"
                gap={0.5}
                sx={{ bgcolor: "#f8fafc", p: 1, borderRadius: "6px", width: "100%" }}
            >
                {Object.entries(value).map(([key, val]) => (
                    <Box key={key} display="flex" gap={1} alignItems="flex-start">
                        <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ minWidth: "70px" }}>
                            {key}:
                        </Typography>
                        <RenderValue value={val} isOld={isOld} />
                    </Box>
                ))}
            </Box>
        );
    }

    // 4. Default Handling for Primitives
    return (
        <Chip
            label={String(value)}
            size="small"
            sx={{
                bgcolor: isOld ? "#FEF2F2" : "#F0FDF4",
                color: isOld ? "#EF4444" : "#16A34A",
                fontWeight: isOld ? 600 : 700,
                fontSize: "11px",
                borderRadius: "6px",
                textDecoration: isOld ? "line-through" : "none",
            }}
        />
    );
};

const FormEditApprovalCard = ({
    approvalData,
    onApprove,
    onReject,
    activeAction = null,
    defaultExpanded = false
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleToggle = () => {
        setExpanded((prev) => !prev);
    };

    const changes = approvalData?.changesLog || [];
    const totalChanges = changes.length; // Corrected array length check

    const isApproving = activeAction === FormStatus.APPROVED || activeAction === "APPROVED";
    const isRejecting = activeAction === FormStatus.REJECTED || activeAction === "REJECTED";
    const isAnyLoading = Boolean(activeAction);

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
                transition: "all 0.2s ease-in-out",
            }}
        >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                {/* Header Section (Toggle Trigger) */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={handleToggle}
                    sx={{ cursor: "pointer", userSelect: "none" }}
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

                    <Box display="flex" alignItems="center" gap={1}>
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
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggle();
                            }}
                            sx={{ color: "#64748B" }}
                        >
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                </Box>

                {/* Collapsible Content */}
                <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
                    <Box mt={2}>
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
                            {approvalData?.agentName && (
                                <Chip
                                    icon={<PersonIcon sx={{ fontSize: "14px !important" }} />}
                                    label={`Agent: ${approvalData?.agentName}`}
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

                            <Chip
                                icon={<BadgeIcon sx={{ fontSize: "14px !important" }} />}
                                label="Role: TeamLeader"
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

                            {approvalData?.branchId?.name && (
                                <Chip
                                    icon={<StorefrontIcon sx={{ fontSize: "14px !important" }} />}
                                    label={`Branch: ${approvalData?.branchId?.name}`}
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

                                    <Box display="flex" alignItems="flex-start" gap={1} flexWrap="wrap">
                                        {/* Old Value */}
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                                                OLD:
                                            </Typography>
                                            <RenderValue value={item.oldValue} isOld={true} />
                                        </Box>

                                        <ArrowForwardIcon sx={{ fontSize: 14, color: "#94A3B8", mt: 0.5 }} />

                                        {/* New Value */}
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                                                NEW:
                                            </Typography>
                                            <RenderValue value={item.newValue} isOld={false} />
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
                                startIcon={
                                    isRejecting ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <CancelOutlinedIcon />
                                    )
                                }
                                onClick={onReject}
                                disabled={isAnyLoading}
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
                                {isRejecting ? "Rejecting..." : "Reject Request"}
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={
                                    isApproving ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <CheckCircleOutlineIcon />
                                    )
                                }
                                onClick={onApprove}
                                disabled={isAnyLoading}
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
                                {isApproving ? "Approving..." : "Approve Changes"}
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default FormEditApprovalCard;