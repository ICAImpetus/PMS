import React, { useState } from "react";
import {
    Box,
    Container,
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    Button,
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
    Switch,
    FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import toast from "react-hot-toast";

const ScheduleManagement = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [schedules, setSchedules] = useState([
        {
            id: 1,
            day: "Monday",
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            slotDuration: 30,
            available: true,
            maxPatients: 20,
        },
        {
            id: 2,
            day: "Tuesday",
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            slotDuration: 30,
            available: true,
            maxPatients: 20,
        },
        {
            id: 3,
            day: "Wednesday",
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            slotDuration: 30,
            available: true,
            maxPatients: 20,
        },
        {
            id: 4,
            day: "Thursday",
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            slotDuration: 30,
            available: true,
            maxPatients: 20,
        },
        {
            id: 5,
            day: "Friday",
            startTime: "09:00 AM",
            endTime: "03:00 PM",
            slotDuration: 30,
            available: true,
            maxPatients: 15,
        },
        {
            id: 6,
            day: "Saturday",
            startTime: "10:00 AM",
            endTime: "02:00 PM",
            slotDuration: 30,
            available: true,
            maxPatients: 10,
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        day: "",
        startTime: "",
        endTime: "",
        slotDuration: 30,
        available: true,
        maxPatients: 20,
    });

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const handleOpenDialog = (schedule = null) => {
        if (schedule) {
            setFormData(schedule);
            setEditingId(schedule.id);
        } else {
            setFormData({
                day: "",
                startTime: "",
                endTime: "",
                slotDuration: 30,
                available: true,
                maxPatients: 20,
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
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = () => {
        if (!formData.day || !formData.startTime || !formData.endTime) {
            toast.error("Please fill in all required fields!");
            return;
        }

        if (editingId) {
            setSchedules((prev) =>
                prev.map((sch) => (sch.id === editingId ? { ...formData, id: editingId } : sch))
            );
            toast.success("Schedule updated successfully!");
        } else {
            setSchedules((prev) => [
                ...prev,
                { ...formData, id: Math.max(...prev.map((s) => s.id), 0) + 1 },
            ]);
            toast.success("Schedule created successfully!");
        }
        handleCloseDialog();
    };

    const handleDelete = (id) => {
        setSchedules((prev) => prev.filter((sch) => sch.id !== id));
        toast.success("Schedule deleted successfully!");
    };

    const handleToggleAvailability = (id) => {
        setSchedules((prev) =>
            prev.map((sch) => (sch.id === id ? { ...sch, available: !sch.available } : sch))
        );
    };

    const calculateTotalSlots = (schedule) => {
        const startHour = parseInt(schedule.startTime.split(":")[0]);
        const endHour = parseInt(schedule.endTime.split(":")[0]);
        const totalHours = endHour - startHour;
        const slots = (totalHours * 60) / schedule.slotDuration;
        return Math.floor(slots);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                        Schedule Management
                    </Typography>
                    <Typography color={colors.gray[300]} variant="body1">
                        Manage your weekly consultation schedule and availability
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ backgroundColor: colors.greenAccent[400] }}
                >
                    Add Schedule
                </Button>
            </Box>

            {/* Info Card */}
            <Card sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Typography color={colors.gray[300]} variant="body2">
                                    Days Available
                                </Typography>
                                <Typography variant="h4" color={colors.greenAccent[400]}>
                                    {schedules.filter((s) => s.available).length}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Typography color={colors.gray[300]} variant="body2">
                                    Total Daily Slots
                                </Typography>
                                <Typography variant="h4" color={colors.blueAccent[400]}>
                                    {schedules.reduce((acc, sch) => acc + calculateTotalSlots(sch), 0)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Typography color={colors.gray[300]} variant="body2">
                                    Weekly Capacity
                                </Typography>
                                <Typography variant="h4" color={colors.yellowAccent[400]}>
                                    {schedules.reduce((acc, sch) => acc + sch.maxPatients, 0)} patients
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Schedule Table */}
            <Card sx={{ backgroundColor: colors.primary[400] }}>
                <CardHeader
                    title="Weekly Schedule"
                    titleTypographyProps={{ color: colors.gray[100] }}
                />
                <Divider sx={{ borderColor: colors.primary[500] }} />
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                    <TableCell sx={{ color: colors.gray[100] }}>Day</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Start Time</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>End Time</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Slot Duration</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Total Slots</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Max Patients</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Status</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schedules.map((schedule) => (
                                    <TableRow
                                        key={schedule.id}
                                        sx={{
                                            "&:hover": { backgroundColor: colors.primary[500] },
                                            borderBottom: `1px solid ${colors.primary[500]}`,
                                            opacity: schedule.available ? 1 : 0.6,
                                        }}
                                    >
                                        <TableCell sx={{ color: colors.gray[100], fontWeight: "bold" }}>
                                            {schedule.day}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {schedule.startTime}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {schedule.endTime}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {schedule.slotDuration} min
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {calculateTotalSlots(schedule)}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {schedule.maxPatients}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={schedule.available ? "Available" : "Unavailable"}
                                                size="small"
                                                color={schedule.available ? "success" : "error"}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenDialog(schedule)}
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
                                                    onClick={() => handleToggleAvailability(schedule.id)}
                                                    sx={{
                                                        color: schedule.available
                                                            ? colors.redAccent[400]
                                                            : colors.greenAccent[400],
                                                        borderColor: schedule.available
                                                            ? colors.redAccent[400]
                                                            : colors.greenAccent[400],
                                                    }}
                                                >
                                                    {schedule.available ? "Mark Off" : "Mark On"}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDelete(schedule.id)}
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
                <DialogTitle>{editingId ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Day"
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                                variant="outlined"
                            >
                                {days.map((day) => (
                                    <MenuItem key={day} value={day}>
                                        {day}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Start Time"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="End Time"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Slot Duration (minutes)"
                                name="slotDuration"
                                value={formData.slotDuration}
                                onChange={handleChange}
                                variant="outlined"
                            >
                                <MenuItem value={15}>15 minutes</MenuItem>
                                <MenuItem value={30}>30 minutes</MenuItem>
                                <MenuItem value={45}>45 minutes</MenuItem>
                                <MenuItem value={60}>60 minutes</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Max Patients"
                                name="maxPatients"
                                type="number"
                                value={formData.maxPatients}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="available"
                                        checked={formData.available}
                                        onChange={handleChange}
                                    />
                                }
                                label={formData.available ? "Available" : "Unavailable"}
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

export default ScheduleManagement;
