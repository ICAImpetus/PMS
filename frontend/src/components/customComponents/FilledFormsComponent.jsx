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
import { FORMS_AVAILABLE_COLUMNS, getNestedValue } from "../../utils/exportUtils";


const searchOptions = [
  "Search Patient...",
  "Search Agent...",
  "Search POC...",
  "Search Remarks...",
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
  const [csvValidationErrors, setCSVValidationErrors] = useState([]);
  const [csvValidationSummary, setCSVValidationSummary] = useState({ totalRows: 0, successCount: 0, errorCount: 0 });
  const [csvRows, setCSVRows] = useState([]);
  const [csvParsedValidRows, setCSVParsedValidRows] = useState([]);
  const [csvParsedInvalidRows, setCSVParsedInvalidRows] = useState([]);
  const [csvParseError, setCSVParseError] = useState(null);
  const [csvActionResult, setCSVActionResult] = useState("");
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
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
  console.log("formsModalOpen", formsModalOpen);

  const [selectedFormColumns, setSelectedFormColumns] = useState([
    "agentName",
    "formType",
    "callStatus",
    "patientName",
    "patientMobile",
    "patientStatus",
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

  const resetCSVState = () => {
    setCSVStatus("idle");
    setCSVProgress({ current: 0, total: 0 });
    setCSVProcessMessage("");
    setCSVValidationErrors([]);
    setCSVValidationSummary({ totalRows: 0, successCount: 0, errorCount: 0 });
    setCSVRows([]);
    setCSVParsedValidRows([]);
    setCSVParsedInvalidRows([]);
    setCSVParseError(null);
    setCSVActionResult("");
  };

  const { request: getFilledForms, loading: getFilledFormsLoading, error: getFilledformError } = useApi(commonRoutes.getFilledForms)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const purpose =
          formsModalOpen === "Appointments"
            ? "Appointments"
            : formsModalOpen === "Followup"
              ? "Followup"
              : "All";


        // console.log("Call", purpose);

        const res = await getFilledForms(
          pagination.page,
          selectedHostpital,
          selectedBranch,
          dateRange?.startDate || null,
          dateRange?.endDate || null,
          searchInput || "",
          purpose,
          formsModalOpen,
          false
        );

        if (res?.success) {
          setFilterForm(res.data || []);
          setForm(res?.data || [])

          setPagination((prev) => ({
            ...prev,
            page: res.pagination?.page || 1,
            totalPages: res.pagination?.totalPages || 1,
            totalDocument: res.pagination?.total || 0,
          }));
        }
      } catch (err) {
        console.error("fetchForms error:", err);
      }
    };


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
    const department = normalizeValue(row.departmentName || row.department);
    const formType = normalizeValue(row.formType);
    const ageValue = normalizeValue(row.age);

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
          columnName: row.patientMobile ? "patientMobile" : "contactNumber",
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

    if (!department) {
      errors.push({
        rowNumber,
        columnName: "departmentName",
        invalidValue: normalizeValue(row.departmentName || row.department),
        message: "Department is required",
      });
    }

    if (!formType) {
      errors.push({
        rowNumber,
        columnName: "formType",
        invalidValue: normalizeValue(row.formType),
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
          setCSVValidationErrors(errorList);
          setCSVValidationSummary({
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
        false
      );

      if (res?.success) {
        setFilterForm(res.data || []);

        setPagination((prev) => ({
          ...prev,
          page: 1,
          totalPages: res.pagination?.totalPages || 1,
          totalDocument: res.pagination?.total || 0,
        }));
      }
    } catch (error) {
      toast.error("Error fetching forms");
    }
  };


  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchApply();
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
    const headers = selectedFormColumns.length
      ? selectedFormColumns
      : FORMS_AVAILABLE_COLUMNS.map((col) => col.key);
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


  const handleClearDateFilter = () => {
    setDateFilterFrom("");
    setDateFilterTo("");
    setDateFilterOpen(false);
    setMoreMenuAnchor(null);
  };

  const handleCSVDialogClose = (event, reason) => {
    if (csvStatus === "processing") return;
    if (reason === "escapeKeyDown") return;
    setUploadCSVModalOpen(false);
  };

  const handleImportAction = (mode) => {
    if (mode === "skipErrors") {
      setCSVActionResult(
        `Import started. ${csvParsedValidRows.length + csvParsedInvalidRows.length - csvParsedInvalidRows.length} valid rows will be imported; ${csvParsedInvalidRows.length} rows will be skipped.`
      );
    } else if (mode === "importValid") {
      setCSVActionResult(
        `Import started. ${csvParsedValidRows.length} valid rows will be imported; ${csvParsedInvalidRows.length} invalid rows will be skipped.`
      );
    }
    setUploadCSVModalOpen(false);
  };

  const toggleFormColumn = (key) => {
    setSelectedFormColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleApplyDateFilter = async () => {
    if (!dateFilterFrom || !dateFilterTo) return;

    try {
      const purpose =
        formsModalOpen === "Appointments"
          ? "Appointments"
          : formsModalOpen === "Followup"
            ? "Followup"
            : "All";


      console.log("selectedHostpital", selectedHostpital);


      const res = await getFilledForms(
        1,
        selectedHostpital,
        selectedBranch,
        dateFilterFrom,
        dateFilterTo,
        searchInput || "",
        purpose,
        formsModalOpen,
        true
      );

      if (res?.success) {
        setFilterForm(res.data || []);
        setForm(res.data || []);

        const allForms = res.data || [];


        if (allForms.length === 0) {
          toast.success("No Data is Found TO Export")
          return
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
              } else {
                const formattedDate = row?.dateTime
                  ? moment(row.dateTime).format("DD MMM YYYY")
                  : "";

                val = formattedDate
                  ? `${formattedDate} | Arrival Time: ${row?.patientArrivalTime || "-"
                  }`
                  : `Arrival Time: ${row?.patientArrivalTime || "-"}`;
              }
            }

            if (
              c.key === "createdAt" &&
              val !== "-" &&
              moment(val).isValid()
            ) {
              val = moment(val).format("DD MMM YYYY hh:mm A");
            }

            if (
              val &&
              typeof val === "object" &&
              !Array.isArray(val)
            ) {
              val = val.name || JSON.stringify(val);
            }

            // CSV safe
            return `"${String(val).replace(/"/g, '""')}"`;
          })
        );

        const csvContent = [
          headers.join(","),
          ...rows.map((r) => r.join(",")),
        ].join("\n");

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
          totalPages: res.pagination?.totalPages || 1,
          totalDocument: res.pagination?.total || 0,
        }));

        setDateFilterOpen(false);
        setDateFilterFrom("")
        setDateFilterTo("")
        toast.success(`Data is Exported From ${dateFilterFrom} to ${dateFilterTo}`)
      }
    } catch {
      toast.error("Error To Fetch Patient");
    }
  };

  const visibleFormColumns = FORMS_AVAILABLE_COLUMNS.filter((col) =>
    selectedFormColumns.includes(col.key),
  );
  const exportFormsToSheet = async () => {
    // console.log("click");
    // console.log("dateFilterFrom", dateFilterFrom);
    // console.log("dateFilterTo", dateFilterTo);

    if (!dateFilterFrom || !dateFilterTo) {
      toast.info("Please select a start date and end date before exporting.");

      // console.log("Please", dateFilterOpen);
      setDateFilterOpen(true);
      // console.log("Please", dateFilterOpen);
      setMoreMenuAnchor(null);

      // console.log("Please");

      return;
    }

    // try {
    //   const purpose =
    //     formsModalOpen === "Appointments"
    //       ? "Appointments"
    //       : formsModalOpen === "Followup"
    //         ? "Followup"
    //         : "All";

    //   const res = await getFilledForms(
    //     1,
    //     selectedHostpital,
    //     selectedBranch,
    //     dateFilterFrom,
    //     dateFilterTo,
    //     searchInput || "",
    //     purpose,
    //     formsTypeFilter,
    //     true
    //   );

    //   const allForms = res.data || [];

    //   if (!allForms.length) return;

    //   const headers = visibleFormColumns.map((c) => c.label);

    //   const rows = allForms.map((row) =>
    //     visibleFormColumns.map((c) => {
    //       let val = row[c.key];

    //       if (c.key === "appointmentSlot" && val) {
    //         const date = val.date ? moment(val.date).format("DD MMM YYYY") : "";
    //         val = `${date} | ${val.start || ""} - ${val.end || ""}`;
    //       }

    //       if (val instanceof Date || c.key === "createdAt") {
    //         val = moment(val).format("D/M/YYYY h:mm:ss A");
    //       }

    //       return String(val ?? "");
    //     })
    //   );

    //   const csvContent = [
    //     headers.join(","),
    //     ...rows.map((r) => r.join(",")),
    //   ].join("\n");

    //   const blob = new Blob(["\uFEFF" + csvContent], {
    //     type: "text/csv;charset=utf-8;",
    //   });

    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");

    //   a.href = url;
    //   a.download = `filled-forms-${moment().format("YYYY-MM-DD-HHmm")}.csv`;
    //   a.click();

    //   URL.revokeObjectURL(url);
    // } catch (err) {
    //   console.error("Export error:", err);
    // }
  };

  return (
    <div
    // className="ff-modal-overlay"
    // onClick={() => setFormsModalOpen(null)}
    >
      <div

        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", color: "#2c3e50" }}>
            <IconButton onClick={() => setFormsModalOpen(false)}>
              <ArrowBackIcon />
            </IconButton>  <ArticleOutlinedIcon /> Filled Forms
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className="ff-header-actions"
              ref={formsColumnFilterRef}
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 0 }}
            >
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
                          disabled={getFilledFormsLoading}
                          onClick={handleSearchApply}
                          sx={{
                            textTransform: "none",
                            minWidth: 72,
                            height: 32,
                            fontSize: "0.8rem",
                          }}
                        >
                          {getFilledFormsLoading ? <CircularProgress size={22} /> : "Search"}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter Patient Name,PhoneNo or Purpose"
                />
              </Grid>
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

              {dateFilterOpen && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    p: 1,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    width: "100%",
                  }}
                >
                  <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={dateFilterFrom}
                    onChange={(e) => setDateFilterFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                  />

                  <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={dateFilterTo}
                    onChange={(e) => setDateFilterTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                  />

                  {/* APPLY BUTTON */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={getFilledFormsLoading}
                    onClick={handleApplyDateFilter}
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
              {/* <MenuItem onClick={handleBrowseCSV}>
                Upload CSV File
              </MenuItem> */}
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
                            } else {
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
            count={pagination?.forms?.totalPages || 1}
            page={pagination?.forms?.page}
            onChange={(e, value) => setPagination((prev) => ({
              ...prev,
              forms: {
                ...prev.forms,
                page: value,
              },
            }))}
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
              <Typography variant="caption" color="text.secondary">
                {csvProgress.current} of {csvProgress.total} rows processed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {csvStatus === "processing" ? "Validating rows..." : csvParseError ? "Validation finished with errors" : "Validation finished"}
              </Typography>
            </Box>
          </Box>

          {csvParseError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {csvParseError}
            </Alert>
          ) : null}

          {csvStatus === "completed" ? (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 2,
                }}
              >
                <Paper sx={{ p: 2, bgcolor: "#f5f7fa" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Total Rows
                  </Typography>
                  <Typography variant="h6">{csvValidationSummary.totalRows}</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Successfully Processed
                  </Typography>
                  <Typography variant="h6">{csvValidationSummary.successCount}</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: "#ffebee" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Rows With Errors
                  </Typography>
                  <Typography variant="h6">{csvValidationSummary.errorCount}</Typography>
                </Paper>
              </Box>

              {csvValidationErrors.length > 0 ? (
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
                        {csvValidationErrors.slice(0, 12).map((error, index) => (
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
                  {csvValidationErrors.length > 12 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Showing first 12 errors. Review all issues before importing.
                    </Typography>
                  ) : null}
                </Box>
              ) : (
                <Alert severity="success" sx={{ mt: 3 }}>
                  No validation issues found. All rows are ready for import.
                </Alert>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReupload}
            disabled={csvStatus === "processing"}
          >
            Reupload File
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleImportAction("skipErrors")}
            disabled={csvStatus === "processing" || csvValidationSummary.totalRows === 0}
          >
            Skip Errors & Continue Import
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleImportAction("importValid")}
            disabled={csvStatus === "processing" || csvValidationSummary.successCount === 0}
          >
            Import Only Valid Rows
          </Button>
          <Button
            variant="text"
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
