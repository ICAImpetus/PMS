import React, { useState, useEffect, useContext } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Card,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";
import UsersCard from "../../../components/UserCard";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SectionLoader from "../../../components/SectionLoader";
import { UserContextHook } from "../../../contexts/UserContexts";
import HospitalContext from "../../../contexts/HospitalContexts";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: "#94a3b8", font: { size: 10, weight: "600" } },
    },
    y: {
      display: false,
    },
  },
};

const filterOptions = [
  { key: "Last 30 Days", value: "last30" },
  { key: "Today", value: "today" },
  { key: "Yesterday", value: "yesterday" },
  { key: "Last 7 Days", value: "last7" },
  { key: "Last 3 Month", value: "last3M" },
];

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const SuperAdminDashboard = () => {
  const { currentUser } = UserContextHook();
  const [formsModalOpen, setFormsModalOpen] = useState(false);
  const [formsTypeFilter, setFormsTypeFilter] = useState("all");

  const {
    hospitals,
    forms,
    loading,
    analytics,
    selectedHostpital,
    filter,
    errors,
    codeAlerts,
    handleFilterChange,
    setSelectedHostpital,
    dateRange,
  } = useContext(HospitalContext);

  const navigate = useNavigate();

  const appointmentData = analytics?.callCategorization?.appointment || [];
  const newPatientData = analytics?.callCategorization?.newPatient || [];

  const labels = newPatientData.length
    ? newPatientData.map((item) => item.month)
    : ["JAN", "FEB", "MAR", "APR"];

  const appointmentChartData = appointmentData.map(
    (item) => item.appointment || 0
  );
  const newPatientChartData = newPatientData.map(
    (item) => item.newPatients || 0
  );

  const totalNew = sum(newPatientChartData);

  const data = {
    labels,
    datasets: [
      {
        label: "Appointments",
        data: appointmentChartData.length ? appointmentChartData : [80, 75, 95, 110],
        backgroundColor: "#0256E8",
        borderRadius: 4,
        barThickness: 24,
      },
      {
        label: "New Patients",
        data: newPatientChartData.length ? newPatientChartData : [45, 50, 55, 65],
        backgroundColor: "#93C5FD",
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const patientTrendData = {
    labels: ["SEP", "OCT", "NOV"],
    datasets: [
      {
        label: "Active",
        data: [40, 55, 65],
        backgroundColor: "#0256E8",
        borderRadius: 4,
        barThickness: 32,
      },
      {
        label: "Pending",
        data: [20, 25, 20],
        backgroundColor: "#93C5FD",
        borderRadius: 4,
        barThickness: 32,
      },
      {
        label: "Closed",
        data: [15, 10, 15],
        backgroundColor: "#E2E8F0",
        borderRadius: 4,
        barThickness: 32,
      },
    ],
  };

  const patientTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, display: false },
    },
  };

  useEffect(() => {
    const error =
      errors?.dashError || errors?.hospitalsError || errors?.formsError;
    if (error) {
      toast.error(error);
    }
  }, [errors]);

  if (loading?.dashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DashboardIcon sx={{ mr: 1 }} /> Dashboard
        </Typography>
        <SectionLoader height="60vh" message="Loading dashboard data..." />
      </Box>
    );
  }

  return (
    <>
      {formsModalOpen ? (
        <FilledFormsComponent
          selectedHostpital={selectedHostpital}
          formsModalOpen={formsModalOpen}
          setFormsModalOpen={setFormsModalOpen}
          formsTypeFilter={formsTypeFilter}
          setFormsTypeFilter={setFormsTypeFilter}
          dateRange={dateRange}
        />
      ) : (
        <Box sx={{ backgroundColor: "#F8FAFC", minHeight: "100vh", p: 3.5 }}>
          {/* --- TOP HEADER NAVIGATION & FILTERS --- */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label="CURRENTLY OPERATING: GINNI DEVI HOSPITAL"
                size="small"
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#0256E8",
                  fontWeight: 800,
                  fontSize: "10px",
                  letterSpacing: "0.5px",
                  px: 0.5,
                }}
              />
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControl size="small">
                <Select
                  value={filter || "last30"}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  sx={{
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748B",
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #E2E8F0" },
                  }}
                >
                  {filterOptions.map((opt) => (
                    <MenuItem key={opt.key} value={opt.value}>
                      {opt.key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select
                  value={selectedHostpital}
                  onChange={(e) => setSelectedHostpital(e.target.value)}
                  disabled={loading?.hospitalsLoading}
                  displayEmpty
                  sx={{
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748B",
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #E2E8F0" },
                  }}
                >
                  {loading?.hospitalsLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                    </MenuItem>
                  ) : hospitals.length > 0 ? (
                    hospitals.map((hospital) => (
                      <MenuItem key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">No hospitals Assigned</MenuItem>
                  )}
                </Select>
              </FormControl>

              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.6,
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="caption" sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                  ACTIVE HOSPITALS
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 900, color: "#0256E8" }}>
                  {hospitals.length || 12} <span style={{ color: "#0256E8" }}>•</span>
                </Typography>
              </Box>

              <IconButton
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  width: 38,
                  height: 38,
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <NotificationsNoneOutlinedIcon sx={{ color: "#64748B", fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* --- GREETING TITLE --- */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ letterSpacing: "-0.5px" }}>
              Good Morning{" "}
              <span style={{ color: "#0256E8" }}>
                {currentUser?.name || "Ayuksha"}
              </span>
            </Typography>
            <Typography variant="body2" color="#64748B" fontWeight={500} sx={{ mt: 0.5 }}>
              Real-time facility orchestration and predictive diagnostics.
            </Typography>
          </Box>

          {/* --- CODE ALERTS --- */}
          {codeAlerts?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {codeAlerts.map((alert, index) => {
                const hospitalName = alert?.HospitalId?.name || "Unknown Hospital";
                const branchName = alert?.BranchId?.name || "Unknown Branch";
                const city = alert?.BranchId?.branchId?.city || "";
                const codeName = alert?.code_id?.name || "Code Alert";

                return (
                  <Box
                    key={alert._id || index}
                    sx={{
                      backgroundColor: alert?.code_id?.color || "#FEF2F2",
                      color: "#991B1B",
                      borderLeft: "5px solid #EF4444",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      mb: 1.5,
                    }}
                  >
                    <AlertTriangle size={20} color="#EF4444" />
                    <Typography variant="body2" fontWeight={600}>
                      {codeName}: {codeName} raised in {hospitalName} {branchName}{" "}
                      {city && `(${city})`}. Immediate attention required.
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* --- KPI METRIC STRIP --- */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <UsersCard
                label="USERS"
                count={analytics?.totalUsers || "1,284"}
                onClick={() =>
                  navigate("/user-management", {
                    replace: true,
                    state: { selectedHostpital },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <UsersCard
                label="BRANCHES"
                count={analytics?.totalBranches || "13"}
                onClick={() => {
                  const selectedHospitalData = hospitals.find(
                    (h) => h._id === selectedHostpital
                  );
                  navigate(
                    `/hospital-management/edit-branches/${selectedHostpital}`,
                    {
                      replace: true,
                      state: {
                        hospital: {
                          name: selectedHospitalData?.name,
                          hospitalCode: selectedHospitalData?.hospitalCode,
                          contact: selectedHospitalData?.contact,
                          hospitallogo: selectedHospitalData?.hospitallogo,
                        },
                      },
                    }
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <UsersCard
                label="APPOINTMENTS FLOW"
                count={analytics?.appointments?.total || "462"}
                onClick={() => {
                  setFormsTypeFilter("all");
                  setFormsModalOpen("Appointments");
                }}
                option={{
                  inbound: analytics?.appointments?.inbound || 289,
                  outbound: analytics?.appointments?.outbound || 173,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <UsersCard
                label="FORMS"
                count={analytics?.forms?.total || "1,024"}
                onClick={() => {
                  setFormsTypeFilter("all");
                  setFormsModalOpen("Forms");
                }}
                option={{
                  inbound: analytics?.forms?.inbound || 842,
                  outbound: analytics?.forms?.outbound || 182,
                }}
              />
            </Grid>
          </Grid>

          {/* --- MIDDLE SECTION: HOSPITAL ACTIVITY & PURPOSE BREAKDOWN --- */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Bar Chart */}
            <Grid item xs={12} md={8}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  p: 3.5,
                  border: "1px solid #E2E8F0",
                  height: "100%",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="#0F172A">
                      Hospital Activity
                    </Typography>
                    <Typography variant="caption" color="#64748B" fontWeight={500}>
                      Month-wise analysis of new patients and appointments
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2.5}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0256E8" }} />
                      <Typography variant="caption" fontWeight={800} color="#64748B" fontSize="10px">
                        APPOINTMENTS
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#93C5FD" }} />
                      <Typography variant="caption" fontWeight={800} color="#64748B" fontSize="10px">
                        PATIENTS
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ width: "100%", height: "240px", pt: 1 }}>
                  <Bar data={data} options={chartOptions} />
                </Box>
              </Card>
            </Grid>

            {/* Inbound & Outbound Purpose Cards */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                {/* Top Inbound Purpose */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    p: 3,
                    border: "1px solid #E2E8F0",
                    bgcolor: "#FFFFFF",
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#0256E8"
                      sx={{ letterSpacing: "0.5px" }}
                    >
                      TOP INBOUND PURPOSE
                    </Typography>
                    <Typography variant="h6" fontWeight={900} color="#0F172A">
                      {analytics?.appointments?.inbound || "1,482"}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {(analytics?.topInboundPurpose?.length
                      ? analytics.topInboundPurpose
                      : [
                        { purpose: "General Query", count: 542 },
                        { purpose: "OPD Timings", count: 380 },
                        { purpose: "Surgery", count: 215 },
                        { purpose: "Diagnosis or Test Price", count: 145 },
                      ]
                    ).map((item, i) => (
                      <Box key={i}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="#334155">
                            {item?.purpose}
                          </Typography>
                          <Typography variant="caption" fontWeight={800} color="#0256E8">
                            {item?.count} Calls
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((item?.count / 600) * 100, 100)}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: "#F1F5F9",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#0256E8",
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>

                {/* Top Outbound Purpose */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    p: 3,
                    border: "1px solid #E2E8F0",
                    bgcolor: "#FFFFFF",
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#0256E8"
                      sx={{ letterSpacing: "0.5px" }}
                    >
                      TOP OUTBOUND PURPOSE
                    </Typography>
                    <Typography variant="h6" fontWeight={900} color="#0F172A">
                      {analytics?.appointments?.outbound || "1,240"}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {(analytics?.topOutboundPurpose?.length
                      ? analytics.topOutboundPurpose
                      : [
                        { purpose: "Feedback", count: 428 },
                        { purpose: "Follow-up", count: 311 },
                      ]
                    ).map((item, i) => (
                      <Box key={i}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="#334155">
                            {item?.purpose}
                          </Typography>
                          <Typography variant="caption" fontWeight={800} color="#0256E8">
                            {item?.count} Calls
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((item?.count / 500) * 100, 100)}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: "#F1F5F9",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#0256E8",
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          {/* --- PATIENT ANALYTICS TABLE --- */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "24px",
              p: 3.5,
              mb: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Patient Analytics
                </Typography>
                <Typography variant="caption" color="#64748B" fontWeight={500}>
                  Comparative performance metrics across surgical and outpatient facilities.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Box
                  sx={{
                    bgcolor: "#EFF6FF",
                    borderRadius: "16px",
                    px: 3,
                    py: 1.2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight={800} color="#0256E8" fontSize="9px">
                    TOTAL REGISTERED PATIENTS
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color="#0F172A">
                    {totalNew || "4,200"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    px: 3,
                    py: 1.2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight={800} color="#94A3B8" fontSize="9px">
                    NEW PATIENTS TOTAL COUNT
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color="#0F172A">
                    {totalNew || "2,650"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <th style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", padding: "12px 0", letterSpacing: "0.5px" }}>
                    TEMPORAL PERIOD
                  </th>
                  <th style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", padding: "12px 0", letterSpacing: "0.5px", textAlign: "center" }}>
                    NEW PATIENTS
                  </th>
                  <th style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", padding: "12px 0", letterSpacing: "0.5px", textAlign: "center" }}>
                    TOTAL PATIENTS
                  </th>
                  <th style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", padding: "12px 0", letterSpacing: "0.5px", textAlign: "right" }}>
                    MOMENTUM
                  </th>
                </tr>
              </thead>
              <tbody>
                {(newPatientData.length
                  ? newPatientData
                  : [
                    { month: "July 2026", newPatients: 950, totalPatients: 4200, momentum: "15%" },
                    { month: "June 2026", newPatients: 860, totalPatients: 3950, momentum: "12%" },
                    { month: "May 2026", newPatients: 820, totalPatients: 3700, momentum: "10%" },
                  ]
                ).map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={{ padding: "16px 0", fontSize: "12px", fontWeight: "800", color: "#0F172A" }}>
                      {item.month}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "12px", color: "#475569", textAlign: "center", fontWeight: "600" }}>
                      {item.newPatients}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "12px", color: "#475569", textAlign: "center", fontWeight: "600" }}>
                      {item.totalPatients || item.newPatients}
                    </td>
                    <td style={{ padding: "16px 0", textAlign: "right" }}>
                      <Chip
                        label={`📈 ${item.momentum || "12%"}`}
                        size="small"
                        sx={{
                          bgcolor: "#EFF6FF",
                          color: "#0256E8",
                          fontWeight: 800,
                          fontSize: "11px",
                          borderRadius: "12px",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* --- BOTTOM ROW CARDS --- */}
          <Grid container spacing={2.5}>
            {/* 1. RECENT ACTIVITY */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  p: 3,
                  border: "1px solid #E2E8F0",
                  height: "360px",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="#64748B"
                  sx={{ letterSpacing: "0.5px", mb: 2 }}
                >
                  RECENT ACTIVITY
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                  <Stack spacing={2}>
                    {(analytics?.recentActivity?.length
                      ? analytics.recentActivity
                      : [
                        { name: "Sandeep", customMessage: 'Executive "Sandeep" created a new INBOUND form.', createdAt: new Date() },
                        { name: "Dr. Sarah Vance", customMessage: "Dr. Sarah Vance triggered a Hospital Sync.", createdAt: new Date() },
                        { name: "System", customMessage: "System Automated generated a new Report Batch.", createdAt: new Date() },
                        { name: "System Core", customMessage: "System Core updated Security Protocols.", createdAt: new Date() },
                        { name: "Rahul", customMessage: 'Executive "Rahul" submitted an OUTBOUND follow-up.', createdAt: new Date() },
                      ]
                    ).map((item, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Avatar
                          src={item?.userAvatar || ""}
                          sx={{ width: 32, height: 32, bgcolor: "#F1F5F9", fontSize: "12px", color: "#475569" }}
                        >
                          {item?.name?.charAt(0) || "U"}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: "11px", fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}>
                            {item?.customMessage}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: "9px", color: "#94A3B8", fontWeight: 700 }}>
                            {item?.name || "SYSTEM"} • {moment(item?.createdAt).format("hh:mm A")}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {/* 2. AGENT PRODUCTIVITY */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  p: 3,
                  border: "1px solid #E2E8F0",
                  height: "360px",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="#64748B"
                  sx={{ letterSpacing: "0.5px", mb: 2, display: "block" }}
                >
                  AGENT PRODUCTIVITY
                </Typography>

                <Stack spacing={2} sx={{ mt: 1 }}>
                  {[
                    { name: "Agent Rahul", count: "188 Forms" },
                    { name: "Agent Priya", count: "162 Forms" },
                    { name: "Agent Sameer", count: "139 Forms" },
                    { name: "Agent Sarah", count: "115 Forms" },
                  ].map((agent, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#F1F5F9", fontSize: "12px" }}>
                          {agent.name.split(" ")[1]?.[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} color="#0F172A" fontSize="12px">
                          {agent.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={agent.count}
                        size="small"
                        sx={{
                          bgcolor: "#0256E8",
                          color: "#FFFFFF",
                          fontWeight: 800,
                          fontSize: "10px",
                          borderRadius: "12px",
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            {/* 3. PATIENT STATUS TRENDS */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  p: 3,
                  border: "1px solid #E2E8F0",
                  height: "360px",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="#64748B"
                  sx={{ letterSpacing: "0.5px" }}
                >
                  PATIENT STATUS TRENDS
                </Typography>
                <Typography variant="caption" color="#94A3B8" fontWeight={500} sx={{ mb: 2, display: "block" }}>
                  Temporal classification mapping
                </Typography>

                <Box sx={{ flexGrow: 1, width: "100%", height: "180px" }}>
                  <Bar data={patientTrendData} options={patientTrendOptions} />
                </Box>

                <Stack direction="row" spacing={2} justifyContent="center" sx={{ pt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0256E8" }} />
                    <Typography variant="caption" fontSize="9px" fontWeight={800} color="#64748B">
                      ACTIVE
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#93C5FD" }} />
                    <Typography variant="caption" fontSize="9px" fontWeight={800} color="#64748B">
                      PENDING
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#E2E8F0" }} />
                    <Typography variant="caption" fontSize="9px" fontWeight={800} color="#64748B">
                      CLOSED
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default SuperAdminDashboard;