import React, { useState, useEffect, useRef } from "react";
import "./Team.css";
import SectionLoader from "../../../components/SectionLoader";
import { useLocation, useNavigate } from "react-router-dom";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import { ProfilePopup } from "../../../scenes/global/ProfileAndCodeAnnousementPopup";
import { Toaster, toast } from "react-hot-toast";
import FilledFormsComponent from "../../../components/customComponents/FilledFormsComponent";
import { UserContextHook } from "../../../contexts/UserContexts";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";
import { AlertTriangle, User } from "lucide-react";
import { Pie } from "react-chartjs-2";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import LabelIcon from "@mui/icons-material/Label";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import PhoneMissedIcon from "@mui/icons-material/PhoneMissed";
import UserIcon from "@mui/icons-material/Person";

const filterOptions = [
  { key: "Today", value: "today" },
  { key: "Yesterday", value: "yesterday" },
  { key: "Last 7 Days", value: "last7" },
  { key: "Last 30 Days", value: "last30" },
  { key: "Last 3 Month", value: "last3M" }
];

const TeamDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = UserContextHook();
  const [formsTypeFilter, setFormsTypeFilter] = useState("all");
  const [filter, setFilter] = useState(filterOptions[0].value);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [page, setPage] = useState(1);
  const [branches, setBranches] = useState([])
  const [codeAlerts, setCodeAlerts] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [profile, setProfile] = React.useState(null);
  const [hospitalId, setHospitalId] = React.useState(null)
  const [branchFollowups, setBranchFollowups] = useState({ data: [], total: 0, page: 1, limit: 10 });
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    type: "Loading...",
    ID: "",
    username: "",
    lastLoginTimeIST: "N/A",
    baseAccumulatedSeconds: 0,
    totalLoginTimeFormatted: "00h 00m 00s",
  });
  const [forms, setForms] = useState({
    today: [],
    appointments: [],
    followups: []
  });
  // Forms
  const [formsModalOpen, setFormsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const navigate = useNavigate()


  const { loading: dashboardLoading, request: getDashboard, error: dashError } = useApi(commonRoutes.getDashboard)
  const { loading: branchesLoading, request: getBranches, error: branchesError } = useApi(commonRoutes.branchesByRole)
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
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const branchParam = selectedBranch || undefined;

        const [res, alertRes] = await Promise.all([
          getDashboard(branchParam, hospitalId),
          getCodeAlerts(hospitalId, selectedBranch),
        ])

        if (res?.data && isMounted) {
          const { analytics, branchFollowups } = res.data;
          setAnalytics(analytics);
          setBranchFollowups(branchFollowups)
          setCodeAlerts(alertRes?.data || []);
        }

      } catch (err) {
        console.error("Dashboard error", err);
      }
    };

    if (hospitalId && selectedBranch) {
      fetchDashboard();
    }


    return () => {
      isMounted = false;
    };
  }, [hospitalId, selectedBranch]);

  const formsDataMap = {
    Forms: forms.today,
    Followups: forms.followups,
    Appointments: forms.appointments
  };

  const formsData = formsDataMap[formsModalOpen] || [];


  useEffect(() => {

    if (currentUser) {
      setUserInfo({ ...currentUser })
    }
  }, [currentUser])
  // --- 3. DYNAMIC CHART INITIALIZATION ---

  const closeAssignModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // normalize into fixed structure
  const statusMap = {
    connected: 0,
    "not connected": 0,
    "call-drop": 0
  };

  analytics?.connectionStatus?.forEach(item => {
    statusMap[item.callStatus] = item.count;
  });

  const total =
    statusMap.connected +
    statusMap["not connected"] +
    statusMap["call-drop"];

  const getPercent = (val) =>
    total ? Math.round((val / total) * 100) : 0;


  useEffect(() => {
    const error = dashError || branchesError || formsError
    if (error) toast.error(error)

  }, [dashError, branchesError, formsError])

  if (dashboardLoading) {
    return (
      <div className="tld-dashboard-content-wrapper">
        <div className="tld-page-header">
          <h1>
            <DashboardIcon sx={{ mr: 1 }} /> Team Dashboard
          </h1>
        </div>
        <SectionLoader height="60vh" message="Loading dashboard data..." />
      </div>
    );
  }

  const statusClasses = ["info", "success", "warning"];
  const callDistributionData = {
    labels: analytics?.callsDistribution?.labels,

    datasets: [
      {
        data: analytics?.callsDistribution?.callData,
        backgroundColor: [
          "#fee2e2", // Soft Red
          "#ffedd5", // Soft Orange
          "#fef9c3", // Soft Yellow
          "#fce7f3", // Soft Pink
          "#f5f3ff"  // Soft Purple
        ],
        borderWidth: 1
      }
    ]
  };

  const callDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12
        }
      }
    }
  };

  return (
    <div className="tld-dashboard-content-wrapper">
      {/* Header */}
      {/* <div className="tld-page-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i> Team Dashboard
        </h1>
        <div className="tld-user-info-badge" onClick={setProfileOpen}>
          <div className="tld-user-avatar-circle">
            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "T"}
          </div>
          <div>
            <div style={{ fontWeight: "600" }}>{userInfo.name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--tld-gray)" }}>
              {userInfo.type}
            </div>
          </div>
        </div>
      </div> */}



      {/* Date Filter Section */}
      <div className="tld-date-filter">
        <select id="global-date-range" onChange={(e) => {
          setFilter(e.target.value);
        }}>
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.key}
            </option>
          ))}
        </select>
        <select
          id="global-date-range"
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches.length === 0 ? (
            <option disabled>No Branches Assigned</option>
          ) : (
            branches.map((option) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))
          )}
        </select>
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
      {/* Profile Modal */}
      {profileModalOpen && (
        <ProfilePopup
          user={userInfo}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {/* --- DAILY PERFORMANCE --- */}
      <div className="executive-dashboard-section">
        <div className="executive-section-header">
          <h2 className="executive-section-title">
            <ShowChartIcon /> Daily Performance
          </h2>
        </div>
        <div className="executive-dashboard-section">
          <div className="executive-combined-reporting">
            <div className="bottom-row">
              <div
                className="executive-combined-total-calls executive-card-clickable"
                onClick={() => {
                  navigate("/user-management", { replace: true })
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && (
                    navigate("/user-management", { replace: true })
                  )

                }
              >
                <div className="executive-chart-title">
                  <PeopleIcon /> Total Agents
                </div>
                <div className="content-wrapper">
                  <div className="executive-metric-value">
                    {analytics?.totalAgents || 0}
                  </div>
                </div>
              </div>
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
            </div>
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
                    disabled={(bfPage === 1 && hPage === 1) || dashboardLoading}
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
                      dashboardLoading
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
      {/* --- TEAM PERFORMANCE & LIST --- */}
      <div className="tld-section-wrapper">
        <div className="tld-section-top">
          <h2 className="tld-section-heading">
            <PeopleIcon /> Team Overview
          </h2>
        </div>

        <div className="tld-analytics-wrapper">
          <div className="tld-split-grid">
            <div className="tld-team-list-container">
              {analytics?.teamOverview && analytics?.teamOverview.length > 0 ? (
                analytics.teamOverview.map((item, i) => {
                  const status = statusClasses[i % statusClasses.length];
                  return (
                    <div key={i} className="tld-team-member-card">
                      <div className="tld-member-avatar">
                        <User size={20} />
                      </div>
                      <div className="tld-member-info">
                        <div className="tld-member-name">{item?.name || "Sandeep"}</div>
                        <div className="tld-member-role">Active Executive</div>
                      </div>
                      <div className={`tld-member-stats-badge ${status}`}>
                        {item?.count || 0} Forms
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="tld-no-data">No team members found</div>
              )}
            </div>

            {/* DYNAMIC CHART */}
            <div className="tld-plain-card" style={{ width: "100%", maxWidth: "100%" }}>
              <div className="tld-card-title">
                <PieChartIcon /> Calls Distribution
              </div>

              <div
                style={{
                  height: "275px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  width: "100%",
                  maxWidth: "100%"
                }}
              >
                <Pie data={callDistributionData} options={callDistributionOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="executive-dashboard-section">
        <div className="executive-outbound-grid">
          <div className="executive-outbound-card">
            <div className="executive-chart-title">
              <PieChartIcon />Top 5 Inbound Purpose
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
              <BarChartIcon />Top 5 Outbound Purpose
            </div>
            {analytics?.topOutboundPurpose?.length === 0 ? (
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
        </div>
      </div>


      {/* --- OUTBOUND PERFORMANCE (STATIC MOCKUP) --- */}
      <div className="tld-section-wrapper">
        <div className="tld-outbound-wrapper">
          <div className="tld-split-grid">
            <div className="tld-detail-card">
              <div className="tld-card-title">
                Lead Sources
              </div>
              {analytics?.topReference?.length === 0 ? (
                <div className="executive-leads-breakdown">
                  <div>No Data Are Found</div>
                </div>
              ) : (
                analytics?.topReference?.map((item, i) => {
                  return <div key={i} className="executive-lead-source">
                    <div className="executive-source-name">
                      <LabelIcon sx={{ fontSize: 16 }} /> {item?.reference || "Other"}
                    </div>
                    <div className="executive-source-count">{item?.count || 0}</div>
                  </div>
                })
              )}
            </div>

            <div className="tld-detail-card">
              <div className="tld-card-title">
                Connection Status
              </div>

              <div>
                {/* Connected */}
                <div className="tld-list-row">
                  <div className="tld-list-label">
                    <EventAvailableIcon className="tld-text-success" /> Connected
                  </div>
                  <div className="tld-list-val tld-text-success">
                    {statusMap.connected} ({getPercent(statusMap.connected)}%)
                  </div>
                </div>
                {/* Call Drop  */}
                <div className="tld-list-row">
                  <div className="tld-list-label">
                    <PhoneMissedIcon className="tld-text-danger" /> Call Drop
                  </div>
                  <div className="tld-list-val tld-text-danger">
                    {statusMap["call-drop"]} ({getPercent(statusMap["call-drop"])}%)
                  </div>
                </div>
                {/* Not Connected */}
                <div className="tld-list-row">
                  <div className="tld-list-label">
                    <SpeakerNotesIcon className="tld-text-warning" /> Not Connected
                  </div>
                  <div className="tld-list-val tld-text-warning">
                    {statusMap["not connected"]} ({getPercent(statusMap["not connected"])}%)
                  </div>
                </div>


              </div>
            </div>
            {/* <div className="tld-detail-card">
              <div className="tld-card-title">
                <i className="fas fa-smile"></i> Customer Sentiment
              </div>
              <div className="tld-sentiment-flex">
                <div className="tld-sentiment-col">
                  <div
                    className="tld-kpi-value tld-text-success"
                    style={{ fontSize: "1.5rem" }}
                  >
                    65%
                  </div>
                  <div className="tld-kpi-label">Positive</div>
                </div>
                <div className="tld-sentiment-col">
                  <div
                    className="tld-kpi-value tld-text-danger"
                    style={{ fontSize: "1.5rem" }}
                  >
                    15%
                  </div>
                  <div className="tld-kpi-label">Negative</div>
                </div>
                <div className="tld-sentiment-col">
                  <div
                    className="tld-kpi-value tld-text-warning"
                    style={{ fontSize: "1.5rem" }}
                  >
                    20%
                  </div>
                  <div className="tld-kpi-label">Neutral</div>
                </div>
              </div>
              <div className="tld-nps-box">
                <div className="tld-kpi-value" style={{ fontSize: "2.5rem" }}>
                  +42
                </div>
                <div className="tld-kpi-label">Net Promoter Score</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

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

      {/* Assign Task Modal */}
      {isModalOpen && (
        <div
          className="tld-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "tld-modal-overlay") closeAssignModal();
          }}
        >
          <div className="tld-modal-window">
            <div className="tld-modal-header-row">
              <h3 style={{ fontSize: "1.3rem", fontWeight: "600", margin: 0 }}>
                Assign Task
              </h3>
              <button
                className="tld-modal-close-btn"
                onClick={closeAssignModal}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAssignTask}>
              <div style={{ marginTop: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Select Agent:
                </label>
                <select style={{ width: "100%", padding: "10px" }} required>
                  <option value="">Select an agent</option>
                  {/* {teamMembers.map((m) => (
                    <option key={m.username} value={m.username}>
                      {m.name}
                    </option>
                  ))} */}
                </select>
              </div>
              <div style={{ marginTop: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Notes (Optional):
                </label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e1e8ed",
                    borderRadius: "8px",
                    minHeight: "80px",
                  }}
                  placeholder="Add any specific instructions..."
                ></textarea>
              </div>
              <div className="tld-modal-footer-row">
                <button
                  type="button"
                  className="tld-modal-action-btn tld-btn-cancel"
                  onClick={closeAssignModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tld-modal-action-btn tld-btn-confirm"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamDashboard;
