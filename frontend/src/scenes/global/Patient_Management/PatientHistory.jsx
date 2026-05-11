
import React, { useState, useEffect, useMemo, useContext } from "react";
import {
    Box,
    TextField,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import HospitalContext from "../../../contexts/HospitalContexts";

export const PatientHistory = () => {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formTypeFilter, setFormTypeFilter] = useState("all");

    // Clear all filters
    const handleClearFilters = () => {
        setSearchName("");
        setStartDate("");
        setEndDate("");
        setFormTypeFilter("all");
        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: 0,
            },
        }));
    };

    const {
        loading,
        hospitals,
        errors,
        selectedHostpital,
        setSelectedHostpital,
        patients,
        pagination,
        setPagination,
        refetchPatients
    } = useContext(HospitalContext);

    const navigate = useNavigate()

    const filteredPatients = useMemo(() => {
        let filtered = [...patients];

        // Search by patient name
        if (searchName.trim()) {
            filtered = filtered.filter((patient) =>
                patient.patientName
                    ?.toLowerCase()
                    .includes(searchName.toLowerCase())
            );
        }

        // Filter by date range
        if (startDate || endDate) {
            filtered = filtered.filter((patient) => {
                const patientDate = new Date(patient.createdAt);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && patientDate < start) return false;

                if (end) {
                    end.setHours(23, 59, 59, 999);
                    if (patientDate > end) return false;
                }

                return true;
            });
        }

        // Filter by form type
        if (formTypeFilter !== "all") {
            filtered = filtered.filter(
                (patient) =>
                    patient?.lastVisit?.formType?.toLowerCase() ===
                    formTypeFilter.toLowerCase()
            );
        }

        return filtered;
    }, [patients, searchName, startDate, endDate, formTypeFilter]);

    console.log("filteredPatients", filteredPatients);


    // Export to CSV
    const handleExportCSV = () => {
        if (filteredPatients.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = [
            "Patient Name",
            "Patient Mobile No.",
            "Purpose",
            "Form Type",
            "Doctor",
            "Department",
            "Remarks",
            "Date",
        ];

        const rows = filteredPatients.map((patient) => [
            patient.patientName || "N/A",
            patient.patientMobile || "N/A",
            patient?.lastVisit?.purpose || "N/A",
            patient?.lastVisit?.formType || "N/A",
            patient?.lastVisit?.doctor?.name || "N/A",
            patient?.lastVisit?.department?.name || "N/A",
            patient?.lastVisit?.remarks || "N/A",
            formatDate(patient.createdAt) || "N/A",
        ]);

        // Create CSV content
        const csvContent = [headers, ...rows]
            .map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            )
            .join("\n");

        // Create blob
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `patients_${new Date()
            .toISOString()
            .split("T")[0]}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        toast.success("CSV exported successfully!");
    };


    // Handle form type tab change
    const handleFormTypeChange = (event, newValue) => {
        setFormTypeFilter(newValue);
        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: 0,
            },
        }));;
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
        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: newPage,
            },
        }));
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: 0,
            },
        }));;
    };

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


    useEffect(() => {
        const error = errors?.patientsError
        if (error) {
            toast.error(error)
        }
    }, [errors?.patientsError])

    return (
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
                        <FormControl sx={{ width: "220px" }} size="small">
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
                        </FormControl>
                        {/* Search by Name */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Search by Name"
                                variant="outlined"
                                size="small"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#7c8fa3" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter patient name"
                            />
                        </Grid>
                        {/* Start Date */}
                        <Grid item xs={12} sm={6} md={3}>
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
                        <Grid item xs={12} sm={6} md={3}>
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
                    </Grid>

                    {/* Active Filters Display and Clear Button (right) */}
                    {(searchName || startDate || endDate) && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Showing {filteredPatients.length} of {patients.length} patient(s)
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

                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExportCSV}

                                >
                                    Export CSV
                                </Button>
                            </Grid>
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
                                    <TableCell>Patient Name</TableCell>
                                    <TableCell>Mobile</TableCell>
                                    <TableCell>Purpose</TableCell>
                                    <TableCell>Form Type</TableCell>
                                    <TableCell>Doctor</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Date & Time</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient, index) => (
                                        <TableRow
                                            key={patient._id}
                                            sx={{
                                                "&:hover": { backgroundColor: "#f0f0f0" },
                                                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                            }}
                                        >
                                            <TableCell align="center">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {patient.patientName || "N/A"}
                                            </TableCell>
                                            <TableCell>{patient.patientMobile || "N/A"}</TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        backgroundColor:
                                                            patient.purpose === "Appointment"
                                                                ? "#e3f2fd"
                                                                : patient.purpose === "followup"
                                                                    ? "#f3e5f5"
                                                                    : "#fce4ec",
                                                        borderRadius: 1,
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {patient?.lastVisit?.purpose || "N/A"}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        backgroundColor:
                                                            patient?.lastVisit?.formType === "inbound"
                                                                ? "#c8e6c9"
                                                                : "#ffccbc",
                                                        borderRadius: 1,
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {patient?.lastVisit?.formType || "N/A"}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{patient?.lastVisit?.doctor?.name || "N/A"}</TableCell>
                                            <TableCell>{patient?.lastVisit?.department?.name || "N/A"}</TableCell>
                                            <TableCell sx={{ fontSize: "0.9rem" }}>
                                                {formatDate(patient.createdAt)}
                                            </TableCell>
                                            <TableCell>
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
                            count={filteredPatients.length}
                            rowsPerPage={pagination?.patients?.limit}
                            page={pagination?.patients?.page}
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
            )
            }
        </Box >
    );
};