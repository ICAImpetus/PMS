import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Menu,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  Popover,
  FormControlLabel,
  Checkbox,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useApi } from "../../api/useApi";
import { commonRoutes } from "../../api/apiService";
import { toast } from "react-toastify";
import { FORMS_AVAILABLE_COLUMNS, FORMS_TEMPLATE, getNestedValue } from "../../utils/exportUtils";
import { PatientHistoryTableBody } from "./PatientHistoryTableBody";
import { useNavigate } from "react-router-dom";

// Styled Components for Alignment
const RootContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#F8FAFC",
  minHeight: "100vh",
  padding: theme.spacing(3, 4),
  fontFamily: "'Inter', sans-serif",
}));

const MainContainer = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
  overflow: "hidden",
  width: "100%",
}));

const FilledFormsComponent = ({
  selectedBranch = null,
  selectedHostpital = null,
  formsModalOpen,
  setFormsModalOpen,
  formsTypeFilter,
  setFormsTypeFilter,
  dateRange,
  role = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCSVModalOpen, setUploadCSVModalOpen] = useState(false);
  const [csvStatus, setCSVStatus] = useState("idle");
  const [csvProgress, setCSVProgress] = useState({ current: 0, total: 0 });
  const [csvProcessMessage, setCSVProcessMessage] = useState("");
  const [csvValidationErrors, setCSVValidationErrors] = useState({
    errors: [],
    totalRows: 0,
    successCount: 0,
    errorCount: 0,
  });
  const [csvValidationSummary, setCSVValidationSummary] = useState({ totalRows: 0, successCount: 0, errorCount: 0 });
  const [csvRows, setCSVRows] = useState([]);
  const [csvParsedValidRows, setCSVParsedValidRows] = useState([]);
  const [csvParsedInvalidRows, setCSVParsedInvalidRows] = useState([]);
  const [csvParseError, setCSVParseError] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [dateFilterOpen, setDateFilterOpen] = useState(true);
  const [dateFilterFrom, setDateFilterFrom] = useState("");
  const [dateFilterTo, setDateFilterTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterForm, setFilterForm] = useState([]);
  const [form, setForm] = useState([]);
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalDocument: 0,
  });

  const [selectedFormColumns, setSelectedFormColumns] = useState([
    "agentName",
    "branchId.name",
    "formType",
    "callStatus",
    "formData.patientDetails.patientName",
    "formData.patientDetails.patientMobile",
    "formData.patientDetails.patientStatus",
    "formData.patientDetails.patientAge",
    "formData.patientDetails.patientCategory",
    "formData.patientDetails.patientlocation",
    "purpose",
    "formData.remarks",
    //   ...(formsTypeFilter === "OutBound"
    //   ? ["appointmentSlot", "department.name", "doctor.name", "formData.feedback.opdNumber", "formData.feedback.ipdNumber", "formData.feedback.questions", "followupStatus"]
    //   : []),
    // ...(formsTypeFilter === "Inbound"
    //   ? ["appointmentSlot", "department.name", "doctor.name", "formData.typeOfDisease", "formData.reportName"]
    //   : []),
    ...(formsModalOpen === "Appointments"
      ? ["appointmentSlot", "department.name", "doctor.name"]
      : []),
    "createdAt",
  ]);

  const formsColumnFilterRef = useRef(null);
  const csvFileInputRef = useRef(null);

  const { request: getFilledForms, loading: getFilledFormsLoading, error: getFilledformError } = useApi(commonRoutes.getFilledForms);
  const { request: uploadFormsCSVApi, loading: uploadFormsCSVApiLoading, error: uploadFormsCSVApiError } = useApi(
    commonRoutes.uploadFormsCSV,
    { onError: setCSVValidationErrors }
  );

  const resetCSVState = () => {
    setCSVStatus("idle");
    setCSVProgress({ current: 0, total: 0 });
    setCSVProcessMessage("");
    setCSVValidationErrors({
      errors: [],
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
    });
    setCSVValidationSummary({ totalRows: 0, successCount: 0, errorCount: 0 });
    setCSVRows([]);
    setCSVParsedValidRows([]);
    setCSVParsedInvalidRows([]);
    setCSVParseError(null);
  };

  const fetchForms = async (search = null) => {
    try {
      const purpose =
        formsModalOpen === "Appointments"
          ? "Appointments"
          : formsModalOpen === "Followup"
            ? "Followup"
            : "All";

      const res = await getFilledForms(
        pagination.page,
        selectedHostpital,
        selectedBranch,
        dateRange?.startDate || null,
        dateRange?.endDate || null,
        search ? search : searchInput || "",
        purpose,
        formsModalOpen,
        formsTypeFilter,
        false
      );

      if (res?.success) {
        setFilterForm(res.data || []);
        setForm(res?.data || []);

        setPagination((prev) => ({
          ...prev,
          page: Number(res.pagination?.page ?? res.pagination?.forms?.page ?? res.pagination?.currentPage ?? prev.page ?? 1),
          totalPages: Number(res.pagination?.totalPages ?? res.pagination?.forms?.totalPages ?? 1),
          totalDocument: Number(res.pagination?.total ?? res.pagination?.forms?.total ?? 0),
        }));
      }
    } catch (err) {
      console.error("fetchForms error:", err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [
    selectedBranch,
    selectedHostpital,
    formsModalOpen,
    dateRange?.startDate,
    dateRange?.endDate,
    pagination.page,
  ]);

  useEffect(() => {
    if (!form) return;

    if (formsTypeFilter === "all") {
      setFilterForm(form);
    } else if (formsTypeFilter?.toLowerCase() === "inbound") {
      const filtered = form.filter(
        (item) => item.formType?.toLowerCase() === "inbound"
      );
      setFilterForm(filtered);
    } else if (formsTypeFilter?.toLowerCase() === "outbound") {
      const filtered = form.filter(
        (item) => item.formType?.toLowerCase() === "outbound"
      );
      setFilterForm(filtered);
    }
  }, [formsTypeFilter, form]);

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const validateCSVRow = (row, rowNumber) => {
    const errors = [];
    const patientName = normalizeValue(row.patientName || row.name || row.patient_name);
    const phone = normalizeValue(row.patientMobile || row.contactNumber || row.phone);
    const formType = normalizeValue(row.formType);
    const ageValue = normalizeValue(row.age);
    const branchId = normalizeValue(row.branchId);
    const followupStatus = normalizeValue(row.followupStatus)?.toLowerCase();
    const gender = normalizeValue(row.gender)?.toLowerCase();
    const patientStatus = normalizeValue(row.patientStatus)?.toLowerCase();
    const createdAt = normalizeValue(row.createdAt)

    const SUPPORTED_DATE_FORMATS = [
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD",
      "D/M/YYYY HH:mm:ss",
      "D/M/YYYY",
      "M/D/YYYY",
      "DD-MM-YYYY",
      "DD/MM/YYYY",
      "MM/DD/YYYY"
    ];

    if (!branchId) {
      errors.push({
        rowNumber,
        columnName: "branchId",
        invalidValue: branchId,
        message: "BranchId is required",
      });
    }
    // 2. CreatedAt Date Validation (Only check if user provided a value)
    if (createdAt) {
      const parsedMoment = moment(createdAt, SUPPORTED_DATE_FORMATS, true);

      if (!parsedMoment.isValid()) {
        errors.push({
          rowNumber,
          columnName: "createdAt",
          invalidValue: createdAt,
          message: `Invalid Date or Format '${createdAt}'. Allowed format ex: 2/6/2026 or YYYY-MM-DD`,
        });
      }
    }

    if (gender && !["male", "female", "transgender", "others"].includes(gender)) {
      errors.push({
        rowNumber,
        columnName: "gender",
        invalidValue: row.gender,
        message: "Please select only from: Male, Female, Transgender, Others",
      });
    }

    if (patientStatus && !["new", "old", "other"].includes(patientStatus)) {
      errors.push({
        rowNumber,
        columnName: "patientStatus",
        invalidValue: row.patientStatus,
        message: "Please select only from: New, Old, Other",
      });
    }

    if (followupStatus && !["pending", "completed"].includes(followupStatus)) {
      errors.push({
        rowNumber,
        columnName: "followupStatus",
        invalidValue: followupStatus,
        message: "Please select only from: pending ,completed",
      });
    }

    if (!patientName) {
      errors.push({
        rowNumber,
        columnName: "patientName",
        invalidValue: normalizeValue(row.patientName || row.name),
        message: "Patient name is required",
      });
    }

    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        errors.push({
          rowNumber,
          columnName: phone ? "patientMobile" : "contactNumber",
          invalidValue: phone,
          message: "Invalid phone number",
        });
      }
    }

    if (ageValue) {
      const age = Number(ageValue);
      if (Number.isNaN(age) || age <= 18) {
        errors.push({
          rowNumber,
          columnName: "age",
          invalidValue: ageValue,
          message: "Age must be greater than 18",
        });
      }
    }

    if (!formType) {
      errors.push({
        rowNumber,
        columnName: "formType",
        invalidValue: formType,
        message: "Form type is required",
      });
    }

    return errors;
  };

  const processCSVRows = (rows, totalRows) => {
    return new Promise((resolve) => {
      const validRows = [];
      const invalidRows = [];
      const errorList = [];
      let processed = 0;
      const batchSize = 30;

      const processBatch = () => {
        const chunk = rows.slice(processed, processed + batchSize);
        chunk.forEach((row, index) => {
          const rowNumber = processed + index + 2;
          const rowErrors = validateCSVRow(row, rowNumber);
          if (rowErrors.length > 0) {
            invalidRows.push(row);
            errorList.push(...rowErrors);
          } else {
            validRows.push(row);
          }
        });

        processed += chunk.length;
        setCSVProgress({ current: processed, total: totalRows });
        setCSVProcessMessage(
          processed < totalRows
            ? `Processing row ${processed} of ${totalRows}`
            : `Processing row ${totalRows} of ${totalRows}`
        );

        if (processed < totalRows) {
          window.requestAnimationFrame(processBatch);
        } else {
          setCSVRows(rows);
          setCSVParsedValidRows(validRows);
          setCSVParsedInvalidRows(invalidRows);
          setCSVValidationErrors({
            errors: errorList,
            totalRows,
            successCount: validRows.length,
            errorCount: invalidRows.length,
          });
          setCSVStatus("completed");
          setCSVProcessMessage("Validation complete");
          resolve();
        }
      };

      processBatch();
    });
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

  const handleImportAction = async () => {
    if (!selectedFile) return;

    setCSVValidationErrors({
      errors: [],
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
    });

    const formdata = new FormData();
    formdata.append("csv", selectedFile);
    formdata.append("type", "doctor");

    try {
      const res = await uploadFormsCSVApi(
        selectedHostpital,
        selectedBranch,
        formdata
      );

      if (res?.success) {
        toast.success(res?.message || "CSV uploaded successfully!");
        setUploadCSVModalOpen(false);
      }
    } catch (error) {
      console.error("Upload error details:", error);
    }
  };

  const handleApplyAll = async () => {
    try {
      const purpose =
        formsModalOpen === "Appointments"
          ? "Appointments"
          : formsModalOpen === "Followup"
            ? "Followup"
            : "All";

      const res = await getFilledForms(
        1,
        selectedHostpital,
        selectedBranch,
        dateFilterFrom || null,
        dateFilterTo || null,
        searchInput || "",
        purpose,
        formsModalOpen,
        formsTypeFilter,
        false
      );

      if (res?.success) {
        setFilterForm(res.data || []);
        setForm(res.data || []);
        toast.success("Filters applied");
      }
    } catch (err) {
      console.error("applyAll error:", err);
      toast.error("Error applying filters");
    }
  };

  const startCSVValidation = async (file) => {
    resetCSVState();
    setCSVStatus("processing");
    setCSVProcessMessage("Processing file...");

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      const totalRows = Math.max(0, lines.length - 1);
      setCSVProgress({ current: 0, total: totalRows });

      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header?.trim() || "",
        error: (error) => {
          setCSVParseError(error.message || "CSV parse failed");
        },
      });

      if (parsed.errors?.length) {
        setCSVParseError(parsed.errors[0]?.message || "CSV parse failed");
        setCSVStatus("completed");
        return;
      }

      await processCSVRows(parsed.data, totalRows);
    } catch (error) {
      setCSVParseError(error?.message || "Unable to read the file");
      setCSVStatus("completed");
      setCSVProcessMessage("Processing failed");
    }
  };

  const handleCSVFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadCSVModalOpen(true);

    await startCSVValidation(file);
  };

  const handleReupload = () => {
    setSelectedFile(null);
    resetCSVState();
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
      csvFileInputRef.current.click();
    }
  };

  const handleBrowseCSV = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
      csvFileInputRef.current.click();
    }
    setMoreMenuAnchor(null);
  };

  const downloadTemplate = () => {
    const headers = FORMS_TEMPLATE.map((col) => col.key);
    const csvContent = [headers.join(",")].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forms-template-${moment().format("YYYY-MM-DD-HHmm")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMoreMenuAnchor(null);
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const handleClearDateFilter = async () => {
    setDateFilterFrom("");
    setDateFilterTo("");
    setDateFilterOpen(true);
    setMoreMenuAnchor(null);
    setSearchInput("");
    setFormsTypeFilter("all");
    await fetchForms("");
  };

  const handleCSVDialogClose = (event, reason) => {
    if (csvStatus === "processing") return;
    if (reason === "escapeKeyDown") return;
    setUploadCSVModalOpen(false);
  };

  const toggleFormColumn = (key) => {
    setSelectedFormColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const visibleFormColumns = FORMS_AVAILABLE_COLUMNS.filter((col) =>
    selectedFormColumns.includes(col.key)
  );

  const exportFormsToSheet = async () => {
    let exportdateFrom = dateFilterFrom;
    let exportdateTo = dateFilterTo;
    if (!exportdateFrom || !exportdateTo) {
      exportdateFrom = dateRange.startDate;
      exportdateTo = dateRange.endDate;
    }

    try {
      const purpose =
        formsModalOpen === "Appointments"
          ? "Appointments"
          : formsModalOpen === "Followup"
            ? "Followup"
            : "All";

      const res = await getFilledForms(
        1,
        selectedHostpital,
        selectedBranch,
        exportdateFrom,
        exportdateTo,
        searchInput || "",
        purpose,
        formsModalOpen,
        formsTypeFilter,
        true
      );

      if (res?.success) {
        const allForms = res.data || [];

        if (allForms.length === 0) {
          toast.success("No Data is Found TO Export");
          return;
        }

        const headers = visibleFormColumns.map((c) => c.label);

        const rows = allForms.map((row) =>
          visibleFormColumns.map((c) => {
            let val = getNestedValue(row, c.key);

            if (c.key === "appointmentSlot") {
              if (val !== "-") {
                const date = val?.date
                  ? moment(val.date).format("DD MMM YYYY")
                  : "";

                val = `${date} | ${val?.start || ""} - ${val?.end || ""}`;
              } else if (c.value === "Appointment") {
                const formattedDate = row?.dateTime
                  ? moment(row.dateTime).format("DD MMM YYYY")
                  : "";

                val = formattedDate
                  ? `${formattedDate} | Arrival Time: ${row?.patientArrivalTime || "-"}`
                  : `Arrival Time: ${row?.patientArrivalTime || "-"}`;
              }
            }

            if (c.key === "createdAt" && val !== "-" && moment(val).isValid()) {
              val = moment(val).format("DD MMM YYYY hh:mm A");
            }

            if (val && Array.isArray(val)) {
              val = val
                .map((q) => {
                  if (q && typeof q === "object" && q.questionText) {
                    return `${q.questionId || ""}: ${q.questionText} -> Rating: ${q.rating ?? "-"}`;
                  }
                  return JSON.stringify(q);
                })
                .join("\n");
            }

            if (val && typeof val === "object" && !Array.isArray(val)) {
              val = val.name || JSON.stringify(val);
            }

            val = val ?? "";

            return `"${String(val).replace(/"/g, '""')}"`;
          })
        );

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `filled-forms-${dateFilterFrom}-${dateFilterTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        setPagination((prev) => ({
          ...prev,
          page: 1,
          totalPages: Number(res.pagination?.totalPages ?? res.pagination?.forms?.totalPages ?? 1),
          totalDocument: Number(res.pagination?.total ?? res.pagination?.forms?.total ?? 0),
        }));

        toast.success(`Data is Exported From ${dateFilterFrom} to ${dateFilterTo}`);
        setMoreMenuAnchor(null);
      }
    } catch (err) {
      console.error("export error:", err);
      toast.error("Error exporting data");
    }
  };

  const handlePageChange = async (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: Number(newPage || 1),
    }));
  };

  const handleOpenConfirm = (record) => {
    setSelectedRecord(record);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedRecord(null);
  };

  const handleConfirmEdit = () => {
    if (!selectedRecord?._id) return;
    setOpenConfirm(false);

    navigate("/executive-forms", {
      state: { formid: selectedRecord._id },
    });
    handleCloseConfirm();
  };

  return (
    <Box>
      <MainContainer elevation={0}>
        {/* TOP TOOLBAR & CONTROLS SECTION */}
        <Box p={2.5} borderBottom="1px solid #F1F5F9">
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            {/* Back Button & Title */}
            <Grid item display="flex" alignItems="center" gap={1}>
              <IconButton onClick={() => setFormsModalOpen(false)} sx={{ bgcolor: "#F8FAFC" }}>
                <ArrowBackIcon fontSize="small" sx={{ color: "#475569" }} />
              </IconButton>

              {/* Inbound / Outbound Toggle Pills */}
              <ToggleButtonGroup
                value={formsTypeFilter}
                exclusive
                onChange={(e, newFilter) => {
                  if (newFilter !== null) setFormsTypeFilter(newFilter);
                }}
                size="small"
                sx={{
                  bgcolor: "#F8FAFC",
                  p: "3px",
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  "& .MuiToggleButton-root": {
                    border: "none",
                    borderRadius: "16px",
                    px: 2,
                    py: 0.5,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "capitalize",
                    "&.Mui-selected": {
                      bgcolor: "#FFFFFF",
                      color: "#0256E8",
                      boxShadow: "0px 1px 3px rgba(0,0,0,0.06)",
                    },
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="inbound">Inbound</ToggleButton>
                <ToggleButton value="outbound">Outbound</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Search Input Field */}
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Search Name / Phone / Purpose..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyAll();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    backgroundColor: "#F8FAFC",
                    fontSize: "12px",
                    "& fieldset": { borderColor: "#E2E8F0" },
                  },
                }}
              />
            </Grid>

            {/* Date Filters & Field Selector Actions */}
            <Grid item display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              {/* Date Filters */}
              {dateFilterOpen && (
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={dateFilterFrom}
                    onChange={(e) => setDateFilterFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 140,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#F8FAFC",
                        fontSize: "12px",
                      },
                    }}
                  />
                  <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={dateFilterTo}
                    onChange={(e) => setDateFilterTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 140,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#F8FAFC",
                        fontSize: "12px",
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    // startIcon={<DownloadIcon />}
                    disabled={getFilledFormsLoading}
                    onClick={handleApplyAll}
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
                    {getFilledFormsLoading ? <CircularProgress size={18} color="inherit" /> : "Apply"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearDateFilter}
                    sx={{
                      borderRadius: "12px",
                      borderColor: "#CBD5E1",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "12px",
                      textTransform: "none",
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              )}

              {/* Select Fields Button */}
              <Button
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={handleOpen}
                sx={{
                  borderRadius: "14px",
                  borderColor: "#E2E8F0",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "12px",
                  textTransform: "none",
                  bgcolor: "#F8FAFC",
                  height: "38px",
                }}
              >

                Fields ({formsModalOpen !== "Appointments" ? selectedFormColumns.length - 3 : selectedFormColumns.length})
              </Button>

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.08)",
                    p: 1.5,
                  },
                }}
              >
                <Box sx={{ width: 240 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        sx={{ color: "#0256E8" }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={800} color="#0F172A">
                        {allSelected ? "Unselect All" : "Select All"}
                      </Typography>
                    }
                  />
                  <Divider sx={{ my: 1, borderColor: "#F1F5F9" }} />
                  <Box sx={{ maxHeight: 260, overflowY: "auto" }}>
                    {FORMS_AVAILABLE_COLUMNS.map((col) => (
                      <FormControlLabel
                        key={col.key}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedFormColumns.includes(col.key)}
                            onChange={() => toggleFormColumn(col.key)}
                            sx={{
                              color: "#94A3B8",
                              "&.Mui-checked": { color: "#0256E8" },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight={500} color="#334155" fontSize="12px">
                            {col.label}
                          </Typography>
                        }
                        sx={{ display: "block", my: 0.2 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Popover>

              {/* Action Overflow Menu */}
              <IconButton
                onClick={handleMoreMenuOpen}
                sx={{
                  bgcolor: "#0256E8",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  width: 38,
                  height: 38,
                  "&:hover": { bgcolor: "#0143B8" },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={handleMoreMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.08)",
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  onClick={exportFormsToSheet}
                  disabled={filterForm?.length === 0 || visibleFormColumns.length === 0 || getFilledFormsLoading}
                  sx={{ py: 1, px: 2, fontSize: "12px", fontWeight: 700 }}
                >
                  <DownloadIcon fontSize="small" sx={{ mr: 1, color: "#0256E8" }} /> Export CSV
                </MenuItem>

                <MenuItem onClick={downloadTemplate} sx={{ py: 1, px: 2, fontSize: "12px", fontWeight: 700 }}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1, color: "#64748B" }} /> Download Template
                </MenuItem>

                <MenuItem onClick={handleBrowseCSV} sx={{ py: 1, px: 2, fontSize: "12px", fontWeight: 700 }}>
                  <UploadFileIcon fontSize="small" sx={{ mr: 1, color: "#64748B" }} /> Upload CSV File
                </MenuItem>
              </Menu>

              <input ref={csvFileInputRef} hidden type="file" accept=".csv" onChange={handleCSVFileChange} />

              <IconButton
                onClick={() => setFormsModalOpen(null)}
                sx={{
                  color: "#94A3B8",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  "&:hover": { bgcolor: "#FEF2F2", color: "#EF4444" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        </Box>

        {/* DATA TABLE CONTAINER */}
        <TableContainer sx={{ minHeight: 400 }}>
          {getFilledFormsLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
              <CircularProgress size={36} sx={{ color: "#0256E8", mb: 2 }} />
              <Typography variant="body2" color="#64748B" fontWeight={600}>
                Loading filled forms data...
              </Typography>
            </Box>
          ) : filterForm?.length === 0 ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={10}>
              <Typography variant="body2" color="#94A3B8" fontWeight={600}>
                No filled forms found.
              </Typography>
            </Box>
          ) : visibleFormColumns.length === 0 ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={10}>
              <Typography variant="body2" color="#94A3B8" fontWeight={600}>
                Select at least one field using &quot;Fields&quot; selector above.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  {role && role === "teamleader" && (
                    <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>ACTIONS</TableCell>
                  )}
                  {visibleFormColumns.map((col) => (
                    <TableCell key={col.key} sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                      {col.label.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>


              <PatientHistoryTableBody
                columns={visibleFormColumns}
                filteredLatestVisits={filterForm}
                isLoading={getFilledFormsLoading}
                editRowId={handleOpenConfirm}
                showAction={Boolean(role && role === "teamleader")}
              />
            </Table>
          )}
        </TableContainer>

        {/* FOOTER PAGINATION */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2.5}
          bgcolor="#F8FAFC"
          borderTop="1px solid #E2E8F0"
        >
          <Typography variant="caption" color="#64748B" fontWeight={600}>
            SHOWING PAGE <strong>{pagination?.page || 1}</strong> OF <strong>{pagination?.totalPages || 1}</strong>
          </Typography>

          <Pagination
            count={Number(pagination?.totalPages ?? 1)}
            page={Number(pagination?.page ?? 1)}
            onChange={(e, value) => handlePageChange(Number(value))}
            color="primary"
            size="small"
          />
        </Box>
      </MainContainer>

      {/* UPLOAD CSV MODAL */}
      <Dialog
        open={uploadCSVModalOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          handleCSVDialogClose();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>CSV Validation & Import</span>
          <Chip label={selectedFile?.name || "No file"} size="small" sx={{ bgcolor: "#F1F5F9", fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
              {csvStatus === "processing" ? "Processing file..." : "Validation Summary"}
            </Typography>
            <Typography variant="caption" color="#64748B">
              {csvProcessMessage || "Uploading and validating the selected CSV file."}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={csvProgress.total ? (csvProgress.current / csvProgress.total) * 100 : 0}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#E2E8F0",
              "& .MuiLinearProgress-bar": { bgcolor: "#0256E8" },
            }}
          />

          {csvValidationErrors?.errors?.length > 0 && (
            <Box mt={3}>
              <Typography variant="caption" fontWeight={800} color="#EF4444" mb={1} display="block">
                VALIDATION ISSUES PREVIEW ({csvValidationErrors?.errorCount} ERRORS)
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", maxHeight: 240 }}>
                <Table stickyHeader size="small">
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: "10px", fontWeight: 800 }}>ROW</TableCell>
                      <TableCell sx={{ fontSize: "10px", fontWeight: 800 }}>COLUMN</TableCell>
                      <TableCell sx={{ fontSize: "10px", fontWeight: 800 }}>VALUE</TableCell>
                      <TableCell sx={{ fontSize: "10px", fontWeight: 800 }}>ERROR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {csvValidationErrors?.errors?.slice(0, 10).map((error, index) => (
                      <TableRow key={`${error.rowNumber}-${index}`}>
                        <TableCell fontSize="11px">{error.rowNumber}</TableCell>
                        <TableCell fontSize="11px">{error.columnName}</TableCell>
                        <TableCell fontSize="11px">{error.invalidValue || "Empty"}</TableCell>
                        <TableCell fontSize="11px" sx={{ color: "#EF4444" }}>
                          {error.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReupload}
            disabled={csvStatus === "processing"}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
          >
            Reupload File
          </Button>

          <Button
            variant="contained"
            onClick={handleImportAction}
            disabled={
              csvStatus === "processing" ||
              uploadFormsCSVApiLoading ||
              csvValidationErrors?.errors?.length > 0
            }
            sx={{ borderRadius: "12px", bgcolor: "#0256E8", textTransform: "none", fontWeight: 800 }}
          >
            {uploadFormsCSVApiLoading ? <CircularProgress size={20} color="inherit" /> : "Continue Import"}
          </Button>

          <Button
            onClick={() => setUploadCSVModalOpen(false)}
            disabled={uploadFormsCSVApiLoading}
            sx={{ color: "#64748B", textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT CONFIRMATION DIALOG */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm} PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Edit Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B">
            Are you sure you want to edit this patient form record?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseConfirm} sx={{ color: "#64748B" }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmEdit} variant="contained" sx={{ bgcolor: "#0256E8", color: "#ffffff", borderRadius: "12px" }}>
            Proceed to Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilledFormsComponent;