import React, { useState, useEffect, useContext, useMemo } from "react";
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
import { ProfilePopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import NotificationCenter from "../../../components/NotificationCenter";
import FormEditApprovalCard from "../../../components/FormEditApprovalCard";
import { FormStatus } from "../../../components/customComponents/PatientHistoryTableBody";

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const {
    hospitals,
    forms,
    loading,
    analytics,
    selectedHostpital,
    filter,
    errors,
    codeAlerts,
    formEditChanges,
    handleFilterChange,
    setSelectedHostpital,
    dateRange,
    updateFormStatusMutation

  } = useContext(HospitalContext);

  const navigate = useNavigate();

  const appointmentData = analytics?.callCategorization?.appointment || [];
  const newPatientData = analytics?.callCategorization?.newPatient || [];

  const labels = newPatientData.length
    ? newPatientData.map((item) => item.month)
    : [];

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
        data: appointmentChartData,
        backgroundColor: "#0256E8",
        borderRadius: 4,
        barThickness: 24,
      },
      {
        label: "New Patients",
        data: newPatientChartData,
        backgroundColor: "#93C5FD",
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const patientTrendLabels = analytics?.patientStatusTrends?.labels || [];
  const activeTrendData = analytics?.patientStatusTrends?.active || [];
  const pendingTrendData = analytics?.patientStatusTrends?.pending || [];
  const closedTrendData = analytics?.patientStatusTrends?.closed || [];

  const patientTrendData = {
    labels: patientTrendLabels,
    datasets: [
      {
        label: "Active",
        data: activeTrendData,
        backgroundColor: "#0256E8",
        borderRadius: 4,
        barThickness: 32,
      },
      {
        label: "Pending",
        data: pendingTrendData,
        backgroundColor: "#93C5FD",
        borderRadius: 4,
        barThickness: 32,
      },
      {
        label: "Closed",
        data: closedTrendData,
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

  const handleUpdateFormStatus = (formId, status, branchId) => {
    if (!formId) return toast.error("Form Not Found");

    // Pass single payload object to mutate
    updateFormStatusMutation.mutate({ formId, status, branchId });
  };


  // Extract Active Loading Variables
  const { isPending: isUpdatingStatus, variables: activeVariables } = updateFormStatusMutation;

  // handling profile card and its names
  const { profileName, hospitalName, greeting } = useMemo(() => {
    const hour = new Date().getHours();
    // Get name of currently selected hospital for the operational chip
    const currentHospitalObj = hospitals?.find((h) => h._id === selectedHostpital);
    const currentHospitalName = currentHospitalObj?.name || "N/A";

    return {
      profileName: currentUser?.name || "Agent",
      hospitalName: currentHospitalName,
      greeting: hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening",
    };
  }, [currentUser, selectedHostpital]);
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
                label={`CURRENTLY OPERATING: ${hospitalName?.toUpperCase()}`}
                size="small"
                sx={{
                  // bgcolor: "#EFF6FF",
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

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={selectedHostpital || ""}
                  onChange={(e) => setSelectedHostpital(e.target.value)}
                  disabled={loading?.hospitalsLoading}
                  displayEmpty
                  sx={{
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0F172A",
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.04)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E2E8F0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#CBD5E1",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0256E8",
                    },
                    "& .MuiSelect-select": {
                      py: 1,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      elevation: 0,
                      sx: {
                        borderRadius: "16px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.08)",
                        mt: 1,
                        maxHeight: 260,
                        "& .MuiMenuItem-root": {
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          borderRadius: "8px",
                          mx: 0.8,
                          my: 0.3,
                          py: 1,
                          "&.Mui-selected": {
                            bgcolor: "#F8FAFC",
                            color: "#0256E8",
                            fontWeight: 800,
                          },
                          "&:hover": {
                            bgcolor: "#F8FAFC",
                          },
                        },
                      },
                    },
                  }}
                >
                  {loading?.hospitalsLoading ? (
                    <MenuItem value="" disabled>
                      <CircularProgress size={16} sx={{ mr: 1, color: "#0256E8" }} />
                      <Typography variant="caption" fontWeight={700} color="#64748B">
                        Loading facilities...
                      </Typography>
                    </MenuItem>
                  ) : hospitals?.length > 0 ? (
                    hospitals.map((hospital) => (
                      <MenuItem key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        No Hospitals Assigned
                      </Typography>
                    </MenuItem>
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
                  {hospitals?.length ?? 0} <span style={{ color: "#0256E8" }}>•</span>
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
                <NotificationCenter />
              </IconButton>

              <Box onClick={() => setProfileModalOpen(true)} sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: "50px", py: 0.5, px: 2, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" } }}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={800} color="#0f172a" fontSize="0.8rem">
                    {hospitalName}
                  </Typography>

                </Box>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#0a4bb6", fontSize: "0.8rem", fontWeight: 800 }}>
                  {profileName ? profileName?.slice(0, 2).toUpperCase() : "TeamLeader"}
                </Avatar>
              </Box>


            </Stack>
          </Box>

          {/* --- GREETING TITLE --- */}
          <Box sx={{ mb: 4 }}>

            <Typography
              variant="h4"
              fontWeight={900}
              color="#0F172A"
              sx={{ letterSpacing: "-0.5px" }}
            >
              {greeting},{" "}
              <Box
                component="span"
                sx={{
                  color: "#0256E8",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                {profileName || "User"}
              </Box>
            </Typography>
            <Typography variant="body2" color="#64748B" fontWeight={500} sx={{ mt: 0.5 }}>
              Real-time facility orchestration and predictive diagnostics.
            </Typography>
          </Box>
          {formEditChanges?.map((item) => {
            // Check if THIS specific item is currently processing
            const isThisItemLoading = isUpdatingStatus && activeVariables?.formId === item?._id;
            const activeAction = isThisItemLoading ? activeVariables?.status : null;

            return (
              <FormEditApprovalCard
                key={item?._id}
                approvalData={item}
                activeAction={activeAction}
                onApprove={() =>
                  handleUpdateFormStatus(item?._id, FormStatus.APPROVED, item?.branchId?._id)
                }
                onReject={() =>
                  handleUpdateFormStatus(item?._id, FormStatus.REJECTED, item?.branchId?._id)
                }
              />
            );
          })}


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
          {/* --- KPI METRIC STRIP --- */}
          <Grid container spacing={2.5} alignItems="stretch" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <UsersCard
                label="USERS"
                count={analytics?.totalUsers ?? 0}
                onClick={() =>
                  navigate("/user-management", {
                    replace: true,
                    state: { selectedHostpital },
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <UsersCard
                label="BRANCHES"
                count={analytics?.totalBranches ?? 0}
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

            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <UsersCard
                label="APPOINTMENTS FLOW"
                count={analytics?.appointments?.total ?? 0}
                onClick={() => {
                  setFormsTypeFilter("all");
                  setFormsModalOpen("Appointments");
                }}
                option={{
                  inbound: analytics?.appointments?.inbound ?? 0,
                  outbound: analytics?.appointments?.outbound ?? 0,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
              <UsersCard
                label="FORMS"
                count={analytics?.forms?.total ?? 0}
                onClick={() => {
                  setFormsTypeFilter("all");
                  setFormsModalOpen("Forms");
                }}
                option={{
                  inbound: analytics?.forms?.inbound ?? 0,
                  outbound: analytics?.forms?.outbound ?? 0,
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

                <Box sx={{ width: "100%", height: "240px", pt: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {labels.length > 0 ? (
                    <Bar data={data} options={chartOptions} />
                  ) : (
                    <Typography variant="body2" color="#94A3B8" fontWeight={600}>
                      No Activity Data Available
                    </Typography>
                  )}
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
                      {analytics?.appointments?.inbound ?? 0}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {analytics?.topInboundPurpose?.length > 0 ? (
                      analytics.topInboundPurpose.map((item, i) => {
                        const totalInbound = analytics?.appointments?.inbound || 1;
                        const percentage = Math.min(((item?.count || 0) / totalInbound) * 100, 100);
                        return (
                          <Box key={i}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="caption" fontWeight={600} color="#334155">
                                {item?.purpose || "N/A"}
                              </Typography>
                              <Typography variant="caption" fontWeight={800} color="#0256E8">
                                {item?.count ?? 0} Calls
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
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
                        );
                      })
                    ) : (
                      <Typography variant="caption" color="#94A3B8" fontWeight={600} align="center" py={2}>
                        No Inbound Data Available
                      </Typography>
                    )}
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
                      {analytics?.appointments?.outbound ?? 0}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {analytics?.topOutboundPurpose?.length > 0 ? (
                      analytics.topOutboundPurpose.map((item, i) => {
                        const totalOutbound = analytics?.appointments?.outbound || 1;
                        const percentage = Math.min(((item?.count || 0) / totalOutbound) * 100, 100);
                        return (
                          <Box key={i}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="caption" fontWeight={600} color="#334155">
                                {item?.purpose || "N/A"}
                              </Typography>
                              <Typography variant="caption" fontWeight={800} color="#0256E8">
                                {item?.count ?? 0} Calls
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
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
                        );
                      })
                    ) : (
                      <Typography variant="caption" color="#94A3B8" fontWeight={600} align="center" py={2}>
                        No Outbound Data Available
                      </Typography>
                    )}
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
                    {analytics?.totalRegisteredPatients ?? totalNew ?? 0}
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
                    {totalNew ?? 0}
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
                {newPatientData.length > 0 ? (
                  newPatientData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td style={{ padding: "16px 0", fontSize: "12px", fontWeight: "800", color: "#0F172A" }}>
                        {item.month || "N/A"}
                      </td>
                      <td style={{ padding: "16px 0", fontSize: "12px", color: "#475569", textAlign: "center", fontWeight: "600" }}>
                        {item.newPatients ?? 0}
                      </td>
                      <td style={{ padding: "16px 0", fontSize: "12px", color: "#475569", textAlign: "center", fontWeight: "600" }}>
                        {item.totalPatients ?? item.newPatients ?? 0}
                      </td>
                      <td style={{ padding: "16px 0", textAlign: "right" }}>
                        <Chip
                          label={`📈 ${item.momentum || "0%"}`}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "24px 0" }}>
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        No Patient Analytics Found
                      </Typography>
                    </td>
                  </tr>
                )}
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
                  {analytics?.recentActivity?.length > 0 ? (
                    <Stack spacing={2}>
                      {analytics.recentActivity.map((item, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <Avatar
                            src={item?.userAvatar || ""}
                            sx={{ width: 32, height: 32, bgcolor: "#F1F5F9", fontSize: "12px", color: "#475569" }}
                          >
                            {item?.name?.charAt(0) || "U"}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontSize: "11px", fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}>
                              {item?.customMessage || "Activity recorded"}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: "9px", color: "#94A3B8", fontWeight: 700 }}>
                              {item?.name || "SYSTEM"} • {item?.createdAt ? moment(item.createdAt).format("hh:mm A") : "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        No Recent Activity
                      </Typography>
                    </Box>
                  )}
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
                  sx={{ letterSpacing: "0.5px", mb: 2, display: "block" }}
                >
                  AGENT PRODUCTIVITY
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                  {analytics?.agentProductivity?.length > 0 ? (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      {analytics.agentProductivity.map((agent, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar src={agent?.avatar || ""} sx={{ width: 32, height: 32, bgcolor: "#F1F5F9", fontSize: "12px", color: "#475569" }}>
                              {agent?.name ? agent.name.charAt(0) : "A"}
                            </Avatar>
                            <Typography variant="body2" fontWeight={700} color="#0F172A" fontSize="12px">
                              {agent?.name || "Unknown Agent"}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${agent?.count ?? 0} Forms`}
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
                  ) : (
                    <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        No Agent Data Available
                      </Typography>
                    </Box>
                  )}
                </Box>
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

                <Box sx={{ flexGrow: 1, width: "100%", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {patientTrendLabels.length > 0 ? (
                    <Bar data={patientTrendData} options={patientTrendOptions} />
                  ) : (
                    <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                      No Patient Status Trends
                    </Typography>
                  )}
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

      {profileModalOpen && (
        <ProfilePopup
          // user={currentUser}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default SuperAdminDashboard;