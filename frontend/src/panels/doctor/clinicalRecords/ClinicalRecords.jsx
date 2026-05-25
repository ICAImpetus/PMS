import React, { useState } from "react";
import {
    Box,
    Container,
    Card,
    CardContent,
    CardHeader,
    Grid,
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
    TextField,
    MenuItem,
    Divider,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    FileDownload as FileDownloadIcon,
    Description as DescriptionIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import toast from "react-hot-toast";

const ClinicalRecords = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [activeTab, setActiveTab] = useState(0);

    const [records, setRecords] = useState([
        {
            id: 1,
            patientName: "John Doe",
            patientId: "P001",
            recordType: "Prescription",
            date: "2026-05-25",
            diagnosis: "Hypertension",
            medicines: "Amlodipine 5mg, Lisinopril 10mg",
            documentUrl: "prescription_001.pdf",
            status: "Active",
        },
        {
            id: 2,
            patientName: "Jane Smith",
            patientId: "P002",
            recordType: "Lab Report",
            date: "2026-05-24",
            diagnosis: "Diabetes Type 2",
            medicines: "Blood Sugar Level: 145 mg/dL",
            documentUrl: "lab_report_002.pdf",
            status: "Completed",
        },
        {
            id: 3,
            patientName: "Mike Johnson",
            patientId: "P003",
            recordType: "Surgery Report",
            date: "2026-05-20",
            diagnosis: "Appendicitis",
            medicines: "Appendectomy performed successfully",
            documentUrl: "surgery_report_003.pdf",
            status: "Completed",
        },
        {
            id: 4,
            patientName: "John Doe",
            patientId: "P001",
            recordType: "Discharge Summary",
            date: "2026-05-18",
            diagnosis: "Post-operative follow-up",
            medicines: "Continue current medications",
            documentUrl: "discharge_summary_001.pdf",
            status: "Completed",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [formData, setFormData] = useState({
        patientName: "",
        patientId: "",
        recordType: "Prescription",
        date: "",
        diagnosis: "",
        medicines: "",
        documentUrl: "",
        status: "Active",
    });

    const recordTypes = [
        "Prescription",
        "Lab Report",
        "Surgery Report",
        "Discharge Summary",
        "Medical History",
        "X-Ray Report",
        "CT Scan Report",
    ];

    const handleOpenDialog = (record = null) => {
        if (record) {
            setFormData(record);
            setEditingId(record.id);
        } else {
            setFormData({
                patientName: "",
                patientId: "",
                recordType: "Prescription",
                date: "",
                diagnosis: "",
                medicines: "",
                documentUrl: "",
                status: "Active",
            });
            setEditingId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
    };

    const handleOpenViewDialog = (record) => {
        setViewingRecord(record);
        setOpenViewDialog(true);
    };

    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setViewingRecord(null);
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
            setRecords((prev) =>
                prev.map((rec) => (rec.id === editingId ? { ...formData, id: editingId } : rec))
            );
            toast.success("Record updated successfully!");
        } else {
            setRecords((prev) => [
                ...prev,
                { ...formData, id: Math.max(...prev.map((r) => r.id), 0) + 1 },
            ]);
            toast.success("Record created successfully!");
        }
        handleCloseDialog();
    };

    const handleDelete = (id) => {
        setRecords((prev) => prev.filter((rec) => rec.id !== id));
        toast.success("Record deleted successfully!");
    };

    const handleDownload = (fileName) => {
        toast.success(`Downloading ${fileName}...`);
    };

    const getRecordTypeColor = (type) => {
        const colors_map = {
            Prescription: "primary",
            "Lab Report": "secondary",
            "Surgery Report": "error",
            "Discharge Summary": "success",
            "Medical History": "info",
            "X-Ray Report": "warning",
            "CT Scan Report": "warning",
        };
        return colors_map[type] || "default";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "success";
            case "Completed":
                return "info";
            case "Archived":
                return "default";
            default:
                return "default";
        }
    };

    const filteredRecords =
        activeTab === 0
            ? records
            : activeTab === 1
                ? records.filter((r) => r.status === "Active")
                : activeTab === 2
                    ? records.filter((r) => r.recordType === "Prescription")
                    : records.filter((r) => r.recordType === "Lab Report");

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                        Clinical Records
                    </Typography>
                    <Typography color={colors.gray[300]} variant="body1">
                        Manage and maintain patient clinical documentation
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ backgroundColor: colors.greenAccent[400] }}
                >
                    Add Record
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Total Records
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {records.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Prescriptions
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {records.filter((r) => r.recordType === "Prescription").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Lab Reports
                            </Typography>
                            <Typography variant="h4" color={colors.yellowAccent[400]}>
                                {records.filter((r) => r.recordType === "Lab Report").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Active Records
                            </Typography>
                            <Typography variant="h4" color={colors.greenAccent[400]}>
                                {records.filter((r) => r.status === "Active").length}
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
                    <Tab label={`All (${records.length})`} />
                    <Tab label={`Active (${records.filter((r) => r.status === "Active").length})`} />
                    <Tab label={`Prescriptions (${records.filter((r) => r.recordType === "Prescription").length})`} />
                    <Tab label={`Lab Reports (${records.filter((r) => r.recordType === "Lab Report").length})`} />
                </Tabs>
            </Card>

            {/* Records Table */}
            <Card sx={{ backgroundColor: colors.primary[400] }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                    <TableCell sx={{ color: colors.gray[100] }}>Patient Name</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Record Type</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Date</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Diagnosis</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Status</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRecords.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        sx={{
                                            "&:hover": { backgroundColor: colors.primary[500] },
                                            borderBottom: `1px solid ${colors.primary[500]}`,
                                        }}
                                    >
                                        <TableCell sx={{ color: colors.gray[100] }}>
                                            {record.patientName}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.recordType}
                                                size="small"
                                                color={getRecordTypeColor(record.recordType)}
                                                variant="outlined"
                                                icon={<DescriptionIcon />}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {record.date}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300], maxWidth: 150 }}>
                                            {record.diagnosis}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.status}
                                                size="small"
                                                color={getStatusColor(record.status)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleOpenViewDialog(record)}
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
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownload(record.documentUrl)}
                                                    sx={{
                                                        color: colors.greenAccent[400],
                                                        borderColor: colors.greenAccent[400],
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenDialog(record)}
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
                                                    onClick={() => handleDelete(record.id)}
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
                <DialogTitle>{editingId ? "Edit Clinical Record" : "Add New Clinical Record"}</DialogTitle>
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
                                label="Record Type"
                                name="recordType"
                                value={formData.recordType}
                                onChange={handleChange}
                                variant="outlined"
                            >
                                {recordTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
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
                                rows={3}
                                label="Medicines / Details"
                                name="medicines"
                                value={formData.medicines}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Document URL / File"
                                name="documentUrl"
                                value={formData.documentUrl}
                                onChange={handleChange}
                                variant="outlined"
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
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Archived">Archived</MenuItem>
                            </TextField>
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

            {/* View Dialog */}
            <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Clinical Record Details</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {viewingRecord && (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Patient Name
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingRecord.patientName}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Record Type
                                </Typography>
                                <Chip
                                    label={viewingRecord.recordType}
                                    size="small"
                                    color={getRecordTypeColor(viewingRecord.recordType)}
                                    variant="outlined"
                                    icon={<DescriptionIcon />}
                                />
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Diagnosis
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingRecord.diagnosis}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Medicines / Details
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingRecord.medicines}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Date
                                </Typography>
                                <Typography color={colors.gray[100]} variant="body1">
                                    {viewingRecord.date}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography color={colors.gray[300]} variant="caption">
                                    Status
                                </Typography>
                                <Chip
                                    label={viewingRecord.status}
                                    size="small"
                                    color={getStatusColor(viewingRecord.status)}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {viewingRecord && (
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={() => handleDownload(viewingRecord.documentUrl)}
                        >
                            Download Document
                        </Button>
                    )}
                    <Button onClick={handleCloseViewDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ClinicalRecords;
