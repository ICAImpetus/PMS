import React, { useState } from "react";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    MenuItem,
    Divider,
    IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Schedule as ScheduleIcon,
    Reschedule as RescheduleIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import toast from "react-hot-toast";

const AppointmentManagement = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [appointments, setAppointments] = useState([
        {
            id: 1,
            patientName: "Amit Sharma",
            patientId: "P001",
            appointmentDate: "2026-05-26",
            appointmentTime: "09:30 AM",
            status: "Scheduled",
            type: "OPD",
            notes: "First consultation - chest pain",
            rescheduleReason: "",
        },
        {
            id: 2,
            patientName: "Priya Singh",
            patientId: "P002",
            appointmentDate: "2026-05-26",
            appointmentTime: "10:00 AM",
            status: "Scheduled",
            type: "Follow-up",
            notes: "Post-angioplasty follow-up",
            rescheduleReason: "",
        },
        {
            id: 3,
            patientName: "Vikram Patel",
            patientId: "P003",
            appointmentDate: "2026-05-26",
            appointmentTime: "10:30 AM",
            status: "Scheduled",
            type: "OPD",
            notes: "ECG review and blood pressure check",
            rescheduleReason: "",
        },
        {
            id: 4,
            patientName: "Neha Gupta",
            patientId: "P004",
            appointmentDate: "2026-05-26",
            appointmentTime: "11:00 AM",
            status: "Scheduled",
            type: "Emergency",
            notes: "Acute myocardial infarction risk assessment",
            rescheduleReason: "",
        },
        {
            id: 5,
            patientName: "Rahul Verma",
            patientId: "P005",
            appointmentDate: "2026-05-26",
            appointmentTime: "02:00 PM",
            status: "Pending",
            type: "Follow-up",
            notes: "Arrhythmia management review",
            rescheduleReason: "",
        },
        {
            id: 6,
            patientName: "Anjali Kumar",
            patientId: "P006",
            appointmentDate: "2026-05-26",
            appointmentTime: "02:30 PM",
            status: "Scheduled",
            type: "OPD",
            notes: "Hypertension counseling",
            rescheduleReason: "",
        },
        {
            id: 7,
            patientName: "Sanjay Dubey",
            patientId: "P007",
            appointmentDate: "2026-05-26",
            appointmentTime: "03:00 PM",
            status: "Scheduled",
            type: "Follow-up",
            notes: "Valve replacement post-operative check",
            rescheduleReason: "",
        },
        {
            id: 8,
            patientName: "Divya Nair",
            patientId: "P008",
            appointmentDate: "2026-05-26",
            appointmentTime: "04:00 PM",
            status: "Scheduled",
            type: "OPD",
            notes: "Cardiac risk factor assessment",
            rescheduleReason: "",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        patientName: "",
        patientId: "",
        appointmentDate: "",
        appointmentTime: "",
        status: "Scheduled",
        type: "OPD",
        notes: "",
        rescheduleReason: "",
    });

    const [rescheduleData, setRescheduleData] = useState({
        appointmentId: null,
        newDate: "",
        newTime: "",
        reason: "",
    });

    const handleOpenDialog = (appointment = null) => {
        if (appointment) {
            setFormData(appointment);
            setEditingId(appointment.id);
        } else {
            setFormData({
                patientName: "",
                patientId: "",
                appointmentDate: "",
                appointmentTime: "",
                status: "Scheduled",
                type: "OPD",
                notes: "",
                rescheduleReason: "",
            });
            setEditingId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
    };

    const handleOpenRescheduleDialog = (appointment) => {
        setRescheduleData({
            appointmentId: appointment.id,
            newDate: appointment.appointmentDate,
            newTime: appointment.appointmentTime,
            reason: "",
        });
        setOpenRescheduleDialog(true);
    };

    const handleCloseRescheduleDialog = () => {
        setOpenRescheduleDialog(false);
        setRescheduleData({
            appointmentId: null,
            newDate: "",
            newTime: "",
            reason: "",
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRescheduleChange = (e) => {
        const { name, value } = e.target;
        setRescheduleData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        if (!formData.patientName || !formData.appointmentDate || !formData.appointmentTime) {
            toast.error("Please fill in all required fields!");
            return;
        }

        if (editingId) {
            setAppointments((prev) =>
                prev.map((apt) => (apt.id === editingId ? { ...formData, id: editingId } : apt))
            );
            toast.success("Appointment updated successfully!");
        } else {
            setAppointments((prev) => [
                ...prev,
                { ...formData, id: Math.max(...prev.map((a) => a.id), 0) + 1 },
            ]);
            toast.success("Appointment created successfully!");
        }
        handleCloseDialog();
    };

    const handleReschedule = () => {
        if (!rescheduleData.newDate || !rescheduleData.newTime || !rescheduleData.reason) {
            toast.error("Please fill in all reschedule fields!");
            return;
        }

        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === rescheduleData.appointmentId
                    ? {
                        ...apt,
                        appointmentDate: rescheduleData.newDate,
                        appointmentTime: rescheduleData.newTime,
                        rescheduleReason: rescheduleData.reason,
                    }
                    : apt
            )
        );
        toast.success("Appointment rescheduled successfully!");
        handleCloseRescheduleDialog();
    };

    const handleDelete = (id) => {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        toast.success("Appointment deleted successfully!");
    };

    const handleStatusChange = (id, newStatus) => {
        setAppointments((prev) =>
            prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
        toast.success(`Appointment marked as ${newStatus}!`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Scheduled":
                return "success";
            case "Pending":
                return "warning";
            case "Completed":
                return "info";
            case "Cancelled":
                return "error";
            default:
                return "default";
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "OPD":
                return "primary";
            case "Follow-up":
                return "secondary";
            case "Emergency":
                return "error";
            default:
                return "default";
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" color={colors.grey[100]} fontWeight="bold" mb={1}>
                        Appointment Management
                    </Typography>
                    <Typography color={colors.grey[300]} variant="body1">
                        Manage, schedule, and reschedule patient appointments
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ backgroundColor: colors.greenAccent[400] }}
                >
                    New Appointment
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.grey[300]} variant="body2">
                                Total Appointments
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {appointments.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.grey[300]} variant="body2">
                                Scheduled
                            </Typography>
                            <Typography variant="h4" color={colors.greenAccent[400]}>
                                {appointments.filter((a) => a.status === "Scheduled").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.grey[300]} variant="body2">
                                Pending
                            </Typography>
                            <Typography variant="h4" color={colors.yellowAccent[400]}>
                                {appointments.filter((a) => a.status === "Pending").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.grey[300]} variant="body2">
                                Completed
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {appointments.filter((a) => a.status === "Completed").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Appointments Table */}
            <Card sx={{ backgroundColor: colors.primary[400] }}>
                <CardHeader
                    title="All Appointments"
                    titleTypographyProps={{ color: colors.grey[100] }}
                />
                <Divider sx={{ borderColor: colors.primary[500] }} />
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                    <TableCell sx={{ color: colors.grey[100] }}>Patient Name</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>Patient ID</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>Date & Time</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>Type</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>Status</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>Notes</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointments.map((appointment) => (
                                    <TableRow
                                        key={appointment.id}
                                        sx={{
                                            "&:hover": { backgroundColor: colors.primary[500] },
                                            borderBottom: `1px solid ${colors.primary[500]}`,
                                        }}
                                    >
                                        <TableCell sx={{ color: colors.grey[100] }}>
                                            {appointment.patientName}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.grey[300] }}>
                                            {appointment.patientId}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.grey[300] }}>
                                            {appointment.appointmentDate} {appointment.appointmentTime}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={appointment.type}
                                                size="small"
                                                color={getTypeColor(appointment.type)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={appointment.status}
                                                size="small"
                                                color={getStatusColor(appointment.status)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: colors.grey[300], maxWidth: 150 }}>
                                            {appointment.notes}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5} flexWrap="wrap">
                                                <IconButton
                                                    size="small"
                                                    title="Reschedule"
                                                    onClick={() => handleOpenRescheduleDialog(appointment)}
                                                    sx={{
                                                        color: colors.blueAccent[400],
                                                        border: `1px solid ${colors.blueAccent[400]}`,
                                                    }}
                                                >
                                                    <ScheduleIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    title="Edit"
                                                    onClick={() => handleOpenDialog(appointment)}
                                                    sx={{
                                                        color: colors.blueAccent[400],
                                                        border: `1px solid ${colors.blueAccent[400]}`,
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    title="Delete"
                                                    onClick={() => handleDelete(appointment.id)}
                                                    sx={{
                                                        color: colors.redAccent[400],
                                                        border: `1px solid ${colors.redAccent[400]}`,
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
                    {editingId ? "Edit Appointment" : "Create New Appointment"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: colors.primary[500], pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Patient Name"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: colors.grey[300] },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Patient ID"
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: colors.grey[300] },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Appointment Date"
                                name="appointmentDate"
                                type="date"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                inputProps={{
                                    sx: { color: colors.grey[100] },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Appointment Time"
                                name="appointmentTime"
                                type="time"
                                value={formData.appointmentTime}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                inputProps={{
                                    sx: { color: colors.grey[100] },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: colors.grey[300] },
                                }}
                            >
                                <MenuItem value="OPD">OPD</MenuItem>
                                <MenuItem value="Follow-up">Follow-up</MenuItem>
                                <MenuItem value="Emergency">Emergency</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: colors.grey[300] },
                                }}
                            >
                                <MenuItem value="Scheduled">Scheduled</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: colors.grey[300] },
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: colors.primary[400], p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        {editingId ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reschedule Dialog */}
            <Dialog open={openRescheduleDialog} onClose={handleCloseRescheduleDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
                    Reschedule Appointment
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: colors.primary[500], pt: 2 }}>
                    <Typography color={colors.grey[300]} variant="body2" mb={2}>
                        Current Date & Time: {rescheduleData.newDate} {rescheduleData.newTime}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="New Date"
                                name="newDate"
                                type="date"
                                value={rescheduleData.newDate}
                                onChange={handleRescheduleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                inputProps={{
                                    sx: { color: colors.grey[100] },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="New Time"
                                name="newTime"
                                type="time"
                                value={rescheduleData.newTime}
                                onChange={handleRescheduleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                inputProps={{
                                    sx: { color: colors.grey[100] },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Reason for Rescheduling *"
                                name="reason"
                                value={rescheduleData.reason}
                                onChange={handleRescheduleChange}
                                placeholder="Please provide reason for rescheduling"
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        color: colors.grey[100],
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: colors.primary[300],
                                        },
                                    },
                                }}
                                InputLabelProps={{
                                    sx: { color: colors.grey[300] },
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: colors.primary[400], p: 2 }}>
                    <Button onClick={handleCloseRescheduleDialog}>Cancel</Button>
                    <Button onClick={handleReschedule} variant="contained" color="primary">
                        Reschedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AppointmentManagement;
