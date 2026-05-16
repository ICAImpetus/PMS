
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserContextHook } from "../../../contexts/UserContexts";
import HospitalContext from "../../../contexts/HospitalContexts";
import { FORMS_AVAILABLE_COLUMNS, getNestedValue } from "./PatientHistory";
import moment from "moment";

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

export const PatientHistory = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState(null);
    const [formTypeFilter, setFormTypeFilter] = useState("all");
    const [exportFormat, setExportFormat] = useState("csv");
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [formsColumnFilterOpen, setFormsColumnFilterOpen] = useState(false);
    const [selectedFormColumns, setSelectedFormColumns] = useState([
        "patientName",
        "patientMobile",
        "lastVisit.purpose",
        "lastVisit.formType",
        "createdAt",
    ]);
    const formsColumnFilterRef = React.useRef(null);
    const columnFilterButtonRef = React.useRef(null);
    const navigate = useNavigate()
    const {
        loading,
        branches,
        errors,
        selectedBranch,
        setSelectedBranch,
        patients,
        pagination,
        setPagination,
        selectedHostpital,
        refreshPatients
    } = useContext(HospitalContext);


    const visibleFormColumns = FORMS_AVAILABLE_COLUMNS.filter((col) =>
        selectedFormColumns.includes(col.key),
    );
    const toggleFormColumn = (colKey) => {
        setSelectedFormColumns((prev) =>
            prev.includes(colKey)
                ? prev.filter((key) => key !== colKey)
                : [...prev, colKey]
        );
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



    // Export helpers
    const exportHeaders = [
        "Patient Name",
        "Patient Mobile No.",
        "Purpose",
        "Form Type",
        "Doctor",
        "Department",
        "Remarks",
        "Date",
    ];

    const exportRows = filteredPatients.map((patient) => [
        patient.patientName || "N/A",
        patient.patientMobile || "N/A",
        patient?.lastVisit?.purpose || "N/A",
        patient?.lastVisit?.formType || "N/A",
        patient?.lastVisit?.doctor?.name || "N/A",
        patient?.lastVisit?.department?.name || "N/A",
        patient?.lastVisit?.remarks || "N/A",
        formatDate(patient.createdAt) || "N/A",
    ]);

    const handleExportCSV = () => {
        if (filteredPatients.length === 0) {
            toast.error("No data to export");
            return;
        }
        const csvContent = [exportHeaders, ...exportRows]
            .map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            )
            .join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `patients_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("CSV exported successfully!");
    };

    const handleExportExcel = () => {
        if (filteredPatients.length === 0) {
            toast.error("No data to export");
            return;
        }
        const ws = XLSX.utils.aoa_to_sheet([exportHeaders, ...exportRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Patients");
        XLSX.writeFile(wb, `patients_${new Date().toISOString().split("T")[0]}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    const handleExportPDF = () => {
        if (filteredPatients.length === 0) {
            toast.error("No data to export");
            return;
        }

        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text("Patients Report", 14, 15);

        // Date
        doc.setFontSize(10);
        doc.text(
            `Export Date: ${moment().format("DD/MM/YYYY hh:mm A")}`,
            14,
            22
        );

        // Table
        autoTable(doc, {
            startY: 30,
            head: [exportHeaders],
            body: exportRows,
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [33, 47, 61], // dark header
                textColor: 255,
                fontStyle: "bold",
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            margin: { top: 30 },
        });

        // Save
        doc.save(
            `patients_${new Date().toISOString().split("T")[0]}.pdf`
        );

        toast.success("PDF exported successfully!");
    };


    const handleExport = () => {
        if (exportFormat === "csv") handleExportCSV();
        else if (exportFormat === "excel") handleExportExcel();
        else if (exportFormat === "pdf") handleExportPDF();
        setExportDialogOpen(false);
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



    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            {/* Header */}
            <Typography
                variant="h4"
                sx={{ mb: 3, fontWeight: 600, color: "#212f3d" }}
            >
                Patient Management
            </Typography>

            {/*Filter Card */}
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
                                    startIcon={<RefreshIcon />}
                                    onClick={refreshPatients}

                                >
                                    Refresh
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    ref={columnFilterButtonRef}
                                    onClick={() => setFormsColumnFilterOpen((prev) => !prev)}

                                >
                                    <i className="fas fa-columns"></i> Select Fields (
                                    {selectedFormColumns.length})
                                </Button>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => setExportDialogOpen(true)}
                                >
                                    Export
                                </Button>
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
                                        <Button onClick={handleExport} color="primary" variant="contained">Download</Button>
                                    </DialogActions>
                                </Dialog>
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

                                    {visibleFormColumns.map((col) => (
                                        <TableCell key={col.key}>
                                            {col.label}
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


                                                if (val) {
                                                    const date = moment(val);

                                                    if (date.isValid()) {
                                                        val = date.format("DD/MM/YYYY hh:mm A");
                                                    }
                                                }

                                                if (
                                                    val &&
                                                    typeof val === "object" &&
                                                    !Array.isArray(val)
                                                ) {
                                                    val = val.name || JSON.stringify(val);
                                                }

                                                return (
                                                    <TableCell key={col.key}>
                                                        {val ?? "-"}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell>
                                                <Button
                                                    onClick={() => {
                                                        navigate(`/single-patient-history/${row?._id}`, {
                                                            state: {

                                                                patient: {
                                                                    ...row,
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
            {/* Column Filter Dropdown */}
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
        </Box >
    );
};