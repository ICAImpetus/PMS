
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
import { commonRoutes } from "../../../api/apiService";
import { useApi } from "../../../api/useApi";
import { UserContextHook } from "../../../contexts/UserContexts";
import HospitalContext from "../../../contexts/HospitalContexts";

// Dummy patient data
const DUMMY_PATIENTS = [
    {
        _id: "1",
        patientName: "Rajesh Kumar",
        patientMobile: "+91-9876543210",
        purpose: "Appointment",
        formType: "inbound",
        doctorName: "Dr. Anil Singh",
        departmentName: "Cardiology",
        createdAt: new Date(2024, 3, 15, 10, 30),
        callStatus: "completed",
    },
    {
        _id: "2",
        patientName: "Priya Sharma",
        patientMobile: "+91-9876543211",
        purpose: "Appointment",
        formType: "outbound",
        doctorName: "Dr. Meera Patel",
        departmentName: "Pediatrics",
        createdAt: new Date(2024, 3, 14, 14, 15),
        callStatus: "completed",
    },
    {
        _id: "3",
        patientName: "Amit Verma",
        patientMobile: "+91-9876543212",
        purpose: "followup",
        formType: "inbound",
        doctorName: "Dr. Rajesh Gupta",
        departmentName: "General Surgery",
        createdAt: new Date(2024, 3, 13, 9, 45),
        callStatus: "dropped",
    },
    {
        _id: "4",
        patientName: "Neha Singh",
        patientMobile: "+91-9876543213",
        purpose: "Appointment",
        formType: "outbound",
        doctorName: "Dr. Sanjana Roy",
        departmentName: "Dermatology",
        createdAt: new Date(2024, 3, 12, 16, 20),
        callStatus: "completed",
    },
    {
        _id: "5",
        patientName: "Vikram Patel",
        patientMobile: "+91-9876543214",
        purpose: "followup",
        formType: "inbound",
        doctorName: "Dr. Anil Singh",
        departmentName: "Cardiology",
        createdAt: new Date(2024, 3, 11, 11, 0),
        callStatus: "pending",
    },
    {
        _id: "6",
        patientName: "Ananya Desai",
        patientMobile: "+91-9876543215",
        purpose: "Appointment",
        formType: "inbound",
        doctorName: "Dr. Meera Patel",
        departmentName: "Psychiatry",
        createdAt: new Date(2024, 3, 10, 13, 30),
        callStatus: "completed",
    },
    {
        _id: "7",
        patientName: "Suresh Reddy",
        patientMobile: "+91-9876543216",
        purpose: "followup",
        formType: "outbound",
        doctorName: "Dr. Rajesh Gupta",
        departmentName: "Orthopedics",
        createdAt: new Date(2024, 3, 9, 15, 45),
        callStatus: "completed",
    },
    {
        _id: "8",
        patientName: "Divya Nair",
        patientMobile: "+91-9876543217",
        purpose: "Appointment",
        formType: "outbound",
        doctorName: "Dr. Sanjana Roy",
        departmentName: "Obstetrics",
        createdAt: new Date(2024, 3, 8, 10, 15),
        callStatus: "dropped",
    },
    {
        _id: "9",
        patientName: "Harsh Malhotra",
        patientMobile: "+91-9876543218",
        purpose: "Appointment",
        formType: "inbound",
        doctorName: "Dr. Anil Singh",
        departmentName: "Neurology",
        createdAt: new Date(2024, 3, 7, 12, 0),
        callStatus: "pending",
    },
    {
        _id: "10",
        patientName: "Sakshi Kulkarni",
        patientMobile: "+91-9876543219",
        purpose: "followup",
        formType: "inbound",
        doctorName: "Dr. Meera Patel",
        departmentName: "ENT",
        createdAt: new Date(2024, 3, 6, 14, 30),
        callStatus: "completed",
    },
    {
        _id: "11",
        patientName: "Ravi Bansal",
        patientMobile: "+91-9876543220",
        purpose: "Appointment",
        formType: "outbound",
        doctorName: "Dr. Rajesh Gupta",
        departmentName: "Urology",
        createdAt: new Date(2024, 3, 5, 16, 0),
        callStatus: "completed",
    },
    {
        _id: "12",
        patientName: "Isha Gupta",
        patientMobile: "+91-9876543221",
        purpose: "followup",
        formType: "outbound",
        doctorName: "Dr. Sanjana Roy",
        departmentName: "Gastroenterology",
        createdAt: new Date(2024, 3, 4, 11, 45),
        callStatus: "dropped",
    },
];

export const PatientHistory = () => {


    const [filteredPatients, setFilteredPatients] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formTypeFilter, setFormTypeFilter] = useState("all");

    const {
        loading,
        hospitals,
        errors,
        selectedHostpital,
        setSelectedHostpital,
        patients,
        pagination,
        setPagination,
        refreshPatients
    } = useContext(HospitalContext);

    const navigate = useNavigate()

    useEffect(() => {
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

        setFilteredPatients(filtered);
        setPagination((prev) => ({
            ...prev,
            patients: 0,
        }));
    }, [patients, searchName, startDate, endDate, formTypeFilter]);

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
            patients: 0,
        }));
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
            patients: newPage,
        }));
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPagination((prev) => ({
            ...prev,
            patients: 0,
        }));
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

    const paginatedData = useMemo(() => {
        return filteredPatients.slice(
            pagination?.patients * rowsPerPage,
            pagination?.patients * rowsPerPage + rowsPerPage
        );
    }, [filteredPatients, pagination?.patients, rowsPerPage]);


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
                            {/* <InputLabel
                                id="hospital-label"
                            >
                                Select Hospital
                            </InputLabel> */}

                            <InputLabel id="demo-multiple-checkbox-label">Select Hospital</InputLabel>

                            <Select
                                labelId="hospital-label"
                                label="Select Hospital"
                                value={selectedHostpital}
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

                        {/* Clear Filters Button */}
                        {/* <Grid item xs={12} sm={6} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                startIcon={<ClearIcon />}
                                onClick={handleClearFilters}
                            >
                                Clear
                            </Button>
                        </Grid> */}

                        {/* Refresh Button */}


                    </Grid>

                    {/* Active Filters Display */}
                    {(searchName || startDate || endDate) && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ color: "#7c8fa3" }}>
                                Showing {filteredPatients.length} of {patients.length} patient(s)
                            </Typography>
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
            {loading?.patientsLoading ? (
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
                                    startIcon={<RefreshIcon />}
                                    onClick={refreshPatients}

                                >
                                    Refresh
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
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((patient, index) => (
                                        <TableRow
                                            key={patient._id}
                                            sx={{
                                                "&:hover": { backgroundColor: "#f0f0f0" },
                                                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                            }}
                                        >
                                            <TableCell align="center">
                                                {pagination?.patients * rowsPerPage + index + 1}
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
                            rowsPerPage={rowsPerPage}
                            page={pagination?.patients}
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