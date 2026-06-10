import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import moment from "moment";
import "./FilledFormsComponent.css";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
} from "@mui/material";
import { useApi } from "../../api/useApi";
import { commonRoutes } from "../../api/apiService";


const FORMS_AVAILABLE_COLUMNS_FOR_TEMP = [
  { key: "agentName", label: "Agent Name" },
  { key: "formType", label: "Form Type" },
  { key: "patientMobile", label: "Patient Mobile No" },
  { key: "patientName", label: "Patient Name" },
  { key: "callStatus", label: "Call Status" },
  { key: "purpose", label: "POC / Purpose" },
  { key: "appointmentSlot", label: "App. Slot" },
  { key: "referenceFrom", label: "Reference From" },
  { key: "callerType", label: "Caller Type" },
  { key: "departmentName", label: "Department" },
  { key: "doctorName", label: "Doctor" },
  { key: "remarks", label: "Remarks" },
  { key: "createdAt", label: "Submitted At" },
];

const FORMS_AVAILABLE_COLUMNS = [
  { key: "agentName", label: "Agent Name" },
  { key: "formType", label: "Form Type" },
  { key: "patientMobile", label: "Patient Mobile No" },
  { key: "patientName", label: "Patient Name" },
  { key: "callStatus", label: "Call Status" },
  { key: "purpose", label: "POC / Purpose" },
  { key: "appointmentSlot", label: "App. Slot" },
  { key: "referenceFrom", label: "Reference From" },
  { key: "callerType", label: "Caller Type" },
  { key: "departmentName", label: "Department" },
  { key: "doctorName", label: "Doctor" },
  { key: "remarks", label: "Remarks" },
  { key: "createdAt", label: "Submitted At" },
];

const flattenFilledForm = (doc) => {
  return {
    _id: doc._id,

    patientName: doc.patientName || "-",
    patientMobile: doc.patientMobile || "-",
    callStatus: doc.callStatus || "-",

    formType: doc.formType || "-",
    purpose: doc.purpose || "-",


    appointmentSlot: doc?.appointmentSlot || "-",

    referenceFrom: doc.referenceFrom || "-",
    callerType: doc.callerType || "-",

    departmentName: doc?.departmentName || "-",
    doctorName: doc?.doctorName || "-",


    remarks: doc.remarks || "-",
    hospitalName: doc.hospitalId?.name || "-",

    agentName:
      doc.agentName ||
      (typeof doc.agentId === "object" ? doc.agentId?.name : doc.agentId) ||
      "-",
    createdAt: moment(doc.createdAt).format("DD MMM YYYY, hh:mm A") || "-",
  };
};

const searchOptions = [
  "Search Patient...",
  "Search Agent...",
  "Search POC...",
  "Search Remarks...",
];




const FilledFormsComponent = ({
  selectedBranch = null,
  selectedHostpital = null,
  filter = "today",
  formsModalOpen,
  setFormsModalOpen,
  formsData = [],
  formsTypeFilter,
  setFormsTypeFilter,
  pagination,
  setPagination,
  formsLoading = false,
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
  const [selectedFormColumns, setSelectedFormColumns] = useState([
    "agentName",
    "callStatus",
    "patientName",
    "patientMobile",
    "purpose",
    ...(formsModalOpen === "Appointments"
      ? ["appointmentSlot", "departmentName", "doctorName"]
      : []),
    "createdAt",
    "remarks"

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
          null,
          pagination?.patients?.page,
          null,
          selectedHostpital,
          startDate,
          endDate,
          searchInput,
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

  const handleApplyDateFilter = async () => {
    // if (!startDate || !endDate) return;

    // try {

    //   const res = await getPatients(null, pagination?.patient?.page, null, selectedHostpital, startDate, endDate, true)
    //   console.log("patinat fetch ", res);
    //   if (res?.success) {
    //     setPatients(res?.data)
    //     setPagination((prev) => ({
    //       ...prev,
    //       patients: {
    //         ...res.pagination
    //       }
    //     }))
    //     handleCloseDateFilter();
    //   }


    // } catch {

    //   toast.error("Error To Fetch Patient")

    // }
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

  const flattenedForms = React.useMemo(() => {
    return formsData?.map(flattenFilledForm);
  }, [formsData]);

  const filteredForms = React.useMemo(() => {
    let data = flattenedForms || [];


    if (formsTypeFilter !== "all") {
      data = data.filter((r) => r.formType === formsTypeFilter);
    }


    if (searchTerm?.trim()) {
      const term = searchTerm.toLowerCase();

      data = data.filter((r) =>
        [
          r.patientName,
          r.agentName,
          r.referenceFrom,
          r.remarks,
          r.patientMobile,
          r.departmentName,
          r.purpose,
        ]
          .filter(Boolean) // null/undefined hatao
          .some((field) =>
            field.toString().toLowerCase().includes(term)
          )
      );
    }

    if (dateFilterFrom) {
      const fromDate = moment(dateFilterFrom, "YYYY-MM-DD").startOf("day");
      data = data.filter((r) =>
        moment(r.createdAt, "DD MMM YYYY, hh:mm A").isSameOrAfter(fromDate),
      );
    }

    if (dateFilterTo) {
      const toDate = moment(dateFilterTo, "YYYY-MM-DD").endOf("day");
      data = data.filter((r) =>
        moment(r.createdAt, "DD MMM YYYY, hh:mm A").isSameOrBefore(toDate),
      );
    }

    return data;
  }, [flattenedForms, formsTypeFilter, searchTerm]);


  const { request: getFilledForms, loading: getFilledFormsLoading } = useApi(commonRoutes.getFilledForms)
  const rowParPage = 10

  const paginationData = filteredForms.slice((pagination?.forms?.page - 1) * rowParPage, pagination?.forms?.page * rowParPage)

  const visibleFormColumns = FORMS_AVAILABLE_COLUMNS.filter((col) =>
    selectedFormColumns.includes(col.key),
  );

  const toggleFormColumn = (key) => {
    setSelectedFormColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const exportFormsToSheet = async () => {
    try {

      //  STEP 2: ALL data fetch (NO pagination)
      const res = await getFilledForms(filter, pagination.forms.page, selectedBranch, selectedHostpital, true)

      const map = {
        "Forms": res?.data?.forms?.today || [],
        "Appointments": res?.data?.forms?.appointments || [],
        "Followups": res?.data?.forms?.followups || []
      }
      const allForms = map[formsModalOpen] || [];
      console.log("allForms", allForms);


      if (allForms.length === 0) return;

      //  STEP 3: CSV logic (same tera)
      const headers = visibleFormColumns.map((c) => c.label);

      const rows = allForms.map((row) =>
        visibleFormColumns.map((c) => {
          console.log("visibleFormColumns", c);
          console.log("rows", visibleFormColumns);

          let val = row[c.key];



          // appointment slot format
          if (c.key === "appointmentSlot") {
            console.log("c.key ", c.key);
            console.log("val", val);
            if (val && typeof val === "object") {
              console.log("val", val);

              const date = val.date
                ? moment(val.date).format("DD MMM YYYY")
                : "";

              const start = val.start || "";
              const end = val.end || "";

              val = `${date} | ${start} - ${end}`;
            } else {
              val = "-";
            }
          }

          if ((val instanceof Date || c.key === "createdAt") && val) {
            val = moment(val).format("D/M/YYYY h:mm:ss A");
          }
          return typeof val === "string" && val.includes(",")
            ? `"${val}"`
            : String(val ?? "");
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
      a.download = `filled-forms-${moment().format(
        "YYYY-MM-DD-HHmm"
      )}.csv`;

      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export error:", err);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        formsColumnFilterRef.current &&
        !formsColumnFilterRef.current.contains(event.target)
      ) {
        setFormsColumnFilterOpen(false);
      }
    };
    if (formsColumnFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [formsColumnFilterOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % searchOptions.length);
      return () => clearInterval(interval);
    }, 2000); // 2 sec me change hoga

  }, []);
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      forms: {
        ...prev.forms,
        page: 1,
      },
    }));
  }, [searchTerm, formsTypeFilter]);




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
                          onClick={handleSearchApply}
                          sx={{
                            textTransform: "none",
                            minWidth: 72,
                            height: 32,
                            fontSize: "0.8rem",
                          }}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter Patient Name,PhoneNo or Purpose"
                />
              </Grid>
              <button
                type="button"
                className="executive-btn-columns"
                onClick={() => setFormsColumnFilterOpen((prev) => !prev)}
                style={{ height: "36px", margin: 0, padding: "0 12px", fontSize: "0.85rem" }}
              >
                <i className="fas fa-columns"></i> Select fields (
                {selectedFormColumns.length})
              </button>

              {formsColumnFilterOpen && (
                <div
                  className="ff-column-filter-dropdown"
                  style={{ top: "100%", marginTop: "8px" }}
                >
                  {/* Select All */}
                  <div
                    style={{
                      // padding: "8px 12px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <label
                      className="ff-column-check"
                      style={{
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedFormColumns.length ===
                          FORMS_AVAILABLE_COLUMNS.length
                        }
                        onChange={() => {
                          if (
                            selectedFormColumns.length ===
                            FORMS_AVAILABLE_COLUMNS.length
                          ) {
                            setSelectedFormColumns([]);
                          } else {
                            setSelectedFormColumns(
                              FORMS_AVAILABLE_COLUMNS.map(
                                (col) => col.key
                              )
                            );
                          }
                        }}
                      />

                      <span>
                        {selectedFormColumns.length ===
                          FORMS_AVAILABLE_COLUMNS.length
                          ? "Unselect All"
                          : "Select All"}
                      </span>
                    </label>
                  </div>

                  {/* Individual Columns */}
                  <div className="ff-column-checkboxes">
                    {FORMS_AVAILABLE_COLUMNS.map((col) => (
                      <label
                        key={col.key}
                        className="ff-column-check"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFormColumns.includes(
                            col.key
                          )}
                          onChange={() =>
                            toggleFormColumn(col.key)
                          }
                        />

                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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
                    onClick={handleApplyDateFilter}
                  >
                    Apply
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
              <MenuItem onClick={handleToggleDateFilter}>
                Date Filter
              </MenuItem>
              {/* <MenuItem
                onClick={handleClearDateFilter}
                disabled={!dateFilterFrom && !dateFilterTo}
              >
                Clear Date Filter
              </MenuItem> */}
              <MenuItem
                onClick={exportFormsToSheet}
                disabled={
                  filteredForms?.length === 0 ||
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
            {formsLoading ? (
              <div className="ff-loading">
                Loading forms...
              </div>
            ) : filteredForms?.length === 0 ? (
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
                  {paginationData?.map((row) => (
                    <tr key={row._id}>
                      {visibleFormColumns.map((col) => {



                        let val = row[col.key];


                        // Handle appointmentSlot object
                        if (
                          col.key === "appointmentSlot"
                        ) {

                          if (val) {

                            const formattedDate = val?.date
                              ? moment(val.date).format(
                                "dddd, DD MMM YYYY"
                              )
                              : null;

                            val = formattedDate
                              ? `${formattedDate} | ${val.start || "N/A"
                              } to ${val.end || "N/A"}`
                              : `${val.start || "N/A"} to ${val.end || "N/A"
                              }`;

                          } else {

                            const formattedDate = row?.dateTime
                              ? moment(row.dateTime).format(
                                "dddd, DD MMM YYYY"
                              )
                              : null;

                            val = formattedDate
                              ? `${formattedDate} | Arrival Time: ${row?.patientArrivalTime || "-"
                              }`
                              : `Arrival Time: ${row?.patientArrivalTime || "-"
                              }`;
                          }
                        }
                        if (val instanceof Date)
                          val = moment(val).format("DD/MM/YYYY hh:mm A");


                        if (
                          val &&
                          typeof val === "object" &&
                          !Array.isArray(val)
                        ) {
                          val = val.name || JSON.stringify(val);
                        }

                        return <td key={col.key}>{val ?? "-"}</td>;
                      })}
                    </tr>
                  ))}
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
