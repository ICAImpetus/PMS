
import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import {
    Box,
    TextField,
    Menu,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Typography,
    InputAdornment,
    Tabs,
    Tab,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    IconButton,
    Radio,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import * as XLSX from "xlsx";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import HospitalContext from "../../../contexts/HospitalContexts";
import moment from "moment";
import { useApi } from "../../../api/useApi.js"
import { commonRoutes } from "../../../api/apiService";
import { handleExport, getNestedValue, PATIENT_AVAILABLE_COLUMNS, statusStyles } from "../../../utils/exportUtils.js";
import { Toaster } from "react-hot-toast";

export const generateExportData = (data, columns) => {
    const headers = columns.map((col) => col.label);

    const rows = data.map((item) =>
        columns.map((col) => {
            let value = getNestedValue(item, col.key);

            switch (col.key) {
                case "createdAt":
                    return value ? formatDate(value) : "N/A";

                default:
                    return value ?? "N/A";
            }
        })
    );

    return { headers, rows };
};

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
export const PatientHistory = () => {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [appliedStartDate, setAppliedStartDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");
    const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState("csv");
    const [formsColumnFilterOpen, setFormsColumnFilterOpen] = useState(false);
    const formsColumnFilterRef = useRef(null);
    const columnFilterButtonRef = useRef(null);
    const [filteredPatients, setFilteredPatients] = useState([])
    const [formTypeFilter, setFormTypeFilter] = useState("all");
    const [selectedFormColumns, setSelectedFormColumns] = useState([
        "patientName",
        "status",
        "patientAge",
        "gender",
        "patientMobile",
        "lastVisit.purpose",
        "lastVisit.formType",
        "createdAt",
    ]);
    const openDateFilter = Boolean(dateFilterAnchorEl);
    const navigate = useNavigate()


    const toggleFormColumn = (colKey) => {
        setSelectedFormColumns((prev) =>
            prev.includes(colKey)
                ? prev.filter((key) => key !== colKey)
                : [...prev, colKey]
        );
    };

    const {
        selectedBranch,
        setSelectedBranch,
        branches,
        isAdmin,
        isNonAdmin,
        loading,
        hospitals,
        errors,
        selectedHostpital,

        setSelectedHostpital,
        patients,
        pagination,
        setPagination,
        refetchPatients,
        dateRangeFilter,
        setDateRangeFilter,
        setPatients
    } = useContext(HospitalContext);

    const { request: getPatients, loading: getPatientloading } = useApi(commonRoutes.getPatients)


    const [searchParams] = useSearchParams();

    console.log("searchParams", searchParams);



    const handleSearchApply = async () => {
        const searchValue = searchInput.trim().toLowerCase();

        setSearchName(searchInput.trim());

        if (!searchValue) return;

        let filtered = [...patients];

        // Search in existing frontend data
        filtered = filtered.filter(
            (patient) =>
                patient.patientName?.toLowerCase().includes(searchValue) ||
                patient.lastVisit?.purpose?.toLowerCase().includes(searchValue) ||
                patient.patientMobile?.toString().includes(searchValue)
        );

        // Form type filter
        if (formTypeFilter !== "all") {
            filtered = filtered.filter(
                (patient) =>
                    patient?.lastVisit?.formType?.toLowerCase() ===
                    formTypeFilter.toLowerCase()
            );
        }

        // If no data found locally, call API
        if (filtered.length === 0) {
            try {
                const res = await getPatients(
                    pagination?.patient?.page,
                    selectedHostpital,
                    isAdmin ? null : selectedBranch,
                    startDate,
                    endDate,
                    searchInput || "",
                    true
                );

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
                toast.error("Error To Fetch Patient");
            }
        }

        setFilteredPatients(filtered);
    };

    useEffect(() => {
        const page = searchParams.get("page");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const search = searchParams.get("search");

        if (page) {
            setPage(Number(page));
        }

        if (startDate) {
            setStartDate(startDate);
        }

        if (endDate) {
            setEndDate(endDate);
        }

        if (search) {
            setSearchInput(search);
        }
    }, [searchParams]);
    useEffect(() => {
        setFilteredPatients(patients)
    }, [patients])

    // Clear all filters
    const handleClearFilters = () => {
        setSearchName("");
        setSearchInput("");
        setStartDate("");
        setEndDate("");
        setAppliedStartDate("");
        setAppliedEndDate("");
        setDateRangeFilter({ startDate: "", endDate: "" });
        setFormTypeFilter("all");
        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: 1,
            },
        }));
    };


    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchApply();
        }
    };
    useEffect(() => {
        setAppliedStartDate(dateRangeFilter.startDate || "");
        setAppliedEndDate(dateRangeFilter.endDate || "");
    }, [dateRangeFilter]);

    const visibleFormColumns = PATIENT_AVAILABLE_COLUMNS.filter((col) =>
        selectedFormColumns.includes(col.key),
    );


    const handleOpenDateFilter = (event) => {
        console.log("event", event.currentTarget);

        setDateFilterAnchorEl(event.currentTarget);
    };

    const handleCloseDateFilter = () => {
        setDateFilterAnchorEl(null);
    };

    const handleMoreMenuOpen = (event) => {
        setMoreMenuAnchor(event.currentTarget);
    };

    const handleMoreMenuClose = () => {
        setMoreMenuAnchor(null);
    };

    const handleMenuOpenDateFilter = (event) => {
        handleOpenDateFilter(event);
        handleMoreMenuClose();
    };

    const handleMenuClearDateFilter = () => {
        handleResetDateFilter();
        handleMoreMenuClose();
    };



    const handleResetDateFilter = () => {
        setStartDate("");
        setEndDate("");

        ;
        handleCloseDateFilter();
    };

    const onExport = async () => {
        if (!startDate || !endDate) {
            toast.warn("Please Enter Start And End Date");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.warn("Start date cannot be greater than end date");
            return;
        }

        try {
            const res = await getPatients(
                pagination?.patient?.page,
                selectedHostpital,
                isAdmin ? null : selectedBranch,
                startDate,
                endDate,
                searchInput || "",
                true
            );

            console.log("patient fetch", res);

            if (res?.success) {
                const data = res?.data || [];

                setPatients(data);
                setFilteredPatients(data);

                if (!data.length) {
                    toast.info("No data found for export");
                    return;
                }

                handleExport({
                    format: exportFormat,
                    data,
                    columns: PATIENT_AVAILABLE_COLUMNS,
                    fileName: `patients_${startDate}_${endDate}`,
                    title: "Patients Report",
                });

                setPagination((prev) => ({
                    ...prev,
                    patients: {
                        ...res.pagination,
                    },
                }));

                setStartDate("");
                setEndDate("");
                setExportDialogOpen(false);
                toast.success("Export successful");
            } else {
                toast.error("Failed to fetch patients");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching patient");
        }
    };
    // Handle form type tab change
    const handleFormTypeChange = (event, newValue) => {
        setFormTypeFilter(newValue);
    };

    // Calculate counts for each form type
    const calculateCounts = () => {
        const allCount = patients.length;
        const inboundCount = patients.filter(
            (p) => p?.lastVisit?.formType?.toLowerCase() === "inbound"
        ).length;
        const outboundCount = patients.filter(
            (p) => p?.lastVisit?.formType?.toLowerCase() === "outbound"
        ).length;

        return { allCount, inboundCount, outboundCount };
    };

    const counts = calculateCounts();

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPagination(prev => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: newPage + 1
            }
        }));
    };


    const handleChangeRowsPerPage = (event) => {
        const newLimit = parseInt(event.target.value, 10);

        setRowsPerPage(newLimit);

        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                limit: newLimit,
                page: 1, // reset to first page
            },
        }));
    };
    // Handle click outside for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                formsColumnFilterRef.current &&
                !formsColumnFilterRef.current.contains(event.target) &&
                columnFilterButtonRef.current &&
                !columnFilterButtonRef.current.contains(event.target)
            ) {
                setFormsColumnFilterOpen(false);
            }
        };
        if (formsColumnFilterOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [formsColumnFilterOpen]);

    useEffect(() => {
        const error = errors?.patientsError
        if (error) {
            toast.error(error)
        }
    }, [errors?.patientsError])


    useEffect(() => {
        if (formTypeFilter?.toLowerCase() === "all") {
            setFilteredPatients(patients);
            return;
        }

        setFilteredPatients(
            patients.filter(
                (pat) =>
                    pat?.lastVisit?.formType?.toLowerCase() ===
                    formTypeFilter?.toLowerCase()
            )
        );
    }, [formTypeFilter, patients]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        zIndex: 999999,
                    },
                }}
            />
            <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                {/* Header */}
                <Typography
                    variant="h4"
                    sx={{ mb: 3, fontWeight: 600, color: "#212f3d" }}
                >
                    Patient Management
                </Typography>

                {/* Filter Card */}
                <Card sx={{ mb: 3, boxShadow: 2 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="flex-end">
                            {isAdmin ? (<FormControl sx={{ width: "220px" }} size="small">
                                <InputLabel id="demo-multiple-checkbox-label">Select Hospital</InputLabel>
                                <Select
                                    labelId="hospital-label"
                                    label="Select Hospital"
                                    value={selectedHostpital || ""}
                                    onChange={(e) => setSelectedHostpital(e.target.value)}
                                    disabled={loading?.hospitalsLoading}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: "black",
                                        color: "black",
                                        ".MuiSvgIcon-root": {
                                            color: "black",
                                        },
                                    }}
                                >
                                    {loading?.hospitalsLoading ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Loading...
                                        </MenuItem>
                                    ) : hospitals.length > 0 ? (
                                        hospitals.map((hospital) => (
                                            <MenuItem
                                                key={hospital._id}
                                                value={hospital._id}
                                            >
                                                {hospital.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">
                                            No hospitals Assigned
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>) : (
                                <FormControl sx={{ width: "220px" }} size="small">
                                    <InputLabel
                                        id="hospital-label"
                                    >
                                        Select Branch
                                    </InputLabel>

                                    <Select
                                        labelId="hospital-label"
                                        label="Select Branch"
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        disabled={loading?.branchesLoading}
                                        displayEmpty
                                        sx={{
                                            borderRadius: 2,
                                            backgroundColor: "black",
                                            color: "black",

                                        }}
                                    >
                                        {/* <MenuItem value="">
                                                                <em>Select Hospital</em>
                                                            </MenuItem> */}

                                        {loading?.branchesLoading ? (
                                            <MenuItem value="">
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Loading...
                                            </MenuItem>
                                        ) : branches.length > 0 ? (
                                            branches.map((branch) => (
                                                <MenuItem
                                                    key={branch._id}
                                                    value={branch._id}
                                                >
                                                    {branch.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="">
                                                No Branch Assigned
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            )}

                            {/* Search by Name */}
                            {console.log("searchin lut", searchInput)
                            }
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
                                                    color="primary"

                                                    onClick={handleSearchApply}
                                                    disabled={getPatientloading || searchInput?.trim() === ""}
                                                    sx={{
                                                        textTransform: "none",
                                                        minWidth: 72,
                                                        height: 32,
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {getPatientloading ? <CircularProgress size={22} /> : "Search"}
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter Patient Name,PhoneNo or Purpose"
                                />
                            </Grid>
                            {/* <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<FilterAltIcon />}
                                    onClick={handleOpenDateFilter}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    {startDate && endDate
                                        ? `Date: ${startDate} to ${endDate}`
                                        : "Date Filter"}
                                </Button>
                                <Menu
                                    id="date-filter-menu"
                                    anchorEl={dateFilterAnchorEl}
                                    open={openDateFilter}
                                    onClose={handleCloseDateFilter}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                                >
                                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: 280 }}>
                                        <TextField
                                            label="Start Date"
                                            type="date"
                                            variant="outlined"
                                            size="small"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <TextField
                                            label="End Date"
                                            type="date"
                                            variant="outlined"
                                            size="small"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                            <Button
                                                color="secondary"
                                                onClick={handleResetDateFilter}
                                                disabled={(!startDate && !endDate) || getPatientloading}
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleApplyDateFilter}
                                                disabled={(!startDate || !endDate) || getPatientloading}
                                            >
                                                {getPatientloading ? <CircularProgress size={22} /> : "Apply"}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Menu>
                            </Grid> */}
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                sx={{

                                    display: 'flex',
                                    gap: '5px',
                                    fontSize: "12px",
                                    textTransform: "none", // keeps "View More" normal
                                    minWidth: "auto",      // removes default large width
                                    px: 1.5,               // horizontal padding
                                    py: 0.5,               // vertical padding
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={loading?.patients}
                                    startIcon={<RefreshIcon />}
                                    onClick={refetchPatients}

                                >
                                    {loading?.patients ? <CircularProgress size={24} /> : "Refresh"}
                                </Button>


                                {/* <div
                                    ref={columnFilterButtonRef}
                                    style={{ position: "relative", display: "inline-block" }}
                                >
                                              <Button
                                    variant="outlined"
                                    color="secondary"
                                    ref={columnFilterButtonRef}
                                    onClick={() => setFormsColumnFilterOpen((prev) => !prev)}

                                >
                                    <i className="fas fa-columns"></i> Select Fields (
                                    {selectedFormColumns.length})


                                </Button>

                                    {formsColumnFilterOpen && (
                                        <div
                                            ref={formsColumnFilterRef}
                                            className="ff-column-filter-dropdown"
                                            style={{
                                                position: "absolute",
                                                zIndex: 10,
                                                top: "calc(100% + 8px)",
                                                right: 0,
                                                background: "#fff",
                                                border: "1px solid #ccc",
                                                borderRadius: 6,
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                padding: 12,
                                                minWidth: 180,
                                            }}
                                        >
                                            <div className="ff-column-checkboxes">
                                                {PATIENT_AVAILABLE_COLUMNS.map((col) => (
                                                    <label
                                                        key={col.key}
                                                        className="ff-column-check"
                                                        style={{
                                                            display: "block",
                                                            marginBottom: 6,
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFormColumns.includes(col.key)}
                                                            onChange={() => toggleFormColumn(col.key)}
                                                        />

                                                        <span style={{ marginLeft: 8 }}>
                                                            {col.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}const searchOptions = [
  "Search Patient...",
  "Search Agent...",
  "Search POC...",
  "Search Remarks...",
];

                                </div> */}
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => setExportDialogOpen(true)}
                                >
                                    Export
                                </Button>


                                <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} fullWidth maxWidth="sm">
                                    <DialogTitle>Export Data</DialogTitle>

                                    <DialogContent>

                                        {/* Date Range Section */}
                                        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                                            <TextField
                                                label="Start Date"
                                                type="date"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />

                                            <TextField
                                                label="End Date"
                                                type="date"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>

                                        {/* Format Selection */}
                                        <div style={{ marginTop: "20px" }}>
                                            <RadioGroup
                                                value={exportFormat}
                                                onChange={(e) => setExportFormat(e.target.value)}
                                            >
                                                <FormControlLabel value="csv" control={<Radio />} label="CSV (.csv)" />
                                                <FormControlLabel value="excel" control={<Radio />} label="Excel (.xlsx)" />
                                                <FormControlLabel value="pdf" control={<Radio />} label="PDF (.pdf)" />
                                            </RadioGroup>
                                        </div>

                                    </DialogContent>

                                    <DialogActions>
                                        <Button disabled={getPatientloading} onClick={() => setExportDialogOpen(false)} color="secondary">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={onExport}
                                            color="primary"
                                            variant="contained"
                                            disabled={
                                                !startDate ||
                                                !endDate ||
                                                getPatientloading
                                            }
                                        >
                                            {getPatientloading ? (
                                                <CircularProgress size={22} color="inherit" />
                                            ) : (
                                                "Download"
                                            )}
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                        </Grid>

                        {/* Active Filters Display and Clear Button (right) */}
                        {(searchName || appliedStartDate || appliedEndDate) && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                    Showing {filteredPatients.length} of {patients.length} patient(s)
                                    {appliedStartDate && appliedEndDate && (
                                        <>&nbsp;| Date: {appliedStartDate} to {appliedEndDate}</>
                                    )}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleClearFilters}
                                    sx={{ ml: 2 }}
                                >
                                    Clear
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Error Alert */}
                {errors?.patientsError && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {errors?.patientsError}
                    </Alert>
                )}

                {/* Loading State */}

                {loading?.patients ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Table */}
                        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

                            </Box>

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
                                                {col?.label || "-"}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map((row, index) => (
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


                                                    const displayValue =
                                                        val === null || val === undefined || val === ""
                                                            ? "--"
                                                            : val;
                                                    return (
                                                        <TableCell key={col.key}>
                                                            {["followupStatus", "lastVisit.formType", "appointmentStatus"].includes(col.key) ? (
                                                                <Chip
                                                                    label={displayValue}
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
                                                                displayValue
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell>
                                                    <Button
                                                        onClick={() => {
                                                            const params = new URLSearchParams({
                                                                page: pagination?.patient?.page || 1,
                                                                startDate: startDate || "",
                                                                endDate: endDate || "",
                                                                search: searchInput || "",
                                                            });

                                                            navigate(
                                                                `/single-patient-history/${row?._id}?${params.toString()}`,
                                                                {
                                                                    state: {
                                                                        patient: {
                                                                            ...row,
                                                                            hospitalId: selectedHostpital,
                                                                        },
                                                                    },
                                                                }
                                                            );
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
                        {filteredPatients.length > 0 && (
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={pagination?.patients?.totalDocument || 0}
                                rowsPerPage={pagination?.patients?.limit || 10}
                                page={pagination?.patients?.page - 1}   // IMPORTANT FIX
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                onPageChange={handleChangePage}
                                sx={{
                                    backgroundColor: "white",
                                    mt: 2,
                                    borderRadius: 1,
                                }}
                            />
                        )}
                    </>
                )
                }


            </Box >
        </>

    );
};