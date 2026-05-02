
import React, { useState, useEffect, useMemo } from "react";
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
    const { currentUser } = UserContextHook()

    const isAdmin = ["superadmin", "admin"].includes(
        currentUser?.type?.toLowerCase()
    );
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [branches, setBranches] = useState([])
    const [profile, setProfile] = React.useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedHostpital, setSelectedHostpital] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState(null);
    const [formTypeFilter, setFormTypeFilter] = useState("all");

    const { loading: branchesLoading, request: getBranches, error: branchesError } = useApi(commonRoutes.branchesByRole)
    const { request: getMe, error: getMeError, loading: getMeloading } = useApi(commonRoutes.getMe)
    const {
        loading: patientsLoading,
        request: getPatients,
        error: patientsError,
    } = useApi(commonRoutes.getPatients);

    React.useEffect(() => {
        const handleGetMe = async () => {
            const res = await getMe();
            setProfile(res.data || {});
            if (res.data?.hospitals?.length) {
                setSelectedHostpital(res.data?.hospitals[0]?.hospitalId)
            }
        };
        handleGetMe()
    }, [])
    // useEffect(() => {

    //     const error = er
    //     if (error) {
    //         toast.error(error || "Internal Server Error")
    //     }

    // }, [hospitalsError])

    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel API calls (fast)
                const [res] = await Promise.all([
                    getBranches(selectedHostpital),
                ]);

                // Hospitals
                setBranches(res?.data || []);
                if (res?.data?.length) {
                    setSelectedBranch(res?.data[0]?._id)
                }



            } catch (err) {
                console.error("Fetch Error:", err);
            }
        };
        if (selectedHostpital) {
            fetchData();
        }
    }, [selectedHostpital]);

    // Fetch patient data
    const fetchPatients = async () => {
        console.log("selectedHostpital", selectedBranch);

        if (!selectedBranch) {

            setError("Branch ID not found. Please select a branch.");
            console.log("Error");

            return;
        }
        try {
            const response = await getPatients(null, page, selectedBranch, selectedHostpital);

            // Flatten the data from the response
            if (response?.success) {
                const flattenedData = response?.data || [];
                setPatients(flattenedData);
                setPage(0);
            }

        } catch (err) {
            const errorMsg = err?.response?.data?.message || err.message || "Failed to fetch patients";
            console.log(err);
            toast.error(errorMsg);
            setError(errorMsg)
        }
    };

    // Initial fetch
    useEffect(() => {
        // Using dummy data for now. Uncomment below to fetch from API
        if (selectedHostpital && selectedBranch)
            fetchPatients();

    }, [selectedHostpital, selectedBranch]);

    // Filter patients based on search and date filters
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
            filtered = filtered.filter((patient) =>
                patient.formType?.toLowerCase() === formTypeFilter.toLowerCase()
            );
        }

        setFilteredPatients(filtered);
        setPage(0);
    }, [searchName, startDate, endDate, formTypeFilter, patients]);

    // Export to CSV
    const handleExportCSV = () => {
        if (filteredVisits.length === 0) {
            toast.warning("No data to export");
            return;
        }

        const headers = [
            "Visit Date",
            "Doctor Name",
            "Department",
            "Purpose",
            "Form Type",
            "Call Status",
        ];

        const rows = filteredVisits.map((visit) => [
            formatDate(visit.createdAt),
            visit.doctorName,
            visit.departmentName,
            visit.purpose,
            visit.formType,
            visit.callStatus,
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

    // Handle form type tab change
    const handleFormTypeChange = (event, newValue) => {
        setFormTypeFilter(newValue);
        setPage(0);
    };

    // Calculate counts for each form type
    const calculateCounts = () => {
        const allCount = patients.length;
        const inboundCount = patients.filter(
            (p) => p.formType?.toLowerCase() === "inbound"
        ).length;
        const outboundCount = patients.filter(
            (p) => p.formType?.toLowerCase() === "outbound"
        ).length;

        return { allCount, inboundCount, outboundCount };
    };

    const counts = calculateCounts();

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
        return filteredPatients.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredPatients, page, rowsPerPage]);

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
                                disabled={branchesLoading}
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

                                {branchesLoading ? (
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
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {loading ? (
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
                                    onClick={fetchPatients}

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
                                                {page * rowsPerPage + index + 1}
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
                                                    {patient.purpose || "N/A"}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        backgroundColor:
                                                            patient.formType === "inbound"
                                                                ? "#c8e6c9"
                                                                : "#ffccbc",
                                                        borderRadius: 1,
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {patient.formType || "N/A"}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{patient.doctorName || "N/A"}</TableCell>
                                            <TableCell>{patient.departmentName || "N/A"}</TableCell>
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
                                                                    hospitalId: selectedHostpital,
                                                                    branchId: selectedBranch
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
            )
            }
        </Box >
    );
};