import React, { useContext, useState } from "react";
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    MenuItem,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Search as SearchIcon,
    WhatsApp as WhatsAppIcon,
    CalendarToday as CalendarTodayIcon,
    PhoneCallback as PhoneCallbackIcon,
    EventAvailable as EventAvailableIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HospitalContext from "../../contexts/HospitalContexts";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
// MongoDB Compass Schema Mapping ke aadhar par Dummy Data
// const DUMMY_LEADS_DATA = [
//     {
//         _id: "6aa503d00a85d3f9a6350511",
//         hospitalId: "6a8d6e97049af6500e262fa7",
//         patientName: "qwerty",
//         patientPhoneNumber: "917340479570",
//         patientAge: "22",
//         leadType: "APPOINTMENT_BOOKING",
//         departmentName.name: "Test Department",
//         doctorName: "Kunal",
//         appointmentDate: "13/09/2026",
//         appointmentSlot: "10:31 AM - 10:41 AM",
//         branchName: "demo branch",
//         leadStatus: "NEW",
//         source: "WHATSAPP_DIRECT",
//         createdAt: "2026-09-12T07:48:32.040+00:00",
//     },
//     {
//         _id: "6aa504190a85d3f9a6350524",
//         hospitalId: "6a8d6e97049af6500e262fa7",
//         patientName: "Enquirer",
//         patientPhoneNumber: "917340479570",
//         patientAge: "",
//         leadType: "CALLBACK_REQUEST",
//         departmentName?.name: "",
//         doctorName: "",
//         appointmentDate: "",
//         appointmentSlot: "",
//         branchName: "",
//         leadStatus: "NEW",
//         source: "WHATSAPP_DIRECT",
//         createdAt: "2026-09-12T07:49:45.255+00:00",
//     },
// ];

const WhatsAppLeads = () => {
    // const [leads, setLeads] = useState(DUMMY_LEADS_DATA);
    const [searchTerm, setSearchTerm] = useState("");
    const [leadTypeFilter, setLeadTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Action Modal State
    const [selectedLead, setSelectedLead] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");


    const { leadMutation, leadsData, refetchleadsData } = useContext(HospitalContext)

    const {
        mutate: updateLeadStatus, // Mutation function
        isPending: isUpdatingLead, // Loading boolean state (formerly isLoading)
        error: leadUpdateError,    // Error object
        isError                    // Boolean error indicator
    } = leadMutation;

    const handleOpenRejectModal = (row) => {
        setSelectedLead(row);
        setRejectReason("");
        setRejectDialogOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) return;
        // Call mutate by passing a SINGLE object containing all fields
        updateLeadStatus({
            leadId: selectedLead?._id,
            leadStatus: "CANCELLED",
            rejectReason: rejectReason
        });
        await refetchleadsData()
        setRejectDialogOpen(false);

    };


    const handleActionClick = (lead) => {
        setSelectedLead(lead);
        setOpenModal(true);
    };

    const handleConfirmAction = async () => {

        updateLeadStatus({
            leadId: selectedLead?._id,
            leadStatus: "CONFIRMED",
            // rejectReason: rejectReason
        });

        await refetchleadsData()
        setOpenModal(false);
    };

    // Filter Logic
    const filteredLeads = (leadsData || [])?.filter((lead) => {
        const matchesSearch =
            lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.patientPhoneNumber.includes(searchTerm);
        const matchesType =
            leadTypeFilter === "ALL" || lead.leadType === leadTypeFilter;
        const matchesStatus =
            statusFilter === "ALL" || lead.leadStatus === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", pb: 6, pt: 3 }}>
            <Container maxWidth="xl">
                {/* Top Metric Stats Summary */}
                <Grid container spacing={2.5} mb={4}>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "20px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box sx={{ p: 1.2, borderRadius: "12px", backgroundColor: "#eff6ff", color: "#2563eb" }}>
                                    <WhatsAppIcon sx={{ fontSize: "1.4rem" }} />
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8">
                                    TOTAL WHATSAPP LEADS
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight={800} color="#0f172a" mt={2}>
                                {leadsData?.length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "20px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box sx={{ p: 1.2, borderRadius: "12px", backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                                    <EventAvailableIcon sx={{ fontSize: "1.4rem" }} />
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8">
                                    APPOINTMENT BOOKINGS
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight={800} color="#0f172a" mt={2}>
                                {leadsData?.filter((l) => l.leadType === "APPOINTMENT_BOOKING").length}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "20px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box sx={{ p: 1.2, borderRadius: "12px", backgroundColor: "#fff7ed", color: "#ea580c" }}>
                                    <PhoneCallbackIcon sx={{ fontSize: "1.4rem" }} />
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8">
                                    CALLBACK REQUESTS
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight={800} color="#0f172a" mt={2}>
                                {leadsData?.filter((l) => l.leadType === "CALLBACK_REQUEST").length}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Main Leads Table Container */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: "20px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
                    }}
                >
                    {/* Filters Bar */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box sx={{ width: 4, height: 22, backgroundColor: "#2563eb", borderRadius: "2px" }} />
                            <Typography variant="h6" fontWeight={800} color="#1e293b">
                                WhatsApp Leads Management
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={2} flexWrap="wrap">

                            <Button
                                size="small"
                                onClick={async () => { await refetchleadsData(); }}
                                startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    borderRadius: "50px",
                                    bgcolor: "#fff",
                                    color: "#334155",
                                    border: "1px solid #e2e8f0",
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "0.78rem",
                                    px: 1.8,
                                    py: 0.6,
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                    "&:hover": { bgcolor: "#f8fafc" },
                                }}
                            >
                                Refresh
                            </Button>
                            <TextField
                                size="small"
                                placeholder="Search Patient Name / Mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#94a3b8" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ width: 260 }}
                            />

                            <TextField
                                select
                                size="small"
                                value={leadTypeFilter}
                                onChange={(e) => setLeadTypeFilter(e.target.value)}
                                sx={{ minWidth: 180 }}
                            >
                                <MenuItem value="ALL">All Lead Types</MenuItem>
                                <MenuItem value="APPOINTMENT_BOOKING">Appointment Booking</MenuItem>
                                <MenuItem value="CALLBACK_REQUEST">Callback Request</MenuItem>
                            </TextField>

                            <TextField
                                select
                                size="small"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{ minWidth: 140 }}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="NEW">New</MenuItem>
                                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                            </TextField>
                        </Stack>
                    </Box>

                    {/* Table View */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ "& th": { borderBottom: "1px solid #f1f5f9", py: 1.5 } }}>
                                    <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>
                                        PATIENT INFO
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>
                                        LEAD TYPE
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>
                                        DOCTOR / DEPT
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>
                                        PREFERRED SLOT
                                    </TableCell>
                                    <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>
                                        STATUS
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>
                                        ACTION
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredLeads.map((row) => {
                                    const isAppointment = row.leadType === "APPOINTMENT_BOOKING";

                                    return (
                                        <TableRow key={row._id} sx={{ "& td": { borderBottom: "1px solid #f8fafc", py: 2 } }}>
                                            {/* Patient Info */}
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 34, height: 34, bgcolor: "#f1f5f9", color: "#64748b", fontWeight: 700, fontSize: "0.8rem" }}>
                                                        {row.patientName?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography fontWeight={700} color="#1e293b" fontSize="0.875rem">
                                                            {row.patientName}
                                                        </Typography>
                                                        <Typography variant="caption" color="#94a3b8" display="block">
                                                            + {row.patientPhoneNumber} {row.patientAge ? `• ${row.patientAge} Yrs` : ""}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {/* Lead Type */}
                                            <TableCell>
                                                <Chip
                                                    label={isAppointment ? "APPOINTMENT" : "CALLBACK"}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: isAppointment ? "#eff6ff" : "#fff7ed",
                                                        color: isAppointment ? "#2563eb" : "#ea580c",
                                                        fontWeight: 800,
                                                        fontSize: "0.65rem",
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Doctor / Dept */}
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600} color="#334155">
                                                    {row?.doctorName?.name ? `${row.doctorName?.name}` : "N/A"}
                                                </Typography>
                                                <Typography variant="caption" color="#94a3b8">
                                                    {row?.departmentName?.name || "General Inquiry"}
                                                </Typography>
                                            </TableCell>

                                            {/* Preferred Slot */}
                                            <TableCell>
                                                {isAppointment ? (
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700} color="#1e293b">
                                                            {row.appointmentDate}
                                                        </Typography>
                                                        <Typography variant="caption" color="#64748b">
                                                            {row.appointmentSlot}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="#94a3b8" fontStyle="italic">
                                                        Immediate Callback
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <Chip
                                                    label={row?.patientStatus || "NEW"}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: row.patientStatus === "NEW" ? "#f0fdf4" : "#fef3c7",
                                                        color: row.patientStatus === "NEW" ? "#16a34a" : "#d97706",
                                                        fontWeight: 800,
                                                        fontSize: "0.65rem",
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            </TableCell>

                                            {/* DYNAMIC ACTION BUTTON */}
                                            <TableCell align="right">
                                                {["CONFIRMED", "CANCELLED", "CANCELD"].includes(row?.leadStatus) ? (
                                                    <Chip
                                                        size="small"
                                                        icon={
                                                            row?.leadStatus === "CONFIRMED" ? (
                                                                <CheckCircleOutlineIcon style={{ color: "#15803d" }} fontSize="small" />
                                                            ) : (
                                                                <HighlightOffIcon style={{ color: "#b91c1c" }} fontSize="small" />
                                                            )
                                                        }
                                                        label={row?.leadStatus}
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: "0.68rem",
                                                            textTransform: "uppercase",
                                                            px: 1,
                                                            backgroundColor: row?.leadStatus === "CONFIRMED" ? "#dcfce7" : "#fee2e2",
                                                            color: row?.leadStatus === "CONFIRMED" ? "#15803d" : "#b91c1c",
                                                            border: "1px solid",
                                                            borderColor: row?.leadStatus === "CONFIRMED" ? "#86efac" : "#fca5a5",
                                                            borderRadius: "6px"
                                                        }}
                                                    />
                                                ) : (
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        {/* Confirm Button */}
                                                        <Button
                                                            variant="contained"
                                                            disableElevation
                                                            size="small"
                                                            onClick={() => handleActionClick(row)}
                                                            startIcon={isAppointment ? <EventAvailableIcon fontSize="small" /> : <PhoneCallbackIcon fontSize="small" />}
                                                            sx={{
                                                                backgroundColor: isAppointment ? "#2563eb" : "#16a34a",
                                                                color: "#ffffff",
                                                                fontWeight: 700,
                                                                fontSize: "0.7rem",
                                                                borderRadius: "8px",
                                                                textTransform: "uppercase",
                                                                px: 1.5,
                                                                py: 0.6,
                                                                "&:hover": { backgroundColor: isAppointment ? "#1d4ed8" : "#15803d" },
                                                            }}
                                                        >
                                                            Confirm
                                                        </Button>

                                                        {/* Reject Button */}
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleOpenRejectModal(row)}
                                                            startIcon={<CancelIcon fontSize="small" />}
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: "0.7rem",
                                                                borderRadius: "8px",
                                                                textTransform: "uppercase",
                                                                px: 1.5,
                                                                py: 0.6,
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>

            {/* Confirmation Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {selectedLead?.leadType === "APPOINTMENT_BOOKING"
                        ? "Confirm Patient Appointment"
                        : "Confirm Callback Process"}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#64748b" mb={2}>
                        Are you sure you want to proceed for <strong>{selectedLead?.patientName}</strong> (+{selectedLead?.patientPhoneNumber})?
                    </Typography>

                    {/* {console.log("ttht", selectedLead)
                    } */}
                    {selectedLead?.leadType === "APPOINTMENT_BOOKING" && (
                        <Box sx={{ backgroundColor: "#f8fafc", p: 2, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <Typography variant="caption" color="#94a3b8" display="block">
                                SLOT DETAILS
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#1e293b">
                                {selectedLead?.doctorName?.name} ({selectedLead?.departmentName?.name})
                            </Typography>
                            <Typography variant="caption" color="#2563eb" fontWeight={700}>
                                {selectedLead?.appointmentDate} | {selectedLead?.appointmentSlot}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ color: "#64748b", fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        disableElevation
                        sx={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 700,
                            borderRadius: "8px",
                        }}
                    >
                        Confirm Now
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Reject {selectedLead?.leadType === "APPOINTMENT_BOOKING" ? "Appointment" : "Callback"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Rejection"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Doctor unavailable, Patient canceled, Incorrect number..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)} color="inherit" size="small">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmReject} color="error" variant="contained" size="small" disabled={!rejectReason.trim()}>
                        Confirm Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WhatsAppLeads;