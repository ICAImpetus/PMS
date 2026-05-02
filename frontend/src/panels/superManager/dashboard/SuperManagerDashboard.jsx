import React, { useState, useEffect } from "react";
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
  Filler
} from "chart.js";
import { FormControl, Select, MenuItem, InputLabel, Box } from "@mui/material";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";
import { UserContextHook } from "../../../contexts/UserContexts";
import { ProfilePopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";

// --- IMPORT MUI ICONS FOR QUICK STATS ---
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import { AlertTriangle, Users } from "lucide-react";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";
import toast from "react-hot-toast";

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

const categoryLabels = {
  location: "Location",
  age: "Age Group",
  gender: "Gender",
  doctor: "Doctor",
  poc: "Purpose of Call"
};
const formatMonth = (m) =>
  m.charAt(0).toUpperCase() + m.slice(1);

const getMonthWiseData = (arr, months) => {
  return months.map(month =>
    arr.reduce((sum, item) => sum + (item[month] || 0), 0)
  );
};


const sum = (arr) => arr.reduce((a, b) => a + b, 0);

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


const Dashboard = () => {

  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState("");
  const [formsModalOpen, setFormsModalOpen] = useState(false);
  const [filter, setFilter] = useState(filterOptions[0].value);
  const [metrics, setMetrics] = useState({});
  const [page, setPage] = useState(1);
  const [analytics, setAnalytics] = useState({});
  const [codeAlerts, setCodeAlerts] = useState([]);
  const [profile, setProfile] = React.useState(null);
  const [hospitalId, setHospitalId] = React.useState(null)
  const [forms, setForms] = useState({
    today: [],
    appointments: [],
    followups: []
  });
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("gender");

  const { currentUser } = UserContextHook();
  // console.log("curre", currentUser);
  const { loading: dashboardLoading, request: getDashboard, error: dashError } = useApi(commonRoutes.getDashboard)
  const { loading: branchesLoading, request: getBranches, error: branchesError } = useApi(commonRoutes.getHospitalBranchById)
  const { loading: alertLoading, request: getCodeAlerts } = useApi(commonRoutes.getCreatedCodeAlerts);
  const { loading: formLoading, request: getforms, error: formsError } = useApi(commonRoutes.getFilledForms)
  const { request: getMe, error: getMeError, loading: getMeloading } = useApi(commonRoutes.getMe)
  React.useEffect(() => {
    const handleGetMe = async () => {
      const res = await getMe();
      setProfile(res.data || {});
      if (res.data?.hospitals?.length) {
        setHospitalId(res.data?.hospitals[0]?.hospitalId)
      }

      // setIsShowAction(res?.data?.canDelete);
      // toast.success(response.message);
    };
    handleGetMe()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel API calls (fast)
        const [res] = await Promise.all([
          getBranches(hospitalId),

        ]);

        // Hospitals
        setBranches(res?.data || []);

        if (res?.data?.length) {
          setSelectedBranch(res?.data[0]?._id)
        }



      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };

    if (hospitalId) {
      fetchData();
    }
  }, [hospitalId]);

  useEffect(() => {
    const fetchforms = async () => {
      const res = await getforms(filter, page, selectedBranch, hospitalId);

      if (res?.data) {
        const { metrics, forms } = res.data;
        setMetrics(metrics);

        setForms(prev => ({
          today: page === 1
            ? forms.today
            : [...prev.today, ...forms.today],

          appointments: page === 1
            ? forms.appointments
            : [...prev.appointments, ...forms.appointments],

          followups: page === 1
            ? forms.followups
            : [...prev.followups, ...forms.followups],
        }));
      }
    };

    if (hospitalId) {
      fetchforms();
    }

  }, [hospitalId, filter, page, selectedBranch]);
  useEffect(() => {

    const fetchDashboard = async () => {

      const [res, alertRes] = await Promise.all([
        getDashboard(selectedBranch, hospitalId),
        getCodeAlerts(hospitalId, selectedBranch)
      ])

      if (res?.data) {
        const { analytics } = res.data;
        setAnalytics(analytics);
      }

      // Code Alerts
      setCodeAlerts(alertRes?.data || []);

    };

    if (hospitalId && selectedBranch) {

      fetchDashboard();
    }

  }, [hospitalId, selectedBranch]);


  const toggleModal = () => setIsTicketModalOpen(!isTicketModalOpen);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f0f0" } },
      x: { grid: { display: false } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f0f0" } },
      x: { grid: { display: false } },
    },
  };
  const getTotalCount = (item) => {
    return Object.keys(item)
      .filter(key => key !== "name") // name skip
      .reduce((sum, key) => sum + (item[key] || 0), 0);
  };
  const categoryData = analytics?.callCategorization || {}
  const currentDataa = categoryData?.[categoryType] || []

  const months = currentDataa.length
    ? Object.keys(currentDataa[0]).filter((key) => key !== "name")
    : [];

  const chartData = {
    labels: currentDataa.map((d) => d.name),
    datasets: [
      {
        data: currentDataa.map((d) => getTotalCount(d)),
        backgroundColor: [
          "#ffe4d1", // Warm Peach
          "#fff4cc", // Soft Yellow
          "#fff9db", // Creamy Sun
          "#fff4e6", // Light Orange
          "#fff0f0"  // Soft Rose
        ],
      },
    ],
  };

  const patientCategoryData = {
    labels: [
      "Govt Health Scheme",
      "NA",
      "Cash",
      "Non Govt Scheme & TPA",
      "Camp"
    ],
    datasets: [
      {
        label: "December",
        data: [920, 628, 405, 11, 7],
        backgroundColor: "#184f9c"
      },
      {
        label: "January",
        data: [663, 398, 417, 14, 9],
        backgroundColor: "#3f86d9"
      },
      {
        label: "February",
        data: [691, 390, 391, 8, 1],
        backgroundColor: "#6aa5e8"
      }
    ]
  };
  // ["jan", "feb", "mar"]
  const labels = months.map(formatMonth);
  const appointmentData = getMonthWiseData(
    analytics?.callCategorization?.appointment || [],
    months
  );

  const newPatientData = getMonthWiseData(
    analytics?.callCategorization?.newPatient || [],
    months
  );

  const oldPatientData = getMonthWiseData(
    analytics?.callCategorization?.oldPatient || [],
    months
  );
  const totalNew = sum(newPatientData);
  const totalOld = sum(oldPatientData);


  const data = {
    labels,
    datasets: [
      {
        label: "Appointments",
        data: appointmentData,
        backgroundColor: "#7b3fe4",
        borderRadius: 6,
        barThickness: 18
      },
      {
        label: "New Patients",
        data: newPatientData,
        backgroundColor: "#2d91ee",
        borderRadius: 6,
        barThickness: 18
      },
      {
        label: "Old Patients",
        data: oldPatientData,
        backgroundColor: "#184f9c",
        borderRadius: 6,
        barThickness: 18
      }
    ]
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

  const patientStatusData = {
    labels,
    datasets: [
      {
        label: "New Patient",
        data: newPatientData ?? [347, 206, 253],
        borderColor: "#3f86d9",
        backgroundColor: "#3f86d9",
        tension: 0.4
      },
      {
        label: "Old Patient",
        data: oldPatientData ?? [1162, 924, 902],
        borderColor: "#184f9c",
        backgroundColor: "#184f9c",
        tension: 0.4
      }
    ]
  };

  useEffect(() => {
    const error = dashError || branchesError || formsError
    if (error) toast.error(error)

  }, [dashError, branchesError, formsError])

  const formsDataMap = {
    Forms: forms?.today || [],
    Followups: forms?.followups || [],
    Appointments: forms?.appointments || []
  };

  const formsData = formsDataMap[formsModalOpen] || [];

  return (
    <div className="dashboard-container">
      {dashboardLoading && (
        <div className="loading-overlay-simple">
          <p>Loading DashBoard data...</p>
        </div>
      )}

      {/* 2. HOSPITAL & BRANCH INFO */}
      <div className="hospital-info-card">
        <div className="info-header">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <h3 className="hospital-name">
                {"Select Branch"}
              </h3>

              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 250, ml: 2 }}
              >
                <Select
                  labelId="branch-label"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  disabled={branchesLoading}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "& .MuiSelect-select": {
                      padding: "8px 14px",
                      fontWeight: 600
                    }
                  }}
                >
                  {branches.length === 0 && (
                    <MenuItem >
                      No Branches Are Found
                    </MenuItem>
                  )}

                  {branches.length > 0 && branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </div>
          </div>
          <div className="hospital-stats">
            <div className="h-stat-box">
              <div className="h-stat-val">
                {branches?.length || 5}
              </div>
              <div className="h-stat-lbl">Branches</div>
            </div>
            <div className="h-stat-box">
              <div className="h-stat-val">{selectedBranch?.beds || 120}</div>
              <div className="h-stat-lbl">Total Beds</div>
            </div>
          </div>
        </div>
      </div>

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

      {/* 4. QUICK STATS - Updated with Icons */}
      {/* Level 1 */}
      <div className="quick-stats-grid">
        <div className="qs-card">
          <div className="qs-icon purple">
            <MedicalServicesIcon />
          </div>
          <div className="qs-info">
            <div className="qs-val">{analytics?.totalDoctors || 0}</div>
            <div className="qs-lbl">Total Doctors</div>
          </div>
        </div>
        <div className="qs-card">
          <div className="qs-icon success">
            <BusinessIcon />
          </div>
          <div className="qs-info">
            <div className="qs-val">
              {analytics?.totalDepartment || 0}
            </div>
            <div className="qs-lbl">Total Departments</div>
          </div>
        </div>
        <div className="qs-card">
          <div className="qs-icon info">
            <GroupIcon />
          </div>
          <div className="qs-info">
            <div className="qs-val">{analytics?.totalUsers}</div>
            <div className="qs-lbl">Agents</div>
          </div>
        </div>
        <div className="qs-card">
          <div className="qs-icon warning">
            <EventAvailableIcon />
          </div>
          <div className="qs-info">
            <div className="qs-val">{analytics?.appointmentForms?.total || 0}</div>
            <div className="qs-lbl">Total Appointments</div>
          </div>
        </div>
        <div className="qs-card">
          <div className="qs-icon danger">
            <DescriptionIcon />
          </div>
          <div className="qs-info">
            <div className="qs-val">
              {analytics?.totalForms?.total || 0}
            </div>
            <div className="qs-lbl">Forms</div>
          </div>
        </div>
      </div>

      {/* Filled Forms Component */}


      {/* 5. MANAGER OVERVIEW */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-chart-bar"></i> Manager Overview
          </div>
        </div>
        <div className="manager-overview-grid">
          <div className="overview-card purple-top">
            <div className="ov-val text-purple">
              {getTeamStat("conversionRate", "0%")}
            </div>
            <div className="ov-lbl">Conversion Rate</div>
          </div>
          <div className="overview-card purple-top">
            <div className="ov-val text-purple">
              {getTeamStat("fcrRate", "0%")}
            </div>
            <div className="ov-lbl">FCR Rate</div>
          </div>
          <div className="overview-card purple-top">
            <div className="ov-val text-purple">
              {getTeamStat("callbackSuccess", "0%")}
            </div>
            <div className="ov-lbl">Callback Success</div>
          </div>
          <div className="overview-card purple-top">
            <div className="ov-val text-purple">
              {getTeamStat("overallQuality", "0%")}
            </div>
            <div className="ov-lbl">Overall Quality</div>
          </div>
        </div>
      </div> */}


      {/* Level 2 */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-user-friends"></i> Call Categorization
          </div>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <Select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              sx={{
                borderRadius: "8px",
                backgroundColor: "white",
                "& .MuiSelect-select": {
                  padding: "6px 14px",
                  fontWeight: 600
                }
              }}
            >
              <MenuItem value="gender">Gender Wise</MenuItem>
              {/* <MenuItem value="location">Location Wise</MenuItem> */}
              <MenuItem value="age">Age Wise</MenuItem>

              <MenuItem value="doctor">Doctor Wise</MenuItem>
              <MenuItem value="poc">Purpose of Call</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="grid-2-col">

          {/* TABLE */}
          <div className="analytics-box" style={{ borderLeft: "5px solid #0f172a" }}>
            <div className="chart-head">
              <i className="fas fa-table"></i> Categorization Summary
            </div>

            <div style={{
              height: "400px",
              overflow: "auto"
            }}>

              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>{categoryLabels[categoryType] || "Category"}</th>

                    {months.map((m) => (
                      <th key={m}>{formatMonth(m)}</th>
                    ))}
                  </tr >
                </thead >

                <tbody>
                  {currentDataa.map((item, i) => {
                    const total = months.reduce(
                      (sum, m) => sum + (item[m] || 0),
                      0
                    );

                    return (
                      <tr key={i}>
                        <td>{item.name}</td>

                        {months.map((m) => (
                          <td key={m}>{item[m] || 0}</td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>{0}</strong></td>
                    <td><strong>{0}</strong></td>
                    <td><strong>{totalOld}</strong></td>
                  </tr>
                </tbody>

              </table>
            </div>

            <div className="patient-summary" style={{ marginTop: "10px" }}>
              <p><strong>New Patients :</strong> {totalNew}</p>
              <p><strong>Old Patients :</strong> {totalOld}</p>
              <p><strong>Total Registered Patients :</strong> {totalNew + totalOld}</p>
            </div>
          </div >

          {/* CHART */}
          < div className="analytics-box" style={{ borderLeft: "5px solid #0f172a" }}>
            <div className="chart-head">
              <i className="fas fa-chart-pie"></i> Distribution
            </div>

            <div className="chart-wrapper">
              <Doughnut data={chartData} options={{ responsive: true }} />
            </div>
          </div >

        </div >
      </div >
      {/* lveel 3 */}
      < div className="dashboard-section" >
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-phone-slash"></i> TOTAL MISSED CALLS
          </div>
        </div>

        <div className="data-grid row-3">
          <div className="data-card" style={{ flex: 1, width: "100%", borderLeft: "5px solid #0f172a" }}>
            <h4>
              <Users size={18} className="mr-2" /> Hospital Activity
            </h4>

            <div className="scrollable-content" style={{ paddingRight: '5px' }}>
              <div
                className="chart-container-sm"
                style={{ width: "100%" }}
              >
                <Bar data={data} options={options} />
              </div>
            </div>
          </div>

          <div className="data-card" style={{ flex: 1, width: "100%", borderLeft: "5px solid #0f172a" }}>
            <h4>
              <i className="fas fa-user-injured mr-2"></i> Patient Analytics
            </h4>

            <div className="scrollable-content">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>New Patient</th>
                    <th>Old Patient</th>
                  </tr >
                </thead >

                <tbody>
                  {labels.map((month, i) => {
                    const newVal = newPatientData[i] || 0;
                    const oldVal = oldPatientData[i] || 0;

                    const { value: change, className } = getChange(
                      newVal,
                      newPatientData[i - 1]
                    );

                    return (
                      <tr key={month}>
                        <td>{month}</td>
                        <td>{newVal}</td>
                        <td>{oldVal}</td>
                      </tr>
                    );
                  })}

                  <tr className="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>{totalNew}</strong></td>
                    <td><strong>{totalOld}</strong></td>
                  </tr>
                </tbody>
              </table >

              <div className="patient-summary" style={{ marginTop: "10px" }}>
                <p><strong>New Patients :</strong> {totalNew}</p>
                <p><strong>Old Patients :</strong> {totalOld}</p>
                <p><strong>Total Registered Patients :</strong> {totalNew + totalOld}</p>
              </div>
            </div>
          </div>
        </div>

      </div >

      <div className="executive-dashboard-section">
        <div className="executive-outbound-grid">
          <div className="executive-outbound-card">
            <div className="executive-chart-title">
              <i className="fas fa-chart-pie"></i>Top 5 Inbound Purpose
            </div>
            <div className="executive-leads-breakdown">
              {analytics?.topInboundPurpose?.length === 0 ? (
                <div>No Data Are Found</div>
              ) : (
                analytics?.topInboundPurpose?.map((item, i) => {
                  return <div key={i} className="executive-lead-source">
                    <div className="executive-source-name">
                      <i className="fab fa-facebook"></i> {item?.purpose || "-"}
                    </div>
                    <div className="executive-source-count">{item?.count || 0}</div>
                  </div>
                })
              )}
            </div>

          </div>
          <div className="executive-outbound-card">
            <div className="executive-chart-title">
              <i className="fas fa-chart-bar"></i>Top 5 Outbound Purpose
            </div>
            <div className="executive-leads-breakdown">
              {analytics?.topOutboundPurpose?.length === 0 ? (
                <div>No Data Are Found</div>
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

      {/* Level 4 */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            Call Analytics
          </div >
        </div >

        <div className="grid-2-col-wide">

          {/* Patient Status */}
          <div className="analytics-box" style={{ borderLeft: "5px solid #0f172a" }}>
            <div className="chart-head">
              <span>
                <i className="fas fa-chart-line"></i> Patient Status Trend
              </span>
            </div>

            <div className="chart-wrapper">
              <Line data={patientStatusData} options={lineOptions} />
            </div>
          </div>

          {/* Patient Category */}
          <div className="analytics-box" style={{ borderLeft: "5px solid #0f172a" }}>
            <div className="chart-head">
              <i className="fas fa-chart-bar"></i> Patient Category
            </div>

            <div className="chart-wrapper">
              <Bar data={patientCategoryData} options={barOptions} />
            </div>
          </div>

        </div>
      </div >

      {/* 6. MISSED CALLS CALLBACK */}
      {/* <div className="dashboard-section callback-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-phone-volume"></i> Recent Missed Calls
          </div>
          <button className="btn-primary-sm">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div className="callback-grid">
          {displayMissedCalls.map((call, index) => (
            <div className="callback-item" key={index}>
              <div className="cb-name">
                {call.CallerName || call.SourceNumber || "Unknown Caller"}
              </div>
              <div className="cb-detail">
                {new Date(call.startTime).toLocaleString()} • {call.Direction}
              </div>
              <div className="cb-meta">
                Status:{" "}
                <span className="text-danger">
                  {call.status || call.hangupcause || "Missed"}
                </span>
              </div>
              <div className="cb-actions">
                <button className="btn-xs btn-primary">Call Back</button>
                <button className="btn-xs btn-success">Mark Done</button>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* 7. REAL-TIME MONITORING */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-broadcast-tower"></i> Real-time Monitoring
          </div>
          <div className="filters">
            <select className="filter-select">
              <option>All Departments</option>
            </select>
          </div>
        </div>
        <div className="monitoring-grid">
          <div className="monitor-card">
            <div className="m-val">{getCallStat("todaysCalls", 0)}</div>
            <div className="m-lbl">Total Calls</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">{getCallStat("todaysInbound", 0)}</div>
            <div className="m-lbl">Inbound</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">{getCallStat("todaysOutbound", 0)}</div>
            <div className="m-lbl">Outbound</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">
              {formatDuration(getCallStat("avgCallDurationToday", 0))}
            </div>
            <div className="m-lbl">Avg Duration</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">{samwadLive.activeUsers}</div>
            <div className="m-lbl">Live Agents</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">--%</div>
            <div className="m-lbl">Occupancy Rate</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">--</div>
            <div className="m-lbl">Escalations</div>
          </div>
          <div className="monitor-card">
            <div className="m-val">{getCallStat("todaysMissed", 0)}</div>
            <div className="m-lbl">Missed Today</div>
          </div>
        </div>
      </div> */}

      {/* 8. KPI DASHBOARD */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-bullseye"></i> KPI Dashboard
          </div>
        </div>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-val text-success">91%</div>
            <div className="kpi-lbl">Quality Score</div>
            <div className="progress-track">
              <div
                className="progress-fill bg-success"
                style={{ width: "91%" }}
              ></div>
            </div>
            <div className="kpi-meta">Target: 90%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val text-primary">76%</div>
            <div className="kpi-lbl">FCR Rate</div>
            <div className="progress-track">
              <div
                className="progress-fill bg-primary"
                style={{ width: "76%" }}
              ></div>
            </div>
            <div className="kpi-meta">Target: 80%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val text-warning">2:18</div>
            <div className="kpi-lbl">Avg Handle Time</div>
            <div className="progress-track">
              <div
                className="progress-fill bg-warning"
                style={{ width: "65%" }}
              ></div>
            </div>
            <div className="kpi-meta">Target: 2:00</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val text-purple">17.8%</div>
            <div className="kpi-lbl">Conversion</div>
            <div className="progress-track">
              <div
                className="progress-fill bg-purple"
                style={{ width: "89%" }}
              ></div>
            </div>
            <div className="kpi-meta">Target: 20%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val text-danger">9.2%</div>
            <div className="kpi-lbl">Missed Rate</div>
            <div className="progress-track">
              <div
                className="progress-fill bg-danger"
                style={{ width: "46%" }}
              ></div>
            </div>
            <div className="kpi-meta">Target: 5%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val text-success">94%</div>
            <div className="kpi-lbl">Callback Success</div>
            <div className="progress-track">
              <div
                className="progress-fill bg-success"
                style={{ width: "94%" }}
              ></div>
            </div>
            <div className="kpi-meta">Target: 95%</div>
          </div>
        </div>
      </div> */}

      {/* 9. CRITICAL ALERTS */}
      {/* <div className="dashboard-section alerts-container">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-exclamation-triangle"></i> Critical Alerts
          </div>
          <select className="filter-select">
            <option>All Alerts</option>
          </select>
        </div>
        <div className="alert-list">
          <div className="alert-item">
            <div className="alert-icon bg-danger">
              <i className="fas fa-skull-crossbones"></i>
            </div>
            <div className="alert-content">
              <div className="alert-msg">
                Emergency Dept: Wait time exceeded 30 minutes
              </div>
              <div className="alert-time">15 minutes ago</div>
            </div>
            <button className="btn-xs btn-outline">View</button>
          </div>
        </div>
      </div> */}

      {/* 10. TICKET MANAGEMENT SYSTEM */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-life-ring"></i> Ticket Management System
          </div>
          <button className="btn-primary-sm" onClick={toggleModal}>
            <i className="fas fa-plus"></i> Create Ticket
          </button>
        </div>
        <div className="tms-section">
          <div className="tms-filters">
            <select className="filter-select">
              <option>All Status</option>
            </select>
            <select className="filter-select">
              <option>All Priorities</option>
            </select>
          </div>
          <div className="ticket-list">
            <div className="ticket-item">
              <div>
                <div className="t-title">
                  VIP Patient Complaint - Dr. Sharma
                </div>
                <div className="t-meta">Ticket #ESC-8452 • Clinical</div>
              </div>
              <span className="badge badge-high">High</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* 11. TEAM LEADERS (From getAllUsers) */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-user-tie"></i> Team Leaders ({staffCounts.tls})
          </div>
        </div>
        <div className="team-grid">
          {teamLeadersList.length > 0 ? (
            teamLeadersList.map((tl, index) => (
              <div className="team-card" key={index}>
                <div className="tc-head">
                  <div className="tc-avatar">
                    {tl.name ? tl.name.charAt(0).toUpperCase() : "TL"}
                  </div>
                  <div>
                    <h4>{tl.name}</h4>
                    <p>{tl.username}</p>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="tc-stats">
                  <div>
                    <strong>{tl.hospitalName?.name || tl.hospitalName}</strong>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "20px", color: "var(--gray)" }}>
              No Team Leaders found for your hospitals.
            </div>
          )}
        </div>
      </div> */}

      {/* 12. AGENT PERFORMANCE (With LIVE STATUS) */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-user-friends"></i> Agent Performance (
            {staffCounts.agents})
          </div>
          <select className="filter-select">
            <option>By Call Volume</option>
          </select>
        </div>
        <div className="grid-2-col">
          <div className="analytics-box">
            <div className="chart-head">
              <i className="fas fa-medal"></i> Top Performing Agents
            </div>
            <div className="agent-list">
              {mergedAgents.length > 0 ? (
                mergedAgents.slice(0, 5).map((member, index) => (
                  <div className="agent-row" key={index}>
                    <div className="a-info">
                      <div className="a-avatar">
                        {member.name
                          ? member.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div>
                        <strong>{member.name}</strong>
                        <p>
                          {member.hospitalName?.name ||
                            member.hospitalName ||
                            "Agent"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="a-status"
                      style={{
                        fontSize: "0.8rem",
                        marginRight: "auto",
                        marginLeft: "10px",
                      }}
                    >
                      {member.liveStatus !== "Offline" ? (
                        <span className="text-success">
                          ● {member.liveStatus}
                        </span>
                      ) : (
                        <span className="text-gray">● Offline</span>
                      )}
                    </div>
                    <div className="a-stats">
                      <strong>{member.todayCalls}</strong> Calls •{" "}
                      <strong>{formatDuration(member.avgDuration)}</strong> Avg
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "10px" }}>No agents found.</div>
              )}
            </div>
          </div>
          <div className="analytics-box">
            <div className="chart-head">
              <i className="fas fa-chart-pie"></i> Call Distribution (
              {selectedPeriod})
            </div>
            <div className="chart-wrapper">
              <Doughnut data={agentDistData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div> */}

      {/* 13. AUTO CALL AUDITOR */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-robot"></i> Auto Call Auditor Overview
          </div>
        </div>
        <div className="aca-layout">
          <div className="aca-metrics">
            <div className="aca-box">
              <div className="ab-val">{getFormStat("totalAudited", "0")}</div>
              <div className="ab-lbl">Total Calls Audited</div>
            </div>
            <div className="aca-box">
              <div className="ab-val">{getFormStat("avgQuality", "0%")}</div>
              <div className="ab-lbl">Avg Quality Score</div>
            </div>
            <div className="aca-box">
              <div className="ab-val text-danger">
                {getFormStat("totalErrors", 0)}
              </div>
              <div className="ab-lbl">Total Error Counts</div>
            </div>
            <div className="aca-box">
              <div className="ab-val text-danger">
                {getFormStat("fatalCounts", 0)}
              </div>
              <div className="ab-lbl">Fatal Counts</div>
            </div>
            <div className="aca-box">
              <div className="ab-val text-danger">
                {getFormStat("trainingPendency", 0)}
              </div>
              <div className="ab-lbl">Training Pendency</div>
            </div>
            <div className="aca-box">
              <div className="ab-val">
                {getFormStat("complianceRate", "0%")}
              </div>
              <div className="ab-lbl">Compliance Rate</div>
            </div>
          </div>
          <div className="analytics-box">
            <div className="chart-head">
              <i className="fas fa-chart-line"></i> Quality Trend
            </div>
            <div className="chart-wrapper">
              <Line data={qualityTrendData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div> */}

      {/* 14. DEPARTMENT PERFORMANCE */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-building"></i> Performance by Departments
          </div>
        </div>
        <div className="grid-2-col">
          <div className="analytics-box">
            <div className="chart-head">
              <i className="fas fa-list"></i> Department Stats
            </div>
            <div className="dept-list">
              <div className="dept-item">
                <div className="d-flex">
                  <span>Urology</span>
                  <span>14,704 Calls</span>
                </div>
                <div className="progress-bg">
                  <div
                    className="progress-fill"
                    style={{ width: "95%", background: "#9b59b6" }}
                  ></div>
                </div>
              </div>
              <div className="dept-item">
                <div className="d-flex">
                  <span>General Medicine</span>
                  <span>12,048 Calls</span>
                </div>
                <div className="progress-bg">
                  <div
                    className="progress-fill"
                    style={{ width: "78%", background: "#9b59b6" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="analytics-box">
            <div className="chart-head">
              <i className="fas fa-chart-bar"></i> Calls by Department
            </div>
            <div className="chart-wrapper">
              <Bar data={departmentData} options={barOptions} />
            </div>
          </div>
        </div>
      </div> */}

      {/* 15. CALL ANALYTICS */}
      {/* <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-phone-alt"></i> Call Analytics
          </div>
        </div>
        <div className="grid-2-col-wide">
          <div className="analytics-box">
            <div className="chart-head">
              <span>
                <i className="fas fa-chart-line"></i> Call Volume Trend (Last 7
                Days)
              </span>
            </div>
            <div className="chart-wrapper">
              <Line data={callVolumeData} options={lineOptions} />
            </div>
          </div>
          <div className="analytics-box">
            <div className="chart-head">
              <i className="fas fa-percentage"></i> Performance Metrics
            </div>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Calls</td>
                  <td>{getCallStat("todaysCalls", 0)}</td>
                  <td className="text-success">↑</td>
                </tr>
                <tr>
                  <td>Inbound</td>
                  <td>{getCallStat("todaysInbound", 0)}</td>
                  <td className="text-success">↑</td>
                </tr>
                <tr>
                  <td>Outbound</td>
                  <td>{getCallStat("todaysOutbound", 0)}</td>
                  <td className="text-success">↑</td>
                </tr>
                <tr>
                  <td>Missed</td>
                  <td>{getCallStat("todaysMissed", 0)}</td>
                  <td className="text-danger">↓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div> */}

      {/* MODAL */}
      {
        isTicketModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New Ticket</h3>
                <button className="close-btn" onClick={toggleModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
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
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={toggleModal}>
                  Cancel
                </button>
                <button className="btn-primary">Create</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Profile Modal */}
      {
        formsModalOpen && (
          <FilledFormsComponent
            setFormsModalOpen={setFormsModalOpen}
            formsData={formsData}
            formsLoading={dashboardLoading}
            formsTypeFilter={formsTypeFilter}
            setFormsTypeFilter={setFormsTypeFilter}
            page={page}
            setPage={setPage}
            totalPages={metrics?.pagination?.totalPages}
          >
          </FilledFormsComponent>
        )
      }
      {
        profileModalOpen && (
          <ProfilePopup
            user={currentUser}
            onClose={() => setProfileModalOpen(false)}
          />
        )
      }
    </div >
  );
};

export default Dashboard;
