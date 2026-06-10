import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    Alert,
    InputAdornment,
    Tabs,
    Tab,
    Chip,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio,
    Menu,
    MenuItem,
    IconButton,
    Popover,
    Checkbox,
} from "@mui/material";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { commonRoutes } from "../../../api/apiService";
import { useApi } from "../../../api/useApi";
import moment from "moment";
import { getNestedValue, handleExport, statusStyles } from "../../../utils/exportUtils";


export const FORMS_AVAILABLE_COLUMNS = [
    { key: "createdAt", label: "Form Submission Date" },
    { key: "purpose", label: "POC / Purpose" },
    { key: "formType", label: "Form Type" },
    { key: "doctor.name", label: "Doctor" },
    { key: "department.name", label: "Department" },
    { key: "formData.surgeryName", label: "Surgery Name" },
    { key: "formData.healthPackageName", label: "Health Package" },
    { key: "formData.department.name", label: "Health Scheme Name" },
    { key: "formData.govertHealthSchemeName", label: "On-Govt Health Scheme Name" },
    { key: "formData.nonGovtHealthSchemeName", label: "Non-Govt Health Scheme Name" },
    { key: "formData.reportName", label: "Report Name" },
    { key: "formData.callerType", label: "Caller Type" },
    { key: "followupStatus", label: "Follow-up Status" },
    { key: "formData.referenceFrom", label: "Reference From" },
    { key: "formData.remarks", label: "Remarks" },
];
export const SInglePatientDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation()
    const [patient, setPatient] = useState(location.state?.patient || {});
    const [searchName, setSearchName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const [exportFormat, setExportFormat] = useState("csv");
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formTypeFilter, setFormTypeFilter] = useState("all");
    const [anchorEl, setAnchorEl] = useState(null);
    const [showDateFilters, setShowDateFilters] = useState(false);
    const formsColumnFilterRef = React.useRef(null);
    const columnFilterButtonRef = React.useRef(null);
    const [index, setIndex] = useState(0);
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
    const [selectedFormColumns, setSelectedFormColumns] = useState([
        "patientName",
        "patientMobile",
        "doctor.name",
        "department.name",
        "purpose",
        "formType",
        "followupStatus",
        // "formData.referenceFrom",
        "formData.remarks",
        "createdAt",
    ]);
    const [error, setError] = useState(null);

    const {
        loading: patientHistoryLoading,
        request: patientHistory,
        error: patientHistoryError,
    } = useApi(commonRoutes.getSinglePatientsHistory);

    const toggleFormColumn = (colKey) => {
        setSelectedFormColumns((prev) =>
            prev.includes(colKey)
                ? prev.filter((key) => key !== colKey)
                : [...prev, colKey]
        );
    };

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const allSelected = selectedFormColumns.length === FORMS_AVAILABLE_COLUMNS.length;

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedFormColumns([]);
        } else {
            setSelectedFormColumns(FORMS_AVAILABLE_COLUMNS.map((c) => c.key));
        }
    };

    const visibleFormColumns = FORMS_AVAILABLE_COLUMNS.filter((col) =>
        selectedFormColumns.includes(col.key),
    );
    const handleSearchApply = async () => {
        const searchValue = searchInput.trim().toLowerCase();

        setSearchName(searchInput.trim());

        let filtered = [...(visits || [])];

        // 1. Frontend filtering
        if (searchValue) {
            filtered = filtered.filter(
                (visit) =>
                    visit?.doctor?.name?.toLowerCase().includes(searchValue) ||
                    visit?.department?.name?.toLowerCase().includes(searchValue) ||
                    visit?.purpose?.toLowerCase().includes(searchValue)
            );
        }

        // 2. Form type filter
        if (formTypeFilter !== "all") {
            filtered = filtered.filter(
                (visit) =>
                    visit?.formType?.toLowerCase() === formTypeFilter.toLowerCase()
            );
        }

        // 3. API fallback ONLY when needed
        const shouldCallAPI = searchValue && filtered.length === 0;

        if (shouldCallAPI) {
            console.log("Calling API...");

            try {
                const res = await patientHistory(
                    patient?.hospitalId,
                    patient?._id,
                    paginatedData.patient.page,
                    startDate,
                    endDate,
                    searchInput,
                    true
                );

                console.log("API res", res);

                if (res?.success) {
                    filtered = res.data || [];

                    setPagination((prev) => ({
                        ...prev,
                        patients: {
                            ...res.pagination,
                        },
                    }));
                }
            } catch (error) {
                toast.error("Error To Fetch Patient History");
            }
        }

        setVisits(filtered);
    };
    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchApply();
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                formsColumnFilterRef.current &&
                !formsColumnFilterRef.current.contains(event.target) &&
                columnFilterButtonRef.current &&
                !columnFilterButtonRef.current.contains(event.target)
            ) {
                setAnchorEl(null);
            }
        };
        if (anchorEl) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [anchorEl]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!patient?.hospitalId || !patient?._id) {
                toast.error("Hospital Id And Patient id Not Found");
                return;
            }
            const res = await patientHistory(patient?.hospitalId, patient?._id);
            if (res.success) {
                setVisits(res?.data);
                setFilteredVisits(res?.data)
            } else {
                toast.error("Error To Fetch Forms");
            }
        };
        fetchHistory();
    }, [patient?._id, patient?.hospitalId]);

    // Count by form type for tabs
    const calculateCounts = () => {
        const allCount = visits.length;
        const inboundCount = visits.filter(
            (v) => v.formType?.toLowerCase() === "inbound"
        ).length;
        const outboundCount = visits.filter(
            (v) => v.formType?.toLowerCase() === "outbound"
        ).length;

        return { allCount, inboundCount, outboundCount };
    };

    const counts = calculateCounts();

    // Handle form type tab change
    const handleFormTypeChange = (event, newValue) => {
        setFormTypeFilter(newValue);
        setPage(0);
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get current page data
    const paginatedData = useMemo(() => {
        return filteredVisits.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredVisits, page, rowsPerPage]);

    // Format date
    const formatDate = (dateString) => {
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


    const onExport = () => {
        handleExport({
            format: exportFormat,
            data: filteredVisits,
            columns: FORMS_AVAILABLE_COLUMNS,
            fileName: `patients_${moment().format("YYYY-MM-DD")}`,
            title: "Patients Report",
        });

        setExportDialogOpen(false);
    };

    const handleMoreMenuOpen = (event) => {
        setMoreMenuAnchor(event.currentTarget);
    };

    const handleMoreMenuClose = () => {
        setMoreMenuAnchor(null);
    };

    const handleMenuExport = () => {
        setExportDialogOpen(true);
        handleMoreMenuClose();
    };

    const handleCloseDateFilter = () => {
        setDateFilterAnchorEl(null);
    };
    const handleMenuClearDateFilter = () => {
        setStartDate("");
        setEndDate("");
        setShowDateFilters(false);
        handleMoreMenuClose();
    };

    const handleResetDateFilter = () => {
        setStartDate("");
        setEndDate("");
        setAppliedStartDate("");
        setAppliedEndDate("");
        setDateRangeFilter({ startDate: "", endDate: "" });
        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: 1,
            },
        }));
        handleCloseDateFilter();
    };

    const handleOpenDateFilter = (event) => {
        console.log("event", event.currentTarget);

        setDateFilterAnchorEl(event.currentTarget);
    };

    const handleMenuOpenDateFilter = (event) => {
        handleOpenDateFilter(event);
        handleMoreMenuClose();
    };

    const handleApplyDateFilter = async () => {
        if (!startDate || !endDate) return;

        console.log("click");

        try {

            const res = await patientHistory(
                patient?.hospitalId,
                patient?._id,
                paginatedData.patient.page,
                startDate,
                endDate,
                searchInput,
                true
            );

            console.log("patinat fetch ", res);
            if (res?.success) {
                setPatients(res?.data)
                setPagination((prev) => ({
                    ...prev,
                    patients: {
                        ...res.pagination
                    }
                }))
                handleCloseDateFilter();
            }


        } catch {

            toast.error("Error To Fetch Patient")

        }
    };

    // Handle back button
    const handleBack = () => {
        navigate(-1);
    };

    const openDateFilter = Boolean(dateFilterAnchorEl);
    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            {/* Header with Back Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                        color: "#212f3d",
                        borderColor: "#212f3d",
                        "&:hover": {
                            backgroundColor: "#f0f0f0",
                            borderColor: "#212f3d",
                        },
                    }}
                >
                    Back
                </Button>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 600, color: "#212f3d" }}
                >
                    Patient Details
                </Typography>
            </Box>

            {/* Patient Information Card */}
            <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Patient Name
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {patient.patientName}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Mobile Number
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {patient.patientMobile}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Age / Gender
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {patient?.patientAge} / {patient.gender}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Total Visits
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: "#212f3d" }}
                            >
                                {patient?.totalVisit}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Address
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                                {patient?.location}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Filter Card */}
            <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">

                        {/* Search */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Search by Name/Phone No./Purpose"
                                variant="outlined"
                                size="small"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#7c8fa3" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={handleSearchApply}
                                                sx={{
                                                    textTransform: "none",
                                                    minWidth: 72,
                                                    height: 30,
                                                    fontSize: "0.75rem",
                                                }}
                                            >
                                                Search
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Column Selector */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<ViewColumnIcon />}
                                    onClick={handleOpen}
                                    sx={{ height: 40, justifyContent: "flex-start" }}
                                >
                                    Select fields ({selectedFormColumns.length})
                                </Button>

                                <Popover
                                    open={Boolean(anchorEl)}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                >
                                    <Box sx={{ width: 260, p: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={allSelected} onChange={handleSelectAll} />
                                            }
                                            label={allSelected ? "Unselect All" : "Select All"}
                                        />

                                        <Divider />

                                        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                                            {FORMS_AVAILABLE_COLUMNS.map((col) => (
                                                <FormControlLabel
                                                    key={col.key}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedFormColumns.includes(col.key)}
                                                            onChange={() => toggleFormColumn(col.key)}
                                                        />
                                                    }
                                                    label={col.label}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </Popover>
                            </Box>
                        </Grid>

                        {/* Date Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterAltIcon />}
                                onClick={handleOpenDateFilter}
                                sx={{ height: 40, justifyContent: "flex-start" }}
                            >
                                {startDate && endDate
                                    ? `Date: ${startDate} to ${endDate}`
                                    : "Date Filter"}
                            </Button>

                            <Menu
                                anchorEl={dateFilterAnchorEl}
                                open={openDateFilter}
                                onClose={handleCloseDateFilter}
                            >
                                <Box sx={{ p: 2, width: 280, display: "flex", flexDirection: "column", gap: 2 }}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        size="small"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        size="small"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Button
                                            onClick={handleResetDateFilter}
                                            disabled={!startDate && !endDate}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleApplyDateFilter}
                                            disabled={!startDate || !endDate}
                                        >
                                            Apply
                                        </Button>
                                    </Box>
                                </Box>
                            </Menu>
                        </Grid>

                        {/* Export */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                startIcon={<DownloadIcon />}
                                onClick={() => setExportDialogOpen(true)}
                                sx={{ height: 40 }}
                            >
                                Export
                            </Button>
                        </Grid>
                        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
                            <DialogTitle>Select Export Format</DialogTitle>
                            <DialogContent>
                                <RadioGroup
                                    value={exportFormat}
                                    onChange={e => setExportFormat(e.target.value)}
                                >
                                    <FormControlLabel value="csv" control={<Radio />} label="CSV (.csv)" />
                                    <FormControlLabel value="excel" control={<Radio />} label="Excel (.xlsx)" />
                                    <FormControlLabel value="pdf" control={<Radio />} label="PDF (.pdf)" />
                                </RadioGroup>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setExportDialogOpen(false)} color="secondary">Cancel</Button>
                                <Button onClick={onExport} color="primary" variant="contained">Download</Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>

                    {/* Active Filters */}
                    {(searchTerm || startDate || endDate) && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Showing {filteredVisits.length} of {visits.length} visit(s)
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Error Alert */}
            {patientHistoryError && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {patientHistoryError}
                </Alert>
            )}
            {patientHistoryLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                        <Tabs
                            value={formTypeFilter}
                            onChange={handleFormTypeChange}
                            sx={{
                                borderBottom: "2px solid #e0e0e0",
                            }}
                        >
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <span>All</span>
                                        <Chip
                                            label={counts.allCount}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    formTypeFilter === "all" ? "#212f3d" : "#e0e0e0",
                                                color: formTypeFilter === "all" ? "white" : "#212f3d",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                }
                                value="all"
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <span>Inbound</span>
                                        <Chip
                                            label={counts.inboundCount}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    formTypeFilter === "inbound" ? "#212f3d" : "#c8e6c9",
                                                color: formTypeFilter === "inbound" ? "white" : "#212f3d",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                }
                                value="inbound"
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <span>Outbound</span>
                                        <Chip
                                            label={counts.outboundCount}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    formTypeFilter === "outbound" ? "#212f3d" : "#ffccbc",
                                                color: formTypeFilter === "outbound" ? "white" : "#212f3d",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                }
                                value="outbound"
                            />
                        </Tabs>
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor: "#212f3d",
                                        "& th": {

                                            fontWeight: 600,
                                            fontSize: "0.95rem",
                                        },
                                    }}
                                >
                                    <TableCell align="center">S.No</TableCell>

                                    {visibleFormColumns.map((col) => (
                                        <TableCell key={col.key}>
                                            {col.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredVisits.length > 0 ? (
                                    filteredVisits.map((row, index) => (
                                        <TableRow
                                            key={row._id}
                                            sx={{
                                                "&:hover": { backgroundColor: "#f0f0f0" },
                                                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                            }}
                                        >
                                            <TableCell align="center">
                                                {index + 1}
                                            </TableCell>
                                            {visibleFormColumns.map((col) => {
                                                let val = getNestedValue(row, col.key);

                                                // Handle appointmentSlot object
                                                if (
                                                    col.key === "lastVisit.formData.appointmentSlot" &&
                                                    val
                                                ) {
                                                    const formattedDate = val?.date
                                                        ? moment(val.date).format("dddd, DD MMM YYYY")
                                                        : null;

                                                    val = formattedDate
                                                        ? `${formattedDate} | ${val.start} to ${val.end}`
                                                        : `${val.start} to ${val.end}`;
                                                }

                                                // Handle dates
                                                else if (val && typeof val === "string") {
                                                    const date = moment(val);

                                                    if (date.isValid()) {
                                                        val = date.format("DD/MM/YYYY hh:mm A");
                                                    }
                                                }

                                                // Handle generic objects
                                                else if (
                                                    val &&
                                                    typeof val === "object" &&
                                                    !Array.isArray(val)
                                                ) {
                                                    val = val.name || JSON.stringify(val);
                                                }

                                                return (
                                                    <TableCell key={col.key}>
                                                        {["followupStatus", "formType", "appointmentStatus"].includes(col.key) ? (
                                                            <Chip
                                                                label={val}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor:
                                                                        statusStyles[val]?.bg || "#e0e0e0",

                                                                    color:
                                                                        statusStyles[val]?.color || "#000",

                                                                    fontWeight: 600,
                                                                    minWidth: 90,
                                                                }}
                                                            />
                                                        ) : (
                                                            val ?? "-"
                                                        )}
                                                    </TableCell>
                                                );
                                            })}

                                        </TableRow>
                                        // <TableRow
                                        //     key={patient._id}
                                        //     sx={{
                                        //         "&:hover": { backgroundColor: "#f0f0f0" },
                                        //         "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                        //     }}
                                        // >
                                        //     <TableCell align="center">
                                        //         {index + 1}
                                        //     </TableCell>
                                        //     <TableCell sx={{ fontWeight: 500 }}>
                                        //         {patient.patientName || "N/A"}
                                        //     </TableCell>
                                        //     <TableCell>{patient.patientMobile || "N/A"}</TableCell>
                                        //     <TableCell>
                                        //         <Box
                                        //             sx={{
                                        //                 display: "inline-block",
                                        //                 px: 1.5,
                                        //                 py: 0.5,
                                        //                 backgroundColor:
                                        //                     patient.purpose === "Appointment"
                                        //                         ? "#e3f2fd"
                                        //                         : patient.purpose === "followup"
                                        //                             ? "#f3e5f5"
                                        //                             : "#fce4ec",
                                        //                 borderRadius: 1,
                                        //                 fontSize: "0.85rem",
                                        //                 fontWeight: 500,
                                        //             }}
                                        //         >
                                        //             {patient?.lastVisit?.purpose || "N/A"}
                                        //         </Box>
                                        //     </TableCell>
                                        //     <TableCell>
                                        //         <Box
                                        //             sx={{
                                        //                 display: "inline-block",
                                        //                 px: 1.5,
                                        //                 py: 0.5,
                                        //                 backgroundColor:
                                        //                     patient?.lastVisit?.formType === "inbound"
                                        //                         ? "#c8e6c9"
                                        //                         : "#ffccbc",
                                        //                 borderRadius: 1,
                                        //                 fontSize: "0.85rem",
                                        //                 fontWeight: 500,
                                        //             }}
                                        //         >
                                        //             {patient?.lastVisit?.formType || "N/A"}
                                        //         </Box>
                                        //     </TableCell>
                                        //     <TableCell>{patient?.lastVisit?.doctor?.name || "N/A"}</TableCell>
                                        //     <TableCell>{patient?.lastVisit?.department?.name || "N/A"}</TableCell>
                                        //     <TableCell sx={{ fontSize: "0.9rem" }}>
                                        //         {formatDate(patient.createdAt)}
                                        //     </TableCell>
                                        // <TableCell>
                                        //     <Button
                                        //         onClick={() => {
                                        //             navigate(`/single-patient-history/${patient?._id}`, {
                                        //                 state: {

                                        //                     patient: {
                                        //                         ...patient,
                                        //                         hospitalId: selectedHostpital
                                        //                     }
                                        //                 }
                                        //             })
                                        //         }}
                                        //         variant="contained"
                                        //         color="success"
                                        //         size="small"
                                        //         sx={{
                                        //             fontSize: "12px",
                                        //             textTransform: "none", // keeps "View More" normal
                                        //             minWidth: "auto",      // removes default large width
                                        //             px: 1.5,               // horizontal padding
                                        //             py: 0.5,               // vertical padding
                                        //         }}
                                        //     >
                                        //         View More
                                        //     </Button>
                                        // </TableCell>
                                        // </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" sx={{ color: "#7c8fa3" }}>
                                                No patients found matching your criteria
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {filteredVisits.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15, 25]}
                            component="div"
                            count={filteredVisits.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                backgroundColor: "white",
                                mt: 2,
                                borderRadius: 1,
                            }}
                        />
                    )}
                </>
            )}

            {/* Visits Table */}


        </Box>
    );
};
