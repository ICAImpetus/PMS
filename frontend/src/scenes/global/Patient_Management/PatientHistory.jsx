
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
    const [patients, setPatients] = useState([])
    const [formTypeFilter, setFormTypeFilter] = useState("all");
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalDocument: 0,
        limit: 10,
    });
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
        selectedHostpital,
        setSelectedHostpital,
    } = useContext(HospitalContext);

    const { request: getPatients, loading: getPatientloading, error: patientApiError } = useApi(commonRoutes.getPatients)
    const fetchPatients = async (
        startDate = null,
        endDate = null,
        searchInput = "",
        isExport = false
    ) => {
        if (!selectedHostpital) return;

        if (isNonAdmin && !selectedBranch) return;

        try {
            const res = await getPatients(
                pagination?.page,
                selectedHostpital,
                isAdmin ? null : selectedBranch,
                startDate,
                endDate,
                searchInput || "",
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
                    limit: prev.limit, // keep current rows per page
                }));

                console.log("data", data.length);

                if (!data.length) {
                    toast.info("No data found for export");
                }

                return data; // IMPORTANT
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
            toast.warn("Please Enter Start And End Date");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.warn("Start date cannot be greater than end date");
            return;
        }

        try {
            const data = await fetchPatients(
                startDate,
                endDate,
                searchInput || "",
                true
            );

            setFilteredPatients(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Error fetching patient");
        }
    };

    const handleSearchApply = async () => {
        const searchValue = searchInput.trim().toLowerCase();

        setSearchName(searchInput.trim());

        if (!searchValue) return;

        let filtered = [...patients];

        // frontend search
        filtered = filtered.filter(
            (patient) =>
                patient?.patientName?.toLowerCase().includes(searchValue) ||
                patient?.lastVisit?.purpose?.toLowerCase().includes(searchValue) ||
                patient?.patientMobile?.toString().includes(searchValue)
        );

        // form filter
        if (formTypeFilter !== "all") {
            filtered = filtered.filter(
                (patient) =>
                    patient?.lastVisit?.formType?.toLowerCase() ===
                    formTypeFilter.toLowerCase()
            );
        }

        // backend fallback
        if (filtered.length === 0) {
            try {
                const res = await getPatients(
                    pagination?.patients?.page,
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
            } catch (error) {
                toast.error("Error To Fetch Patient");
                return;
            }
        }

        setFilteredPatients(filtered);
        setPatients(filtered);
    };


    // Clear all filters
    const handleClearFilters = async () => {
        setSearchName("");
        setSearchInput("");
        setStartDate("");
        setEndDate("");
        setAppliedStartDate("");
        setAppliedEndDate("");
        setFormTypeFilter("all");
        await fetchPatients()
    };


    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchApply();
        }
    };

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
        handleCloseDateFilter();
    };

    const onExport = async () => {
        try {
            handleExport({
                format: exportFormat,
                data: filteredPatients,
                columns: PATIENT_AVAILABLE_COLUMNS,
                fileName: `patients_${startDate}_${endDate}`,
                title: "Patients Report",
            });
            setStartDate("");
            setEndDate("");
            setExportDialogOpen(false);
            toast.success("Export successful");
        } catch (error) {
            console.error(error);
            toast.error("Error fetching patient");
        }
    };
    // Handle form type tab change
    const handleFormTypeChange = (event, newValue) => {
        setFormTypeFilter(newValue);

        if (newValue?.toLowerCase() === "all") {
            setFilteredPatients(patients);
            return;
        }

        const filter = (patients || []).filter(
            (pat) =>
                pat?.lastVisit?.formType?.toLowerCase() ===
                newValue?.toLowerCase()
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
    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPagination((prev) => ({
            ...prev,
            page: newPage + 1,
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


    return (
        <>
            {/* <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        zIndex: 999999,
                    },
                }}
            /> */}
            <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                {/* Header with Title and Tabs */}
                <Box sx={{ p: 2, pb: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderBottom: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: "#212f3d" }}>
                            Patient History
                        </Typography>
                    </Box>
                </Box>

                {/* Filter and Search Bar */}
                <Box sx={{ p: 2, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    {/* Left Side: Hospital/Branch Select */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {isAdmin ? (
                            <FormControl sx={{ width: "200px" }} size="small">
                                <InputLabel id="hospital-select-label">Select Hospital</InputLabel>
                                <Select
                                    labelId="hospital-select-label"
                                    label="Select Hospital"
                                    value={selectedHostpital || ""}
                                    onChange={(e) => setSelectedHostpital(e.target.value)}
                                    disabled={loading?.hospitalsLoading}
                                    sx={{ borderRadius: 1 }}
                                >
                                    {loading?.hospitalsLoading ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Loading...
                                        </MenuItem>
                                    ) : hospitals.length > 0 ? (
                                        hospitals.map((hospital) => (
                                            <MenuItem key={hospital._id} value={hospital._id}>
                                                {hospital.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No hospitals Assigned</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        ) : (
                            <FormControl sx={{ width: "200px" }} size="small">
                                <InputLabel id="branch-select-label">Select Branch</InputLabel>
                                <Select
                                    labelId="branch-select-label"
                                    label="Select Branch"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    disabled={loading?.branchesLoading}
                                    sx={{ borderRadius: 1 }}
                                >
                                    {loading?.branchesLoading ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Loading...
                                        </MenuItem>
                                    ) : branches.length > 0 ? (
                                        branches.map((branch) => (
                                            <MenuItem key={branch._id} value={branch._id}>
                                                {branch.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No Branch Assigned</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        )}
                    </Box>

                    {/* Right Side: Search, Refresh, Select Fields, Export, Actions */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {/* Search Input */}
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Search by Name/Phone No./Purpose"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "#7c8fa3", fontSize: "20px" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: "250px",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 1,
                                    height: "36px",
                                },
                            }}
                        />

                        {/* Search Button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearchApply}
                            disabled={getPatientloading || searchInput?.trim() === ""}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                height: "36px",
                                minWidth: "80px",
                            }}
                        >
                            {getPatientloading ? <CircularProgress size={20} color="inherit" /> : "Search"}
                        </Button>

                        {/* Date Range Filters */}
                        <TextField
                            type="date"
                            size="small"
                            variant="outlined"
                            label="From"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            sx={{
                                width: "140px",
                                "& .MuiOutlinedInput-root": {
                                    height: "36px",
                                    borderRadius: 1,
                                },
                            }}
                        />

                        <TextField
                            type="date"
                            size="small"
                            variant="outlined"
                            label="To"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            sx={{
                                width: "140px",
                                "& .MuiOutlinedInput-root": {
                                    height: "36px",
                                    borderRadius: 1,
                                },
                            }}
                        />

                        {/* Apply Date Filter Button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                if (startDate && endDate) {
                                    if (new Date(startDate) > new Date(endDate)) {
                                        toast.warn("Start date cannot be greater than end date");
                                        return;
                                    }
                                    setAppliedStartDate(startDate);
                                    setAppliedEndDate(endDate);
                                    handleApplyDatefilter()
                                    toast.success("Date filter applied");
                                } else {
                                    toast.warn("Please select both start and end dates");
                                }
                            }}
                            disabled={!startDate || !endDate || getPatientloading}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                height: "36px",
                                minWidth: "70px",
                            }}
                        >
                            {getPatientloading ? <CircularProgress size={22} /> : "Apply"}
                        </Button>

                        {/* Clear Date Filter Button */}
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleClearFilters}
                            disabled={getPatientloading}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                height: "36px",
                                minWidth: "70px",
                            }}
                        >
                            Clear
                        </Button>

                        {/* Select Fields Button */}
                        {/* <Button
                            variant="outlined"
                            color="primary"
                            ref={columnFilterButtonRef}
                            onClick={() => setFormsColumnFilterOpen((prev) => !prev)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                height: "36px",
                            }}
                        >
                            Select fields ({selectedFormColumns.length})
                        </Button> */}



                        {/* Refresh Button */}
                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={getPatientloading}
                            startIcon={<RefreshIcon />}
                            onClick={fetchPatients}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                height: "36px",
                            }}
                        >
                            {getPatientloading ? <CircularProgress size={20} /> : "Refresh"}
                        </Button>

                        {/* Export Button */}
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<DownloadIcon />}
                            onClick={() => setExportDialogOpen(true)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                height: "36px",
                            }}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>

                {/* Export Dialog */}
                <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Export Data</DialogTitle>
                    <DialogContent>
                        {/* Date Range Section */}
                        {/* <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
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
                        </div> */}

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

                {/* Tabs and Table Section */}
                {patientApiError && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {patientApiError}
                    </Alert>
                )}

                {getPatientloading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Table */}
                        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", borderBottom: "1px solid #e0e0e0" }}>
                                <Tabs
                                    value={formTypeFilter}
                                    onChange={handleFormTypeChange}
                                    sx={{
                                        borderBottom: "none",
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
                                count={pagination?.totalDocument || 0}
                                rowsPerPage={pagination?.limit || 10}
                                page={pagination?.page - 1}   // IMPORTANT FIX
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