import React, { useContext, useEffect, useMemo, useState } from "react";
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import {
  TextField, Button, CircularProgress, MenuItem,
  FormControl, Select, Dialog, DialogTitle,
  Typography, DialogContent, DialogActions, Grid,
  Box, Paper, Chip, Avatar, IconButton, LinearProgress
} from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PhoneMissedIcon from "@mui/icons-material/PhoneMissed";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HospitalContext from "../../../contexts/HospitalContexts";
import { UserContextHook } from "../../../contexts/UserContexts";
import SectionLoader from "../../../components/SectionLoader";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";
import NotificationCenter from "../../../components/NotificationCenter";
import { ProfilePopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import { toast } from "react-toastify";

const chartColors = ["#0a4bb6", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

const TeamDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [formsModalOpen, setFormsModalOpen] = useState(null);
  const [formsTypeFilter, setFormsTypeFilter] = useState("all");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentUser } = UserContextHook();

  const {
    loading,
    analytics,
    codeAlerts,
    branches,
    selectedBranch,
    selectedHostpital,
    setSelectedBranch,
    filter,
    filterOptions,
    refetchDashboard,
    refetchUsers,
    dateRange,
    handleFilterChange,
  } = useContext(HospitalContext);

  const openAssignModal = () => setIsModalOpen(true);
  const closeAssignModal = () => setIsModalOpen(false);

  const handleAssignTask = (e) => {
    e.preventDefault();
    toast.success("Task assigned successfully");
    closeAssignModal();
  };

  const currentBranch = branches?.find((b) => b._id === selectedBranch);
  const branchLabel = currentBranch?.name || (branches?.[0]?.name ?? "Branch");
  const hospitalName = currentUser?.hospitals?.[0]?.hospitalId?.name || selectedHostpital?.name || "Hospital";

  // ── PREPARE PRODUCTIVITY BAR DATA (STRICTLY REAL DYNAMIC DATA) ──
  const productivityBarData = useMemo(() => {
    const hourly = analytics?.hourlyStats || [];
    const hasData = hourly.length > 0;

    const labels = hasData
      ? hourly.map((h) => `${String(h.hour).padStart(2, "0")}:00`)
      : ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

    const actualData = hasData
      ? hourly.map((h) => (h.inbound || 0) + (h.outbound || 0))
      : [0, 0, 0, 0, 0, 0];

    const targetData = hasData
      ? hourly.map((h) => h.target ?? Math.round(((h.inbound || 0) + (h.outbound || 0)) * 1.2))
      : [0, 0, 0, 0, 0, 0];

    return {
      labels,
      datasets: [
        {
          label: "Target",
          data: targetData,
          backgroundColor: "#cbd5e1",
          borderRadius: 6,
          barThickness: 10,
        },
        {
          label: "Actual",
          data: actualData,
          backgroundColor: "#0a4bb6",
          borderRadius: 6,
          barThickness: 10,
        },
      ],
    };
  }, [analytics?.hourlyStats]);

  // ── PREPARE DOUGHNUT DATA ──
  const outboundDoughnutData = useMemo(() => {
    if (!analytics?.topOutboundPurpose?.length) return null;
    return {
      labels: analytics.topOutboundPurpose.map(p => p.purpose),
      datasets: [
        {
          data: analytics.topOutboundPurpose.map(p => p.count),
          backgroundColor: chartColors,
          borderWidth: 0,
        },
      ],
    };
  }, [analytics?.topOutboundPurpose]);

  const inboundDoughnutData = useMemo(() => {
    if (!analytics?.topInboundPurpose?.length) return null;
    return {
      labels: analytics.topInboundPurpose.map(p => p.purpose),
      datasets: [
        {
          data: analytics.topInboundPurpose.map(p => p.count),
          backgroundColor: chartColors,
          borderWidth: 0,
        },
      ],
    };
  }, [analytics?.topInboundPurpose]);

  // ── CONNECTION STATUS PERCENTAGES ──
  const statusMap = useMemo(() => {
    const map = { connected: 0, "call-drop": 0, "not connected": 0 };
    if (analytics?.connectionStatus) {
      analytics.connectionStatus.forEach(item => {
        const key = item.status?.toLowerCase();
        if (map[key] !== undefined) {
          map[key] = item.count;
        }
      });
    }
    return map;
  }, [analytics?.connectionStatus]);

  const totalStatusCount = statusMap.connected + statusMap["call-drop"] + statusMap["not connected"];
  const getPercent = (count) => totalStatusCount > 0 ? Math.round((count / totalStatusCount) * 100) : 0;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 10, weight: "700" }, color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: { font: { size: 10, weight: "600" }, color: "#94a3b8" },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
    },
  };

  if (loading?.dashboardLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <SectionLoader height="60vh" message="Loading dashboard data..." />
      </Box>
    );
  }

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

          {/* ── TOP HEADER SEARCH & USER BAR ── */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {/* Search Input Box */}
            <TextField
              size="small"
              placeholder="Global search patient UID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />,
              }}
              sx={{
                width: { xs: "100%", md: 450 },
                bgcolor: "#fff",
                borderRadius: "50px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                  px: 2,
                  py: 0.5,
                  fontSize: "0.875rem",
                  "& fieldset": { borderColor: "#e2e8f0" },
                },
              }}
            />

            {/* User Info & Icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Functional Notification Bell */}
              <NotificationCenter />

              {/* <IconButton size="small" onClick={() => setProfileModalOpen(true)} sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", p: 1 }}>
                <SettingsIcon sx={{ fontSize: 18, color: "#475569" }} />
              </IconButton> */}

              {/* Profile Box - Clicking triggers Profile Dialog */}
              <Box onClick={() => setProfileModalOpen(true)} sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: "50px", py: 0.5, px: 2, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" } }}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={800} color="#0f172a" fontSize="0.8rem">
                    {hospitalName}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem">
                    {branchLabel.toUpperCase()}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#0a4bb6", fontSize: "0.8rem", fontWeight: 800 }}>
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "TL"}
                </Avatar>
              </Box>
            </Box>
          </Box>

          {/* ── GREETING TITLE SECTION ── */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ fontSize: { xs: "1.5rem", md: "1.85rem" } }}>
              Good Morning, {currentUser?.name || "Team Leader"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              <Typography variant="body2" fontWeight={600} color="#64748b" fontSize="0.85rem">
                {hospitalName}, {branchLabel}
              </Typography>
            </Box>
          </Box>

          {/* ── FILTER CONTAINER CARD ── */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              {/* Left Controls */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {/* Date Range Select */}
                <Box>
                  <Typography variant="caption" fontWeight={800} color="#94a3b8" display="block" mb={0.5} letterSpacing={0.5}>
                    DATE RANGE
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={filter?.value || filter || "today"}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      sx={{
                        borderRadius: "50px",
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#1e293b",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0a4bb6", borderWidth: "1.5px" },
                      }}
                    >
                      {filterOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.key}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Branch Select */}
                <Box>
                  <Typography variant="caption" fontWeight={800} color="#94a3b8" display="block" mb={0.5} letterSpacing={0.5}>
                    BRANCH
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <Select
                      value={selectedBranch || ""}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: "50px",
                        bgcolor: "#f8fafc",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#1e293b",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0a4bb6", borderWidth: "1.5px" },
                      }}
                    >
                      <MenuItem value="" disabled>
                        {branches?.length === 0 ? "No Branches Assigned" : "Select Branch"}
                      </MenuItem>
                      {branches?.map((b) => (
                        <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Right Action Buttons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: { xs: 1, sm: 0 } }}>
                <Button
                  size="small"
                  onClick={async () => { await Promise.all([refetchDashboard(), refetchUsers()]); }}
                  startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: "50px",
                    bgcolor: "#cbd5e1",
                    color: "#334155",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    "&:hover": { bgcolor: "#94a3b8", color: "#fff" },
                  }}
                >
                  Refresh
                </Button>

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
                  Go to Forms
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* ── CODE ALERTS ── */}
          {codeAlerts?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {codeAlerts.map((alert, index) => {
                const hName = alert?.HospitalId?.name || "Unknown Hospital";
                const bName = alert?.BranchId?.name || "Unknown Branch";
                const city = alert?.BranchId?.branchId?.city || "";
                const codeName = alert?.code_id?.name || "Code Alert";
                return (
                  <Paper key={alert._id || index} elevation={0} sx={{ bgcolor: alert?.code_id?.color || "#fef2f2", borderLeft: "4px solid #dc2626", borderRadius: "14px", p: 1.5, mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                      {codeName}: <span style={{ fontWeight: 400 }}>{codeName} raised in {hName} {bName} {city && `(${city})`}. Immediate attention required.</span>
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* ── MAIN DASHBOARD GRID (8 / 4 LAYOUT WITH EQUAL HEIGHT CARDS) ── */}
          <Grid container spacing={2.5}>

            {/* ── LEFT COLUMN (8 UNITS) ── */}
            <Grid item xs={12} lg={8} sx={{ display: "flex", flexDirection: "column" }}>

              {/* CARD 1: TEAM PRODUCTIVITY TRENDS */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", mb: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                    <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">
                      Team Productivity Trends
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#cbd5e1" }} />
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5}>Target</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0a4bb6" }} />
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5}>Actual</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ height: 210, pt: 1 }}>
                  <Bar data={productivityBarData} options={barOptions} />
                </Box>
              </Paper>

              {/* ROW 2: TOP OUTBOUND PURPOSE & CONNECTION STATUS */}
              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                {/* Top Outbound Purpose */}
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">
                        TOP OUTBOUND PURPOSE
                      </Typography>
                    </Box>

                    {outboundDoughnutData ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: 160, mt: 1 }}>
                        <Box sx={{ width: 120, height: 120, position: "relative" }}>
                          <Doughnut data={outboundDoughnutData} options={doughnutOptions} />
                          <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="caption" fontWeight={800} color="#0f172a">PURPOSE</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, overflowY: "auto", maxHeight: 150 }}>
                          {analytics.topOutboundPurpose.map((item, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: chartColors[idx % chartColors.length] }} />
                              <Typography variant="caption" fontWeight={700} color="#334155">
                                {item.purpose || "-"}: <strong>{item.count || 0}</strong>
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="#94a3b8" textAlign="center" py={4}>No Data Are Found</Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Connection Status */}
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                      <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">
                        CONNECTION STATUS
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={700} color="#334155">Connected</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {statusMap.connected} ({getPercent(statusMap.connected)}%)
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PhoneMissedIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={700} color="#334155">Call Drop</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {statusMap["call-drop"]} ({getPercent(statusMap["call-drop"])}%)
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <SpeakerNotesIcon sx={{ color: "#ca8a04", fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={700} color="#334155">Not Connected</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          {statusMap["not connected"]} ({getPercent(statusMap["not connected"])}%)
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" fontWeight={600} color="#94a3b8" textAlign="center" display="block" mt={2.5}>
                      Monitoring live traffic...
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* ROW 3: TOP INBOUND PURPOSE & ACTIVE CALLING AGENTS */}
              <Grid container spacing={2.5} sx={{ flexGrow: 1 }}>
                {/* Top Inbound Purpose */}
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">
                        TOP INBOUND PURPOSE
                      </Typography>
                    </Box>

                    {inboundDoughnutData ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: 160, mt: 1 }}>
                        <Box sx={{ width: 120, height: 120, position: "relative" }}>
                          <Doughnut data={inboundDoughnutData} options={doughnutOptions} />
                          <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="caption" fontWeight={800} color="#0f172a">PURPOSE</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, overflowY: "auto", maxHeight: 150 }}>
                          {analytics.topInboundPurpose.map((item, idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: chartColors[idx % chartColors.length] }} />
                              <Typography variant="caption" fontWeight={700} color="#334155">
                                {item.purpose || "-"}: <strong>{item.count || 0}</strong>
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="#94a3b8" textAlign="center" py={4}>No Data Are Found</Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Active Calling Agents / Team Overview */}
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">
                        ACTIVE CALLING AGENTS
                      </Typography>
                    </Box>

                    {analytics?.teamOverview && analytics.teamOverview.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 180, overflowY: "auto" }}>
                        {analytics.teamOverview.map((item, idx) => {
                          const name = item?.agentName || "Agent";
                          const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                          return (
                            <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: "12px", bgcolor: "#f8fafc" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: "#dbeafe", color: "#0a4bb6", fontSize: "0.75rem", fontWeight: 800 }}>
                                  {initials}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={800} color="#0f172a">{name}</Typography>
                                  <Chip label="Active Agent" size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800, bgcolor: "#e2e8f0", color: "#475569", p: 0 }} />
                                </Box>
                              </Box>
                              <Typography variant="caption" fontWeight={800} color="#0a4bb6">
                                {item?.totalCalls || 0} Forms
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="#94a3b8" textAlign="center" py={4}>No team member has submitted any forms yet.</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

            </Grid>

            {/* ── RIGHT COLUMN (4 UNITS) ── */}
            <Grid item xs={12} lg={4} sx={{ display: "flex", flexDirection: "column" }}>

              {/* 2X2 STAT CARDS GRID - STRICTLY EQUAL 1:1 UNIFORM SIZE */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {/* Stat 1: AGENTS */}
                <Grid item xs={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} onClick={() => navigate("/user-management", { replace: true })}
                    sx={{
                      p: 2.5,
                      width: "100%",
                      height: "100%",
                      minHeight: 140,
                      borderRadius: "20px",
                      bgcolor: "#fff",
                      border: "1px solid #edf2f7",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      alignItems: "center",
                      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
                    }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PeopleIcon sx={{ fontSize: 20, color: "#0a4bb6" }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight={800} color="#0a4bb6" lineHeight={1}>
                        {analytics?.totalAgents || 0}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5} display="block" mt={0.5}>
                        AGENTS
                      </Typography>
                    </Box>
                    {/* Spacer for vertical layout equality */}
                    <Box sx={{ minHeight: 18 }} />
                  </Paper>
                </Grid>

                {/* Stat 2: FORMS */}
                <Grid item xs={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} onClick={() => { setFormsTypeFilter("all"); setFormsModalOpen("Forms"); }}
                    sx={{
                      p: 2.5,
                      width: "100%",
                      height: "100%",
                      minHeight: 140,
                      borderRadius: "20px",
                      bgcolor: "#fff",
                      border: "1px solid #edf2f7",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      alignItems: "center",
                      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
                    }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DescriptionIcon sx={{ fontSize: 20, color: "#0a4bb6" }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight={800} color="#0a4bb6" lineHeight={1}>
                        {analytics?.forms?.total || 0}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5} display="block" mt={0.5}>
                        FORMS
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, minHeight: 18 }}>
                      <Typography variant="caption" fontSize="0.62rem" fontWeight={700} color="#94a3b8" onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("inbound"); setFormsModalOpen("Forms"); }}>
                        INBOUND <strong style={{ color: "#0a4bb6" }}>{analytics?.forms?.inbound || 0}</strong>
                      </Typography>
                      <Typography variant="caption" fontSize="0.62rem" fontWeight={700} color="#94a3b8" onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("outbound"); setFormsModalOpen("Forms"); }}>
                        OUTBOUND <strong style={{ color: "#0a4bb6" }}>{analytics?.forms?.outbound || 0}</strong>
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Stat 3: APPOINTMENTS */}
                <Grid item xs={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} onClick={() => { setFormsTypeFilter("all"); setFormsModalOpen("Appointments"); }}
                    sx={{
                      p: 2.5,
                      width: "100%",
                      height: "100%",
                      minHeight: 140,
                      borderRadius: "20px",
                      bgcolor: "#fff",
                      border: "1px solid #edf2f7",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      alignItems: "center",
                      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
                    }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <EventIcon sx={{ fontSize: 20, color: "#0a4bb6" }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight={800} color="#0a4bb6" lineHeight={1}>
                        {analytics?.appointments?.total || 0}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing={0.5} display="block" mt={0.5}>
                        APPOINTMENTS
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, minHeight: 18 }}>
                      <Typography variant="caption" fontSize="0.62rem" fontWeight={700} color="#94a3b8" onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("inbound"); setFormsModalOpen("Appointments"); }}>
                        INBOUND <strong style={{ color: "#0a4bb6" }}>{analytics?.appointments?.inbound || 0}</strong>
                      </Typography>
                      <Typography variant="caption" fontSize="0.62rem" fontWeight={700} color="#94a3b8" onClick={(e) => { e.stopPropagation(); setFormsTypeFilter("outbound"); setFormsModalOpen("Appointments"); }}>
                        OUTBOUND <strong style={{ color: "#0a4bb6" }}>{analytics?.appointments?.outbound || 0}</strong>
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Stat 4: PENDING FOLLOW UP */}
                <Grid item xs={6} sx={{ display: "flex" }}>
                  <Paper elevation={0} onClick={() => { setFormsTypeFilter("all"); setFormsModalOpen("Followups"); }}
                    sx={{
                      p: 2.5,
                      width: "100%",
                      height: "100%",
                      minHeight: 140,
                      borderRadius: "20px",
                      bgcolor: "#fff7f7",
                      border: "1.5px solid #fee2e2",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      alignItems: "center",
                      "&:hover": { boxShadow: "0 4px 16px rgba(220,38,38,0.08)" }
                    }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AlertTriangle size={18} color="#dc2626" />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight={800} color="#dc2626" lineHeight={1}>
                        {String(analytics?.followups || 0).padStart(2, "0")}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="#dc2626" letterSpacing={0.5} display="block" mt={0.5}>
                        PENDING FOLLOW UP
                      </Typography>
                    </Box>
                    {/* Spacer for vertical layout equality */}
                    <Box sx={{ minHeight: 18 }} />
                  </Paper>
                </Grid>
              </Grid>

              {/* CARD BELOW STAT GRID: LEAD SOURCES */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: "#fff", border: "1px solid #edf2f7", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: "#0a4bb6", borderRadius: "2px" }} />
                    <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.05rem">
                      LEAD SOURCES
                    </Typography>
                  </Box>

                  {analytics?.topReference && analytics.topReference.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {analytics.topReference.map((item, i) => {
                        const totalRef = analytics.topReference.reduce((s, r) => s + (r.count || 0), 0);
                        const percent = totalRef > 0 ? Math.round(((item.count || 0) / totalRef) * 100) : 0;
                        return (
                          <Box key={i}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                              <Typography variant="body2" fontWeight={700} color="#334155">
                                {item.reference || "Other"}
                              </Typography>
                              <Typography variant="body2" fontWeight={800} color="#0a4bb6">
                                {item.count || 0} ({percent}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: "#f1f5f9",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 4,
                                  bgcolor: chartColors[i % chartColors.length],
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#94a3b8" textAlign="center" py={4}>No Data Are Found</Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 3, opacity: 0.25 }}>
                  <SignalCellularAltIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
                </Box>
              </Paper>

            </Grid>
          </Grid>

          {/* ── ASSIGN TASK MODAL ── */}
          <Dialog open={isModalOpen} onClose={closeAssignModal} maxWidth="xs" fullWidth>
            <DialogTitle>Assign Task</DialogTitle>
            <form onSubmit={handleAssignTask}>
              <DialogContent>
                <Typography variant="body2" mb={1} fontWeight={600}>Select Agent:</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select displayEmpty defaultValue="">
                    <MenuItem value="" disabled>Select an agent</MenuItem>
                    {analytics?.teamOverview?.map((m, idx) => (
                      <MenuItem key={idx} value={m.agentName}>{m.agentName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Notes (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add any specific instructions..."
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={closeAssignModal}>Cancel</Button>
                <Button type="submit" variant="contained">Assign</Button>
              </DialogActions>
            </form>
          </Dialog>

        </Box>
      )}

      {profileModalOpen && (
        <ProfilePopup
          user={currentUser}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default TeamDashboard;
