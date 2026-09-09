import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Tooltip,
    Stack,
    Container,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    Typography,
    Chip,
    Avatar,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    InputAdornment,
    Divider,
    Tab,
    Tabs,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Person as PersonIcon,
    Event as EventIcon,
    Assignment as AssignmentIcon,
    TrendingUp as TrendingUpIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    TrendingDown as TrendingDownIcon,
    CalendarToday as CalendarTodayIcon,
    Settings as SettingsIcon,
    Hotel as HotelIcon,
    Tune as TuneIcon,
} from "@mui/icons-material";
import RefreshIcon from '@mui/icons-material/Refresh';

import { tokens } from "../../../theme";
import { UserContextHook } from "../../../contexts/UserContexts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HospitalContext from "../../../contexts/HospitalContexts";
import moment from "moment";

const DATE_FILTER_OPTIONS = {
    today: "Today",
    tomorrow: "Tomorrow",
    next3: "Next 3 Days",
    next7: "Next 7 Days",
    all: "All Upcoming",
};

const DoctorDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { currentUser } = UserContextHook() || { name: "N.D Soni" };

    const {
        appointments,
        recentConsultations,
        pastappointments,
        loading,
        refetchAppointments,
        refetchPastAppointments,
        dateFilter,
        setDateFilter,
        tabValue,
        setTabValue,
        doctorStats,
    } = useContext(HospitalContext);

    // Dialog states
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Past appointments filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    const [sortBy, setSortBy] = useState("date-desc");

    // Handle edit appointment
    const handleEditAppointment = (apt) => {
        setEditingAppointment(apt);
        setEditFormData({ ...apt });
        setOpenEditDialog(true);
    };

    const handleUpdateAppointment = () => {
        toast.success("Appointment updated successfully!");
        setOpenEditDialog(false);
    };

    const handleCompleteAppointment = (id) => {
        toast.success("Appointment marked as completed!");
    };

    const handleCancelAppointment = (id) => {
        toast.error("Appointment cancelled!");
    };

    // Filter and sort past appointments
    const getFilteredPastAppointments = () => {
        let filtered = pastappointments || [];

        if (searchTerm) {
            filtered = filtered.filter((apt) =>
                (apt.patientName || apt?.formData?.patientDetails?.patientName || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== "All") {
            filtered = filtered.filter((apt) => apt?.formData?.status?.toLowerCase() === filterStatus?.toLowerCase());
        }

        if (filterDate) {
            filtered = filtered.filter((apt) => apt?.formData?.dateTime === filterDate);
        }

        return filtered;
    };

    const renderTodayAppointmentsCard = () => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 4, height: 22, backgroundColor: "#2563eb", borderRadius: "2px" }} />
                    <Typography variant="h6" fontWeight={700} color="#1e293b" fontSize="1.1rem">
                        Today's Appointments
                    </Typography>
                </Box>

                {/* Tabs & Filter Pill Container */}
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            backgroundColor: "#f1f5f9",
                            p: "4px",
                            borderRadius: "100px",
                            display: "flex",
                        }}
                    >
                        <Button
                            onClick={() => setTabValue(0)}
                            sx={{
                                borderRadius: "100px",
                                px: 2.5,
                                py: 0.5,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor: tabValue === 0 ? "#ffffff" : "transparent",
                                color: tabValue === 0 ? "#1e293b" : "#64748b",
                                boxShadow: tabValue === 0 ? "0px 2px 6px rgba(0,0,0,0.06)" : "none",
                                "&:hover": { backgroundColor: tabValue === 0 ? "#ffffff" : "transparent" },
                            }}
                        >
                            Today
                        </Button>
                        <Button
                            onClick={() => setTabValue(1)}
                            sx={{
                                borderRadius: "100px",
                                px: 2.5,
                                py: 0.5,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor: tabValue === 1 ? "#ffffff" : "transparent",
                                color: tabValue === 1 ? "#64748b" : "#64748b",
                                boxShadow: tabValue === 1 ? "0px 2px 6px rgba(0,0,0,0.06)" : "none",
                                "&:hover": { backgroundColor: tabValue === 1 ? "#ffffff" : "transparent" },
                            }}
                        >
                            Past
                        </Button>
                    </Box>

                    <IconButton
                        size="small"
                        onClick={refetchAppointments}
                        disabled={loading?.appointmentLoading}
                        sx={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            p: 1,
                        }}
                    >
                        <TuneIcon sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Content Section */}
            {loading?.appointmentLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                    <CircularProgress size={30} sx={{ color: "#2563eb" }} />
                </Box>
            ) : (
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    {appointments?.length > 0 ? (
                        <TableContainer component={Box}>
                            <Table sx={{ minWidth: 500 }}>
                                <TableHead>
                                    <TableRow sx={{ "& th": { borderBottom: "1px solid #f1f5f9", py: 1.5 } }}>
                                        <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>TIME</TableCell>
                                        <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>PATIENT NAME</TableCell>
                                        <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>STATUS</TableCell>
                                        <TableCell sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>TYPE</TableCell>
                                        <TableCell align="right" sx={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase" }}>ACTION</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {appointments.slice(0, 5).map((apt) => {
                                        const pName = apt?.formData?.patientDetails?.patientName || "Unknown Patient";
                                        const initials = pName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                                        const status = apt?.status || "Waiting";

                                        // Status Chip styling logic
                                        let statusBg = "#fef3c7";
                                        let statusColor = "#d97706";
                                        if (status === "Critical" || status === "Old") {
                                            statusBg = "#fee2e2";
                                            statusColor = "#dc2626";
                                        } else if (status === "In Consult" || status === "New") {
                                            statusBg = "#dcfce7";
                                            statusColor = "#16a34a";
                                        }

                                        return (
                                            <TableRow key={apt.id} sx={{ "& td": { borderBottom: "1px solid #f8fafc", py: 2 } }}>
                                                {/* Time */}
                                                <TableCell sx={{ fontWeight: 700, color: "#2563eb", fontSize: "0.85rem" }}>
                                                    {apt?.formData?.dateTime ? moment(apt?.formData?.dateTime).format("hh:mm A") : "09:30 AM"}
                                                </TableCell>

                                                {/* Patient Info */}
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#e2e8f0", color: "#64748b", fontSize: "0.75rem", fontWeight: 700 }}>
                                                            {initials}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography fontWeight={700} color="#1e293b" fontSize="0.875rem" lineHeight={1.2}>
                                                                {pName}
                                                            </Typography>
                                                            <Typography variant="caption" color="#94a3b8" fontSize="0.7rem">
                                                                ID: #{apt?.id?.slice(-5) || "HSP-204"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <Chip
                                                        label={status.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: statusBg,
                                                            color: statusColor,
                                                            fontWeight: 800,
                                                            fontSize: "0.65rem",
                                                            borderRadius: "6px",
                                                            height: "22px",
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Type */}
                                                <TableCell sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                                                    {apt?.type || "Follow-up"}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        disableElevation
                                                        size="small"
                                                        onClick={() => handleCompleteAppointment(apt.id)}
                                                        sx={{
                                                            backgroundColor: "#eff6ff",
                                                            color: "#2563eb",
                                                            fontWeight: 700,
                                                            fontSize: "0.7rem",
                                                            borderRadius: "8px",
                                                            textTransform: "uppercase",
                                                            px: 1.5,
                                                            py: 0.6,
                                                            "&:hover": { backgroundColor: "#dbeafe" }
                                                        }}
                                                    >
                                                        Open Chart
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} textAlign="center">
                            <EventIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                            <Typography variant="body2" color="#64748b">
                                No appointments found for {DATE_FILTER_OPTIONS[dateFilter]}.
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Bottom Button */}
            <Box mt="auto" pt={2}>
                <Button
                    fullWidth
                    disableElevation
                    sx={{
                        backgroundColor: "#f8fafc",
                        color: "#64748b",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "12px",
                        py: 1.2,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        "&:hover": { backgroundColor: "#f1f5f9" }
                    }}
                >
                    View All Appointments ({appointments?.length || 0})
                </Button>
            </Box>
        </Paper>
    );

    const renderRecentConsultationsCard = () => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Box sx={{ width: 4, height: 22, backgroundColor: "#2563eb", borderRadius: "2px" }} />
                <Typography variant="h6" fontWeight={700} color="#1e293b" fontSize="1.1rem">
                    Recent Activity
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                {recentConsultations?.length > 0 ? (
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        {recentConsultations.map((apt, idx) => {
                            const isFirst = idx === 0;
                            return (
                                <Box key={apt.id || idx} display="flex" gap={2} position="relative">
                                    {/* Timeline Left Line & Indicator */}
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                border: "2px solid #2563eb",
                                                backgroundColor: isFirst ? "#2563eb" : "#ffffff",
                                                mt: "4px",
                                                zIndex: 1,
                                            }}
                                        />
                                        {idx < recentConsultations.length - 1 && (
                                            <Box
                                                sx={{
                                                    width: "2px",
                                                    backgroundColor: "#e2e8f0",
                                                    flexGrow: 1,
                                                    my: "4px",
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Timeline Content Right */}
                                    <Box flex={1} pb={1}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                            <Typography
                                                variant="caption"
                                                fontWeight={800}
                                                sx={{ color: isFirst ? "#2563eb" : "#94a3b8", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.5px" }}
                                            >
                                                {isFirst ? "JUST NOW" : moment(apt?.formData?.dateTime).fromNow()}
                                            </Typography>
                                            <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem" sx={{ textTransform: "uppercase" }}>
                                                {apt?.department || "CARDIOLOGY"}
                                            </Typography>
                                        </Box>

                                        <Typography fontWeight={700} color="#1e293b" fontSize="0.9rem" mb={0.5}>
                                            {apt?.type || "ECG Analysis"}: <span style={{ color: "#334155" }}>{apt?.formData?.patientDetails?.patientName || "Patient"}</span>
                                        </Typography>

                                        <Typography variant="body2" color="#64748b" fontSize="0.8rem" mb={1} lineHeight={1.4}>
                                            {apt?.formData?.remarks || "Report generated. Normal sinus rhythm detected with minor arrhythmia."}
                                        </Typography>

                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label="REPORT"
                                                size="small"
                                                sx={{ backgroundColor: "#f1f5f9", color: "#64748b", fontWeight: 700, fontSize: "0.6rem", height: 20, borderRadius: "4px" }}
                                            />
                                            <Chip
                                                label="ECG"
                                                size="small"
                                                sx={{ backgroundColor: "#f1f5f9", color: "#64748b", fontWeight: 700, fontSize: "0.6rem", height: 20, borderRadius: "4px" }}
                                            />
                                        </Stack>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} textAlign="center">
                        <Typography variant="body2" color="#94a3b8">
                            No consultation records are available yet.
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box mt="auto" pt={2}>
                <Button
                    fullWidth
                    disableElevation
                    sx={{
                        backgroundColor: "#f8fafc",
                        color: "#64748b",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "12px",
                        py: 1.2,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        "&:hover": { backgroundColor: "#f1f5f9" }
                    }}
                >
                    View Detailed History
                </Button>
            </Box>
        </Paper>
    );

    const renderPastAppointmentsTab = () => (
        <Box display="flex" flexDirection="column" gap={3}>
            {/* Filter Card */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", backgroundColor: "#ffffff" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "#94a3b8" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <MenuItem value="All">All Status</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Filter by Date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Past Appointments Table */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", backgroundColor: "#ffffff" }}>
                <Typography variant="h6" fontWeight={700} color="#1e293b" mb={2}>
                    Past Appointments ({getFilteredPastAppointments().length})
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            backgroundColor: "#f1f5f9",
                            p: "4px",
                            borderRadius: "100px",
                            display: "flex",
                        }}
                    >
                        <Button
                            onClick={() => setTabValue(0)}
                            sx={{
                                borderRadius: "100px",
                                px: 2.5,
                                py: 0.5,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor: tabValue === 0 ? "#ffffff" : "transparent",
                                color: tabValue === 0 ? "#1e293b" : "#64748b",
                                boxShadow: tabValue === 0 ? "0px 2px 6px rgba(0,0,0,0.06)" : "none",
                                "&:hover": { backgroundColor: tabValue === 0 ? "#ffffff" : "transparent" },
                            }}
                        >
                            Today
                        </Button>
                        <Button
                            onClick={() => setTabValue(1)}
                            sx={{
                                borderRadius: "100px",
                                px: 2.5,
                                py: 0.5,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor: tabValue === 1 ? "#ffffff" : "transparent",
                                color: tabValue === 1 ? "#64748b" : "#64748b",
                                boxShadow: tabValue === 1 ? "0px 2px 6px rgba(0,0,0,0.06)" : "none",
                                "&:hover": { backgroundColor: tabValue === 1 ? "#ffffff" : "transparent" },
                            }}
                        >
                            Past
                        </Button>
                    </Box>

                    <IconButton
                        size="small"
                        onClick={refetchAppointments}
                        disabled={loading?.appointmentLoading}
                        sx={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            p: 1,
                        }}
                    >
                        <TuneIcon sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ "& th": { borderBottom: "1px solid #f1f5f9" } }}>
                                <TableCell sx={{ fontWeight: 700, color: "#94a3b8" }}>Patient</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#94a3b8" }}>Date & Time</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#94a3b8" }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#94a3b8" }}>Gender / Age</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#94a3b8" }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#94a3b8" }}>Remarks</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading?.pastAppointmentLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : getFilteredPastAppointments().length > 0 ? (
                                getFilteredPastAppointments().map((apt, idx) => {
                                    const patientName = apt?.formData?.patientDetails?.patientName || apt?.patientName || "Unknown";
                                    const gender = apt?.formData?.patientDetails?.gender || "N/A";
                                    const age = apt?.formData?.patientDetails?.patientAge || "N/A";
                                    const category = apt?.formData?.patientDetails?.category;

                                    return (
                                        <TableRow key={apt.id || idx}>
                                            <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{patientName}</TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>
                                                {apt?.formData?.dateTime ? moment(apt?.formData.dateTime).format("DD MMM YYYY, hh:mm A") : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={apt?.status || "Completed"}
                                                    size="small"
                                                    color={apt?.status === "Completed" ? "success" : "warning"}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>{gender} / {age}</TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>{category || "-"}</TableCell>
                                            <TableCell sx={{ color: "#64748b", maxWidth: 200 }}>{apt?.formData?.remarks || "No remarks"}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#94a3b8" }}>
                                        No past appointments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    const renderEditAppointmentDialog = () => (
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Patient Name"
                            value={editFormData.patientName || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={editFormData.appointmentDate || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, appointmentDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Time"
                            type="time"
                            value={editFormData.appointmentTime || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, appointmentTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={editFormData.notes || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button onClick={handleUpdateAppointment} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", pb: 6, pt: 3 }}>
            <Container maxWidth="xl">
                {/* Top Pill Header Bar */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        {/* Hospital Tag Pill */}
                        <Paper
                            elevation={0}
                            sx={{
                                px: 2,
                                py: 0.8,
                                borderRadius: "100px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >
                            <Typography variant="body2" fontWeight={700} color="#1e293b" fontSize="0.8rem">
                                Mahatma Gandhi College & Hospital
                            </Typography>
                        </Paper>

                        {/* Date Tag Pill */}
                        <Paper
                            elevation={0}
                            sx={{
                                px: 2,
                                py: 0.8,
                                borderRadius: "100px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >
                            <CalendarTodayIcon sx={{ fontSize: "0.9rem", color: "#2563eb" }} />
                            <Typography variant="body2" fontWeight={700} color="#1e293b" fontSize="0.8rem">
                                {moment().format("MM/DD/YYYY")}
                            </Typography>
                        </Paper>
                    </Box>

                    <IconButton sx={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b" }}>
                        <SettingsIcon sx={{ fontSize: "1.2rem" }} />
                    </IconButton>
                </Box>

                {/* Welcome Section */}
                <Box mb={4}>
                    <Typography variant="h3" fontWeight={800} color="#0f172a" letterSpacing="-0.5px" mb={0.5}>
                        Welcome, Dr. {currentUser?.name || "N.D Soni"}
                    </Typography>
                    <Typography variant="body1" color="#64748b" fontSize="0.95rem">
                        Here is a brief overview of your clinical schedule for today.
                    </Typography>
                </Box>

                {/* Metric Cards Grid */}
                <Grid container spacing={2.5} mb={4}>
                    {/* Today's Appointments Metric */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "20px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                position: "relative",
                                height: "100%",
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ p: 1.2, borderRadius: "12px", backgroundColor: "#eff6ff", color: "#2563eb" }}>
                                    <EventIcon sx={{ fontSize: "1.4rem" }} />
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                    SCHEDULE
                                </Typography>
                            </Box>

                            <Box mt={3}>
                                <Typography variant="h2" fontWeight={800} color="#0f172a" lineHeight={1}>
                                    {doctorStats?.todayAppointments?.value ?? 24}
                                </Typography>

                                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={1}>
                                    <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ textTransform: "uppercase" }}>
                                        TODAY'S APPOINTMENTS
                                    </Typography>
                                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                                        <Chip
                                            icon={<TrendingUpIcon sx={{ fontSize: "0.8rem !important", color: "#16a34a !important" }} />}
                                            label="+4 TODAY"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#f0fdf4",
                                                color: "#16a34a",
                                                fontWeight: 800,
                                                fontSize: "0.65rem",
                                                height: 22,
                                                borderRadius: "6px",
                                                mb: 0.5
                                            }}
                                        />
                                        <Typography variant="caption" color="#94a3b8" fontSize="0.7rem" fontWeight={600}>
                                            09:00 - 17:00
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Pending Consultations Metric */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "20px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                position: "relative",
                                height: "100%",
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ p: 1.2, borderRadius: "12px", backgroundColor: "#f8fafc", color: "#64748b" }}>
                                    <AssignmentIcon sx={{ fontSize: "1.4rem" }} />
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                    PENDING
                                </Typography>
                            </Box>

                            <Box mt={3}>
                                <Typography variant="h2" fontWeight={800} color="#0f172a" lineHeight={1}>
                                    {String(doctorStats?.pendingConsultations?.value ?? 8).padStart(2, '0')}
                                </Typography>

                                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={1}>
                                    <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ textTransform: "uppercase" }}>
                                        CONSULTATIONS
                                    </Typography>
                                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                                        <Chip
                                            label="IN REVIEW"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#eff6ff",
                                                color: "#2563eb",
                                                fontWeight: 800,
                                                fontSize: "0.65rem",
                                                height: 22,
                                                borderRadius: "6px",
                                                mb: 0.5
                                            }}
                                        />
                                        <Typography variant="caption" color="#94a3b8" fontSize="0.7rem" fontWeight={600}>
                                            FOLLOW-UPS REQUIRED
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* In-Patient / Ward Patients Metric */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "20px",
                                backgroundColor: "#fff5f5",
                                border: "1px solid #ffe3e3",
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                position: "relative",
                                height: "100%",
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ p: 1.2, borderRadius: "12px", backgroundColor: "#fee2e2", color: "#dc2626" }}>
                                    <HotelIcon sx={{ fontSize: "1.4rem" }} />
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#dc2626" letterSpacing="0.5px">
                                    IN-PATIENT
                                </Typography>
                            </Box>

                            <Box mt={3}>
                                <Typography variant="h2" fontWeight={800} color="#dc2626" lineHeight={1}>
                                    {doctorStats?.totalPatients?.value ?? 12}
                                </Typography>

                                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={1}>
                                    <Typography variant="caption" fontWeight={700} color="#dc2626" sx={{ textTransform: "uppercase" }}>
                                        WARD PATIENTS
                                    </Typography>
                                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                                        <Chip
                                            label="STABLE"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#fee2e2",
                                                color: "#dc2626",
                                                fontWeight: 800,
                                                fontSize: "0.65rem",
                                                height: 22,
                                                borderRadius: "6px",
                                                mb: 0.5
                                            }}
                                        />
                                        <Typography variant="caption" color="#dc2626" fontSize="0.7rem" fontWeight={600}>
                                            NORTH WING
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Content Section (Appointments + Activity / Tab views) */}
                {tabValue === 0 ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            {renderTodayAppointmentsCard()}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {renderRecentConsultationsCard()}
                        </Grid>
                    </Grid>
                ) : (
                    renderPastAppointmentsTab()
                )}

                {/* Footer Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={6} pt={3} borderTop="1px solid #e2e8f0">
                    <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing="0.5px">
                        © 2026 HEALTHSYNC CLINICAL PRECISION
                    </Typography>
                    <Box display="flex" gap={3}>
                        <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ cursor: "pointer", letterSpacing: "0.5px" }}>
                            PRIVACY POLICY
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ cursor: "pointer", letterSpacing: "0.5px" }}>
                            SUPPORT
                        </Typography>
                    </Box>
                </Box>
            </Container>

            {/* Edit Appointment Dialog */}
            {renderEditAppointmentDialog()}
        </Box>
    );
};

export default DoctorDashboard;