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
    Alert,
    Divider,
    TextField,
    MenuItem,
    Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Check as CheckIcon,
    Phone as PhoneIcon,
    LocationOn as LocationOnIcon,
    Schedule as ScheduleIcon,
    Close as CloseIcon,
    Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import toast from "react-hot-toast";

const EmergencyAlerts = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [alerts, setAlerts] = useState([
        {
            id: 1,
            patientName: "John Doe",
            patientId: "P001",
            severity: "Critical",
            condition: "Acute Myocardial Infarction",
            location: "Emergency Ward - Room 5",
            timestamp: "2026-05-25 02:30 PM",
            contactNumber: "+91-9876543210",
            status: "Pending",
            notes: "Patient presenting with chest pain and shortness of breath",
        },
        {
            id: 2,
            patientName: "Jane Smith",
            patientId: "P002",
            severity: "High",
            condition: "Severe Allergic Reaction",
            location: "Emergency Ward - Room 3",
            timestamp: "2026-05-25 01:45 PM",
            contactNumber: "+91-9876543211",
            status: "In Progress",
            notes: "Anaphylaxis response, epinephrine administered",
        },
        {
            id: 3,
            patientName: "Mike Johnson",
            patientId: "P003",
            severity: "Medium",
            condition: "Severe Dehydration",
            location: "OPD - Ward 2",
            timestamp: "2026-05-25 12:15 PM",
            contactNumber: "+91-9876543212",
            status: "Resolved",
            notes: "IV fluid therapy initiated, vitals stable",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [viewingAlert, setViewingAlert] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("all");

    const handleOpenViewDialog = (alert) => {
        setViewingAlert(alert);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setViewingAlert(null);
    };

    const handleStatusChange = (id, newStatus) => {
        setAlerts((prev) =>
            prev.map((alert) => (alert.id === id ? { ...alert, status: newStatus } : alert))
        );
        toast.success(`Alert status updated to ${newStatus}`);
    };

    const handleAcknowledge = (id) => {
        handleStatusChange(id, "In Progress");
    };

    const handleResolve = (id) => {
        handleStatusChange(id, "Resolved");
    };

    const handleContactPatient = (phoneNumber) => {
        toast.success(`Initiating call to ${phoneNumber}...`);
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case "Critical":
                return <ErrorIcon sx={{ color: colors.redAccent[400] }} />;
            case "High":
                return <WarningIcon sx={{ color: colors.yellowAccent[400] }} />;
            case "Medium":
                return <InfoIcon sx={{ color: colors.blueAccent[400] }} />;
            default:
                return <InfoIcon />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "Critical":
                return "error";
            case "High":
                return "warning";
            case "Medium":
                return "info";
            default:
                return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "warning";
            case "In Progress":
                return "info";
            case "Resolved":
                return "success";
            default:
                return "default";
        }
    };

    const filteredAlerts =
        selectedFilter === "all" ? alerts :
            selectedFilter === "pending" ? alerts.filter((a) => a.status === "Pending") :
                selectedFilter === "inprogress" ? alerts.filter((a) => a.status === "In Progress") :
                    alerts.filter((a) => a.status === "Resolved");

    const pendingCount = alerts.filter((a) => a.status === "Pending").length;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                        Emergency Alerts
                    </Typography>
                    <Typography color={colors.gray[300]} variant="body1">
                        Monitor and respond to critical patient situations
                    </Typography>
                </Box>
                <Badge
                    badgeContent={pendingCount}
                    color="error"
                    overlap="circular"
                    invisible={pendingCount === 0}
                >
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.primary[400],
                        }}
                    >
                        <WarningIcon sx={{ fontSize: "2rem", color: colors.redAccent[400] }} />
                    </Box>
                </Badge>
            </Box>

            {/* Alert Banner */}
            {pendingCount > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography fontWeight="bold">
                        ⚠️ {pendingCount} Pending Emergency Alert{pendingCount > 1 ? "s" : ""}
                    </Typography>
                    <Typography variant="body2">
                        Please review and take appropriate action on pending emergencies
                    </Typography>
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Total Alerts
                            </Typography>
                            <Typography variant="h4" color={colors.blueAccent[400]}>
                                {alerts.length}
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
                            <Typography variant="h4" color={colors.redAccent[400]}>
                                {alerts.filter((a) => a.status === "Pending").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                In Progress
                            </Typography>
                            <Typography variant="h4" color={colors.yellowAccent[400]}>
                                {alerts.filter((a) => a.status === "In Progress").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: colors.primary[400] }}>
                        <CardContent>
                            <Typography color={colors.gray[300]} variant="body2">
                                Resolved
                            </Typography>
                            <Typography variant="h4" color={colors.greenAccent[400]}>
                                {alerts.filter((a) => a.status === "Resolved").length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Buttons */}
            <Box mb={3} display="flex" gap={2} flexWrap="wrap">
                <Button
                    variant={selectedFilter === "all" ? "contained" : "outlined"}
                    onClick={() => setSelectedFilter("all")}
                    sx={{
                        backgroundColor: selectedFilter === "all" ? colors.blueAccent[400] : "transparent",
                    }}
                >
                    All
                </Button>
                <Button
                    variant={selectedFilter === "pending" ? "contained" : "outlined"}
                    onClick={() => setSelectedFilter("pending")}
                    sx={{
                        backgroundColor: selectedFilter === "pending" ? colors.redAccent[400] : "transparent",
                    }}
                >
                    Pending
                </Button>
                <Button
                    variant={selectedFilter === "inprogress" ? "contained" : "outlined"}
                    onClick={() => setSelectedFilter("inprogress")}
                    sx={{
                        backgroundColor: selectedFilter === "inprogress" ? colors.yellowAccent[400] : "transparent",
                    }}
                >
                    In Progress
                </Button>
                <Button
                    variant={selectedFilter === "resolved" ? "contained" : "outlined"}
                    onClick={() => setSelectedFilter("resolved")}
                    sx={{
                        backgroundColor: selectedFilter === "resolved" ? colors.greenAccent[400] : "transparent",
                    }}
                >
                    Resolved
                </Button>
            </Box>

            {/* Alerts Table */}
            <Card sx={{ backgroundColor: colors.primary[400] }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                    <TableCell sx={{ color: colors.gray[100] }}>Severity</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Patient Name</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Condition</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Location</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Time</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Status</TableCell>
                                    <TableCell sx={{ color: colors.gray[100] }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredAlerts.map((alert) => (
                                    <TableRow
                                        key={alert.id}
                                        sx={{
                                            "&:hover": { backgroundColor: colors.primary[500] },
                                            borderBottom: `1px solid ${colors.primary[500]}`,
                                            backgroundColor:
                                                alert.status === "Pending" ? `${colors.redAccent[900]}30` : "transparent",
                                        }}
                                    >
                                        <TableCell sx={{ color: colors.gray[100] }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getSeverityIcon(alert.severity)}
                                                <Chip
                                                    label={alert.severity}
                                                    size="small"
                                                    color={getSeverityColor(alert.severity)}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[100] }}>
                                            {alert.patientName}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {alert.condition}
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <LocationOnIcon sx={{ fontSize: "1rem", color: colors.blueAccent[400] }} />
                                                {alert.location}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: colors.gray[300] }}>
                                            {alert.timestamp}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={alert.status}
                                                size="small"
                                                color={getStatusColor(alert.status)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleOpenViewDialog(alert)}
                                                    sx={{
                                                        color: colors.blueAccent[400],
                                                        borderColor: colors.blueAccent[400],
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                {alert.status === "Pending" && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleAcknowledge(alert.id)}
                                                        sx={{
                                                            color: colors.yellowAccent[400],
                                                            borderColor: colors.yellowAccent[400],
                                                        }}
                                                    >
                                                        Acknowledge
                                                    </Button>
                                                )}
                                                {alert.status !== "Resolved" && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<CheckIcon />}
                                                        onClick={() => handleResolve(alert.id)}
                                                        sx={{
                                                            color: colors.greenAccent[400],
                                                            borderColor: colors.greenAccent[400],
                                                        }}
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PhoneIcon />}
                                                    onClick={() => handleContactPatient(alert.contactNumber)}
                                                    sx={{
                                                        color: colors.blueAccent[400],
                                                        borderColor: colors.blueAccent[400],
                                                    }}
                                                >
                                                    Call
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

            {/* View Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.gray[100] }}>
                    Emergency Alert Details
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
                    {viewingAlert && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Alert Level Warning */}
                            {viewingAlert.severity === "Critical" && (
                                <Alert severity="error">
                                    <Typography fontWeight="bold">CRITICAL ALERT - Immediate Attention Required</Typography>
                                </Alert>
                            )}

                            {/* Patient Information */}
                            <Box>
                                <Typography color={colors.gray[300]} variant="subtitle2" fontWeight="bold">
                                    PATIENT INFORMATION
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Name
                                        </Typography>
                                        <Typography color={colors.gray[100]} variant="body1">
                                            {viewingAlert.patientName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Patient ID
                                        </Typography>
                                        <Typography color={colors.gray[100]} variant="body1">
                                            {viewingAlert.patientId}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Contact Number
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography color={colors.gray[100]} variant="body1">
                                                {viewingAlert.contactNumber}
                                            </Typography>
                                            <Button
                                                size="small"
                                                startIcon={<PhoneIcon />}
                                                onClick={() => handleContactPatient(viewingAlert.contactNumber)}
                                            >
                                                Call
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Alert Details */}
                            <Box>
                                <Typography color={colors.gray[300]} variant="subtitle2" fontWeight="bold">
                                    ALERT DETAILS
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Severity
                                        </Typography>
                                        <Chip
                                            label={viewingAlert.severity}
                                            color={getSeverityColor(viewingAlert.severity)}
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={viewingAlert.status}
                                            color={getStatusColor(viewingAlert.status)}
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Condition
                                        </Typography>
                                        <Typography color={colors.gray[100]} variant="body1">
                                            {viewingAlert.condition}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Location
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <LocationOnIcon sx={{ color: colors.blueAccent[400] }} />
                                            <Typography color={colors.gray[100]} variant="body1">
                                                {viewingAlert.location}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography color={colors.gray[300]} variant="caption">
                                            Reported At
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <ScheduleIcon sx={{ color: colors.blueAccent[400] }} />
                                            <Typography color={colors.gray[100]} variant="body1">
                                                {viewingAlert.timestamp}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Clinical Notes */}
                            <Box>
                                <Typography color={colors.gray[300]} variant="subtitle2" fontWeight="bold">
                                    CLINICAL NOTES
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography color={colors.gray[100]} variant="body2">
                                    {viewingAlert.notes}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EmergencyAlerts;
