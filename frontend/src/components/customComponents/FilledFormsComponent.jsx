import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import "./FilledFormsComponent.css";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Box, Pagination, TextField } from "@mui/material";

// Filled Forms: available columns for filter & export
const FORMS_AVAILABLE_COLUMNS = [
  { key: "agentName", label: "Agent Name" },
  { key: "formType", label: "Form Type" },
  { key: "patientMobile", label: "Patient Mobile No" },
  { key: "patientName", label: "Patient Name" },
  { key: "callStatus", label: "Call Status" },
  { key: "purpose", label: "POC / Purpose" },
  { key: "appointmentslot", label: "App. Slot" },
  { key: "referenceFrom", label: "Reference From" },
  { key: "callerType", label: "Caller Type" },
  { key: "department", label: "Department" },
  { key: "doctor", label: "Doctor" },
  { key: "remarks", label: "Remarks" },
  { key: "createdAt", label: "Submitted At" },
];
// Flatten a filled form document into a row with all display fields
const flattenFilledForm = (doc) => {
  const formData = doc.formData || {};
  const patient = formData.patientDetails || {};
  const attendant = formData.attendantDetails || {};

  return {
    _id: doc._id,

    patientName: doc.patientName || "-",
    patientMobile: doc.patientMobile || "-",
    callStatus: doc.callStatus || "-",

    formType: doc.formType || "-",
    purpose: doc.purpose || "-",

    appointmentslot: doc.appointmentslot || "-",

    referenceFrom: doc.referenceFrom || "-",
    callerType: doc.callerType || "-",

    department: doc?.departmentName || "-",
    doctor: doc?.doctorName || "-",


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
  setFormsModalOpen,
  formsData = [],
  formsTypeFilter,
  setFormsTypeFilter,
  pagination,
  setPagination,
  totalPages,
  formsLoading = false,
}) => {
  const [formsColumnFilterOpen, setFormsColumnFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  const [index, setIndex] = useState(0);
  const [selectedFormColumns, setSelectedFormColumns] = useState([
    "agentName",
    "callStatus",
    "patientName",
    "patientMobile",
    "callerType",
    "purpose",
    "formType",
    "createdAt",
    "remarks"
  ]);
  const formsColumnFilterRef = useRef(null);


  console.log("formsData-formsData", formsData);


  // useEffect(() => {


  //   const fetchForms = async () => {

  //     const res = await getFilledForms({
  //       page: 1,
  //       limit: 10,
  //       filters: {
  //         seletedHospital,
  //         seletedbranch,
  //         filtervalue
  //       },
  //     });
  //     sethospitals(res?.data || [])
  //   }
  //   if (page !== 1) {
  //     fetchForms()
  //   }
  //   fetchForms()


  // }, []);

  // Flatten and filter filled forms for display
  const flattenedForms = React.useMemo(() => {
    return formsData?.map(flattenFilledForm);
  }, [formsData]);

  const filteredForms = React.useMemo(() => {
    let data = flattenedForms || [];

    // 🔹 Step 1: Form Type Filter
    if (formsTypeFilter !== "all") {
      data = data.filter((r) => r.formType === formsTypeFilter);
    }

    // 🔹 Step 2: Search Filter
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

    return data;
  }, [flattenedForms, formsTypeFilter, searchTerm]);

  //  for pagination 
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

  const exportFormsToSheet = () => {
    if (filteredForms.length === 0) return;
    const headers = visibleFormColumns.map((c) => c.label);
    const rows = filteredForms.map((row) =>
      visibleFormColumns.map((c) => {
        let val = row[c.key];
        if (val instanceof Date) val = val.toISOString();
        return typeof val === "string" && val.includes(",")
          ? `"${val}"`
          : String(val ?? "");
      }),
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
    a.download = `filled-forms-${moment().format("YYYY-MM-DD-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        ...prev.patients,
        page: 1,
      },
    }));
  }, [searchTerm, formsTypeFilter]);

  // useEffect(() => {
  //   fetchForms();
  // }, [page]);
  return (
    <div
      className="ff-modal-overlay"
      onClick={() => setFormsModalOpen(null)}
    >
      <div
        className="ff-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", color: "#2c3e50" }}>
            <ArticleOutlinedIcon /> Filled Forms
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
              <TextField
                placeholder={searchOptions[index]}
                value={searchTerm}
                size="small"
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  "& .MuiInputBase-root": {
                    height: 36, // Match button height
                    fontSize: "0.85rem",
                  },
                }}
              />
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
                <div className="ff-column-filter-dropdown" style={{ top: "100%", marginTop: "8px" }}>
                  <div className="ff-column-checkboxes">
                    {FORMS_AVAILABLE_COLUMNS.map((col) => (
                      <label key={col.key} className="ff-column-check">
                        <input
                          type="checkbox"
                          checked={selectedFormColumns.includes(col.key)}
                          onChange={() => toggleFormColumn(col.key)}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <IconButton
              className="ff-btn export"
              onClick={exportFormsToSheet}
              disabled={
                filteredForms?.length === 0 ||
                visibleFormColumns.length === 0
              }
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
              <IosShareOutlinedIcon sx={{ fontSize: "1.1rem", mr: 0.5 }} /> Export
            </IconButton>

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
                        if (val instanceof Date)
                          val = moment(val).format("DD/MM/YYYY hh:mm A");

                        // Safe rendering for objects to prevent React errors
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
            count={totalPages}
            page={pagination?.forms?.page}
            onChange={(e, value) => setPagination((prev) => ({
              ...prev,
              forms: {
                ...prev.patients,
                page: value,
              },
            }))}
            color="primary"
            size="large"
          />
        </Box>

      </div>
    </div>
  );
};

export default FilledFormsComponent;
