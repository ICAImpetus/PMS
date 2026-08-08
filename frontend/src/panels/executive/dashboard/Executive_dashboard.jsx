import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import {
  TextField, Button, CircularProgress, MenuItem,
  FormControl, Select, Dialog, DialogTitle,
  Typography, DialogContent, DialogActions, Grid,
  Box, Paper, Chip, IconButton,
} from "@mui/material";
import Chart from "chart.js/auto";
import "./Executive.css";
import CampaignIcon from "@mui/icons-material/Campaign";
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from '@mui/icons-material/Refresh';
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { AlertTriangle } from "lucide-react";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { ProfilePopup, CodeAnnousementPopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import { toast } from "react-toastify";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";
import HospitalContext from "../../../contexts/HospitalContexts";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const hourlyChartRef = useRef(null);
  const hourlyChartInstance = useRef(null);
  const [loadingId, setLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(null);
  const [callsModalOpen, setCallsModalOpen] = useState(false);
  const [callsDateFilter, setCallsDateFilter] = useState("today");
  const [callsTab, setCallsTab] = useState("all");
  const [formsModalOpen, setFormsModalOpen] = useState(null);
  const [formsTypeFilter, setFormsTypeFilter] = useState("all");
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ heading: '', body: '' });
  const [expandedNote, setExpandedNote] = useState(null);
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const {
    forms,
    loading,
    analytics,
    codeAlerts,
    branches,
    selectedBranch,
    selectedHostpital,
    setSelectedBranch,
    filter,
    codeAlertsData,
    filterOptions,
    refetchDashboard,
    dateRange,
    handleFilterChange
  } = useContext(HospitalContext);

  const { request: toggleAlertStatus } = useApi(commonRoutes.toggleCodeAlertStatus);

  // ── HOURLY CHART DATA PROCESSING ──
  const hourlyChartData = useMemo(() => {
    const data = analytics?.hourlyStats || [];
    const defaultHours = Array.from({ length: 24 }, (_, i) => i);
    const map = new Map();
    data.forEach((item) => {
      map.set(item.hour, item);
    });

    const labels = defaultHours.map((h) => `${String(h).padStart(2, "0")}:00`);
    const inboundData = defaultHours.map((h) => map.get(h)?.inbound || 0);
    const outboundData = defaultHours.map((h) => map.get(h)?.outbound || 0);

    return { labels, inboundData, outboundData };
  }, [analytics?.hourlyStats]);

  // ── CHART.JS STACKED BAR CHART INITIALIZATION ──
  useEffect(() => {
    if (!hourlyChartRef.current) return;

    if (hourlyChartInstance.current) {
      hourlyChartInstance.current.destroy();
    }

    const ctx = hourlyChartRef.current.getContext("2d");

    hourlyChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: hourlyChartData.labels,
        datasets: [
          {
            label: "Inbound",
            data: hourlyChartData.inboundData,
            backgroundColor: "#0a4bb6",
            borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6 },
            borderSkipped: false,
            barThickness: 16,
            stack: "stack1",
          },
          {
            label: "Outbound",
            data: hourlyChartData.outboundData,
            backgroundColor: "#e2e8f0",
            borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barThickness: 16,
            stack: "stack1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10, weight: "600" }, color: "#94a3b8" },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            border: { display: false },
            ticks: { font: { size: 10, weight: "600" }, color: "#94a3b8" },
          },
        },
      },
    });

    return () => {
      hourlyChartInstance.current?.destroy();
    };
  }, [hourlyChartData]);

  // ── CODE ALERT STATUS TOGGLE ──
  const handleToggleStatus = async (id) => {
    if (!id) return;
    try {
      setLoadingId(id);
      const res = await toggleAlertStatus(selectedHostpital, id);
      if (res?.success) {
        toast.success("Status Updated");
        await refetchDashboard();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Server Error");
    } finally {
      setLoadingId(null);
    }
  };

  // ── NOTES MANAGEMENT ──
  const handleAddNote = () => {
    if (newNote.heading.trim() && newNote.body.trim()) {
      const note = {
        id: Date.now(),
        heading: newNote.heading.trim(),
        body: newNote.body.trim(),
        createdAt: new Date().toISOString()
      };
      const updatedNotes = [...notes, note];
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      setNewNote({ heading: '', body: '' });
      setNotesModalOpen(false);
      toast.success("Note added successfully");
    } else {
      toast.error("Please fill both heading and body");
    }
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    toast.success("Note deleted");
  };

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const currentBranch = branches?.find((b) => b._id === selectedBranch);
  const branchLabel = currentBranch?.name || "Main Hospital";
  const todayStr = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  // Status Chip Formatting for Latest Appointments
  const getAppointmentBadge = (status) => {
    const s = (status || "SCHEDULED").toUpperCase();
    if (s.includes("CONFIRM")) {
      return { label: "CONFIRMED", bg: "#dcfce7", color: "#16a34a", icon: <CheckCircleOutlineIcon sx={{ fontSize: "14px !important", color: "#16a34a" }} /> };
    }
    if (s.includes("PROGRESS") || s.includes("IN_PROGRESS")) {
      return { label: "IN-PROGRESS", bg: "#dbeafe", color: "#0a4bb6", icon: <WatchLaterOutlinedIcon sx={{ fontSize: "14px !important", color: "#0a4bb6" }} /> };
    }
    if (s.includes("WAIT")) {
      return { label: "WAITING", bg: "#fef9c3", color: "#ca8a04", icon: <WatchLaterOutlinedIcon sx={{ fontSize: "14px !important", color: "#ca8a04" }} /> };
    }
    return { label: "SCHEDULED", bg: "#f1f5f9", color: "#64748b", icon: <ScheduleIcon sx={{ fontSize: "14px !important", color: "#64748b" }} /> };
  };

  return (
    <>
      {formsModalOpen ? (
        <FilledFormsComponent
          selectedBranch={selectedBranch}
          selectedHostpital={selectedHostpital}
          formsModalOpen={formsModalOpen}
          setFormsModalOpen={setFormsModalOpen}
          formsTypeFilter={formsTypeFilter}
          setFormsTypeFilter={setFormsTypeFilter}
          dateRange={dateRange}
        />
      ) : (
        <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", p: { xs: 2, md: 3 }, fontFamily: "'Inter', sans-serif" }}>

          {/* Loading Overlay */}
          {loading?.dashboard && (
            <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(255,255,255,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <CircularProgress size={28} />
              <Typography fontWeight={600} color="primary">Loading Dashboard Data...</Typography>
            </Box>
          )}

          {/* ── TOP NAVBAR ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
            {/* Left Controls (Branch + Filter + Date + Refresh) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              {/* Branch Select */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedBranch || ""}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  disabled={loading?.branchesLoading}
                  displayEmpty
                  sx={{
                    borderRadius: "50px",
                    bgcolor: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#1e293b",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                  }}
                >
                  {loading?.branchesLoading ? (
                    <MenuItem value=""><CircularProgress size={16} sx={{ mr: 1 }} />Loading...</MenuItem>
                  ) : branches?.length > 0 ? (
                    branches.map((b) => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)
                  ) : (
                    <MenuItem value="">{branchLabel}</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Filter Select */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={filter || ""}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: "50px",
                    bgcolor: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#1e293b",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                  }}
                >
                  {filterOptions?.length > 0 ? (
                    filterOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.key}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">No Filters</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Date Pill */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#fff",
                px: 2.5,
                py: 0.9,
                borderRadius: "50px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: "#0a4bb6" }} />
                <Typography variant="body2" fontWeight={700} color="#334155">{todayStr}</Typography>
              </Box>

              {/* Refresh Button */}
              <Button
                size="small"
                onClick={async () => { await refetchDashboard(); }}
                startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: "50px",
                  bgcolor: "#fff",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.9,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                Refresh
              </Button>
            </Box>

            {/* Right Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                size="small"
                onClick={() => navigate("/executive-forms", { state: { branch: { branchId: selectedBranch } } })}
                startIcon={<ArticleOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: "50px",
                  bgcolor: "#0a4bb6",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 14px rgba(10,75,182,0.3)",
                  "&:hover": { bgcolor: "#003aa3" },
                }}
              >
                Forms
              </Button>

              <Button
                size="small"
                onClick={() => setNotesModalOpen(true)}
                startIcon={<StickyNote2Icon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: "50px",
                  bgcolor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.9,
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                Notes
              </Button>

              <Button
                size="small"
                onClick={() => setModalOpen("announcement")}
                startIcon={<CampaignIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: "50px",
                  bgcolor: "#e2e8f0",
                  color: "#334155",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.9,
                  "&:hover": { bgcolor: "#cbd5e1" },
                }}
              >
                Announcements
              </Button>

              <IconButton size="small" sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", p: 1 }}>
                <NotificationsNoneIcon sx={{ fontSize: 18, color: "#475569" }} />
              </IconButton>
              <IconButton size="small" onClick={() => setModalOpen("profile")} sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", p: 1 }}>
                <SettingsIcon sx={{ fontSize: 18, color: "#475569" }} />
              </IconButton>
            </Box>
          </Box>

          {/* ── CODE ALERTS ── */}
          {codeAlerts?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {codeAlerts.map((alert, i) => {
                const hospitalName = alert?.HospitalId?.name || "Unknown Hospital";
                const branchName = alert?.BranchId?.name || "Unknown Branch";
                const city = alert?.BranchId?.branchId?.city || "";
                const codeName = alert?.code_id?.name || "Code Alert";
                return (
                  <Paper key={alert._id || i} elevation={0} sx={{ bgcolor: alert?.code_id?.color || "#fef2f2", borderLeft: "4px solid #dc2626", borderRadius: "14px", p: 1.5, mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{codeName}: <span style={{ fontWeight: 400 }}>{codeName} raised in {hospitalName} {branchName} {city && `(${city})`}. Immediate attention required.</span></Typography>
                    <Button size="small" variant="outlined" disabled={loadingId === alert._id} onClick={() => handleToggleStatus(alert._id)}
                      sx={{ bgcolor: "#fff", borderColor: "#ccc", color: "#000", "&:hover": { bgcolor: "#fff" }, minWidth: 80 }}>
                      {loadingId === alert._id ? <CircularProgress size={18} /> : "Resolve"}
                    </Button>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* ── STICKY NOTES ── */}
          {notes.length > 0 && (
            <Box sx={{ mb: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {notes.map((note) => (
                <Paper key={note.id} elevation={0} sx={{ border: "1px solid #fde68a", bgcolor: "#fffbeb", borderRadius: "14px", p: 1.5, minWidth: 160, maxWidth: 220, cursor: "pointer" }}
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" fontWeight={700} color="#92400e">{note.heading}</Typography>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} sx={{ p: 0.2 }}>
                      <CloseIcon sx={{ fontSize: 14, color: "#92400e" }} />
                    </IconButton>
                  </Box>
                  {expandedNote === note.id && <Typography variant="caption" color="#78350f" sx={{ display: "block", mt: 0.5 }}>{note.body}</Typography>}
                </Paper>
              ))}
            </Box>
          )}

          {/* ── ROW 1: STAT CARDS (REAL DYNAMIC DATA) ── */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Forms Stat Card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} onClick={() => { setFormsTypeFilter("all"); setFormsModalOpen("Forms"); }} role="button" tabIndex={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#fff",
                  border: "1px solid #edf2f7",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
                  transition: "all .2s ease",
                }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DescriptionIcon sx={{ fontSize: 22, color: "#0a4bb6" }} />
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={1}>VOLUME</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: 1 }}>
                  <Box>
                    <Typography variant="h2" fontWeight={800} color="#0f172a" lineHeight={1}>
                      {analytics?.forms?.total ?? 0}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing={0.5} sx={{ display: "block", mt: 1 }}>
                      TOTAL FORMS
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Box onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("inbound"); setFormsModalOpen("Forms"); }} sx={{ cursor: "pointer", mb: 0.8 }}>
                      <Typography component="span" variant="caption" color="#94a3b8" fontWeight={700} sx={{ mr: 1 }}>INBOUND</Typography>
                      <Typography component="span" variant="body1" fontWeight={800} color="#0a4bb6">{analytics?.forms?.inbound ?? 0}</Typography>
                    </Box>
                    <Box onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("outbound"); setFormsModalOpen("Forms"); }} sx={{ cursor: "pointer" }}>
                      <Typography component="span" variant="caption" color="#94a3b8" fontWeight={700} sx={{ mr: 1 }}>OUTBOUND</Typography>
                      <Typography component="span" variant="body1" fontWeight={800} color="#0a4bb6">{analytics?.forms?.outbound ?? 0}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Appointments Stat Card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} onClick={() => { setFormsTypeFilter("all"); setFormsModalOpen("Appointments"); }} role="button" tabIndex={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#fff",
                  border: "1px solid #edf2f7",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
                  transition: "all .2s ease",
                }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventIcon sx={{ fontSize: 22, color: "#0a4bb6" }} />
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={1}>SCHEDULE</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: 1 }}>
                  <Box>
                    <Typography variant="h2" fontWeight={800} color="#0f172a" lineHeight={1}>
                      {analytics?.appointments?.total ?? 0}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing={0.5} sx={{ display: "block", mt: 1 }}>
                      APPOINTMENTS
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Box onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("inbound"); setFormsModalOpen("Appointments"); }} sx={{ cursor: "pointer", mb: 0.8 }}>
                      <Typography component="span" variant="caption" color="#94a3b8" fontWeight={700} sx={{ mr: 1 }}>INBOUND</Typography>
                      <Typography component="span" variant="body1" fontWeight={800} color="#0a4bb6">{analytics?.appointments?.inbound ?? 0}</Typography>
                    </Box>
                    <Box onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("outbound"); setFormsModalOpen("Appointments"); }} sx={{ cursor: "pointer" }}>
                      <Typography component="span" variant="caption" color="#94a3b8" fontWeight={700} sx={{ mr: 1 }}>OUTBOUND</Typography>
                      <Typography component="span" variant="body1" fontWeight={800} color="#0a4bb6">{analytics?.appointments?.outbound ?? 0}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Urgent Followups Stat Card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} onClick={() => { setFormsTypeFilter("all"); setFormsModalOpen("Followups"); }} role="button" tabIndex={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#fff7f7",
                  border: "1.5px solid #fee2e2",
                  boxShadow: "0 2px 12px rgba(220,38,38,0.04)",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 6px 20px rgba(220,38,38,0.08)" },
                  transition: "all .2s ease",
                }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={20} color="#dc2626" />
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="#dc2626" letterSpacing={1}>URGENT</Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="h2" fontWeight={800} color="#dc2626" lineHeight={1}>
                    {String(analytics?.followups ?? 0).padStart(2, "0")}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#dc2626" letterSpacing={0.5} sx={{ display: "block", mt: 1 }}>
                    PENDING FOLLOW-UP
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.8 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#dc2626" }} />
                    <Typography variant="caption" fontWeight={700} color="#dc2626" fontSize="0.68rem" letterSpacing={0.4}>
                      CRITICAL ATTENTION NEEDED
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* ── ROW 2: TOP INBOUND & OUTBOUND PURPOSE (DYNAMIC MAPPING) ── */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Top Inbound Purpose */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                    <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">Top Inbound Purpose</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5}>
                    TOTAL {analytics?.forms?.inbound ?? 0}
                  </Typography>
                </Box>

                {analytics?.topInboundPurpose && analytics.topInboundPurpose.length > 0 ? (
                  <Grid container spacing={2}>
                    {analytics.topInboundPurpose.slice(0, 6).map((item, i) => (
                      <Grid item xs={4} key={i}>
                        <Box sx={{ bgcolor: "#f8fafc", borderRadius: "24px", py: 2.5, px: 1.5, textAlign: "center" }}>
                          <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5} display="block" mb={0.5}>
                            {(item.purpose || "-").toUpperCase()}
                          </Typography>
                          <Typography variant="h3" fontWeight={800} color="#0a4bb6">
                            {String(item.count || 0).padStart(2, "0")}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="#94a3b8" textAlign="center" py={3}>No Data Found</Typography>
                )}
              </Paper>
            </Grid>

            {/* Top Outbound Purpose */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                    <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">Top Outbound Purpose</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5}>
                    GROWTH {analytics?.forms?.outbound ?? 0}
                  </Typography>
                </Box>

                {analytics?.topOutboundPurpose && analytics.topOutboundPurpose.length > 0 ? (
                  <Grid container spacing={2}>
                    {analytics.topOutboundPurpose.slice(0, 6).map((item, i) => (
                      <Grid item xs={4} key={i}>
                        <Box sx={{ bgcolor: "#f8fafc", borderRadius: "24px", py: 2.5, px: 1.5, textAlign: "center" }}>
                          <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5} display="block" mb={0.5}>
                            {(item.purpose || "-").toUpperCase()}
                          </Typography>
                          <Typography variant="h3" fontWeight={800} color="#0a4bb6">
                            {String(item.count || 0).padStart(2, "0")}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="#94a3b8" textAlign="center" py={3}>No Data Found</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ── ROW 3: REAL-TIME HOURLY CHART & LATEST APPOINTMENTS ── */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Real Call Volume by Hour (Stacked Bar Chart) */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", height: "100%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                    <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">Call Volume by Hour</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#cbd5e1" }} />
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5}>OUTBOUND</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0a4bb6" }} />
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5}>INBOUND</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ height: 280, pt: 1 }}>
                  <canvas id="hourlyChart" ref={hourlyChartRef} />
                </Box>
              </Paper>
            </Grid>

            {/* Real Latest Appointments */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                  <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">Latest Appointments</Typography>
                </Box>

                {analytics?.latestAppointment && analytics.latestAppointment.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {analytics.latestAppointment.slice(0, 6).map((apt, i) => {
                      const badge = getAppointmentBadge(apt.status);
                      const timeDisplay = apt.appointmentSlot
                        ? `${apt.appointmentSlot.start} - ${apt.appointmentSlot.end}`
                        : (apt.dateTime ? new Date(apt.dateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "-");

                      return (
                        <Box key={i} sx={{
                          p: 2,
                          borderRadius: "14px",
                          bgcolor: "#fff",
                          border: "1px solid #f1f5f9",
                          display: "flex",
                          justify: "space-between",
                          alignItems: "center",
                        }}>
                          <Box>
                            <Typography variant="body2" fontWeight={800} color="#0f172a">
                              {apt.patientName || "Unknown Patient"}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing={0.5}>
                              {apt?.doctorName ? `DR. ${apt.doctorName.toUpperCase()}` : ""}{apt?.departmentName ? ` - ${apt.departmentName}` : ""}
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="caption" fontWeight={800} color="#0a4bb6" display="block" mb={0.4}>
                              {timeDisplay}
                            </Typography>
                            <Chip
                              icon={badge.icon}
                              label={badge.label}
                              size="small"
                              sx={{
                                bgcolor: badge.bg,
                                color: badge.color,
                                fontWeight: 800,
                                fontSize: "0.65rem",
                                height: 22,
                                borderRadius: "20px",
                                px: 0.5,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="#94a3b8" textAlign="center" py={4}>No appointments found</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ── FOOTER ── */}
          <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing={0.5} sx={{ display: "block", mt: 3, mb: 1 }}>
            © {new Date().getFullYear()} INFINIS CLINICAL PRECISION
          </Typography>

          {/* ── MODALS ── */}
          {modalOpen === "profile" && <ProfilePopup onClose={() => setModalOpen(null)} />}
          {modalOpen === "announcement" && (
            <CodeAnnousementPopup selectedHostpital={selectedHostpital} selectedBranch={selectedBranch} data={codeAlertsData} onClose={() => setModalOpen(null)} refetchDashboard={refetchDashboard} />
          )}

          {/* Calls Modal */}
          {callsModalOpen && (
            <div className="executive-modal-overlay" onClick={() => setCallsModalOpen(false)}>
              <div className="executive-modal executive-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="executive-modal-header">
                  <h3>Call Details</h3>
                  <div className="executive-modal-actions">
                    <button className="executive-modal-close" onClick={() => setCallsModalOpen(false)}><CloseIcon /></button>
                  </div>
                </div>
                <div className="executive-modal-body">
                  <div className="executive-calls-filters">
                    <select value={callsDateFilter} onChange={(e) => setCallsDateFilter(e.target.value)} className="executive-calls-date-select">
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <div className="executive-calls-tabs">
                      {["all", "inbound", "outbound"].map((t) => (
                        <button key={t} className={callsTab === t ? "active" : ""} onClick={() => setCallsTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Modal */}
          <Dialog open={notesModalOpen} onClose={() => setNotesModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogContent>
              <TextField autoFocus margin="dense" label="Heading" fullWidth variant="outlined" value={newNote.heading}
                onChange={(e) => setNewNote((p) => ({ ...p, heading: e.target.value }))} sx={{ mb: 2 }} />
              <TextField margin="dense" label="Body" fullWidth multiline rows={4} variant="outlined" value={newNote.body}
                onChange={(e) => setNewNote((p) => ({ ...p, body: e.target.value }))} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNotesModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddNote} variant="contained">Add Note</Button>
            </DialogActions>
          </Dialog>

        </Box>
      )}
    </>
  );
};

export default ExecutiveDashboard;
