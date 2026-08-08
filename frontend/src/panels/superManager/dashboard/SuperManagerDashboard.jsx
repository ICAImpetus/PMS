import React, { useState, useEffect, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Box,
  Card,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  LinearProgress,
  IconButton,
  CircularProgress,
  InputBase,
  Avatar,
  Badge,
} from "@mui/material";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";
import { ProfilePopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";

// --- MUI ICONS ---
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SingleBedIcon from "@mui/icons-material/SingleBed";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { AlertTriangle } from "lucide-react";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";
import { toast } from "react-toastify";
import HospitalContext from "../../../contexts/HospitalContexts";
import { UserContextHook } from "../../../contexts/UserContexts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const categoryLabels = {
  location: "Location",
  age: "Age Group",
  gender: "Gender",
  doctor: "DOCTOR NAME",
  poc: "Purpose of Call",
};

const formatMonth = (m) =>
  m.charAt(0).toUpperCase() + m.slice(1);

const getMonthWiseData = (arr = [], months = []) => {
  return months.map((month) =>
    arr.reduce((sum, item) => sum + (item[month] || 0), 0)
  );
};

const sum = (arr = []) => arr.reduce((a, b) => a + b, 0);

const SuperManagerDashboard = () => {
  const [formsModalOpen, setFormsModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("doctor");
  const [formsTypeFilter, setFormsTypeFilter] = useState("all");

  const {
    forms,
    loading,
    analytics,
    pagination,
    setPagination,
    metrics,
    errors,
    codeAlerts,
    branches,
    hospitals,
    selectedBranch,
    selectedHostpital,
    setSelectedBranch,
    filterOptions,
    filter,
    handleFilterChange,
  } = useContext(HospitalContext);

  const { currentUser } = UserContextHook() || {};

  const page = pagination?.forms?.page || 1;
  const setPage = (newPage) => setPagination((prev) => ({ ...prev, forms: { ...prev.forms, page: newPage } }));

  const toggleModal = () => setIsTicketModalOpen(!isTicketModalOpen);

  useEffect(() => {
    const error = errors?.dashboard?.message || errors?.branches?.message;
    if (error) toast.error(error);
  }, [errors?.dashboard, errors?.branches]);

  const formsDataMap = {
    Forms: forms?.today || [],
    Followups: forms?.followups || [],
    Appointments: forms?.appointments || [],
  };

  const formsData = formsDataMap[formsModalOpen] || [];

  // User display
  const userName = currentUser?.name || currentUser?.username || "User";
  const userInitials = userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const currentHospitalObj = hospitals?.find((h) => h._id === selectedHostpital);
  const hospitalName = currentHospitalObj?.name || "Hospital";

  // Data processing for Categorization Summary
  const categoryData = analytics?.callCategorization || {};
  const currentDataa = categoryData?.[categoryType] || [];

  const months = currentDataa.length
    ? Object.keys(currentDataa[0]).filter(
        (key) => key !== "name" && key !== "activeTotal" && key !== "_id"
      )
    : [];

  const displayMonths = months.length > 0 ? months : [];

  const getTotalCount = (item) => {
    if (item.activeTotal !== undefined) return item.activeTotal;
    return displayMonths.reduce((acc, m) => acc + (item[m] || 0), 0);
  };

  // Doughnut Chart Data for Distribution
  const distributionChartData = {
    labels: currentDataa.map((d) => d.name),
    datasets: [
      {
        data: currentDataa.map((d) => getTotalCount(d)),
        backgroundColor: [
          "#1d4ed8", // Deep Blue
          "#3b82f6", // Vibrant Blue
          "#60a5fa", // Light Blue
          "#93c5fd", // Soft Sky
          "#38bdf8", // Cyan
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        cutout: "78%",
      },
    ],
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  // Call Analytics - fully dynamic from real categorization data
  const callMonths = months.length > 0 ? months : [];
  const callLabels = callMonths.map((m) => m.toUpperCase());

  const newPatientData = getMonthWiseData(
    analytics?.callCategorization?.newPatient || [],
    callMonths
  );
  const oldPatientData = getMonthWiseData(
    analytics?.callCategorization?.oldPatient || [],
    callMonths
  );
  const appointmentDataArr = getMonthWiseData(
    analytics?.callCategorization?.appointment || [],
    callMonths
  );

  const totalNew = sum(newPatientData);
  const totalOld = sum(oldPatientData);
  const totalRegistered = totalNew + totalOld;

  const callAnalyticsData = {
    labels: callLabels.length > 0 ? callLabels : ["N/A"],
    datasets: [
      {
        label: "Patient Trend",
        data: callMonths.length > 0 ? newPatientData.map((v, i) => v + (oldPatientData[i] || 0)) : [0],
        backgroundColor: "#e0e7ff",
        borderRadius: { topLeft: 6, topRight: 6 },
        barThickness: 32,
      },
      {
        label: "Call Volume",
        data: callMonths.length > 0 ? appointmentDataArr : [0],
        backgroundColor: "#1d4ed8",
        borderRadius: { topLeft: 6, topRight: 6 },
        barThickness: 32,
      },
    ],
  };

  const callAnalyticsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        stacked: true,
        ticks: { font: { size: 11, weight: "600" }, color: "#64748b" },
      },
      y: { display: false, stacked: true },
    },
  };

  // Patient category from analytics
  const patientCatRaw = analytics?.patientCategory || [];
  const patientCatTotal = patientCatRaw.reduce((s, c) => s + (c.count || 0), 0) || 1;
  const patientCategoryItems = patientCatRaw.length > 0
    ? patientCatRaw.map((c, i) => ({
        label: (c.category || c.name || "Category").toUpperCase(),
        percent: Math.round(((c.count || 0) / patientCatTotal) * 100),
        color: ["#1d4ed8", "#3b82f6", "#93c5fd", "#38bdf8", "#0ea5e9"][i % 5],
      }))
    : [
        { label: "GOVT HEALTH SCHEME", percent: analytics?.govtSchemePercent || 0, color: "#1d4ed8" },
        { label: "CASH PAYMENTS", percent: analytics?.cashPercent || 0, color: "#3b82f6" },
        { label: "INSURANCE & TPA", percent: analytics?.insurancePercent || 0, color: "#93c5fd" },
      ];

  // Operational status from analytics
  const ambulanceActive = analytics?.ambulance?.active ?? analytics?.ambulanceActive ?? "--";
  const ambulanceTotal = analytics?.ambulance?.total ?? analytics?.ambulanceTotal ?? "--";
  const ambulancePct = ambulanceTotal && ambulanceActive ? Math.round((Number(ambulanceActive) / Number(ambulanceTotal)) * 100) : 0;

  const icuOccupied = analytics?.icu?.occupied ?? analytics?.icuOccupied ?? "--";
  const icuTotal = analytics?.icu?.total ?? analytics?.icuTotal ?? "--";
  const icuPct = icuTotal && icuOccupied ? Math.round((Number(icuOccupied) / Number(icuTotal)) * 100) : 0;

  const bloodBankPct = analytics?.bloodBank?.stockPercent ?? analytics?.bloodBankPercent ?? 0;
  const erWait = analytics?.erTriage?.waitLevel ?? analytics?.erWaitLevel ?? "N/A";
  const erPct = erWait === "Low" ? 20 : erWait === "Medium" ? 55 : erWait === "High" ? 85 : 0;

  // Selected Branch
  const currentBranchObj = branches?.find((b) => b._id === selectedBranch);
  const selectedBranchName = currentBranchObj ? currentBranchObj.name : "Select Branch";

  // Distribution chart dynamic legend from currentDataa
  const doughnutColors = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#38bdf8"];
  const distributionTotal = currentDataa.reduce((s, d) => s + getTotalCount(d), 0);

  return (
    <Box
      sx={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        color: "#1e293b",
        fontFamily: "'Inter', 'Roboto', sans-serif",
      }}
    >
      {/* Loading Overlay */}
      {loading?.dashboardLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="h6" color="primary" fontWeight={600}>
            Loading Dashboard data...
          </Typography>
        </Box>
      )}

      {/* TOP NAVBAR / HEADER */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        {/* Global Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: "4px 12px",
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 380 },
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <SearchIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
          <InputBase
            sx={{ flex: 1, fontSize: "0.875rem" }}
            placeholder="Global search patient UID or Name..."
            inputProps={{ "aria-label": "search patient" }}
          />
        </Paper>

        {/* Top Right User Profile & Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton size="small" sx={{ border: "1px solid #e2e8f0", bg: "#fff" }}>
            <NotificationsNoneIcon sx={{ color: "#64748b", fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" sx={{ border: "1px solid #e2e8f0", bg: "#fff" }}>
            <SettingsIcon sx={{ color: "#64748b", fontSize: 20 }} />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              pl: 1,
            }}
          >
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b" lineHeight={1.2}>
                {hospitalName}
              </Typography>
              <Typography variant="caption" color="#64748b">
                {selectedBranchName.toUpperCase()}
              </Typography>
            </Box>
            <Avatar
              onClick={() => setProfileModalOpen(true)}
              sx={{
                bgcolor: "#1d4ed8",
                width: 36,
                height: 36,
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {userInitials}
            </Avatar>
          </Box>
        </Box>
      </Box>

      {/* HOSPITAL TITLE & BRANCH SELECTOR HEADER */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label={hospitalName.toUpperCase()}
              size="small"
              sx={{
                bgcolor: "#e0edff",
                color: "#1d4ed8",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "6px",
              }}
            />
            <Typography variant="caption" color="#64748b" fontWeight={600}>
              Status:
            </Typography>
            <Chip
              label="ACTIVE"
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#15803d",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "6px",
              }}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} color="#0f172a" sx={{ letterSpacing: "-0.5px" }}>
            Hospital Progress
          </Typography>
        </Box>

        {/* Branch Selector Dropdown & Stats */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 220 }}>
            <Select
              value={selectedBranch || ""}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={loading?.branchesLoading}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) return selectedBranchName;
                const b = branches.find((item) => item._id === selected);
                return b ? b.name : selectedBranchName;
              }}
              sx={{
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                fontWeight: 600,
                fontSize: "0.875rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e2e8f0",
                },
              }}
            >
              {branches.length === 0 && (
                <MenuItem disabled>No Branches Found</MenuItem>
              )}
              {branches.map((branch) => (
                <MenuItem key={branch._id} value={branch._id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight={800} color="#1d4ed8" lineHeight={1}>
                {branches?.length || 2}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ letterSpacing: "0.5px" }}>
                BRANCHES
              </Typography>
            </Box>
            <Box sx={{ width: "1px", height: "28px", bgcolor: "#cbd5e1" }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight={800} color="#1d4ed8" lineHeight={1}>
                {currentBranchObj?.beds || 150}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ letterSpacing: "0.5px" }}>
                BEDS
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* CODE ALERTS SECTION */}
      {codeAlerts?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {codeAlerts.map((alert, index) => {
            const hospitalName = alert?.HospitalId?.name || "Unknown Hospital";
            const branchName = alert?.BranchId?.name || "Unknown Branch";
            const city = alert?.BranchId?.branchId?.city || "";
            const codeName = alert?.code_id?.name || "Code Alert";

            return (
              <Paper
                key={alert._id || index}
                elevation={0}
                sx={{
                  backgroundColor: alert?.code_id?.color || "#fef2f2",
                  color: "#991b1b",
                  borderLeft: "5px solid #dc2626",
                  borderRadius: "12px",
                  p: 2,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <AlertTriangle size={20} color="#dc2626" />
                <Typography variant="body2" fontWeight={600}>
                  <strong>{codeName}:</strong> {codeName} raised in {hospitalName} {branchName}{" "}
                  {city && `(${city})`}. Immediate attention required.
                </Typography>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* QUICK STATS CARDS (ROW 1 - 6 CARDS) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Card 1: Total Doctors */}
        <Grid item xs={6} sm={4} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
              }}
            >
              <MedicalServicesIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#2563eb">
              {analytics?.totalDoctors ? String(analytics.totalDoctors).padStart(2, "0") : "09"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#94a3b8">
              TOTAL DOCTORS
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Total Departments */}
        <Grid item xs={6} sm={4} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#ecfeff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0891b2",
              }}
            >
              <BusinessIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0891b2">
              {analytics?.totalDepartment ? String(analytics.totalDepartment).padStart(2, "0") : "07"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#94a3b8">
              TOTAL DEPARTMENTS
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: Active Agents */}
        <Grid item xs={6} sm={4} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
              }}
            >
              <GroupIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#16a34a">
              {analytics?.totalUsers ? String(analytics.totalUsers).padStart(2, "0") : "02"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#94a3b8">
              ACTIVE AGENTS
            </Typography>
          </Paper>
        </Grid>

        {/* Card 4: Total Appointments */}
        <Grid item xs={6} sm={4} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d97706",
              }}
            >
              <EventAvailableIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#d97706">
              {analytics?.appointmentForms ? String(analytics.appointmentForms).padStart(2, "0") : "10"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#94a3b8">
              TOTAL APPOINTMENTS
            </Typography>
          </Paper>
        </Grid>

        {/* Card 5: Forms Submitted */}
        <Grid item xs={6} sm={4} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626",
              }}
            >
              <DescriptionIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#dc2626">
              {analytics?.totalForms ? String(analytics.totalForms).padStart(2, "0") : "14"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#94a3b8">
              FORMS SUBMITTED
            </Typography>
          </Paper>
        </Grid>

        {/* Card 6: Occupancy */}
        <Grid item xs={6} sm={4} md={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                bgcolor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4b5563",
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#1f2937">
              {analytics?.occupancyRate ? `${analytics.occupancyRate}%` : analytics?.totalBeds ? `${Math.round((analytics.occupiedBeds / analytics.totalBeds) * 100)}%` : "N/A"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#94a3b8">
              OCCUPANCY
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CATEGORY TOGGLE PILLS ROW */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {[
          { id: "doctor", label: "Doctor Wise" },
          { id: "gender", label: "Gender Wise" },
          { id: "age", label: "Age Wise" },
          { id: "poc", label: "Purpose of Call" },
        ].map((cat) => {
          const isActive = categoryType === cat.id;
          return (
            <Button
              key={cat.id}
              onClick={() => setCategoryType(cat.id)}
              variant={isActive ? "contained" : "outlined"}
              disableElevation
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.8125rem",
                px: 3,
                py: 0.8,
                bgcolor: isActive ? "#1d4ed8" : "#ffffff",
                color: isActive ? "#ffffff" : "#64748b",
                borderColor: isActive ? "#1d4ed8" : "#e2e8f0",
                "&:hover": {
                  bgcolor: isActive ? "#1e40af" : "#f1f5f9",
                  borderColor: isActive ? "#1e40af" : "#cbd5e1",
                },
              }}
            >
              {cat.label}
            </Button>
          );
        })}
      </Box>

      {/* SECTION: CATEGORIZATION SUMMARY & DISTRIBUTION (ROW 2) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: Categorization Summary Table */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 18,
                      bgcolor: "#1d4ed8",
                      borderRadius: "2px",
                      mr: 1.5,
                    }}
                  />
                  <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
                    Categorization Summary
                  </Typography>
                </Box>
                <Chip
                  label="Sort by: Monthly Total"
                  size="small"
                  sx={{
                    bgcolor: "#f1f5f9",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 240 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          borderBottom: "1px solid #f1f5f9",
                          bg: "#ffffff",
                        }}
                      >
                        {categoryLabels[categoryType] || "DOCTOR NAME"}
                      </TableCell>
                      {displayMonths.map((m) => (
                        <TableCell
                          key={m}
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            borderBottom: "1px solid #f1f5f9",
                            bg: "#ffffff",
                          }}
                        >
                          {m.toUpperCase()}
                        </TableCell>
                      ))}
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          borderBottom: "1px solid #f1f5f9",
                          bg: "#ffffff",
                        }}
                      >
                        ACTIVE TOTAL
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentDataa.map((row, idx) => {
                      const totalCount = getTotalCount(row);
                      return (
                        <TableRow key={idx} hover sx={{ "&:last-child td": { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.875rem" }}>
                            {row.name}
                          </TableCell>
                          {displayMonths.map((m) => (
                            <TableCell
                              key={m}
                              align="center"
                              sx={{ color: "#64748b", fontSize: "0.875rem" }}
                            >
                              {String(row[m] ?? 0).padStart(2, "0")}
                            </TableCell>
                          ))}
                          <TableCell align="right">
                            <Chip
                              label={String(totalCount).padStart(2, "0")}
                              size="small"
                              sx={{
                                bgcolor: idx === 0 ? "#1d4ed8" : idx === 4 ? "#1e3a8a" : "#dbeafe",
                                color: idx === 0 || idx === 4 ? "#ffffff" : "#1d4ed8",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                borderRadius: "6px",
                                height: 22,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box
              sx={{
                pt: 1.5,
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="caption" color="#64748b">
                New Patients: <strong>{totalNew}</strong> &nbsp;|&nbsp; Old Patients:{" "}
                <strong>{totalOld}</strong>
              </Typography>
              <Typography variant="caption" fontWeight={700} color="#1e293b">
                Total Registered Database : {totalRegistered.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Distribution Doughnut Chart */}
        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: "100%", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    bgcolor: "#1d4ed8",
                    borderRadius: "2px",
                    mr: 1.5,
                  }}
                />
                <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
                  Distribution
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                position: "relative",
                width: 180,
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                my: 1,
              }}
            >
              <Doughnut data={distributionChartData} options={distributionOptions} />
              <Box
                sx={{
                  position: "absolute",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <Typography variant="h4" fontWeight={800} color="#0f172a" lineHeight={1}>
                  {distributionTotal || "--"}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem">
                  TOTAL
                </Typography>
              </Box>
            </Box>

            {/* Dynamic Legend from real data */}
            {currentDataa.length > 0 ? (
              <Grid container spacing={1} sx={{ mt: 1, width: "100%" }}>
                {currentDataa.slice(0, 6).map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: doughnutColors[i % doughnutColors.length] }} />
                      <Box>
                        <Typography variant="caption" fontWeight={700} color="#1e293b" display="block" lineHeight={1.1}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8" fontSize="0.7rem">
                          {getTotalCount(item)} total
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="caption" color="#94a3b8" sx={{ mt: 1 }}>No data available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION: CALL ANALYTICS & PATIENT CATEGORY (ROW 3) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Box: Call Analytics */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    bgcolor: "#1d4ed8",
                    borderRadius: "2px",
                    mr: 1.5,
                  }}
                />
                <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
                  Call Analytics
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#93c5fd" }} />
                  <Typography variant="caption" fontWeight={600} color="#64748b">
                    Patient Trend
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1d4ed8" }} />
                  <Typography variant="caption" fontWeight={600} color="#64748b">
                    Call Volume
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ height: 180, mt: 2 }}>
              <Bar data={callAnalyticsData} options={callAnalyticsOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Right Box: Patient Category */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    bgcolor: "#1d4ed8",
                    borderRadius: "2px",
                    mr: 1.5,
                  }}
                />
                <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
                  Patient Category
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                {patientCategoryItems.length > 0 ? patientCategoryItems.map((item, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} color="#475569">
                        {item.label}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="#1d4ed8">
                        {item.percent}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: item.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                )) : (
                  <Typography variant="body2" color="#94a3b8">No category data available</Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 4,
                pt: 2,
                borderTop: "1px solid #f1f5f9",
                mt: 2,
              }}
            >
              <Typography variant="caption" color="#94a3b8">
                ○ NEW PATIENTS: <strong>{totalNew || 0}</strong>
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                ○ OLD PATIENTS: <strong>{totalOld || 0}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION: TOP INBOUND & OUTBOUND PURPOSE (ROW 4) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Top Inbound Purpose */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 4,
                  height: 18,
                  bgcolor: "#1d4ed8",
                  borderRadius: "2px",
                  mr: 1.5,
                }}
              />
              <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
                Top Inbound Purpose
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              {(analytics?.topInboundPurpose && analytics.topInboundPurpose.length > 0
                ? analytics.topInboundPurpose
                : [
                    { purpose: "APPOINTMENTS", count: 9 },
                    { purpose: "SURGERY", count: 1 },
                    { purpose: "OPD TIMINGS", count: 1 },
                  ]
              ).map((item, idx) => (
                <Grid item xs={4} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h4" fontWeight={800} color="#1d4ed8">
                      {String(item.count || 0).padStart(2, "0")}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem">
                      {item.purpose?.toUpperCase() || "PURPOSE"}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Top Outbound Purpose */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 4,
                  height: 18,
                  bgcolor: "#1d4ed8",
                  borderRadius: "2px",
                  mr: 1.5,
                }}
              />
              <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
                Top Outbound Purpose
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              {(analytics?.topOutboundPurpose && analytics.topOutboundPurpose.length > 0
                ? analytics.topOutboundPurpose
                : [
                    { purpose: "FOLLOW-UP / FEEDBACK", count: 1 },
                    { purpose: "APPOINTMENT REMINDERS", count: 1 },
                    { purpose: "HEALTH CAMPS", count: 0 },
                  ]
              ).map((item, idx) => (
                <Grid item xs={4} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h4" fontWeight={800} color="#1d4ed8">
                      {String(item.count || 0).padStart(2, "0")}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem">
                      {item.purpose?.toUpperCase() || "PURPOSE"}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION: OPERATIONAL STATUS & RESOURCE ALLOCATION (ROW 5) */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 4,
                height: 18,
                bgcolor: "#1d4ed8",
                borderRadius: "2px",
                mr: 1.5,
              }}
            />
            <Typography variant="h6" fontWeight={700} color="#0f172a" fontSize="1rem">
              Operational Status & Resource Allocation
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1d4ed8" }} />
            <Typography variant="caption" fontWeight={700} color="#1d4ed8">
              LIVE FLEET STATUS
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Card 1: Ambulance */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#e0edff",
                    color: "#1d4ed8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AirportShuttleIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="caption" color="#94a3b8" fontWeight={600}>
                  Ambulance
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ my: 1 }}>
                {ambulanceActive} / {ambulanceTotal}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={ambulancePct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#cbd5e1",
                  mb: 1,
                  "& .MuiLinearProgress-bar": { bgcolor: "#1d4ed8", borderRadius: 3 },
                }}
              />
              <Typography variant="caption" fontWeight={700} color="#1d4ed8" fontSize="0.65rem">
                ACTIVE TRANSPORTS
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2: ICU Capacity */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#e0f2fe",
                    color: "#0284c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SingleBedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="caption" color="#94a3b8" fontWeight={600}>
                  ICU Capacity
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ my: 1 }}>
                {icuOccupied} / {icuTotal}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={icuPct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#cbd5e1",
                  mb: 1,
                  "& .MuiLinearProgress-bar": { bgcolor: "#0284c7", borderRadius: 3 },
                }}
              />
              <Typography variant="caption" fontWeight={700} color="#0284c7" fontSize="0.65rem">
                BEDS OCCUPIED
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: Blood Bank */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#f1f5f9",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WaterDropIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="caption" color="#94a3b8" fontWeight={600}>
                  Blood Bank
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ my: 1 }}>
                {bloodBankPct ? `${bloodBankPct}%` : "N/A"}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={typeof bloodBankPct === "number" ? bloodBankPct : 0}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#cbd5e1",
                  mb: 1,
                  "& .MuiLinearProgress-bar": { bgcolor: "#475569", borderRadius: 3 },
                }}
              />
              <Typography variant="caption" fontWeight={700} color="#64748b" fontSize="0.65rem">
                STOCK LEVEL
              </Typography>
            </Paper>
          </Grid>

          {/* Card 4: ER Triage */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "#fef2f2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="caption" color="#94a3b8" fontWeight={600}>
                  ER Triage
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ my: 1 }}>
                {erWait}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={erPct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#cbd5e1",
                  mb: 1,
                  "& .MuiLinearProgress-bar": { bgcolor: "#dc2626", borderRadius: 3 },
                }}
              />
              <Typography variant="caption" fontWeight={700} color="#dc2626" fontSize="0.65rem">
                CURRENT WAIT TIME
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* FOOTER */}
      <Box
        sx={{
          pt: 2,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="caption" color="#94a3b8" fontWeight={600}>
          © 2026 CLINICAL PRECISION V2.4.0 INTELLIGENCE ARCHITECTURE
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Typography variant="caption" color="#64748b" fontWeight={700} sx={{ cursor: "pointer" }}>
            SYSTEM STATUS
          </Typography>
          <Typography variant="caption" color="#64748b" fontWeight={700} sx={{ cursor: "pointer" }}>
            ADMIN PRIVACY
          </Typography>
          <Typography variant="caption" color="#64748b" fontWeight={700} sx={{ cursor: "pointer" }}>
            EXPORT LOGS
          </Typography>
        </Box>
      </Box>

      {/* TICKET CREATION MODAL */}
      {isTicketModalOpen && (
        <Box className="modal-overlay">
          <Box className="modal-content">
            <Box className="modal-header">
              <Typography variant="h6" fontWeight={700}>
                Create New Ticket
              </Typography>
              <button className="close-btn" onClick={toggleModal}>
                ×
              </button>
            </Box>
            <Box className="modal-body">
              <label>Ticket Title</label>
              <input type="text" className="input-field" />
              <label>Description</label>
              <textarea className="input-field" rows="3"></textarea>
              <label>Department</label>
              <select className="input-field">
                <option>IT Support</option>
                <option>HR</option>
              </select>
              <label>Priority</label>
              <select className="input-field">
                <option>Low</option>
                <option>High</option>
              </select>
            </Box>
            <Box className="modal-footer">
              <button className="btn-secondary" onClick={toggleModal}>
                Cancel
              </button>
              <button className="btn-primary">Create</button>
            </Box>
          </Box>
        </Box>
      )}

      {/* FILLED FORMS MODAL */}
      {formsModalOpen && (
        <FilledFormsComponent
          selectedBranch={selectedBranch}
          selectedHostpital={selectedHostpital}
          formsModalOpen={formsModalOpen}
          setFormsModalOpen={setFormsModalOpen}
          formsData={formsData}
          formsLoading={loading?.dashboardLoading}
          formsTypeFilter={formsTypeFilter}
          setFormsTypeFilter={setFormsTypeFilter}
          page={page}
          setPage={setPage}
          totalPages={metrics?.pagination?.totalPages}
        />
      )}

      {/* PROFILE MODAL */}
      {profileModalOpen && (
        <ProfilePopup
          user={currentUser}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </Box>
  );
};

export default SuperManagerDashboard;

