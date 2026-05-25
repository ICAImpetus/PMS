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
    Tabs,
    Tab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import toast from "react-hot-toast";

const PatientConsultations = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [activeTab, setActiveTab] = useState(0);

    const [consultations, setConsultations] = useState([
        {
            id: 1,
            patientName: "John Doe",
            patientId: "P001",
            consultationType: "OPD",
            date: "2026-05-25",
            time: "10:00 AM",
            diagnosis: "Hypertension",
            prescription: "Amlodipine 5mg daily",
            status: "Completed",
            notes: "Patient responded well to treatment",
        },
        {
            id: 2,
            patientName: "Jane Smith",
            patientId: "P002",
            consultationType: "Follow-up",
            date: "2026-05-25",
            time: "10:30 AM",
            diagnosis: "Diabetes Type 2",
            prescription: "Metformin 500mg twice daily",
            status: "Ongoing",
            notes: "Blood sugar levels improving",
        },
        {
            id: 3,
            patientName: "Mike Johnson",
            patientId: "P003",
            consultationType: "Emergency",
            date: "2026-05-24",
            time: "02:00 PM",
            diagnosis: "Acute Gastroenteritis",
            prescription: "IV fluids, Ondansetron",
            status: "Completed",
            notes: "Patient stabilized and discharged",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewingConsultation, setViewingConsultation] = useState(null);
    const [formData, setFormData] = useState({
        patientName: "",
        patientId: "",
        consultationType: "OPD",
        date: "",
        time: "",
        diagnosis: "",
        prescription: "",
        status: "Ongoing",
        notes: "",
    });

    const handleOpenDialog = (consultation = null) => {
        if (consultation) {
            setFormData(consultation);
            setEditingId(consultation.id);
        } else {
            setFormData({
                patientName: "",
                patientId: "",
                consultationType: "OPD",
                date: "",
                time: "",
                diagnosis: "",
                prescription: "",
                status: "Ongoing",
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

    const handleOpenViewDialog = (consultation) => {
        setViewingConsultation(consultation);
        setOpenViewDialog(true);
    };

    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setViewingConsultation(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        if (!formData.patientName || !formData.date || !formData.diagnosis) {
            toast.error("Please fill in all required fields!");
            return;
        }

        if (editingId) {
            setConsultations((prev) =>
                prev.map((con) => (con.id === editingId ? { ...formData, id: editingId } : con))
            );
            toast.success("Consultation updated successfully!");
        } else {
            setConsultations((prev) => [
                ...prev,
                { ...formData, id: Math.max(...prev.map((c) => c.id), 0) + 1 },
            ]);
            toast.success("Consultation recorded successfully!");
        }
        handleCloseDialog();
    };

    const handleDelete = (id) => {
        setConsultations((prev) => prev.filter((con) => con.id !== id));
        toast.success("Consultation deleted successfully!");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "success";
            case "Ongoing":
                return "warning";
            case "Pending":
                return "info";
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

    const filteredConsultations =
        activeTab === 0 ? consultations :
            activeTab === 1 ? consultations.filter((c) => c.status === "Ongoing") :
                consultations.filter((c) => c.status === "Completed");

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                        Patient Consultations
                    </Typography>
                    <Typography color={colors.gray[300]} variant="body1">
                        Track and manage all patient consultation records
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ backgroundColor: colors.greenAccent[400] }}
                >
                    New Consultation
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Total Consultations
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {consultations.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Ongoing
                            </Typography>
                            <Typography variant="h4" color={colors.yellowAccent[400]}>
                                {consultations.filter((c) => c.status === "Ongoing").length}
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
                            <Typography variant="h4" color={colors.greenAccent[400]}>
                                {consultations.filter((c) => c.status === "Completed").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                OPD Consultations
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {consultations.filter((c) => c.consultationType === "OPD").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Card sx={{ backgroundColor: colors.primary[400], mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, value) => setActiveTab(value)}
                    sx={{
                        "& .MuiTab-root": {
                            color: colors.gray[300],
                            "&.Mui-selected": {
                                color: colors.blueAccent[400],
                            },
                        },
                        borderBottom: `1px solid ${colors.primary[500]}`,
                        px: 2,
                    }}
                >
                    <Tab label={`All (${consultations.length})`} />
                    <Tab label={`Ongoing (${consultations.filter((c) => c.status === "Ongoing").length})`} />
                    <Tab label={`Completed (${consultations.filter((c) => c.status === "Completed").length})`} />
                </Tabs>
            </Card>

            {/* Consultations Table */}
            <Card sx={{ backgroundColor: colors.primary[400] }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                    <TableCell sx={{ color: colors.gray[100] }}>Patient Name</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Type</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Date & Time</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Diagnosis</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Status</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredConsultations.map((consultation) => (
                                    <TableRow
                                        key={consultation.id}
                                        sx={{
                                            "&:hover": { backgroundColor: colors.primary[500] },
                                            borderBottom: `1px solid ${colors.primary[500]}`,
                                        }}
                                    >
                                        <TableCell sx={{ color: colors.gray[100] }}>
                                            {consultation.patientName}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={consultation.consultationType}
                                                size="small"
                                                color={getTypeColor(consultation.consultationType)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {consultation.date} {consultation.time}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300], maxWidth: 150 }}>
                                            {consultation.diagnosis}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={consultation.status}
                                                size="small"
                                                color={getStatusColor(consultation.status)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleOpenViewDialog(consultation)}
                                                    sx={{
                                                        color: colors.blueAccent[400],
                                                        borderColor: colors.blueAccent[400],
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenDialog(consultation)}
                                                    sx={{
                                                        color: colors.yellowAccent[400],
                                                        borderColor: colors.yellowAccent[400],
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDelete(consultation.id)}
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
                <DialogTitle>{editingId ? "Edit Consultation" : "Record New Consultation"}</DialogTitle>
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
                                select
                                label="Consultation Type"
                                name="consultationType"
                                value={formData.consultationType}
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
                                label="Date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Time"
                                name="time"
                                type="time"
                                value={formData.time}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
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
                                <MenuItem value="Ongoing">Ongoing</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Diagnosis"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Prescription"
                                name="prescription"
                                value={formData.prescription}
                                onChange={handleChange}
                                variant="outlined"
                            />
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
                        {editingId ? "Update" : "Record"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Consultation Details</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {viewingConsultation && (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Patient Name
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingConsultation.patientName}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Consultation Type
                                </Typography>
                                <Chip
                                    label={viewingConsultation.consultationType}
                                    size="small"
                                    color={getTypeColor(viewingConsultation.consultationType)}
                                    variant="outlined"
                                />
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Diagnosis
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingConsultation.diagnosis}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Prescription
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingConsultation.prescription}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Notes
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingConsultation.notes}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseViewDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PatientConsultations;
