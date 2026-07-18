import React, { useState, useEffect, useRef, useContext } from "react";
import Papa from "papaparse";
import moment from "moment";
import "./FilledFormsComponent.css";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  Tooltip,
  Typography,
  Paper,
  Alert,
  Grid,
  InputAdornment,
  Popover,
  FormControlLabel,
  Checkbox,
  Divider
} from "@mui/material";
import { useApi } from "../../api/useApi";
import { commonRoutes } from "../../api/apiService";
import { toast } from "react-toastify";
import HospitalContext from "../../contexts/HospitalContexts";
import { FORMS_AVAILABLE_COLUMNS, FORMS_TEMPLATE, getNestedValue } from "../../utils/exportUtils";


const searchOptions = [
  "Search Patient...",
  "Search Agent...",
];




const FilledFormsComponent = ({
  selectedBranch = null,
  selectedHostpital = null,
  formsModalOpen,
  setFormsModalOpen,
  formsTypeFilter,
  setFormsTypeFilter,
  dateRange
}) => {
  const [formsColumnFilterOpen, setFormsColumnFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
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
  const [csvActionResult, setCSVActionResult] = useState("");
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [dateFilterOpen, setDateFilterOpen] = useState(true);
  const [dateFilterFrom, setDateFilterFrom] = useState("");
  const [dateFilterTo, setDateFilterTo] = useState("");
  const [index, setIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [filterForm, setFilterForm] = useState([])
  const [form, setForm] = useState([])
  const [anchorEl, setAnchorEl] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalDocument: 0,
  })


  const [selectedFormColumns, setSelectedFormColumns] = useState([
    "agentName",
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
    ...(formsModalOpen === "Appointments"
      ? ["appointmentSlot", "department.name", "doctor.name"]
      : []),
    "createdAt"


  ]);
  // const { request } = useApi(commonRoutes.getFilledForms);
  const formsColumnFilterRef = useRef(null);
  const csvFileInputRef = useRef(null);

  console.log("selectedHostpital-forms", selectedHostpital)


  const { request: getFilledForms, loading: getFilledFormsLoading, error: getFilledformError } = useApi(commonRoutes.getFilledForms)
  const { request: uploadFormsCSVApi, loading: uploadFormsCSVApiLoading, error: uploadFormsCSVApiError } = useApi(commonRoutes.uploadFormsCSV, { onError: setCSVValidationErrors });


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
    setCSVActionResult("");
  };

  const fetchForms = async (search = null) => {
    try {
      const purpose =
        formsModalOpen === "Appointments"
          ? "Appointments"
          : formsModalOpen === "Followup"
            ? "Followup"
            : "All";


      // console.log("Call", purpose);

      console.log("searchInput ", searchInput);


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
        setForm(res?.data || [])

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

  React.useEffect(() => {
    if (!form) return;

    if (formsTypeFilter === "all") {
      setFilterForm(form);
    }
    else if (formsTypeFilter?.toLowerCase() === "inbound") {
      const filtered = form.filter(
        (item) => item.formType?.toLowerCase() === "inbound"
      );
      setFilterForm(filtered);
    }
    else if (formsTypeFilter?.toLowerCase() === "outbound") {
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
    const doctor = normalizeValue(row.doctor);
    const department = normalizeValue(row.department);
    const branchId = normalizeValue(row.branchId);
    const followupStatus = normalizeValue(row.followupStatus)?.toLowerCase();
    const gender = normalizeValue(row.gender)?.toLowerCase();
    const patientStatus = normalizeValue(row.patientStatus)?.toLowerCase();
    // const department = normalizeValue(row.department);
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (!branchId) {
      errors.push({
        rowNumber,
        columnName: "branchId",
        invalidValue: branchId,
        message: "BranchId is required",
      });
    }



    if (
      gender &&
      !["male", "female", "transgender", "others"].includes(gender)
    ) {
      errors.push({
        rowNumber,
        columnName: "gender",
        invalidValue: row.gender,
        message:
          "Please select only from: Male, Female, Transgender, Others",
      });
    }



    if (
      patientStatus &&
      !["new", "old", "other"].includes(patientStatus)
    ) {
      errors.push({
        rowNumber,
        columnName: "patientStatus",
        invalidValue: row.patientStatus,
        message: "Please select only from: New, Old, Other",
      });
    }

    if (
      followupStatus &&
      !["pending", "completed"].includes(followupStatus)
    ) {
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

    // if (branchId && !isValidObjectId(branchId)) {
    //   errors.push({
    //     rowNumber,
    //     columnName: "branchId",
    //     invalidValue: branchId,
    //     message: "BranchId must be a valid ObjectId",
    //   });
    // }

    // if (doctor) {
    //   errors.push({
    //     rowNumber,
    //     columnName: "doctor",
    //     invalidValue: doctor,
    //     message: "Doctor must be a valid ObjectId",
    //   });
    // }

    // if (department && !isValidObjectId(department)) {
    //   errors.push({
    //     rowNumber,
    //     columnName: "department",
    //     invalidValue: department,
    //     message: "Department must be a valid ObjectId",
    //   });
    // }

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
          // setCSVValidationSummary({
          //   totalRows,
          //   successCount: validRows.length,
          //   errorCount: invalidRows.length,
          // });
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

    // Clear previous errors before a new attempt
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

  const handleSearchApply = async () => {
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
        dateRange?.startDate || null,
        dateRange?.endDate || null,
        searchInput || "",
        purpose,
        formsModalOpen,
        formsTypeFilter,
        false
      );

      if (res?.success) {
        setFilterForm(res.data || []);

        setPagination((prev) => ({
          ...prev,
          page: 1,
          totalPages: Number(res.pagination?.totalPages ?? res.pagination?.forms?.totalPages ?? 1),
          totalDocument: Number(res.pagination?.total ?? res.pagination?.forms?.total ?? 0),
        }));
      }
    } catch (error) {
      toast.error("Error fetching forms");
    }
  };

  const handleApplyAll = async () => {
    // Apply search + date filter together and reset to page 1
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
        true
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
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyAll();
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
    console.log("file", file);

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

  const handleToggleDateFilter = () => {
    setDateFilterOpen((prev) => !prev);
    setMoreMenuAnchor(null);
  };


  const handleClearDateFilter = async () => {
    setDateFilterFrom("");
    setDateFilterTo("");
    setDateFilterOpen(true);
    setMoreMenuAnchor(null);
    setSearchInput("")
    console.log("formty", searchInput);

    setFormsTypeFilter("all")
    await fetchForms("")



  };

  const handleCSVDialogClose = (event, reason) => {
    if (csvStatus === "processing") return;
    if (reason === "escapeKeyDown") return;
    setUploadCSVModalOpen(false);
  };

  const toggleFormColumn = (key) => {
    setSelectedFormColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleApplyDateFilter = async () => {
    // Apply date range to the current listing (not export)
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

        setPagination((prev) => ({
          ...prev,
          page: Number(res.pagination?.page ?? res.pagination?.forms?.page ?? res.pagination?.currentPage ?? prev.page ?? 1),
          totalPages: Number(res.pagination?.totalPages ?? res.pagination?.forms?.totalPages ?? 1),
          totalDocument: Number(res.pagination?.total ?? res.pagination?.forms?.total ?? 0),
        }));
        toast.success("Date filter applied");
      }
    } catch (err) {
      console.error("apply date filter error:", err);
      toast.error("Error applying date filter");
    }
  };

  const visibleFormColumns = FORMS_AVAILABLE_COLUMNS.filter((col) =>
    selectedFormColumns.includes(col.key),
  );
  const exportFormsToSheet = async () => {

    let exportdateFrom = dateFilterFrom
    let exportdateTo = dateFilterTo
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

            if (val && typeof val === "object" && !Array.isArray(val)) {
              val = val.name || JSON.stringify(val);
            }

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
    // Only set the requested page number; let the main useEffect fetch data
    setPagination((prev) => ({
      ...prev,
      page: Number(newPage || 1),
    }));
  };

  return (
    <div

    >

      <div
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header" style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", gap: "12px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", color: "#2c3e50" }}>
            <IconButton onClick={() => setFormsModalOpen(false)}>
              <ArrowBackIcon />
            </IconButton>
            {/* <ArticleOutlinedIcon /> Filled Forms */}
          </h3>
          <div className="ff-tabs" style={{ margin: 0 }}>
            <button
              className={formsTypeFilter === "all" ? "active" : ""}
              onClick={() => setFormsTypeFilter("all")}
            >
              All
            </button>
            <button
              className={formsTypeFilter === "inbound" ? "active" : ""}
              onClick={() => setFormsTypeFilter("inbound")}
            >
              Inbound
            </button>
            <button
              className={formsTypeFilter === "outbound" ? "active" : ""}
              onClick={() => setFormsTypeFilter("outbound")}
            >
              Outbound
            </button>
          </div>
          <Box sx={{ width: 250 }}>
            <TextField
              label="Search by Name/Phone No./Purpose"
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyAll(); } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#7c8fa3" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {/* <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={getFilledFormsLoading}
                      onClick={handleApplyAll}
                      sx={{ textTransform: "none", minWidth: 72, height: 32, fontSize: "0.8rem" }}
                    >
                      {getFilledFormsLoading ? <CircularProgress size={22} /> : "Apply"}
                    </Button> */}
                  </InputAdornment>
                ),
              }}
              placeholder="Enter Patient Name,PhoneNo or Purpose"
              fullWidth
            />
          </Box>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className="ff-header-actions"
              ref={formsColumnFilterRef}
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 0 }}
            >



              {dateFilterOpen && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    p: 1,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                    width: "auto",
                    minWidth: 300,
                  }}
                >
                  <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={dateFilterFrom}
                    onChange={(e) => setDateFilterFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                  />

                  <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={dateFilterTo}
                    onChange={(e) => setDateFilterTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                  />

                  {/* APPLY BUTTON */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={getFilledFormsLoading}
                    onClick={handleApplyAll}
                  >
                    {getFilledFormsLoading ? <CircularProgress size={22} /> : "Apply"}
                  </Button>

                  {/* CLEAR BUTTON */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearDateFilter}
                  >
                    Clear
                  </Button>
                </Box>
              )}

            </div>
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
            <IconButton
              className="ff-btn export"
              onClick={handleMoreMenuOpen}
              sx={{
                borderRadius: 2,
                height: 36,
                padding: "0 16px",
                fontSize: "0.85rem",
                fontWeight: 600,
                backgroundColor: "#2e7d32",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#1b5e20",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#c8e6c9",
                  color: "#888",
                },
              }}
            >
              <MoreVertIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={handleMoreMenuClose}
            >
              {/* <MenuItem onClick={handleToggleDateFilter}>
                Date Filter
              </MenuItem> */}
              {/* <MenuItem
                onClick={handleClearDateFilter}
                disabled={!dateFilterFrom && !dateFilterTo}
              >
                Clear Date Filter
              </MenuItem> */}
              <MenuItem
                onClick={exportFormsToSheet}
                disabled={
                  filterForm?.length === 0 ||
                  visibleFormColumns.length === 0 || getFilledFormsLoading
                }
              >
                {getFilledFormsLoading ? <CircularProgress size={22} /> : "Export"}
              </MenuItem>
              <MenuItem onClick={downloadTemplate}>
                Download Template
              </MenuItem>
              <MenuItem onClick={handleBrowseCSV}>
                Upload CSV File
              </MenuItem>
            </Menu>
            <input
              ref={csvFileInputRef}
              hidden
              type="file"
              accept=".csv"
              onChange={handleCSVFileChange}
            />

            <IconButton
              onClick={() => setFormsModalOpen(null)}
              sx={{
                height: 36,
                width: 36,
                color: "#333",
                "&:hover": {
                  color: "red",
                  backgroundColor: "rgba(255,0,0,0.1)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </div>

        </div>


        <div className="ff-modal-body">

          <div className="ff-table-wrapper">
            {getFilledFormsLoading ? (
              <div className="ff-loading">
                Loading forms...
              </div>
            ) : filterForm?.length === 0 ? (
              <div className="ff-empty">
                No filled forms found.
              </div>
            ) : visibleFormColumns.length === 0 ? (
              <div className="ff-empty">
                Select at least one field using &quot;Select fields&quot;
                above.
              </div>
            ) : (
              <table className="ff-table">
                <thead>
                  <tr>
                    {visibleFormColumns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {
                    filterForm?.map((row) => (
                      <tr key={row._id}>
                        {visibleFormColumns.map((col) => {
                          let val = getNestedValue(row, col.key);

                          // Handle appointmentSlot object
                          if (col.key === "appointmentSlot") {
                            if (val !== "-") {
                              const formattedDate = val?.date
                                ? moment(val.date).format("dddd, DD MMM YYYY")
                                : null;

                              val = formattedDate
                                ? `${formattedDate} | ${val.start || "N/A"} to ${val.end || "N/A"
                                }`
                                : `${val.start || "N/A"} to ${val.end || "N/A"}`;
                            } else if (col.value === "Appointment") {
                              const formattedDate = row?.dateTime
                                ? moment(row.dateTime).format("dddd, DD MMM YYYY")
                                : null;

                              val = formattedDate
                                ? `${formattedDate} | Arrival Time: ${row?.patientArrivalTime || "-"
                                }`
                                : `Arrival Time: ${row?.patientArrivalTime || "-"}`;
                            }
                          }

                          // Handle createdAt
                          if (
                            col.key === "createdAt" &&
                            val !== "-" &&
                            moment(val).isValid()
                          ) {
                            val = moment(val).format("DD MMM YYYY, hh:mm A");
                          }

                          // Handle Date objects
                          if (val instanceof Date) {
                            val = moment(val).format("DD/MM/YYYY hh:mm A");
                          }

                          // Handle objects
                          if (
                            val &&
                            typeof val === "object" &&
                            !Array.isArray(val)
                          ) {
                            val = val.name || JSON.stringify(val);
                          }

                          return <td key={col.key}>{val}</td>;
                        })}
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
            borderTop: "1px solid #e1e8ed",
            background: "#f8f9fa"
          }}
        >
          <Pagination
            count={Number(pagination?.totalPages ?? 1)}
            page={Number(pagination?.page ?? 1)}
            onChange={(e, value) => handlePageChange(Number(value))}
            color="primary"
            size="large"
          />
        </Box>

      </div>

      <Dialog
        open={uploadCSVModalOpen}
        onClose={(event, reason) => {
          console.log("Dialog close reason:", reason);

          if (reason === "backdropClick") return;
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCSVDialogClose()
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#f5f7fa", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>CSV Validation & Import</span>
          <Typography variant="caption" sx={{ bgcolor: "#e0e0e0", px: 1.5, py: 0.5, borderRadius: 1 }}>
            {selectedFile?.name || "No file selected"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, minHeight: 280 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {csvStatus === "processing" ? "Processing file..." : "Validation summary"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {csvProcessMessage || "Uploading and validating the selected CSV file."}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant={csvStatus === "processing" ? "determinate" : "determinate"}
              value={csvProgress.total ? (csvProgress.current / csvProgress.total) * 100 : 0}
              sx={{ height: 10, borderRadius: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              {/* <Typography variant="caption" color="text.secondary"> */}

              <Typography variant="h6">{csvValidationErrors?.errorCount}</Typography>
              {/* </Paper> */}
            </Box>

            {console.log("uploadFormsCSVApiError", uploadFormsCSVApiError)}

            {csvValidationErrors?.errors?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                  Validation issues preview
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 320 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Row</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Column</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvValidationErrors?.errors?.slice(0, 12).map((error, index) => (
                        <TableRow key={`${error.rowNumber}-${index}`} sx={{ bgcolor: index % 2 === 0 ? "#fff5f5" : "#fff" }}>
                          <TableCell>{error.rowNumber}</TableCell>
                          <TableCell>{error.columnName}</TableCell>
                          <TableCell>{error.invalidValue || "Empty"}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {csvValidationErrors?.errors?.length > 12 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Showing first 12 errors. Review all issues before importing.
                  </Typography>
                ) : null}
              </Box>
            )
              // : (

              //   <Alert severity={uploadFormsCSVApiError ? "error" : "success"} sx={{ mt: 3 }}>
              //     {uploadFormsCSVApiError ? `Error:${uploadFormsCSVApiError}` : "You Can Continue"}

              //   </Alert>

              // )
            }
          </Box>
          {/* ) : null} */}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReupload}
            disabled={csvStatus === "processing"}
          >
            Reupload File
          </Button>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => handleImportAction("skipErrors")}
            disabled={csvStatus === "processing" || csvValidationSummary.totalRows === 0}
          >
            Skip Errors & Continue Import
          </Button> */}
          <Button
            variant="contained"
            color="success"
            onClick={handleImportAction}
            disabled={csvStatus === "processing" || uploadFormsCSVApiLoading || csvValidationErrors?.errors?.length > 0}
          >
            {uploadFormsCSVApiLoading ? <CircularProgress size={22} /> : "Continue"}
          </Button>
          <Button
            variant="text"
            disabled={uploadFormsCSVApiLoading}
            onClick={() => setUploadCSVModalOpen(false)}
          // disabled={csvStatus === "processing"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilledFormsComponent;
