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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import toast from "react-hot-toast";

const AppointmentManagement = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [appointments, setAppointments] = useState([
        {
            id: 1,
            patientName: "John Doe",
            patientId: "P001",
            appointmentDate: "2026-05-25",
            appointmentTime: "10:00 AM",
            status: "Scheduled",
            type: "OPD",
            notes: "First consultation",
        },
        {
            id: 2,
            patientName: "Jane Smith",
            patientId: "P002",
            appointmentDate: "2026-05-25",
            appointmentTime: "10:30 AM",
            status: "Scheduled",
            type: "Follow-up",
            notes: "Post-treatment follow-up",
        },
        {
            id: 3,
            patientName: "Mike Johnson",
            patientId: "P003",
            appointmentDate: "2026-05-26",
            appointmentTime: "02:00 PM",
            status: "Pending",
            type: "Emergency",
            notes: "Urgent case",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        patientName: "",
        patientId: "",
        appointmentDate: "",
        appointmentTime: "",
        status: "Scheduled",
        type: "OPD",
        notes: "",
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
            });
            setEditingId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
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
                    <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                        Appointment Management
                    </Typography>
                    <Typography color={colors.gray[300]} variant="body1">
                        Manage and schedule patient appointments
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
                            <Typography color={colors.gray[300]} variant="body2">
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
                            <Typography color={colors.gray[300]} variant="body2">
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
                            <Typography color={colors.gray[300]} variant="body2">
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
                            <Typography color={colors.gray[300]} variant="body2">
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
                    titleTypographyProps={{ color: colors.gray[100] }}
                />
                <Divider sx={{ borderColor: colors.primary[500] }} />
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                    <TableCell sx={{ color: colors.gray[100] }}>Patient Name</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Patient ID</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Date & Time</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Type</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Status</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Notes</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Actions</TableCell>
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
                                        <TableCell sx={{ color: colors.gray[100] }}>
                                            {appointment.patientName}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {appointment.patientId}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
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
                                        <TableCell sx={{ color: colors.gray[300], maxWidth: 150 }}>
                                            {appointment.notes}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenDialog(appointment)}
                                                    sx={{
                                                        color: colors.blueAccent[400],
                                                        borderColor: colors.blueAccent[400],
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDelete(appointment.id)}
                                                    sx={{ color: colors.redAccent[400], borderColor: colors.redAccent[400] }}
                                                >
                                                    Delete
                                                </Button>
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
                <DialogTitle>{editingId ? "Edit Appointment" : "Create New Appointment"}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Patient Name"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                variant="outlined"
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        {editingId ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AppointmentManagement;
