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
    CardHeader,
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
    Notifications as NotificationsIcon,
    Speed as SpeedIcon,
    TrendingUp as TrendingUpIcon,
    AccountCircle as AccountCircleIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Schedule as ScheduleIcon,
    Info as InfoIcon,
    TrendingDown as TrendingDownIcon,
    RememberMeOutlined,
} from "@mui/icons-material";
import CampaignIcon from "@mui/icons-material/Campaign";
import RefreshIcon from '@mui/icons-material/Refresh';

import { tokens } from "../../../theme";
import { UserContextHook } from "../../../contexts/UserContexts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HospitalContext from "../../../contexts/HospitalContexts";
import moment from "moment"

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
    const { currentUser } = UserContextHook() || { name: "Dr. Rajesh Kumar" };

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
    } = useContext(HospitalContext)


    // Dialog states
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Past appointments filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    const [sortBy, setSortBy] = useState("date-desc");


    // Tab for past appointments


    // Enhanced stat card with gradient
    const StatCard = ({ title, value, icon: Icon, color, unit = "", trend = null }) => (
        <Card
            sx={{
                height: "100%",
                backgroundColor: colors.primary[400],
                // border: `1px solid ${colors.primary[500]}`,
                transition: "all 0.3s ease",
                "&:hover": {
                    // boxShadow: `0 8px 16px ${color}40`,
                    transform: "translateY(-4px)",
                },
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography variant="body2" mb={1} fontWeight={500}>
                            {title}
                        </Typography>
                        <Box display="flex" alignItems="baseline" gap={1}>
                            <Typography color={color} variant="h3" fontWeight="bold">
                                {value}
                            </Typography>
                            {unit && (
                                <Typography color={colors.grey[400]} variant="body2">
                                    {unit}
                                </Typography>
                            )}
                        </Box>
                        {trend && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                                <TrendingUpIcon sx={{ fontSize: "0.9rem", color: trend > 0 ? colors.greenAccent[400] : colors.redAccent[400] }} />
                                <Typography
                                    variant="caption"
                                    sx={{ color: trend > 0 ? colors.greenAccent[400] : colors.redAccent[400] }}
                                >
                                    {trend > 0 ? "+" : ""}{trend}% from last week
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: "12px",
                            backgroundColor: `${color}20`,
                        }}
                    >
                        <Icon sx={{ color, fontSize: "1.8rem" }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
    const TodayAppointmentsCard = () => (
        <Card
            elevation={0}
            sx={{
                boxShadow: "none",
                transition: "none",
                "&:hover": {
                    boxShadow: "none !important",
                    transform: "none !important",
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            > <Box> <Typography
                variant="h6"
                fontWeight={600}
                color={colors.grey[100]}
            >
                Appointments </Typography>
                    <Typography
                        variant="body2"
                        color={colors.grey[400]}
                    >
                        {appointments?.length || 0} appointments found
                    </Typography>
                </Box>

                <Box
                    display="flex"
                    gap={2}
                    alignItems="center"
                    flexWrap="wrap"
                >
                    <TextField
                        select
                        size="small"
                        label="Date Range"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        sx={{
                            minWidth: 180,
                            "& .MuiOutlinedInput-root": {
                                color: colors.grey[100],
                                "& fieldset": {
                                    borderColor: colors.primary[500],
                                },
                            },
                        }}
                    >
                        {Object.entries(DATE_FILTER_OPTIONS).map(([value, label]) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <IconButton
                        size="small"
                        onClick={refetchAppointments}
                        disabled={loading?.appointmentLoading}
                        title="Refresh"
                        sx={{
                            border: `1px solid ${colors.primary[500]}`,
                            borderRadius: 2,
                        }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Divider sx={{ borderColor: "lightgray" }} />

            {loading?.appointmentLoading && (
                <CircularProgress size={20} />
            )}
            <CardContent sx={{ p: 0 }}>
                {!loading?.appointmentLoading && (
                    <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
                        {appointments?.length > 0 ? (
                            appointments.slice(0, 5).map((apt, idx) => (
                                <Paper
                                    key={apt.id}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        mb: idx < appointments.slice(0, 5).length - 1 ? 1.5 : 0,
                                        borderRadius: "12px",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        backgroundColor: "background.paper",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                                            backgroundColor: "rgba(0, 0, 0, 0.05)"

                                        },
                                    }}
                                >
                                    {/* Main Row Header */}
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        gap={2}
                                        mb={1.5}
                                    >
                                        {/* Left Section: Patient Meta */}
                                        <Box flex={1}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={700}
                                                    color="text.primary"
                                                    lineHeight={1.2}
                                                >
                                                    {apt?.formData?.patientDetails?.patientName || "Unknown Patient"}
                                                </Typography>

                                                {/* Status Badge */}
                                                <Chip
                                                    size="small"
                                                    label={apt?.status || "New"}
                                                    color={
                                                        apt?.status === "New"
                                                            ? "success"
                                                            : apt?.status === "Old"
                                                                ? "error"
                                                                : "default"
                                                    }
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                                                />
                                            </Stack>

                                            {/* Sub-info Row */}
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                <Typography variant="body2" color="text.secondary">
                                                    Gender: <strong>{apt?.formData?.patientDetails?.gender || "N/A"}</strong>
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary">•</Typography>

                                                <Typography variant="body2" color="text.secondary">
                                                    Age: <strong>{apt?.formData?.patientDetails?.patientAge || "N/A"}</strong>
                                                </Typography>

                                                {apt?.formData?.patientDetails?.category && (
                                                    <>
                                                        <Typography variant="body2" color="text.secondary">•</Typography>
                                                        <Chip
                                                            label={apt.formData.patientDetails.category}
                                                            size="small"
                                                            color="success"
                                                            variant="soft" // If using MUI Joy, or use light background for MUI Material
                                                            sx={{
                                                                height: 22,
                                                                fontSize: "0.7rem",
                                                                fontWeight: 600,
                                                                backgroundColor: "rgba(46, 125, 50, 0.1)",
                                                                color: "#2e7d32",
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* Right Section: Action Buttons */}
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            {/* <Tooltip title="Edit" arrow>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditAppointment(apt)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip> */}

                                            <Tooltip title="Complete" arrow>
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleCompleteAppointment(apt.id)}
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Cancel" arrow>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleCancelAppointment(apt.id)}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>

                                    {/* Remarks Block */}
                                    <Box
                                        sx={{
                                            backgroundColor: "action.hover",
                                            p: 1.25,
                                            borderRadius: "8px",
                                            borderLeft: "3px solid",
                                            borderLeftColor: "primary.main",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                            sx={{
                                                opacity: apt?.formData?.remarks ? 1 : 0.6,
                                                fontStyle: apt?.formData?.remarks ? "normal" : "italic",
                                            }}
                                        >
                                            <strong>Remarks:</strong> {apt?.formData?.remarks || "No notes available"}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))
                        ) : (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                py={8}
                                px={3}
                                textAlign="center"
                            >
                                <EventIcon
                                    sx={{
                                        fontSize: 55,
                                        color: colors.grey[500],
                                        mb: 2,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color={colors.grey[400]}
                                >
                                    No appointments found for {DATE_FILTER_OPTIONS[dateFilter]}.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

            </CardContent>
        </Card>
    );

    const RecentConsultationsCard = () => (
        <Card
            elevation={0}
            sx={{
                boxShadow: "none",
                transition: "none",

                "&:hover": {
                    boxShadow: "none !important",
                    transform: "none !important",
                },
            }}
        >
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" gap={1}>
                        <InfoIcon sx={{ color: colors.greenAccent[400] }} />
                        <span>Recent Consultations</span>
                    </Box>
                }
                subheader="Detailed consultation history"
                titleTypographyProps={{
                    color: colors.grey[100],
                    variant: "h6",
                }}
                subheaderTypographyProps={{
                    color: colors.grey[300],
                }}
                sx={{ pb: 2 }}
            />

            <Divider sx={{ borderColor: "lightgray" }} />

            <CardContent sx={{ p: 0 }}>
                <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
                    {recentConsultations?.length > 0 ? (
                        recentConsultations.map((apt, idx) => (
                            <Box
                                key={apt.id}
                                sx={{
                                    p: 2,
                                    borderBottom:
                                        idx < appointments.length - 1
                                            ? `1px solid ${colors.primary[500]} `
                                            : "none",

                                    backgroundColor:
                                        idx % 2 === 0
                                            ? "transparent"
                                            : `${colors.primary[500]} 40`,
                                }}
                            >
                                <Box display="flex" gap={2} mb={1}>
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: colors.blueAccent[500],
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {apt?.formData?.patientDetails?.patientName?.charAt(0) || "P"}
                                    </Avatar>

                                    <Box flex={1}>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Typography
                                                color={colors.grey[100]}
                                                variant="subtitle2"
                                                fontWeight={600}
                                            >
                                                {apt?.formData?.patientDetails?.patientName}
                                            </Typography>

                                            <Typography
                                                color={colors.grey[300]}
                                                variant="caption"
                                            >
                                                {apt?.formData?.dateTime
                                                    ? moment(apt?.formData.dateTime).format("DD MMM YYYY, hh:mm A")
                                                    : "-"}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                            <Typography variant="body2" color="text.secondary">
                                                Gender: <strong>{apt?.formData?.patientDetails?.gender || "N/A"}</strong>
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">•</Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Age: <strong>{apt?.formData?.patientDetails?.patientAge || "N/A"}</strong>
                                            </Typography>

                                            {apt?.formData?.patientDetails?.category && (
                                                <>
                                                    <Typography variant="body2" color="text.secondary">•</Typography>
                                                    <Chip
                                                        label={apt.formData.patientDetails.category}
                                                        size="small"
                                                        color="success"
                                                        variant="soft" // If using MUI Joy, or use light background for MUI Material
                                                        sx={{
                                                            height: 22,
                                                            fontSize: "0.7rem",
                                                            fontWeight: 600,
                                                            backgroundColor: "rgba(46, 125, 50, 0.1)",
                                                            color: "#2e7d32",
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </Stack>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                            mt={0.5}
                                            sx={{
                                                fontStyle: apt?.formData?.remarks ? "normal" : "italic",
                                                opacity: apt?.formData?.remarks ? 1 : 0.7,
                                            }}
                                        >
                                            <strong>Remarks:</strong> {apt?.formData?.remarks || "No consultation notes available"}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box
                                    display="flex"
                                    gap={1}
                                    justifyContent="flex-end"
                                >
                                    <Chip
                                        label={apt.type || "General"}
                                        size="small"
                                        variant="outlined"
                                    />

                                    <Chip
                                        label={`${apt?.formData?.patientDetails?.status}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            color: colors.blueAccent[400],
                                            borderColor: colors.blueAccent[400],
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            py={8}
                            px={3}
                            textAlign="center"
                        >
                            <InfoIcon
                                sx={{
                                    fontSize: 55,
                                    color: colors.grey[500],
                                    mb: 2,
                                }}
                            />

                            <Typography
                                variant="body2"
                                color={colors.grey[400]}
                            >
                                No consultation records are available yet.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    // Handle edit appointment
    const handleEditAppointment = (apt) => {
        setEditingAppointment(apt);
        setEditFormData({ ...apt });
        setOpenEditDialog(true);
    };

    const handleUpdateAppointment = () => {
        // setAppointments((prev) =>
        //     prev.map((apt) =>
        //         apt.id === editingAppointment.id ? { ...apt, ...editFormData } : apt
        //     )
        // );
        // setOpenEditDialog(false);
        toast.success("Appointment updated successfully!");
    };

    const handleCompleteAppointment = (id) => {
        // setAppointments((prev) =>
        //     prev.map((apt) =>
        //         apt.id === id ? { ...apt, status: "Completed" } : apt
        //     )
        // );
        toast.success("Appointment marked as completed!");
    };

    const handleCancelAppointment = (id) => {
        // setAppointments((prev) =>
        //     prev.map((apt) =>
        //         apt.id === id ? { ...apt, status: "Cancelled" } : apt
        //     )
        // );
        toast.error("Appointment cancelled!");
    };

    // Filter and sort past appointments
    const getFilteredPastAppointments = () => {
        let filtered = pastappointments;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((apt) =>
                apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== "All") {
            filtered = filtered.filter((apt) => apt?.formData?.status?.toLowerCase() === filterStatus?.toLowerCase());
        }

        // Date filter
        if (filterDate) {
            filtered = filtered.filter((apt) => apt?.formData?.dateTime === filterDate);
        }

        // Sorting
        // switch (sortBy) {
        //     case "date-desc":
        //         filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        //         break;
        //     case "date-asc":
        //         filtered.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        //         break;
        //     case "name":
        //         filtered.sort((a, b) => a.patientName.localeCompare(b.patientName));
        //         break;
        //     default:
        //         break;
        // }

        return filtered;
    };

    // All Appointments Tab
    const AllAppointmentsTab = () => (
        <Card sx={{ backgroundColor: colors.primary[400], border: `1px solid ${colors.primary[500]} `, mt: 3 }}>
            <CardHeader
                title="All Appointments"
                titleTypographyProps={{ color: colors.grey[100] }}
                sx={{ pb: 2 }}
            />
            <Divider sx={{ borderColor: colors.primary[500] }} />
            <CardContent sx={{ p: 0 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: colors.primary[500] }}>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 600 }}>Patient</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 600 }}>Date & Time</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 600 }}>Notes</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointments.map((apt, idx) => (
                                <TableRow
                                    key={apt.id}
                                    sx={{
                                        backgroundColor: idx % 2 === 0 ? "transparent" : `${colors.primary[500]} 40`,
                                        borderBottom: `1px solid ${colors.primary[500]} `,
                                        "&:hover": { backgroundColor: colors.primary[500] },
                                    }}
                                >
                                    <TableCell sx={{ color: colors.grey[100] }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: "0.9rem", backgroundColor: colors.blueAccent[500] }}>
                                                {apt.patientName.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography color={colors.grey[100]} variant="body2">
                                                    {apt.patientName}
                                                </Typography>
                                                <Typography color={colors.grey[300]} variant="caption">
                                                    {apt.patientId}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: colors.grey[300] }}>
                                        {apt.appointmentDate} <br /> {apt.appointmentTime}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={apt.type}
                                            size="small"
                                            sx={{
                                                backgroundColor: apt.type === "Emergency" ? `${colors.redAccent[400]} 40` : `${colors.blueAccent[400]} 40`,
                                                color: apt.type === "Emergency" ? colors.redAccent[400] : colors.blueAccent[400],
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={apt.status}
                                            size="small"
                                            color={
                                                apt.status === "Scheduled"
                                                    ? "success"
                                                    : apt.status === "Pending"
                                                        ? "warning"
                                                        : "default"
                                            }
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: colors.grey[300], maxWidth: 200 }}>
                                        <Typography variant="caption">{apt.notes}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditAppointment(apt)}
                                                sx={{ color: colors.blueAccent[400] }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCompleteAppointment(apt.id)}
                                                sx={{ color: colors.greenAccent[400] }}
                                            >
                                                <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCancelAppointment(apt.id)}
                                                sx={{ color: colors.redAccent[400] }}
                                            >
                                                <CancelIcon fontSize="small" />
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
    );

    // Past Appointments Tab
    const PastAppointmentsTab = () => (
        <Box>
            {/* Filters */}
            <Card sx={{
                border: `1px solid lightgray`, "&:hover": {
                    boxShadow: "none",
                    transform: "none",
                }
            }}>
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center" gap={1}>
                            <FilterListIcon sx={{ color: colors.yellowAccent[400] }} />
                            <span>Filter & Search</span>
                        </Box>
                    }
                    titleTypographyProps={{ color: colors.grey[100], variant: "h6" }}
                    sx={{ pb: 2 }}
                />
                {/* <Divider sx={{ borderColor: colors.primary[500] }} /> */}
                <CardContent sx={{
                    p: 0,
                    boxShadow: "none",
                    transition: "none",

                    "&:hover": {
                        boxShadow: "none !important",
                        transform: "none !important",
                    },
                }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                placeholder="Search patient name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: colors.grey[400] }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.grey[100],
                                        "& fieldset": { borderColor: colors.primary[500] },
                                        "&:hover fieldset": { borderColor: colors.primary[400] },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.grey[100],
                                        "& fieldset": { borderColor: colors.primary[500] },
                                    },
                                    "& .MuiInputBase-input": { color: colors.grey[100] },
                                }}
                            >
                                <MenuItem value="All">All Status</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Filter by Date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.grey[100],
                                        "& fieldset": { borderColor: colors.primary[500] },
                                    },
                                    "& .MuiInputBase-input": { color: colors.grey[100] },
                                }}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            {/* Past Appointments Table */}
            <Card sx={{ backgroundColor: colors.primary[400], border: `1px solid lightgray` }}>
                <CardHeader
                    title={`Past Appointments(${getFilteredPastAppointments().length})`}
                    titleTypographyProps={{ color: colors.grey[100] }}
                    sx={{ pb: 2 }}
                />
                <Divider sx={{ borderColor: "lightgray" }} />
                <CardContent sx={{
                    p: 0,
                    boxShadow: "none",
                    transition: "none",

                    "&:hover": {
                        boxShadow: "none !important",
                        transform: "none !important",
                    }
                }} >
                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: "action.hover" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Patient</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Date & Time</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Gender / Age</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Category</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Remarks</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {/* Loading State */}
                                {loading?.pastAppointmentLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                            <CircularProgress size={30} />
                                        </TableCell>
                                    </TableRow>
                                ) : getFilteredPastAppointments().length > 0 ? (
                                    getFilteredPastAppointments().map((apt, idx) => {
                                        const patientName = apt?.formData?.patientDetails?.patientName || "Unknown";
                                        const gender = apt?.formData?.patientDetails?.gender || "N/A";
                                        const age = apt?.formData?.patientDetails?.patientAge || "N/A";
                                        const category = apt?.formData?.patientDetails?.category;

                                        return (
                                            <TableRow
                                                key={apt.id || idx}
                                                sx={{
                                                    transition: "background-color 0.2s ease",
                                                    "&:hover": { backgroundColor: "action.hover" },
                                                    opacity: apt?.status === "Cancelled" ? 0.5 : 1,
                                                }}
                                            >
                                                {/* Patient Column */}
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Avatar
                                                            sx={{
                                                                width: 34,
                                                                height: 34,
                                                                fontSize: "0.85rem",
                                                                fontWeight: 600,
                                                                backgroundColor: "primary.main",
                                                                color: "primary.contrastText"
                                                            }}
                                                        >
                                                            {patientName.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                                            {patientName}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/* Date & Time Column */}
                                                <TableCell>
                                                    <Typography variant="body2" color="text.primary">
                                                        {apt?.formData?.dateTime
                                                            ? moment(apt?.formData.dateTime).format("DD MMM YYYY, hh:mm A")
                                                            : "-"}
                                                    </Typography>
                                                </TableCell>

                                                {/* Status Column */}
                                                <TableCell>
                                                    <Chip
                                                        label={apt?.status || "Pending"}
                                                        size="small"
                                                        color={
                                                            apt?.status === "Completed"
                                                                ? "success"
                                                                : apt?.status === "Cancelled"
                                                                    ? "error"
                                                                    : "warning"
                                                        }
                                                        variant="soft"
                                                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                                    />
                                                </TableCell>

                                                {/* Gender / Age Column */}
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {gender} / {age}
                                                    </Typography>
                                                </TableCell>

                                                {/* Category Column */}
                                                <TableCell>
                                                    {category ? (
                                                        <Chip
                                                            label={category}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: "rgba(46, 125, 50, 0.1)",
                                                                color: "#2e7d32",
                                                                fontWeight: 600,
                                                                fontSize: "0.7rem",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">-</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Remarks Column */}
                                                <TableCell sx={{ maxWidth: 220 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                            fontStyle: apt?.formData?.remarks ? "normal" : "italic"
                                                        }}
                                                    >
                                                        {apt?.formData?.remarks || "No remarks"}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    /* Empty State */
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No past appointments found matching your filters.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card >
        </Box >
    );

    // Edit appointment dialog
    const EditAppointmentDialog = () => (
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
                Edit Appointment
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: colors.primary[500], pt: 2 }}>
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
            <DialogActions sx={{ backgroundColor: colors.primary[400], p: 2 }}>
                <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button onClick={handleUpdateAppointment} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Welcome Section with Profile */}
            <Card fullwidth sx={{
                backgroundColor: colors.primary[400],
                border: `2px solid ${colors.blueAccent[400]} `, p: 2,
                display: "flex", alignItems: "center", gap: 2,
                mt: 0,
                mb: 2,
                "&:hover": {
                    boxShadow: "none",
                    transform: "none",
                },
            }}>
                <Box>
                    <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                        Welcome, Dr. {currentUser?.name}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: "grey" }}
                    >
                        dashboard overview
                    </Typography>

                </Box>

            </Card>


            {/* Enhanced Stats Grid */}
            <Grid container spacing={2} mb={2}>
                {/* Today's Appointments */}
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Today's Appointments"
                        value={doctorStats?.todayAppointments?.value ?? 0}
                        icon={EventIcon}
                        color={colors.blueAccent[400]}
                        trend={doctorStats?.todayAppointments?.trend ?? 0}
                        subtitle="from last week"
                    />
                </Grid>

                {/* Pending Consultations */}
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Pending Consultations"
                        value={doctorStats?.pendingConsultations?.value ?? 0}
                        icon={AssignmentIcon}
                        color={colors.yellowAccent[400]}
                        trend={doctorStats?.pendingConsultations?.trend ?? 0}
                        subtitle="from last week"
                    />
                </Grid>

                {/* Total Patients */}
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Total Patients"
                        value={doctorStats?.totalPatients?.value ?? 0}
                        icon={PersonIcon}
                        color={colors.greenAccent[400]}
                        trend={doctorStats?.totalPatients?.trend ?? 0}
                        subtitle="from last week"
                    />
                </Grid>

                {/* Optional Metrics (If uncommented later) */}
                {/* 
    <Grid item xs={12} sm={6} md={4}>
        <StatCard
            title="Emergency Alerts"
            value={doctorStats?.emergencyAlerts ?? 0}
            icon={NotificationsIcon}
            color={colors.redAccent[400]}
        />
    </Grid> 

    <Grid item xs={12} sm={6} md={4}>
        <StatCard
            title="Avg. Rating"
            value={doctorStats?.averageRating ?? 0}
            icon={TrendingUpIcon}
            color={colors.blueAccent[400]}
            unit="/5"
        />
    </Grid> 

    <Grid item xs={12} sm={6} md={4}>
        <StatCard
            title="Consultation Rate"
            value={doctorStats?.consultationRate ?? 0}
            icon={SpeedIcon}
            color={colors.greenAccent[400]}
            unit="%"
        />
    </Grid> 
    */}
            </Grid>

            {/* Tabbed Interface */}
            <Card
                elevation={0}
                sx={{
                    backgroundColor: colors.primary[400],
                    borderColor: colors.primary[400],
                    boxShadow: "none",
                    transition: "none",

                    "&:hover": {
                        boxShadow: "none !important",
                        transform: "none !important",
                        backgroundColor: colors.primary[400],
                    },
                }}
            >
                <Box >
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        sx={{
                            // "& .MuiTabs-indicator": { backgroundColor: colors.blueAccent[400] },
                            // "& .MuiTab-root": {
                            //     color: colors.grey[300],
                            //     "&.Mui-selected": { color: colors.blueAccent[400] },
                            // },
                        }}
                    >
                        <Tab label="Today's Appointments" icon={<EventIcon />} iconPosition="start" />
                        <Tab label="Past Appointments" icon={<TrendingDownIcon />} iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ pt: 0 }}>
                    {tabValue === 0 && (
                        <Box>
                            <CardContent
                                sx={{
                                    p: 0,
                                    boxShadow: "none",
                                    transition: "none",

                                    "&:hover": {
                                        boxShadow: "none !important",
                                        transform: "none !important",
                                    },
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={7}>
                                        <TodayAppointmentsCard />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <RecentConsultationsCard />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Box>
                    )}
                    {tabValue === 1 && <PastAppointmentsTab />}
                </Box>
            </Card>

            {/* Edit Appointment Dialog */}
            <EditAppointmentDialog />
        </Container >
    );
};

export default DoctorDashboard;
