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
  CircularProgress
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


          {/* --- FILTER BAR --- */}
          <div className="hospital-info-card" style={{ borderLeft: "5px solid #0f172a" }}>
            <div className="info-header">
              <div style={{
                display: "flex",
                alignItems: "center",
                // backgroundColor: "antiquewhite",
                width: '650px',
                gap: "20px"

              }}>
                <h3 className="hospital-name">
                  {"Select Hospital"}
                </h3>
                <FormControl sx={{ width: '220px' }} size="small">
                  {/* <InputLabel id="hospital-label">Select Hospital</InputLabel> */}

                  <Select
                    value={selectedHostpital}
                    onChange={(e) => setSelectedHostpital(e.target.value)}
                    disabled={loading?.hospitalsLoading}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
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
                      borderRadius: 2,
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

              </div>
              <div className="hospital-stats">
                <div className="h-stat-box">
                  <div className="h-stat-val">
                    {hospitals.length || 0}
                  </div>
                  <div className="h-stat-lbl">Hospitals</div>
                </div>
                {/* <div className="h-stat-box">
              <div className="h-stat-val">{12}</div>
              <div className="h-stat-lbl">Branches</div>
            </div> */}
              </div>
            </div>
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
          <section className="critical-strip" style={{ marginBottom: "12px" }}>
            <UsersCard label="Users" count={analytics?.totalUsers} onClick={() => navigate("/user-management", { replace: true, state: { selectedHostpital } })} />
            <UsersCard label="Branches" count={analytics?.totalBranches || 0} onClick={() => {
              const selectedHospitalData = hospitals.find(
                (h) => h._id === selectedHostpital
              );
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
              })
            }

            } />
            <UsersCard label="Appointments" count={analytics?.appointments?.total} onClick={() => {
              setFormsTypeFilter("all");
              setFormsModalOpen("Appointments");
            }} option={
              {
                "inbound": analytics?.appointments?.inbound,
                "outbound": analytics?.appointments?.outbound
              }
            } />
            <UsersCard label="Forms" onClick={() => {
              setFormsTypeFilter("all");
              setFormsModalOpen("Forms");
            }} count={analytics?.forms?.total} option={
              {
                "inbound": analytics?.forms?.inbound,
                "outbound": analytics?.forms?.outbound
              }
            } />

          </section>

          <div
            className="data-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
              width: "100%",
              marginBottom: "8px"
            }}
          >
            <div className="data-card" style={{ width: "100%", height: "310px", borderLeft: "5px solid #0f172a" }}>
              <h4>
                <Users size={18} className="mr-2" /> Hospital Activity
              </h4>

              <div
                className="chart-container-sm"
                style={{ width: "100%", height: "240px" }}
              >
                <Bar data={data} options={options} />
              </div>
            </div>

            <div className="data-card" style={{ width: "100%", height: "310px", borderLeft: "5px solid #0f172a" }}>
              <h4>
                <MedicalServicesIcon sx={{ mr: 1 }} /> Patient Analytics
              </h4>

              <div className="scrollable-content">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>New Patient</th>
                    </tr>
                  </thead>

                  <tbody>
                    {newPatientData?.length > 0 ? (
                      newPatientData.map((item, i) => (
                        <tr key={i}>
                          <td>{item.month}</td>
                          <td>{item.newPatients}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No data available</td>
                      </tr>
                    )}

                    <tr className="total-row">
                      <td>
                        <strong>Total</strong>
                      </td>

                      <td>
                        <strong>{totalNew}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="patient-summary" style={{ marginTop: "15px" }}>
                  <p><strong>New Patients :</strong> {totalNew}</p>
                  <p><strong>Total Registered Patients :</strong> {totalNew}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="executive-dashboard-section" style={{ marginBottom: "8px" }}>
            <div className="executive-outbound-grid">
              <div className="executive-outbound-card">
                <div className="executive-chart-title">
                  <PieChartIcon />Top Inbound Purpose
                </div>
                {analytics?.topInboundPurpose?.length === 0 ? (
                  <div className="executive-leads-breakdown">
                    <div>No Data Are Found</div>
                  </div>
                ) : (
                  analytics?.topInboundPurpose?.map((item, i) => {
                    return <div key={i} className="executive-lead-source">
                      <div className="executive-source-name">
                        <LabelIcon sx={{ fontSize: 16 }} /> {item?.purpose || "-"}
                      </div>
                      <div className="executive-source-count">{item?.count || 0}</div>
                    </div>
                  })


                )}

              </div>
              <div className="executive-outbound-card">
                <div className="executive-chart-title">
                  <BarChartIcon />Top Outbound Purpose
                </div>
                {analytics?.topOutboundPurpose?.length === 0 ? (
                  <div className="executive-leads-breakdown">
                    <div>No Data Are Found</div>
                  </div>
                ) : (
                  analytics?.topOutboundPurpose?.map((item, i) => {
                    return <div key={i} className="executive-lead-source">
                      <div className="executive-source-name">
                        <i className="fab fa-facebook"></i> {item?.purpose || "-"}
                      </div>
                      <div className="executive-source-count">{item?.count || 0}</div>
                    </div>
                  })
                )}

              </div>

              {/* <div className="executive-outbound-card">
              <div className="executive-chart-title">
                <i className="fas fa-smile"></i> Customer Sentiment
              </div>
              <div className executive-sentiment-stats>
                <div className="executive-sentiment-item">
                  <div className="executive-sentiment-value executive-positive-sentiment">
                    65%
                  </div>
                  <div className="executive-sentiment-label">Positive</div>
                </div>
                <div className="executive-sentiment-item">
                  <div className="executive-sentiment-value executive-negative-sentiment">
                    15%
                  </div>
                  <div className="executive-sentiment-label">Negative</div>
                </div>
                <div className="executive-sentiment-item">
                  <div className="executive-sentiment-value executive-neutral-sentiment">
                    20%
                  </div>
                  <div className="executive-sentiment-label">Neutral</div>
                </div>
              </div>
              <div className="executive-nps-container">
                <div className="executive-nps-score">+42</div>
                <div className="executive-nps-label">Net Promoter Score</div>
              </div>
            </div> */}

              {/* <div className="executive-outbound-card">
              <div className="executive-chart-title">
                <i className="fas fa-chart-line"></i> Conversion & Revenue
              </div>
              <div className="executive-revenue-stats">
                <div className="executive-revenue-item">
                  <div className="executive-revenue-type">Conversion Rate</div>
                  <div className="executive-revenue-amount">18.2%</div>
                </div>
                <div className="executive-revenue-item">
                  <div className="executive-revenue-type">Total Revenue</div>
                  <div className="executive-revenue-amount">₹2,85,000</div>
                </div>
                <div className="executive-revenue-item">
                  <div className="executive-revenue-type">
                    Avg. Revenue per Call
                  </div>
                  <div className="executive-revenue-amount">₹338</div>
                </div>
                <div className="executive-revenue-item">
                  <div className="executive-revenue-type">
                    Revenue per Connected Call
                  </div>
                  <div className="executive-revenue-amount">₹498</div>
                </div>
              </div>
            </div> */}
            </div>
          </div>
          <div className="data-grid row-3" style={{ marginBottom: "8px", gap: "8px" }}>
            <div className="data-card">
              <h4>Recent Activity</h4>
              <div className="scrollable-content">
                {analytics?.recentActivity?.length === 0 && (
                  <div className="log-entry">
                    <p>No Activity Found</p>
                  </div>
                )}
                {analytics?.recentActivity?.map((item, i) => (
                  <div key={i} className="log-entry">
                    <div className="log-icon info">
                      <UserPlus size={16} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div>
                        <strong style={{ fontSize: "12px" }}>{item?.customMessage || "Unknown Activity"}</strong>
                      </div>
                      <small style={{ color: "var(--muted)" }}>
                        {item?.name} • {moment(item?.createdAt).format("hh:mm A")}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="data-card">
              <h4>Agent Performance</h4>
              <div className="scrollable-content">
                {analytics?.teamOverview?.map((item, i) => {
                  const status = statusClasses[i % statusClasses.length];
                  return (
                    <div
                      key={i}
                      className="log-entry"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className={`log-icon ${status}`}>
                          <User size={16} />
                        </div>
                        <strong>{item?.agentName || "name"}</strong>
                      </div>
                      <span>
                        Forms: {item?.totalCalls || 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="data-card">
              <div className="chart-head">
                <span>
                  <ShowChartIcon /> Patient Status Trend
                </span>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <Line data={patientStatusData} options={lineOptions} />
              </div>
            </div>
          </div>


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
