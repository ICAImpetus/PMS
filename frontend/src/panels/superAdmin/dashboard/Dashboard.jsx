import React, { useState, useEffect, useContext } from "react";
import {

  AlertTriangle,
  UserPlus,
  Cog,
  Gauge,
  Lock,
  Users,
  User,
} from "lucide-react";
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
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box, Card, Grid, Typography, LinearProgress, Stack, Avatar, Divider, Chip
} from "@mui/material";
import { Line, Bar } from "react-chartjs-2";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LabelIcon from "@mui/icons-material/Label";
import "./dashboard.css";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";
import { ProfilePopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import UsersCard from "../../../components/UserCard";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SectionLoader from "../../../components/SectionLoader";
import { UserContextHook } from "../../../contexts/UserContexts";
import HospitalContext from "../../../contexts/HospitalContexts";
import { ProjectThemeSettings } from "../../../theme";


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
  Filler,
);


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // Legend is custom rendered above
    tooltip: { enabled: true }
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: "#94a3b8", font: { size: 10, weight: "600" } }
    },
    y: {
      display: false // Hide Y-axis to match clean UI
    }
  }
};
// --- HELPER FUNCTIONS ---
const filterOptions = [
  { key: "Today", value: "today" },
  { key: "Yesterday", value: "yesterday" },
  { key: "Last 7 Days", value: "last7" },
  { key: "Last 30 Days", value: "last30" },
  { key: "Last 3 Month", value: "last3M" }
];
const formatMonth = (m) =>
  m.charAt(0).toUpperCase() + m.slice(1);

const getMonthWiseData = (arr, months) => {
  return months.map(month =>
    arr.reduce((sum, item) => sum + (item[month] || 0), 0)
  );
};
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const statusClasses = ["info", "success", "warning"];

const getChange = (current, prev) => {
  if (!prev) return { value: "-", className: "" };

  const diff = ((current - prev) / prev) * 100;

  if (diff > 0) {
    return { value: `↑ ${diff.toFixed(0)}%`, className: "text-success" };
  } else if (diff < 0) {
    return { value: `↓ ${Math.abs(diff).toFixed(0)}%`, className: "text-danger" };
  }

  return { value: "0%", className: "" };
};


const SuperAdminDashboard = () => {
  const { currentUser } = UserContextHook();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [formsModalOpen, setFormsModalOpen] = useState(false);
  const [formsTypeFilter, setFormsTypeFilter] = useState("all");
  // const [hospitals, sethospitals] = useState([])
  // const [branCount, setbranCount] = useState(0)
  // const [filter, setFilter] = React.useState(filterOptions[0]?.value || "");
  // const [metrics, setMetrics] = useState({});
  // const [analytics, setAnalytics] = useState({});
  // const [selectedHostpital, setSelectedHostpital] = useState("");
  // const [page, setPage] = useState(1)
  // const [codeAlerts, setCodeAlerts] = useState([]);
  // const [forms, setForms] = useState({
  //   today: [],
  //   appointments: [],
  //   followups: []
  // });


  const {
    hospitals,
    forms,
    loading,
    analytics,
    page,
    metrics,
    selectedHostpital,
    filter,
    errors,
    branCount,
    codeAlerts,
    setCodeAlerts,
    setbranCount,
    setFilter,
    handleFilterChange,
    setMetrics,
    setSelectedHostpital,
    setPagination,
    pagination,
    dateRange,
    setDateRange
  } = useContext(HospitalContext);
  const navigate = useNavigate()

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Parallel API calls (fast)
  //       const [hospitalRes] = await Promise.all([
  //         gethospitals(),
  //       ]);

  //       // Hospitals
  //       sethospitals(hospitalRes?.data || []);
  //       if (hospitalRes?.data?.length) {
  //         setSelectedHostpital(hospitalRes?.data[0]?._id)
  //         setbranCount(hospitalRes?.data[0]?.branchCount || 0);
  //       }

  //       // Code Alerts


  //     } catch (err) {
  //       console.error("Fetch Error:", err);
  //     }
  //   };

  //   fetchData();

  // }, []);

  // useEffect(() => {
  //   if (!selectedHostpital) return;
  //   const fetchforms = async () => {
  //     const res = await getforms(filter, page, null, selectedHostpital);

  //     if (res?.data) {
  //       const { metrics, forms } = res.data;
  //       setMetrics(metrics);

  //       setForms(prev => ({
  //         today: page === 1
  //           ? forms.today
  //           : [...prev.today, ...forms.today],

  //         appointments: page === 1
  //           ? forms.appointments
  //           : [...prev.appointments, ...forms.appointments],

  //         followups: page === 1
  //           ? forms.followups
  //           : [...prev.followups, ...forms.followups],
  //       }));
  //     }
  //   };

  //   fetchforms();
  // }, [filter, page, selectedHostpital]);


  // useEffect(() => {

  //   const fetchDashboard = async () => {

  //     const [res, alertRes] = await Promise.all([
  //       getDashboard(null, selectedHostpital),
  //       getCodeAlerts(selectedHostpital),
  //     ])

  //     if (res?.data) {

  //       const { analytics } = res.data;
  //       setAnalytics(analytics);
  //     }
  //     setCodeAlerts(alertRes?.data || []);

  //   };
  //   if (selectedHostpital) fetchDashboard();

  // }, [selectedHostpital]);
  const categoryData =
    analytics?.callCategorization || {};

  const currentDataa =
    categoryData["appointment"] || [];

  const months = currentDataa?.length
    ? Object.keys(currentDataa[0]).filter(
      (key) => key !== "name"
    )
    : [];


  // API DATA
  const appointmentData =
    analytics?.callCategorization?.appointment || [];

  const newPatientData =
    analytics?.callCategorization?.newPatient || [];


  const labels = newPatientData.map(
    (item) => item.month
  );
  // CHART VALUES

  console.log("Appointment Data:", appointmentData);

  const appointmentChartData = appointmentData.map(
    (item) => item.appointment || 0
  );

  console.log("appointmentChartData:", appointmentChartData);
  const newPatientChartData = newPatientData.map(
    (item) => item.newPatients || 0
  );

  // LABELS

  const totalNew = sum(newPatientChartData);

  // FINAL CHART DATA
  const data = {
    labels,

    datasets: [
      {
        label: "Appointments",
        data: appointmentChartData,
        backgroundColor: "#7b3fe4",
        borderRadius: 6,
        barThickness: 18,
      },

      {
        label: "New Patients",
        data: newPatientChartData,
        backgroundColor: "#2d91ee",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 20
        }
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#eee"
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f0f0" } },
      x: { grid: { display: false } },
    },
  };

  const patientStatusData = {
    labels,
    datasets: [
      {
        label: "New Patient",
        data: newPatientChartData ?? [347, 206, 253],
        borderColor: "#3f86d9",
        backgroundColor: "#3f86d9",
        tension: 0.4
      },
    ]
  };

  const formsDataMap = {
    Forms: forms.today,
    Followups: forms.followups,
    Appointments: forms.appointments
  };

  const formsData = formsDataMap[formsModalOpen] || [];

  useEffect(() => {

    const error =
      errors?.dashError ||
      errors?.hospitalsError ||
      errors?.formsError;

    if (error) {
      toast.error(error);
    }

  }, [errors]);



  if (loading?.dashboard) {
    return (
      <div className="tld-dashboard-content-wrapper">
        <div className="tld-page-header">
          <h1>
            <DashboardIcon sx={{ mr: 1 }} />Dashboard
          </h1>
        </div>
        <SectionLoader height="60vh" message="Loading dashboard data..." />
      </div>
    );
  }


  return (
    <>
      {/* <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      /> */}
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
        <div className="dashboard-container">

          <div className="info-header">
            <div style={{
              display: "flex",
              alignItems: "center",

              width: '650px',
              gap: "20px"

            }}>

              <FormControl sx={{ width: '220px' }} size="small">
                {/* <InputLabel id="hospital-label">Select Hospital</InputLabel> */}

                <Select
                  value={selectedHostpital}
                  onChange={(e) => setSelectedHostpital(e.target.value)}
                  disabled={loading?.hospitalsLoading}
                  displayEmpty
                  sx={{
                    borderRadius: "24px",
                    color: "black",
                    "&.Mui-focused": {
                      color: "black",
                    },
                    backgroundColor: "#fff"
                  }}
                >
                  {loading?.hospitalsLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading...
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
              <FormControl sx={{ width: '220px' }} size="small">
                <Select
                  labelId="hospital-label"
                  value={filter}
                  displayEmpty
                  onChange={(e) => handleFilterChange(e.target.value)}
                  sx={{
                    borderRadius: "24px",
                    backgroundColor: "#fff"
                  }}
                >
                  <MenuItem value="" disabled>
                  </MenuItem>
                  {filterOptions.length > 0 ? (
                    filterOptions.map((opt) => (
                      <MenuItem key={opt.key} value={opt.value}>
                        {opt.key}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">No Options For Select</MenuItem>
                  )}
                </Select>
              </FormControl>
              <div className="h-stat-box">


                <div className="h-stat-lbl" style={{ color: `${ProjectThemeSettings.titleTextColor.one}` }}>
                  Hospitals
                </div>
                <div className="h-stat-val">
                  {hospitals.length || 0}
                </div>

              </div>
            </div>


            {/* <div className="h-stat-box">
              <div className="h-stat-val">{12}</div>
              <div className="h-stat-lbl">Branches</div>
            </div> */}

          </div>

          {/* --- ALERT SECTION --- */}
          {codeAlerts?.length > 0 && (
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
                  </div>
                );
              })}
            </div>
          )}

          {/* --- CRITICAL KPI STRIP --- */}
          <section className="critical-strip" style={{ marginBottom: "20px" }}>
            <UsersCard
              label="Users"
              count={analytics?.totalUsers}
              onClick={() => navigate("/user-management", { replace: true, state: { selectedHostpital } })}
            />
            <UsersCard
              label="Branches"
              count={analytics?.totalBranches || 0}
              onClick={() => {
                const selectedHospitalData = hospitals.find((h) => h._id === selectedHostpital);
                navigate(`/hospital-management/edit-branches/${selectedHostpital}`, {
                  replace: true,
                  state: {
                    hospital: {
                      name: selectedHospitalData?.name,
                      hospitalCode: selectedHospitalData?.hospitalCode,
                      contact: selectedHospitalData?.contact,
                      hospitallogo: selectedHospitalData?.hospitallogo
                    }
                  }
                });
              }}
            />
            <UsersCard
              label="Appointments"
              count={analytics?.appointments?.total}
              onClick={() => {
                setFormsTypeFilter("all");
                setFormsModalOpen("Appointments");
              }}
              option={{
                "inbound": analytics?.appointments?.inbound,
                "outbound": analytics?.appointments?.outbound
              }}
            />
            <UsersCard
              label="Forms"
              onClick={() => {
                setFormsTypeFilter("all");
                setFormsModalOpen("Forms");
              }}
              count={analytics?.forms?.total}
              option={{
                "inbound": analytics?.forms?.inbound,
                "outbound": analytics?.forms?.outbound
              }}
            />
          </section>


          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {/* Hospital Activity Bar Chart */}
            <Grid item xs={12} md={7.5}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  p: 3.5,
                  border: "1px solid #e2e8f0",
                  height: "100%",
                  boxShadow: "none",
                  bgcolor: "#ffffff"
                }}
              >
                {/* Header & Legend */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#1e293b",
                        lineHeight: 1.2,
                        fontFamily: "Inter, sans-serif"
                      }}
                    >
                      Hospital Activity
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        color: "#64748b",
                        mt: 0.75,
                        fontWeight: 400
                      }}
                    >
                      Month-wise analysis of new patients and appointments
                    </Typography>
                  </Box>

                  {/* Legend */}
                  <Stack direction="row" spacing={2.5} sx={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#475569" }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#0052cc" }} /> APPOINTMENTS
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#475569" }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#93c5fd" }} /> PATIENTS
                    </Box>
                  </Stack>
                </Box>

                {/* Bar Chart Canvas Container */}
                <Box sx={{ width: "100%", height: "240px", pt: 1 }}>
                  <Bar data={data} options={options || chartOptions} />
                </Box>
              </Card>
            </Grid>

            {/* Inbound & Outbound Cards Container */}
            <Grid item xs={12} md={4.5}>
              <Stack spacing={2.5}>
                {/* Top Inbound Purpose */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    p: 3,
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    bgcolor: "#ffffff"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.5px", textTransform: "uppercase" }}
                    >
                      TOP INBOUND PURPOSE
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                      {analytics?.appointments?.inbound || "1,482"}
                    </Typography>
                  </Box>

                  <Stack spacing={1.75}>
                    {analytics?.topInboundPurpose?.length === 0 ? (
                      <Typography variant="body2" sx={{ fontSize: "13px", color: "#94a3b8" }}>
                        No Data Found
                      </Typography>
                    ) : (
                      analytics?.topInboundPurpose?.map((item, i) => (
                        <Box key={i}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "12px", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                              {item?.purpose || "-"}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: "12px", color: "#2563eb", fontWeight: 700 }}>
                              {item?.count || 0} Calls
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(item?.count || 0, 100)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#f1f5f9",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: "#2563eb",
                                borderRadius: 2
                              }
                            }}
                          />
                        </Box>
                      ))
                    )}
                  </Stack>
                </Card>

                {/* Top Outbound Purpose */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    p: 3,
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    bgcolor: "#ffffff"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.5px", textTransform: "uppercase" }}
                    >
                      TOP OUTBOUND PURPOSE
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                      {analytics?.appointments?.outbound || "1,240"}
                    </Typography>
                  </Box>

                  <Stack spacing={1.75}>
                    {analytics?.topOutboundPurpose?.length === 0 ? (
                      <Typography variant="body2" sx={{ fontSize: "13px", color: "#94a3b8" }}>
                        No Data Found
                      </Typography>
                    ) : (
                      analytics?.topOutboundPurpose?.map((item, i) => (
                        <Box key={i}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "12px", mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                              {item?.purpose || "-"}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: "12px", color: "#2563eb", fontWeight: 700 }}>
                              {item?.count || 0} Calls
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(item?.count || 0, 100)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#f1f5f9",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: "#2563eb",
                                borderRadius: 2
                              }
                            }}
                          />
                        </Box>
                      ))
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
          {/* --- BOTTOM ROW: PATIENT ANALYTICS TABLE --- */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>

            {/* Header & Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Patient Analytics</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>Comparative performance metrics across surgical and outpatient facilities.</p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ background: "#eff6ff", borderRadius: "16px", padding: "10px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#2563eb", letterSpacing: "0.5px" }}>TOTAL REGISTERED PATIENTS</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{totalNew || "4,200"}</div>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "10px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px" }}>NEW PATIENTS TOTAL COUNT</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{totalNew || "2,650"}</div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <th style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", padding: "12px 0", letterSpacing: "0.5px" }}>TEMPORAL PERIOD</th>
                  <th style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", padding: "12px 0", letterSpacing: "0.5px", textAlign: "center" }}>NEW PATIENTS</th>
                  <th style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", padding: "12px 0", letterSpacing: "0.5px", textAlign: "center" }}>TOTAL PATIENTS</th>
                  <th style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", padding: "12px 0", letterSpacing: "0.5px", textAlign: "right" }}>MOMENTUM</th>
                </tr>
              </thead>
              <tbody>
                {newPatientData?.length > 0 ? (
                  newPatientData.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i !== newPatientData.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <td style={{ padding: "16px 0", fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{item.month}</td>
                      <td style={{ padding: "16px 0", fontSize: "13px", color: "#475569", textAlign: "center" }}>{item.newPatients}</td>
                      <td style={{ padding: "16px 0", fontSize: "13px", color: "#475569", textAlign: "center" }}>{item.totalPatients || item.newPatients}</td>
                      <td style={{ padding: "16px 0", textAlign: "right" }}>
                        <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "600", padding: "4px 8px", borderRadius: "12px" }}>
                          📈 {item.momentum || "12%"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>

            {/* 1. RECENT ACTIVITY CARD */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid #e2e8f0",
                  height: "360px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase", mb: 2 }}
                >
                  RECENT ACTIVITY
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5 }}>
                  {analytics?.recentActivity?.length === 0 ? (
                    <Typography variant="body2" sx={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", mt: 4 }}>
                      No Activity Found
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {analytics?.recentActivity?.map((item, i) => {
                        const isOutbound = item?.customMessage?.toLowerCase().includes("outbound");
                        const isInbound = item?.customMessage?.toLowerCase().includes("inbound");

                        return (
                          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                            <Avatar
                              src={item?.userAvatar || ""}
                              alt={item?.name || "User"}
                              sx={{ width: 32, height: 32, bgcolor: "#e2e8f0", fontSize: "12px", color: "#475569" }}
                            >
                              {item?.name?.charAt(0) || "U"}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>
                                {item?.customMessage || "Unknown Activity"}
                                {isInbound && (
                                  <Chip
                                    label="INBOUND"
                                    size="small"
                                    sx={{ ml: 0.75, height: 16, fontSize: "9px", fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }}
                                  />
                                )}
                                {isOutbound && (
                                  <Chip
                                    label="OUTBOUND"
                                    size="small"
                                    sx={{ ml: 0.75, height: 16, fontSize: "9px", fontWeight: 700, bgcolor: "#eff6ff", color: "#2563eb" }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", mt: 0.25, display: "block" }}>
                                {item?.name || "SYSTEM"} • {moment(item?.createdAt).format("hh:mm A")}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* 2. AGENT PRODUCTIVITY CARD */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid #e2e8f0",
                  height: "360px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase", mb: 2 }}
                >
                  AGENT PRODUCTIVITY
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                  <Stack divider={<Divider sx={{ borderColor: "#f1f5f9" }} />} spacing={1.5}>
                    {analytics?.teamOverview?.map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 0.5
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={item?.avatar || ""}
                            alt={item?.agentName || "Agent"}
                            sx={{ width: 32, height: 32, bgcolor: "#0052cc", fontSize: "12px" }}
                          >
                            {item?.agentName?.charAt(0) || "A"}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                            {item?.agentName || "Agent"}
                          </Typography>
                        </Box>

                        <Chip
                          label={`${item?.totalCalls || 0} Forms`}
                          sx={{
                            bgcolor: "#0052cc",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 700,
                            height: 24,
                            borderRadius: "12px",
                            px: 0.5
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {/* 3. PATIENT STATUS TRENDS CARD */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid #e2e8f0",
                  height: "360px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase", display: "block" }}
                  >
                    PATIENT STATUS TRENDS
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "12px", color: "#94a3b8", mt: 0.25 }}>
                    Temporal classification mapping
                  </Typography>
                </Box>

                {/* Chart Section */}
                <Box sx={{ flexGrow: 1, minHeight: 0, position: "relative" }}>
                  <Bar data={patientStatusData} options={lineOptions} />
                </Box>

                {/* Footer Legend */}
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1.5, mt: 1, borderTop: "1px solid #f1f5f9", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#0052cc" }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0052cc" }} /> ACTIVE
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#8da4f7" }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#8da4f7" }} /> OBSERVED
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#cbd5e1" }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#e2e8f0" }} /> CLOSED
                  </Box>
                </Stack>
              </Card>
            </Grid>

          </Grid>

          {
            profileModalOpen && (
              <ProfilePopup
                user={currentUser}
                onClose={() => setProfileModalOpen(false)}
              />
            )
          }
        </div >
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

export default SuperAdminDashboard;
