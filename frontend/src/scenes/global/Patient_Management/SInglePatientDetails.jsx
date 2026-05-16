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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { commonRoutes } from "../../../api/apiService";
import { useApi } from "../../../api/useApi";

export const FORMS_AVAILABLE_COLUMNS = [
    { key: "patientName", label: "Patient Name" },
    { key: "patientMobile", label: "Patient Mobile No" },
    { key: "lastVisit.purpose", label: "POC / Purpose" },
    { key: "lastVisit.formType", label: "Form Type" },
    { key: "lastVisit.doctor.name", label: "Doctor" },
    { key: "lastVisit.department.name", label: "Department" },
    { key: "createdAt", label: "Created At" },
];
export const SInglePatientDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation()
    const [patient, setPatient] = useState(location.state?.patient || {});
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formTypeFilter, setFormTypeFilter] = useState("all");
    const [formsColumnFilterOpen, setFormsColumnFilterOpen] = useState(false);
    const formsColumnFilterRef = React.useRef(null);
    const columnFilterButtonRef = React.useRef(null);
    const [selectedFormColumns, setSelectedFormColumns] = useState([
        "patientName",
        "patientMobile",
        "lastVisit.purpose",
        "lastVisit.formType",
        "createdAt",
    ]);
    const [error, setError] = useState(null)

    const {
        loading: patientHistoryLoading,
        request: patientHistory,
        error: patientHistoryError,
    } = useApi(commonRoutes.getSinglePatientsHistory);

    const filteredVisits = useMemo(() => {
        let filtered = [...(visits || [])];


        // Search by doctor name or department
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();

            filtered = filtered.filter((visit) =>
                visit?.doctor?.name?.toLowerCase().includes(search) ||
                visit?.department?.name?.toLowerCase().includes(search)
            );
        }

        // Filter by date range
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (end) {
                end.setHours(23, 59, 59, 999);
            }

            filtered = filtered.filter((visit) => {
                const visitDate = new Date(visit?.createdAt);

                if (start && visitDate < start) return false;
                if (end && visitDate > end) return false;

                return true;
            });
        }

        // Filter by form type
        if (formTypeFilter !== "all") {
            const type = formTypeFilter.toLowerCase();

            filtered = filtered.filter(
                (visit) => visit?.formType?.toLowerCase() === type
            );
        }

        return filtered;
    }, [visits, searchTerm, startDate, endDate, formTypeFilter]);


    const toggleFormColumn = (colKey) => {
        setSelectedFormColumns((prev) =>
            prev.includes(colKey)
                ? prev.filter((key) => key !== colKey)
                : [...prev, colKey]
        );
    };
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
        const fetchHistory = async () => {
            if (!patient?.hospitalId || !patient?._id) {
                toast.error("Hospital Id And Patient id Not Found")
                return
            }
            const res = await patientHistory(patient?.hospitalId, patient?._id)
            if (res.success) {
                setVisits(res?.data)
            } else {
                toast.error("Error To Fetch Forms")
            }
        }
        fetchHistory()
    }, [patient?._id, patient?.hospitalId])

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

    // Export to CSV
    const handleExportCSV = () => {
        if (filteredVisits.length === 0) {
            toast.warning("No data to export");
            return;
        }

        const headers = [
            "Call Date",
            "Doctor Name",
            "Department",
            "Purpose",
            "Form Type",
            "Remarks",
        ];

        const rows = filteredVisits.map((visit) => [
            formatDate(visit.createdAt),
            visit.doctorName,
            visit.departmentName,
            visit.purpose,
            visit.formType,
            visit.remarks,
        ]);

        // Create CSV content
        const csvContent = [
            [
                `Patient: ${patient.patientName}`,
                `Mobile: ${patient.patientMobile}`,
                `Age: ${patient.age}`,
                `Gender: ${patient.gender}`,
            ],
            [],
            headers,
            ...rows,
        ]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `${patient.patientName}_visits_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("CSV exported successfully!");
    };

    // Handle back button
    const handleBack = () => {
        navigate(-1);
    };

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
                    <Grid container spacing={2} alignItems="flex-end">

                        {/* Search */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Search by Doctor/Department"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#7c8fa3" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter doctor name or department"
                            />
                        </Grid>

                        {/* Start Date */}
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* End Date */}
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Select Fields */}
                        <Grid item xs={12} sm={6} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                ref={columnFilterButtonRef}
                                onClick={() => setFormsColumnFilterOpen((prev) => !prev)}
                                size="medium"
                                sx={{ height: "40px" }}
                            >
                                <i className="fas fa-columns"></i>
                                &nbsp; Select Fields ({selectedFormColumns.length})
                            </Button>
                        </Grid>

                        {/* Export CSV */}
                        <Grid item xs={12} sm={6} md={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                startIcon={<FileDownloadIcon />}
                                onClick={handleExportCSV}
                                size="medium"
                                sx={{ height: "40px" }}
                            >
                                Export CSV
                            </Button>
                        </Grid>

                    </Grid>

                    {/* Active Filters Display */}
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
                                    <TableCell>Call Date</TableCell>
                                    <TableCell>Doctor Name</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Purpose</TableCell>
                                    <TableCell>Form Type</TableCell>
                                    <TableCell>Remarks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((visit, index) => (
                                        <TableRow
                                            key={visit._id}
                                            sx={{
                                                "&:hover": { backgroundColor: "#f0f0f0" },
                                                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                            }}
                                        >
                                            <TableCell align="center">
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "0.9rem" }}>
                                                {formatDate(visit.createdAt)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {visit.doctor?.name || "N/A"}
                                            </TableCell>
                                            <TableCell>{visit.department?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        backgroundColor:
                                                            visit.purpose === "Appointment"
                                                                ? "#e3f2fd"
                                                                : "#f3e5f5",
                                                        borderRadius: 1,
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {visit.purpose}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        backgroundColor:
                                                            visit.formType === "inbound"
                                                                ? "#c8e6c9"
                                                                : "#ffccbc",
                                                        borderRadius: 1,
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {visit.formType}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        backgroundColor: "#fff9c4",
                                                        borderRadius: 1,
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {visit?.formData?.remarks || "N/A"}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" sx={{ color: "#7c8fa3" }}>
                                                No visits found matching your criteria
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

            {formsColumnFilterOpen && (
                <div
                    ref={formsColumnFilterRef}
                    className="ff-column-filter-dropdown"
                    style={{
                        position: "absolute",
                        zIndex: 10,
                        top: columnFilterButtonRef.current ? columnFilterButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 8 : '100%',
                        left: columnFilterButtonRef.current ? columnFilterButtonRef.current.getBoundingClientRect().left + window.scrollX : 0,
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        padding: 12,
                        minWidth: 180,
                    }}
                >
                    <div className="ff-column-checkboxes">
                        {FORMS_AVAILABLE_COLUMNS.map((col) => (
                            <label key={col.key} className="ff-column-check" style={{ display: 'block', marginBottom: 6 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedFormColumns.includes(col.key)}
                                    onChange={() => toggleFormColumn(col.key)}
                                />
                                <span style={{ marginLeft: 8 }}>{col.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </Box>
    );
};
