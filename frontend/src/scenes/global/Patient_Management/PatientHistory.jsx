import React, { useState, useEffect, useMemo, useContext } from "react";
import {
    Box,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Typography,
    InputAdornment,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    IconButton,
    Radio,
    Avatar,
    Grid,
    Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import HospitalContext from "../../../contexts/HospitalContexts";
import { useApi } from "../../../api/useApi.js";
import { commonRoutes } from "../../../api/apiService";
import {
    handleExport,
    getNestedValue,
    PATIENT_AVAILABLE_COLUMNS,
} from "../../../utils/exportUtils.js";

// --- STYLED COMPONENTS ---
const RootContainer = styled(Box)(({ theme }) => ({
    backgroundColor: "#F8FAFC",
    minHeight: "100vh",
    padding: theme.spacing(3, 4),
    fontFamily: "'Inter', sans-serif",
}));

const FilterBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
    backgroundColor: "#FFFFFF",
    marginBottom: theme.spacing(3),
}));

const LogCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    backgroundColor: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

export const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "N/A";
    }
};

const getStatusStyle = (status) => {
    const norm = (status || "").toLowerCase();
    if (norm.includes("critical")) {
        return { bgcolor: "#FEE2E2", color: "#EF4444" };
    }
    if (norm.includes("discharged")) {
        return { bgcolor: "#EFF6FF", color: "#2563EB" };
    }
    return { bgcolor: "#ECFDF5", color: "#059669" };
};

export const PatientHistory = () => {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState("csv");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formTypeFilter, setFormTypeFilter] = useState("all");
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalDocument: 0,
        limit: 10,
    });

    const navigate = useNavigate();

    const {
        selectedBranch,
        setSelectedBranch,
        branches,
        isAdmin,
        isNonAdmin,
        loading,
        hospitals,
        selectedHostpital,
        setSelectedHostpital,
    } = useContext(HospitalContext);

    const {
        request: getPatients,
        loading: getPatientloading,
        error: patientApiError,
    } = useApi(commonRoutes.getPatients);

    const fetchPatients = async (
        sDate = null,
        eDate = null,
        searchVal = "",
        isExport = false
    ) => {
        if (!selectedHostpital) return;
        if (isNonAdmin && !selectedBranch) return;

        try {
            const res = await getPatients(
                pagination?.page,
                selectedHostpital,
                isAdmin ? null : selectedBranch,
                sDate,
                eDate,
                searchVal || "",
                isExport
            );

            if (res?.success) {
                const data = res?.data || [];
                const apiPagination = res?.pagination || {};

                setPatients(data);
                setFilteredPatients(data);
                setPagination((prev) => ({
                    page: apiPagination.page || 1,
                    totalPages: apiPagination.totalPages || 1,
                    totalDocument: apiPagination.totalDocument || 0,
                    limit: prev.limit,
                }));
                return data;
            } else {
                toast.error("Failed to fetch patients");
                return [];
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching patient");
            return [];
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [selectedHostpital, selectedBranch, pagination?.page]);

    const handleApplyDatefilter = async () => {
        if (!startDate || !endDate) {
            toast.warn("Please enter both start and end date");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.warn("Start date cannot be greater than end date");
            return;
        }

        const data = await fetchPatients(startDate, endDate, searchInput || "", true);
        setFilteredPatients(data || []);
    };

    const handleSearchApply = async () => {
        const searchValue = searchInput.trim().toLowerCase();
        if (!searchValue) return;

        let filtered = patients.filter(
            (patient) =>
                patient?.patientName?.toLowerCase().includes(searchValue) ||
                patient?.lastVisit?.purpose?.toLowerCase().includes(searchValue) ||
                patient?.patientMobile?.toString().includes(searchValue)
        );

        if (formTypeFilter !== "all") {
            filtered = filtered.filter(
                (patient) =>
                    patient?.lastVisit?.formType?.toLowerCase() ===
                    formTypeFilter.toLowerCase()
            );
        }

        if (filtered.length === 0) {
            const res = await getPatients(
                pagination?.page,
                selectedHostpital,
                isAdmin ? null : selectedBranch,
                startDate,
                endDate,
                searchInput || "",
                true
            );
            if (res?.success) {
                filtered = res.data || [];
            }
        }

        setFilteredPatients(filtered);
    };

    const handleClearFilters = async () => {
        setSearchInput("");
        setStartDate("");
        setEndDate("");
        setFormTypeFilter("all");
        await fetchPatients();
    };

    const onExport = async () => {
        try {
            if (filteredPatients.length <= 0) {
                toast.warn("No data found")
            }
            handleExport({
                format: exportFormat,
                data: filteredPatients,
                columns: PATIENT_AVAILABLE_COLUMNS,
                fileName: `patients_${startDate}_${endDate}`,
                title: "Patients Report",
            });
            setExportDialogOpen(false);
            toast.success("Export successful");
        } catch (error) {
            console.error(error);
            toast.error("Error exporting patients");
        }
    };

    const handleFormTypeChange = (newValue) => {
        setFormTypeFilter(newValue);
        if (newValue?.toLowerCase() === "all") {
            setFilteredPatients(patients);
            return;
        }
        const filter = (patients || []).filter(
            (pat) =>
                pat?.lastVisit?.formType?.toLowerCase() === newValue?.toLowerCase()
        );
        setFilteredPatients(filter);
    };

    const counts = useMemo(() => {
        return {
            allCount: patients.length,
            inboundCount: patients.filter(
                (p) => p?.lastVisit?.formType?.toLowerCase() === "inbound"
            ).length,
            outboundCount: patients.filter(
                (p) => p?.lastVisit?.formType?.toLowerCase() === "outbound"
            ).length,
        };
    }, [patients]);

    return (
        <RootContainer>
            {/* 1. TOP HEADER SEARCH & NAV */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <TextField
                    placeholder="Analyze system archives..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#94A3B8" }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: "380px",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "24px",
                            backgroundColor: "#FFFFFF",
                            "& fieldset": { borderColor: "#E2E8F0" },
                        },
                    }}
                />

                <Box display="flex" alignItems="center" gap={1.5}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={selectedHostpital || ""}
                            onChange={(e) => setSelectedHostpital(e.target.value)}
                            disabled={loading?.hospitalsLoading}
                            displayEmpty
                            sx={{
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#FFFFFF",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                            }}
                        >
                            {hospitals.map((hospital) => (
                                <MenuItem key={hospital._id} value={hospital._id}>
                                    {hospital.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Chip
                        label="Last 30 Days"
                        variant="outlined"
                        sx={{ borderRadius: "20px", fontWeight: 600, bgcolor: "#FFFFFF" }}
                    />

                    <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                        <NotificationsNoneIcon fontSize="small" />
                    </IconButton>
                    <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                        <SettingsOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* 2. TITLE & ACTION HEADER */}
            <Box mb={3}>
                <Chip
                    label="OPERATIONAL NETWORK : PATIENT HISTORY"
                    size="small"
                    sx={{
                        bgcolor: "#EFF6FF",
                        color: "#1D4ED8",
                        fontWeight: 700,
                        fontSize: "10px",
                        mb: 1,
                        borderRadius: "4px",
                    }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                        <Typography variant="h3" component="h1" fontWeight={800} color="#0F172A">
                            Patients <span style={{ color: "#0256E8" }}>History</span>
                        </Typography>
                        <Typography variant="body2" color="#64748B" mt={0.5}>
                            Comprehensive clinical records and intake archives across the network.
                        </Typography>
                    </Box>

                    <Box display="flex" gap={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchPatients}
                            disabled={getPatientloading}
                            sx={{
                                borderRadius: "8px",
                                borderColor: "#CBD5E1",
                                color: "#334155",
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            REFRESH
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => setExportDialogOpen(true)}

                            disabled={filteredPatients.length === 0}
                            sx={{
                                borderRadius: "20px",
                                backgroundColor: "#0256E8",
                                color: "#FFFFFF",
                                textTransform: "none",
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                fontSize: "12px",
                                boxShadow: "0px 2px 4px rgba(2, 86, 232, 0.2)",
                                "&:hover": {
                                    backgroundColor: "#0143B8",
                                    boxShadow: "0px 4px 8px rgba(1, 67, 184, 0.3)"
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: "#CBD5E1",
                                    color: "#94A3B8"
                                },
                            }}
                        >
                            EXPORT DATA
                        </Button>

                    </Box>
                </Box>
            </Box>

            {/* 3. FILTERING SECTION PANEL */}
            <FilterBox elevation={0}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3.5}>
                        <Typography variant="caption" fontWeight={800} color="#64748B" display="block" mb={0.5}>
                            SEARCH PATIENTS
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Patient name or unique ID..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "20px",
                                    bgcolor: "#F8FAFC",
                                    fontSize: "12px",
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Typography variant="caption" fontWeight={800} color="#64748B" display="block" mb={0.5}>
                            FACILITY NODE
                        </Typography>
                        {isAdmin ? (
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedHostpital || ""}
                                    onChange={(e) => setSelectedHostpital(e.target.value)}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <LocationCityIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                                        </InputAdornment>
                                    }
                                    sx={{
                                        borderRadius: "20px",
                                        bgcolor: "#F8FAFC",
                                        fontSize: "12px",
                                    }}
                                >
                                    {hospitals.map((h) => (
                                        <MenuItem key={h._id} value={h._id}>
                                            {h.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedBranch || ""}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    sx={{
                                        borderRadius: "20px",
                                        bgcolor: "#F8FAFC",
                                        fontSize: "12px",
                                    }}
                                >
                                    {branches.map((b) => (
                                        <MenuItem key={b._id} value={b._id}>
                                            {b.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Grid>

                    <Grid item xs={12} md={3.5}>
                        <Typography variant="caption" fontWeight={800} color="#64748B" display="block" mb={0.5}>
                            TIMELINE RANGE
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                                type="date"
                                size="small"
                                fullWidth
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
                                        bgcolor: "#F8FAFC",
                                        fontSize: "11px",
                                    },
                                }}
                            />
                            <Typography variant="caption" color="#94A3B8">
                                TO
                            </Typography>
                            <TextField
                                type="date"
                                size="small"
                                fullWidth
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "20px",
                                        bgcolor: "#F8FAFC",
                                        fontSize: "11px",
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={2} display="flex" alignItems="flex-end" gap={1}>
                        <Box sx={{ width: "100%" }}>
                            {/* Spacer label to match other filter fields */}
                            <Typography variant="caption" fontWeight={800} color="transparent" display="block" mb={0.5}>
                                &nbsp;
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<FilterListIcon />}
                                onClick={handleApplyDatefilter}
                                sx={{
                                    bgcolor: "#6c6e70",
                                    borderRadius: "20px",
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    "&:hover": { bgcolor: "#0F172A" },
                                }}
                            >
                                APPLY FILTERS
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Form Type Tabs & Status Legends Bar */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={3}
                    pt={2}
                    borderTop="1px solid #F1F5F9"
                >
                    <Box sx={{ bgcolor: "#F1F5F9", p: "4px", borderRadius: "20px", display: "flex", gap: "4px" }}>
                        {[
                            { id: "all", label: "ALL PATIENTS" },
                            { id: "inbound", label: "INBOUND" },
                            { id: "outbound", label: "OUTBOUND" },
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                size="small"
                                onClick={() => handleFormTypeChange(tab.id)}
                                sx={{
                                    borderRadius: "16px",
                                    px: 2,
                                    py: 0.5,
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    bgcolor: formTypeFilter === tab.id ? "#FFFFFF" : "transparent",
                                    color: formTypeFilter === tab.id ? "#0F172A" : "#64748B",
                                    boxShadow: formTypeFilter === tab.id ? "0px 1px 2px rgba(0,0,0,0.05)" : "none",
                                }}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </Box>

                    <Box display="flex" gap={2} alignItems="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#10B981" }} />
                            <Typography variant="caption" color="#64748B" fontWeight={600} fontSize="10px">
                                ACTIVE ({counts.allCount})
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#3B82F6" }} />
                            <Typography variant="caption" color="#64748B" fontWeight={600} fontSize="10px">
                                DISCHARGED (7,850)
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#EF4444" }} />
                            <Typography variant="caption" color="#64748B" fontWeight={600} fontSize="10px">
                                CRITICAL (152)
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </FilterBox>

            {patientApiError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {patientApiError}
                </Alert>
            )}

            {/* 4. MAIN DATA TABLE */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    overflow: "hidden",
                    mb: 4,
                }}
            >
                {getPatientloading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress size={36} sx={{ color: "#0256E8" }} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: "#FFFFFF" }}>
                                <TableRow>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>ID</TableCell>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>BRANCH NAME</TableCell>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                                        PATIENT PROFILE
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                                        DEMOGRAPHICS
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>STATUS</TableCell>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                                        PRIMARY INTAKE
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                                        DATE REGISTERED
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                                        COMMAND
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredPatients.map((patient, idx) => {
                                    const statusStyle = getStatusStyle(patient?.status || "Active");
                                    const initials = (patient?.patientName || "P")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .substring(0, 2);

                                    return (
                                        <TableRow key={patient._id || idx} hover>
                                            <TableCell sx={{ fontSize: "12px", color: "#94A3B8" }}>
                                                #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                            </TableCell>
                                            <TableCell variant="caption" sx={{ fontSize: "12px" }}>
                                                {patient?.branchId?.name || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: "11px",
                                                            fontWeight: 700,
                                                            bgcolor: "#DBEAFE",
                                                            color: "#1E40AF",
                                                        }}
                                                    >
                                                        {initials}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                                                            {patient?.patientName || "Arthur Pendleton"}
                                                        </Typography>
                                                        <Typography variant="caption" color="#94A3B8" fontSize="10px">
                                                            +1 {patient?.patientMobile || "(555) 0192-341"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color="#0F172A">
                                                    {patient?.patientAge || 68} Yrs
                                                </Typography>
                                                <Typography variant="caption" color="#94A3B8" fontSize="10px">
                                                    {(patient?.gender || "MALE").toUpperCase()}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={patient?.status || "Active"}
                                                    size="small"
                                                    sx={{
                                                        ...statusStyle,
                                                        fontWeight: 800,
                                                        fontSize: "10px",
                                                        height: "22px",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color="#0F172A">
                                                    {patient?.lastVisit?.purpose || "Cardio Follow-up"}
                                                </Typography>
                                                <Typography variant="caption" color="#94A3B8" fontSize="10px">
                                                    {patient?.lastVisit?.formType || "Standard Intake Form"}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color="#0F172A">
                                                    {formatDate(patient?.createdAt || new Date())}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Button
                                                    onClick={() => {
                                                        navigate(`/single-patient-history/${patient?._id}`, {
                                                            state: {

                                                                patient: {
                                                                    ...patient,
                                                                    hospitalId: selectedHostpital
                                                                }
                                                            }
                                                        })
                                                    }}
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    sx={{
                                                        fontSize: "12px",
                                                        textTransform: "none", // keeps "View More" normal
                                                        minWidth: "auto",      // removes default large width
                                                        px: 1.5,               // horizontal padding
                                                        py: 0.5,               // vertical padding
                                                    }}
                                                >
                                                    View More
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Pagination Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2.5}>
                    <Typography variant="caption" color="#64748B">
                        Showing <strong>1 - 10</strong> of <strong>{pagination.totalDocument || 12465}</strong> total profiles
                    </Typography>
                    <Pagination
                        count={pagination.totalPages || 3}
                        page={pagination.page}
                        onChange={(e, newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
                        color="primary"
                        size="small"
                    />
                </Box>
            </Paper>

            {/* 5. BOTTOM SYSTEM LOGS & INTEGRITY SECTION */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="caption" fontWeight={800} color="#475569">
                            SYSTEM LOG HIERARCHY
                        </Typography>
                        <Typography
                            variant="caption"
                            fontWeight={800}
                            color="#0256E8"
                            sx={{ cursor: "pointer", textTransform: "uppercase" }}
                        >
                            FULL AUDIT ARCHIVE
                        </Typography>
                    </Box>

                    <LogCard elevation={0}>
                        <Avatar sx={{ bgcolor: "#E0F2FE", color: "#0369A1", width: 36, height: 36 }}>
                            <CloudDoneOutlinedIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                                Regional Cloud Sync Active
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                                12 satellite clinics synchronized successfully at 10:42 AM.
                            </Typography>
                        </Box>
                    </LogCard>

                    <LogCard elevation={0}>
                        <Avatar sx={{ bgcolor: "#EFF6FF", color: "#2563EB", width: 36, height: 36 }}>
                            <AnalyticsOutlinedIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                                Analytical Batch Generated
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                                Monthly performance audit exported for operational review.
                            </Typography>
                        </Box>
                    </LogCard>
                </Grid>

                {/* Circular Storage Chart Card */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: "16px",
                            border: "1px solid #E2E8F0",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            fontWeight={800}
                            color="#64748B"
                            alignSelf="flex-start"
                            mb={2}
                        >
                            DATABASE INTEGRITY
                        </Typography>

                        <Box
                            sx={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                my: 1,
                            }}
                        >
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                size={110}
                                thickness={4}
                                sx={{ color: "#E2E8F0" }}
                            />
                            <CircularProgress
                                variant="determinate"
                                value={80}
                                size={110}
                                thickness={4}
                                sx={{ color: "#0256E8", position: "absolute", left: 0 }}
                            />
                            <Box position="absolute" textAlign="center">
                                <Typography variant="h5" fontWeight={800} color="#0F172A">
                                    80<span style={{ fontSize: "14px" }}>%</span>
                                </Typography>
                                <Typography variant="caption" color="#94A3B8" fontSize="9px">
                                    STORAGE NODE
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="caption" color="#94A3B8" fontSize="10px" mt={1}>
                            12.4TB OF 15TB OPTIMIZED
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Export Dialog Modal */}
            <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Export Patient Data</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#64748B" mb={2}>
                        Select your preferred file format for export:
                    </Typography>
                    <RadioGroup value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                        <FormControlLabel value="csv" control={<Radio />} label="CSV (.csv)" />
                        <FormControlLabel value="excel" control={<Radio />} label="Excel (.xlsx)" />
                        <FormControlLabel value="pdf" control={<Radio />} label="PDF (.pdf)" />
                    </RadioGroup>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setExportDialogOpen(false)} sx={{ color: "#64748B" }}>
                        Cancel
                    </Button>
                    <Button onClick={onExport} disabled={filteredPatients.length === 0} variant="contained" sx={{ bgcolor: "#0256E8" }}>
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </RootContainer>
    );
};