import React, { useContext, useEffect, useRef, useState } from "react";
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { TextField, Button, CircularProgress, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from "@mui/material";
import Chart from "chart.js/auto";
import "./Executive.css";
// import { useCallData } from "../../../hooks/useCallData";
import CampaignIcon from "@mui/icons-material/Campaign";
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from '@mui/icons-material/Refresh';
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import {

  AlertTriangle,
  UserPlus,
  Users,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import EventIcon from "@mui/icons-material/Event";
import LabelIcon from "@mui/icons-material/Label";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { ProfilePopup, CodeAnnousementPopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import toast from "react-hot-toast";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";
import HospitalContext from "../../../contexts/HospitalContexts";
import { IconButton } from "@mui/material";
const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const hourlyChartRef = useRef(null);
  const hourlyChartInstance = useRef(null);
  const [loadingId, setLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);
  const [callsModalOpen, setCallsModalOpen] = useState(false);
  const [callsDateFilter, setCallsDateFilter] = useState("today");
  const [callsTab, setCallsTab] = useState("all"); // "all" | "inbound" | "outbound"
  const [formsModalOpen, setFormsModalOpen] = useState(null);
  const [formsTypeFilter, setFormsTypeFilter] = useState("all"); // "all" | "inbound" | "outbound"
  const [branchFollowups, setBranchFollowups] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [followupsPopupOpen, setFollowupsPopupOpen] = useState(false);
  const [bfPage, setBfPage] = useState(1);
  const [page, setPage] = useState(1);
  const [hPage, setHPage] = useState(1); // Horizontal page (5 items per page)
  // Notes states
  const [notes, setNotes] = useState([]);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ heading: '', body: '' });
  const [expandedNote, setExpandedNote] = useState(null);
  const {
    forms,
    loading,
    analytics,
    metrics,
    errors,
    codeAlerts,
    branches,
    selectedBranch,
    selectedHostpital,
    pagination,
    setSelectedBranch,
    filter,
    setFilter,
    setPagination,
    codeAlertsData,
    filterOptions,
    refetchDashboard,


  } = useContext(HospitalContext);

  useEffect(() => {
    if (hourlyChartRef.current) {
      if (hourlyChartInstance.current) {
        hourlyChartInstance.current.destroy();
      }

      const hourlyCtx = hourlyChartRef.current.getContext("2d");

      // Build hourly data from forms.today
      const hourlyMap = {};
      const allForms = forms?.today || [];
      allForms.forEach(form => {
        if (form.createdAt) {
          const hour = new Date(form.createdAt).getHours();
          const hourKey = `${String(hour).padStart(2, '0')}:00`;
          if (!hourlyMap[hourKey]) hourlyMap[hourKey] = { inbound: 0, outbound: 0 };
          if (form.formType === 'inbound') hourlyMap[hourKey].inbound++;
          else if (form.formType === 'outbound') hourlyMap[hourKey].outbound++;
        }
      });

      // Generate labels for working hours
      const defaultLabels = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
      const labels = Object.keys(hourlyMap).length > 0
        ? [...new Set([...defaultLabels, ...Object.keys(hourlyMap)])].sort()
        : defaultLabels;
      const inboundData = labels.map(h => hourlyMap[h]?.inbound || 0);
      const outboundData = labels.map(h => hourlyMap[h]?.outbound || 0);

      hourlyChartInstance.current = new Chart(hourlyCtx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Inbound",
              data: inboundData,
              borderColor: "#3498db",
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Outbound",
              data: outboundData,
              borderColor: "#2ecc71",
              backgroundColor: "rgba(46, 204, 113, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 15
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.05)" },
              title: { display: true, text: "Calls", font: { size: 12 } },
            },
            x: {
              grid: { display: false },
              title: { display: true, text: "Time (Hours)", font: { size: 12 } }
            },
          },
        },
      });
    }

    return () => {
      if (hourlyChartInstance.current) {
        hourlyChartInstance.current.destroy();
      }
    };
  }, [forms]);

  const handleToggleStatus = async (id) => {
    if (!id) return;

    try {
      setLoadingId(id);

      const res = await toggleAlertStatus(hospitalId, id);

      if (res?.success) {
        toast.success("Status Updated");

        setCodeAlerts((prev) =>
          prev.filter((item) => item?._id !== id)
        );
      } else {
        toast.error(res?.message || "Something went wrong");
      }

    } catch (error) {
      toast.error("Server Error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddNote = () => {
    if (newNote.heading.trim() && newNote.body.trim()) {
      const note = {
        id: Date.now(),
        heading: newNote.heading.trim(),
        body: newNote.body.trim(),
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [...prev, note]);
      setNewNote({ heading: '', body: '' });
      setNotesModalOpen(false);
      toast.success("Note added successfully");
    } else {
      toast.error("Please fill both heading and body");
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast.success("Note deleted");
  };


  const formsDataMap = {
    Forms: forms.today,
    Followups: forms.followups,
    Appointments: forms.appointments
  };

  console.log("forms", forms);

  const formsData = formsDataMap[formsModalOpen] || [];


  console.log("formformsData formsDatas", formsData);
  return (
    <div className="executive-dashboard-page">

      {loading?.dashboard && (
        <div className="loading-overlay-simple">
          <p>Loading DashBoard data...</p>
        </div>
      )}
      {/* <div className="executive-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i> Agent Dashboard
        </h1>
        <div
          className="executive-user-info executive-user-info-clickable"
          onClick={() => setModalOpen("profile")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setModalOpen("profile")}
        >
          <div className="executive-user-avatar">
            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div>{userInfo.name || "User"}</div>
            <div className="executive-gray-text">
              {userInfo.type || "Agent"}
            </div>
          </div>
        </div>
      </div> */}



      <div className="executive-date-filter">

        {/* Filters Section */}
        <div className="filters">
          <Grid container spacing={1} alignItems="center" gap={1}>
            {/* Branch Select */}
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

            {/* Filter Select */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="filter-label">Select Filter</InputLabel>

              <Select
                labelId="filter-label"
                label="Select Filter"
                value={filter || ""}
                onChange={(e) => setFilter(e.target.value)}
              >
                {filterOptions.length > 0 ? (
                  filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.key}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No Filters</MenuItem>
                )}
              </Select>
            </FormControl>

          </Grid>
        </div>


        {/* Buttons Section */}
        <div className="executive-forms-button-container">
          <IconButton
            color="warning"
            size="small"
            onClick={refetchDashboard}
            title="Refresh"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>

          <button
            className="executive-forms-button"
            onClick={() =>
              navigate("/executive-forms", {
                state: {
                  branch: {
                    branchId: selectedBranch,
                  },
                },
              })
            }
          >
            <ArticleOutlinedIcon /> Go to Forms
          </button>

          <button
            className="executive-forms-button"
            onClick={() => setNotesModalOpen(true)}
          >
            <StickyNote2Icon /> Notes
          </button>

          <button
            className="executiveannoucementbutton"
            onClick={() => setModalOpen("announcement")}
          >
            <CampaignIcon sx={{ fontSize: 25 }} /> Go to Announcements
          </button>

        </div>
      </div>

      {/* Sticky Notes Section */}
      {
        notes.length > 0 && (
          <div className="executive-dashboard-section">
            <div className="executive-section-header">
              <h4 className="executive-section-title">
                <StickyNote2Icon /> Sticky Notes
              </h4>
            </div>
            <div className="notes-container">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="note-card"
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  onMouseEnter={() => setExpandedNote(note.id)}
                  onMouseLeave={() => setExpandedNote(null)}
                >
                  <div className="note-header">
                    <h3 className="note-heading">{note.heading}</h3>
                    <button
                      className="note-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                  {expandedNote === note.id && (
                    <div className="note-body">
                      {note.body}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }
      {
        codeAlerts?.length > 0 && (
          <div>
            {codeAlerts.map((alert, index) => {
              const hospitalName = alert?.HospitalId?.name || "Unknown Hospital";
              const branchName = alert?.BranchId?.name || "Unknown Branch";
              const city = alert?.BranchId?.branchId?.city || "";
              const codeName = alert?.code_id?.name || "Code Alert";

              return (
                <div
                  key={alert._id || index}
                  className="ai-recommendation alert-card"
                  style={{
                    backgroundColor: alert?.code_id?.color || '#f1f5f9',
                    color: "#1e293b",
                    borderLeft: '5px solid #0f172a',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '10px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}
                >
                  <AlertTriangle size={20} color="#0f172a" />

                  <div style={{ flexGrow: 1, fontWeight: '600' }}>
                    {codeName}:{" "}
                    <span style={{ fontWeight: '400' }}>
                      {codeName} raised in {hospitalName} {branchName} {city && `(${city})`}.
                      Immediate attention required.
                    </span>
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    disableRipple
                    disableElevation
                    disabled={loadingId === alert._id}
                    onClick={() => handleToggleStatus(alert._id)}
                    sx={{
                      backgroundColor: "white",
                      color: "#000",
                      borderColor: "#ccc",
                      '&:hover': {
                        backgroundColor: "white",
                        borderColor: "#ccc"
                      }
                    }}
                  >
                    {loadingId === alert._id ? (
                      <CircularProgress size={22} />
                    ) : (
                      "Resolve"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )
      }
      <div className="executive-dashboard-section">
        <div className="executive-combined-reporting">
          <div className="bottom-row">
            <div
              className="executive-combined-total-calls executive-card-clickable"
              onClick={() => {
                setFormsTypeFilter("all");
                setFormsModalOpen("Forms");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (setFormsTypeFilter("all"), setFormsModalOpen("Forms"))
              }
            >
              <div className="executive-chart-title">
                <DescriptionIcon />Forms {filter.key}
              </div>
              <div className="content-wrapper">
                <div className="executive-metric-value">
                  {metrics?.totalForms?.total || 0}
                </div>
                <div className="executive-metric-breakdown">
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("inbound");
                      setFormsModalOpen("Forms");
                    }}
                  >
                    <div className="executive-breakdown-label">Inbound</div>
                    <div className="executive-breakdown-value executive-inbound-breakdown">
                      {metrics?.totalForms?.inbound || 0}
                    </div>
                  </div>
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("outbound");
                      setFormsModalOpen("Forms");
                    }}
                  >
                    <div className="executive-breakdown-label">Outbound</div>
                    <div className="executive-breakdown-value executive-outbound-breakdown">
                      {metrics?.totalForms?.outbound || 0}
                    </div>
                  </div>
                </div>
                {/* <div className="executive-metric-change executive-positive">
                  <i className="fas fa-arrow-up"></i> 26% from last month
                </div> */}
              </div>
            </div>
            <div
              className="executive-combined-total-calls executive-card-clickable"
              onClick={() => {
                setFormsTypeFilter("all");
                setFormsModalOpen("Appointments");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (setFormsTypeFilter("all"), setFormsModalOpen("Appointments"))
              }
            >
              <div className="executive-chart-title">
                <DescriptionIcon /> Appointments
              </div>
              <div className="content-wrapper">
                <div className="executive-metric-value">
                  {metrics?.appointments?.total || 0}
                </div>
                <div className="executive-metric-breakdown">
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("inbound");
                      setFormsModalOpen("Appointments");
                    }}
                  >
                    <div className="executive-breakdown-label">Inbound</div>
                    <div className="executive-breakdown-value executive-inbound-breakdown">
                      {metrics?.appointments?.inbound || 0}
                    </div>
                  </div>
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("outbound");
                      setFormsModalOpen("Appointments");
                    }}
                  >
                    <div className="executive-breakdown-label">Outbound</div>
                    <div className="executive-breakdown-value executive-outbound-breakdown">
                      {metrics?.appointments?.outbound || 0}
                    </div>
                  </div>
                </div>
                {/* <div className="executive-metric-change executive-positive">
                  <i className="fas fa-arrow-up"></i> 26% from last month
                </div> */}
              </div>
            </div>
            <div
              className="executive-combined-total-calls executive-card-clickable"
              onClick={() => {
                setFormsTypeFilter("all");
                setFormsModalOpen("Followups");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (setFormsTypeFilter("all"), setFormsModalOpen("Followups"))
              }
            >
              <div className="executive-chart-title">
                <DescriptionIcon /> Followups Pending
              </div>
              <div className="content-wrapper">
                <div className="executive-metric-value">
                  {metrics?.followupsPending?.total || 0}
                </div>
                <div className="executive-metric-breakdown">
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("inbound");
                      setFormsModalOpen("Followups");
                    }}
                  >
                    <div className="executive-breakdown-label">Inbound</div>
                    <div className="executive-breakdown-value executive-inbound-breakdown">
                      {metrics?.followupsPending?.inbound || 0}
                    </div>
                  </div>
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("outbound");
                      setFormsModalOpen("Followups");
                    }}
                  >
                    <div className="executive-breakdown-label">Outbound</div>
                    <div className="executive-breakdown-value executive-outbound-breakdown">
                      {metrics?.followupsPending?.outbound || 0}
                    </div>
                  </div>
                </div>
                {/* <div className="executive-metric-change executive-positive">
                  <i className="fas fa-arrow-up"></i> 26% from last month
                </div> */}
              </div>
            </div>
            {/* <div
              className="executive-combined-total-calls executive-card-clickable"
              onClick={() => {
                setFormsTypeFilter("all");
                setFormsModalOpen(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (setFormsTypeFilter("all"), setFormsModalOpen(true))
              }
            >
              <div className="executive-chart-title">
                <i className="fas fa-file-alt"></i> Filled Forms
              </div>
              <div className="content-wrapper">
                <div className="executive-metric-value">
                  {formsData?.filledForms?.length || 0}
                </div>
                <div className="executive-metric-breakdown">
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("inbound");
                      setFormsModalOpen(true);
                    }}
                  >
                    <div className="executive-breakdown-label">Inbound</div>
                    <div className="executive-breakdown-value executive-inbound-breakdown">
                      {formsData.totalInbound || 0}
                    </div>
                  </div>
                  <div
                    className="executive-breakdown-item executive-breakdown-clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormsTypeFilter("outbound");
                      setFormsModalOpen(true);
                    }}
                  >
                    <div className="executive-breakdown-label">Outbound</div>
                    <div className="executive-breakdown-value executive-outbound-breakdown">
                      {formsData.totalOutbound || 0}
                    </div>
                  </div>
                </div>
                <div className="executive-metric-change executive-positive">
                  <i className="fas fa-arrow-up"></i> 26% from last month
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Pending Follow-ups (Branch) Section */}
      <div className="executive-dashboard-section">
        <div className="pending-followups-section">
          <div className="pending-followups-header">
            <h2 className="executive-section-title">
              <PhoneCallbackIcon /> Pending Follow-ups (Branch)
            </h2>
            <div className="pending-followups-header-actions">
              {(branchFollowups.total > 5 || branchFollowups.data?.length > 5) && (
                <div className="h-pagination-btns">
                  <button
                    className="h-page-btn"
                    disabled={(bfPage === 1 && hPage === 1) || loading?.dashboard}
                    onClick={() => {
                      if (hPage > 1) {
                        setHPage(hPage - 1);
                      } else if (bfPage > 1) {
                        setBfPage(bfPage - 1);
                        setHPage(2);
                      }
                    }}
                    title="Previous"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="h-page-info">
                    {((bfPage - 1) * 2) + hPage}
                  </span>
                  <button
                    className="h-page-btn"
                    disabled={
                      (((bfPage - 1) * 10) + (hPage * 5) >= (branchFollowups.total || 0)) &&
                      (hPage * 5 >= (branchFollowups.data?.length || 0)) ||
                      loading?.dashboard
                    }
                    onClick={() => {
                      if (hPage < 2 && branchFollowups.data?.length > 5) {
                        setHPage(hPage + 1);
                      } else if (bfPage * 10 < branchFollowups.total) {
                        setBfPage(bfPage + 1);
                        setHPage(1);
                      }
                    }}
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
              {branchFollowups.data?.length > 0 && (
                <button
                  className="pending-followups-more-btn"
                  onClick={() => setFollowupsPopupOpen(true)}
                >
                  More ({branchFollowups.total || branchFollowups.data?.length})
                </button>
              )}
            </div>
          </div>
          {branchFollowups.data?.length === 0 ? (
            <div className="pending-followups-empty">
              No pending follow-ups in this branch.
            </div>
          ) : (
            <div className="pending-followups-scroll">
              {branchFollowups.data?.slice((hPage - 1) * 5, hPage * 5).map((fu, idx) => (
                <div key={fu._id || idx} className="pending-followup-card">
                  <div className="pf-card-top">
                    <span className={`pf-type-badge pf-type-${fu.formType}`}>
                      {fu.formType}
                    </span>
                    <span className="pf-date">
                      {fu.createdAt
                        ? new Date(fu.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="pf-patient-name">
                    {fu.patientName || "Unknown Patient"}
                  </div>
                  <div className="pf-details">
                    <span>{fu.patientMobile || "—"}</span>
                  </div>
                  <div className="pf-details">
                    <span>{fu.doctorName || "—"}</span>
                    <span className="pf-separator">•</span>
                    <span>{fu.departmentName || "—"}</span>
                  </div>
                  <div className="pf-agent">
                    Agent: {fu.agentName || "N/A"}
                  </div>
                  {fu.remarks && (
                    <div className="pf-remarks" title={fu.remarks}>
                      {fu.remarks.length > 50 ? fu.remarks.slice(0, 50) + "…" : fu.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="executive-dashboard-section">
        <div className="data-grid row-3">
          <div className="data-card">
            <div className="executive-chart-title">
              <PieChartIcon /> Top 5 Inbound Purpose
            </div>
            {console.log("analytics", analytics)
            }
            <div className="scrollable-content">
              {analytics?.topInboundPurpose?.length === 0 ? (
                <div>No Data Found</div>
              ) : (
                analytics?.topInboundPurpose?.map((item, i) => (
                  <div key={i} className="executive-lead-source">
                    <div className="executive-source-name">
                      <LabelIcon sx={{ fontSize: 16 }} /> {item?.purpose || "-"}
                    </div>
                    <div className="executive-source-count">{item?.count || 0}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="data-card">
            <div className="executive-chart-title">
              <BarChartIcon /> Top 5 Outbound Purpose
            </div>
            <div className="scrollable-content">
              {analytics?.topOutboundPurpose?.length === 0 ? (
                <div>No Data Found</div>
              ) : (
                analytics?.topOutboundPurpose?.map((item, i) => (
                  <div key={i} className="executive-lead-source">
                    <div className="executive-source-name">
                      <LabelIcon sx={{ fontSize: 16 }} /> {item?.purpose || "-"}
                    </div>
                    <div className="executive-source-count">{item?.count || 0}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="data-card">
            <div className="executive-chart-title">
              <PhoneCallbackIcon /> Pending Inbound Followups
            </div>
            <div className="scrollable-content">
              {metrics?.followupsPending?.inbound > 0 ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <h2 style={{ fontSize: "3rem", color: "var(--primary)" }}>{metrics.followupsPending.inbound}</h2>
                  <p style={{ color: "var(--gray)" }}>Total Pending</p>
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <Users size={48} color="#cbd5e1" style={{ marginBottom: "15px" }} />
                  <p>All clear! No pending inbound followups.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Call Volume and Appointment Details Section */}
      <div className="executive-dashboard-section">
        <div className="executive-section-header">
          <h2 className="executive-section-title">
            <TimelineIcon /> Call Analytics & Appointments
          </h2>
          {/* <div className="executive-section-filters">
            <select
              className=""
              id="analytics-date-filter"
              defaultValue="month"
              onChange={handleFilterChange}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div> */}
        </div>
        <div className="executive-call-analytics-grid">
          <div className="executive-analytics-card">
            <div className="executive-chart-title">
              <span>
                <ShowChartIcon /> Call Volume by Hour
              </span>
            </div>
            <div className="executive-chart-container">
              <canvas id="hourlyChart" ref={hourlyChartRef}></canvas>
            </div>
          </div>

          <div className="executive-analytics-card">
            <div className="executive-chart-title">
              <EventIcon /> Today's Appointments
            </div>
            <ul className="executive-appointment-list">
              {forms.appointments && forms.appointments.length > 0 ? (
                forms.appointments.map((apt, index) => (
                  <li key={index} className="executive-appointment-item">
                    <div className="executive-appointment-info">
                      <div className="executive-appointment-patient">
                        {apt.patientName || "Unknown Patient"}
                      </div>
                      <div className="executive-appointment-details">
                        {apt.doctorName || "N/A"} - {apt.departmentName || "General"}
                      </div>
                      <div className="executive-appointment-time">
                        {apt.createdAt ? new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <>
                  <li className="executive-appointment-item">
                    <div className="executive-appointment-info">
                      <div className="executive-appointment-patient">Rajesh Kumar</div>
                      <div className="executive-appointment-details">Dr. Sharma - Urology</div>
                      <div className="executive-appointment-time">10:30 AM</div>
                    </div>
                  </li>
                  <li className="executive-appointment-item">
                    <div className="executive-appointment-info">
                      <div className="executive-appointment-patient">Neha Verma</div>
                      <div className="executive-appointment-details">Dr. Gupta - General Medicine</div>
                      <div className="executive-appointment-time">11:15 AM</div>
                    </div>
                  </li>
                  <li className="executive-appointment-item">
                    <div className="executive-appointment-info">
                      <div className="executive-appointment-patient">Anita Sharma</div>
                      <div className="executive-appointment-details">Dr. Agarwal - Neurology</div>
                      <div className="executive-appointment-time">2:00 PM</div>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {
        modalOpen === "profile" && (
          <ProfilePopup
            onClose={() => setModalOpen(null)}
          />
        )
      }

      {
        modalOpen === "announcement" && (
          <CodeAnnousementPopup
            selectedHostpital={selectedHostpital}
            selectedBranch={selectedBranch}
            data={codeAlertsData}
            onClose={() => setModalOpen(null)}
            refetchDashboard={refetchDashboard}
          />
        )
      }

      {/* Calls List Modal */}
      {
        callsModalOpen && (
          <div
            className="executive-modal-overlay"
            onClick={() => setCallsModalOpen(false)}
          >
            <div
              className="executive-modal executive-modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="executive-modal-header">
                <h3>
                  <i className="fas fa-phone"></i> Call Details
                </h3>
                <div className="executive-modal-actions">
                  <button
                    className="executive-btn-export-small"
                  // onClick={exportCallsToCSV}
                  // disabled={filteredCalls.length === 0}
                  >
                    <i className="fas fa-file-export"></i> Export CSV
                  </button>
                  <button
                    className="executive-modal-close"
                    onClick={() => setCallsModalOpen(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div className="executive-modal-body">
                <div className="executive-calls-filters">
                  <select
                    value={callsDateFilter}
                    onChange={(e) => setCallsDateFilter(e.target.value)}
                    className="executive-calls-date-select"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <div className="executive-calls-tabs">
                    <button
                      className={callsTab === "all" ? "active" : ""}
                      onClick={() => setCallsTab("all")}
                    >
                      All
                    </button>
                    <button
                      className={callsTab === "inbound" ? "active" : ""}
                      onClick={() => setCallsTab("inbound")}
                    >
                      Inbound
                    </button>
                    <button
                      className={callsTab === "outbound" ? "active" : ""}
                      onClick={() => setCallsTab("outbound")}
                    >
                      Outbound
                    </button>
                  </div>
                </div>
                {/* <div className="executive-calls-table-wrap">
                {isCallsLoading ? (
                  <div className="executive-calls-loading">
                    Loading calls...
                  </div>
                ) : filteredCalls.length === 0 ? (
                  <div className="executive-calls-empty">
                    No calls found for{" "}
                    {callsDateFilter === "today" ? "today" : "yesterday"}.
                  </div>
                ) : (
                  <table className="executive-calls-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Time</th>
                        <th>Duration</th>
                        <th>Hangup Cause</th>
                      </tr>
                    </thead>
                    <tbody>

                    </tbody>
                  </table>
                )}
              </div> */}
              </div>
            </div>
          </div>
        )
      }

      {/* Filled Forms Modal */}
      {
        console.log("formsData", formsData)
      }
      {
        formsModalOpen && (
          <FilledFormsComponent
            setFormsModalOpen={setFormsModalOpen}
            formsData={formsData}
            formsLoading={loading?.dashboard}
            formsTypeFilter={formsTypeFilter}
            setFormsTypeFilter={setFormsTypeFilter}
            setPagination={setPagination}
            pagination={pagination}
          >
          </FilledFormsComponent>
        )
      }

      {/* Branch Pending Follow-ups Popup */}
      {
        followupsPopupOpen && (
          <div
            className="executive-modal-overlay"
            onClick={() => setFollowupsPopupOpen(false)}
          >
            <div
              className="executive-modal executive-modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="executive-modal-header">
                <h3>
                  <PhoneCallbackIcon style={{ marginRight: 8 }} />
                  All Pending Follow-ups (Branch)
                </h3>
                <button
                  className="executive-modal-close"
                  onClick={() => setFollowupsPopupOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="executive-modal-body">
                {branchFollowups.length === 0 ? (
                  <div className="pending-followups-empty">
                    No pending follow-ups found.
                  </div>
                ) : (
                  <div className="pf-popup-table-wrap">
                    <table className="pf-popup-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Patient</th>
                          <th>Mobile</th>
                          <th>Type</th>
                          <th>Agent</th>
                          <th>Doctor</th>
                          <th>Department</th>
                          <th>Date</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchFollowups.data?.map((fu, idx) => (
                          <tr key={fu._id || idx}>
                            <td>{(branchFollowups.page - 1) * branchFollowups.limit + idx + 1}</td>
                            <td>{fu.patientName || "—"}</td>
                            <td>{fu.patientMobile || "—"}</td>
                            <td>
                              <span className={`pf-type-badge pf-type-${fu.formType}`}>
                                {fu.formType}
                              </span>
                            </td>
                            <td>{fu.agentName || "—"}</td>
                            <td>{fu.doctorName || "—"}</td>
                            <td>{fu.departmentName || "—"}</td>
                            <td>
                              {fu.createdAt
                                ? new Date(fu.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "—"}
                            </td>
                            <td title={fu.remarks || ""}>
                              {fu.remarks
                                ? fu.remarks.length > 40
                                  ? fu.remarks.slice(0, 40) + "…"
                                  : fu.remarks
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {branchFollowups.total > branchFollowups.limit && (
                <div className="executive-modal-footer pf-pagination">
                  <div className="pf-pagination-info">
                    Showing {(branchFollowups.page - 1) * branchFollowups.limit + 1} to{" "}
                    {Math.min(branchFollowups.page * branchFollowups.limit, branchFollowups.total)} of{" "}
                    {branchFollowups.total}
                  </div>
                  <div className="pf-pagination-btns">
                    <button
                      className="pf-page-btn"
                      disabled={bfPage <= 1 || loading?.dashboard}
                      onClick={() => setBfPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="pf-page-num">Page {bfPage}</span>
                    <button
                      className="pf-page-btn"
                      disabled={bfPage * branchFollowups.limit >= branchFollowups.total || loading?.dashboard}
                      onClick={() => setBfPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onClose={() => setNotesModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Heading"
            fullWidth
            variant="outlined"
            value={newNote.heading}
            onChange={(e) => setNewNote(prev => ({ ...prev, heading: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Body"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNote.body}
            onChange={(e) => setNewNote(prev => ({ ...prev, body: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Add Note</Button>
        </DialogActions>
      </Dialog>
    </div >
  );
};

export default ExecutiveDashboard;
