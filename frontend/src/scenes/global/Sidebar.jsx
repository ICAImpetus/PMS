import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import LogoutModal from "../../components/LogoutModal";
import { tokens } from "../../theme";
import { UserContextHook } from "../../contexts/UserContexts";
import { logoutApi } from "../../utils/services";

// --- ICONS ---
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
// Assets
import adminImage from "../../assets/adminNew.jpg";
import adminImage3 from "../../assets/adminFemaleNew.jpeg";

// --- ITEM COMPONENT ---
const Item = ({ title, to, icon, selected, setSelected, testId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Check if this item is active based on the URL path
  const isActive = selected === to || (to !== "/" && selected.startsWith(to));

  return (
    <MenuItem

      active={isActive}
      style={{
        color: "white",
      }}
      onClick={() => setSelected(to)}

      icon={icon}
      data-testid={testId}
    >
      <Typography fontSize={13}>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = ({ isSidebar, toggled, setIsToggled }) => {
  const { currentUser } = UserContextHook();

  // Define role groups for easier checking
  const userType = currentUser?.type;
  const isManagement = [
    "superadmin",
    "admin",
    "supermanager",
    "teamLeader",
    "teamleader"
  ].includes(userType);
  const isSuperAdmin = userType === "superadmin";
  const isAdmin = userType === "admin";
  const isSuperManager = userType === "supermanager";
  const isTeamLeader = userType === "teamLeader" || userType === "teamleader";
  const isExecutive = userType === "executive";
  const isHospital = userType === "hospital";
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(isExecutive ? false : true);

  // Initialize state with current URL path
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);

  // Sync state if the user navigates using back/forward buttons
  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  const capitalizeFirstChar = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };



  // --- LOGOUT HANDLER ---
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logoutApi();
      return Promise.resolve();
    } catch (error) {
      console.error("Error during logout API call:", error);
      return Promise.reject(error);
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          "& .pro-sidebar": {
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            background:
              theme.palette.mode === "dark"
                ? `${colors.primary[800]} !important`
                : `#212f3d !important`,
          },
          "& .pro-sidebar-inner": {
            background: "transparent !important",
            padding: "0 !important",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
          "& .pro-menu": {
            padding: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            "& > ul": {
              flex: 1,
            },
          },
          "& .pro-icon-wrapper": {
            backgroundColor: "transparent !important",
          },
          "& .pro-inner-item": {
            padding: "5px 20px 5px 20px !important",
          },
          "& .pro-inner-item:hover": {
            color: "#868dfb !important",
          },
          "& .pro-menu-item.active": {
            color: "#6870fa !important",
          },
        }}
      >
        <ProSidebar collapsed={toggled ? false : isCollapsed} breakPoint="md" toggled={toggled} onToggle={setIsToggled}>
          <Menu iconShape="square">
            {/* LOGO AND MENU ICON */}
            <MenuItem
              onClick={() => setIsCollapsed(!isCollapsed)}
              icon={
                (!toggled && isCollapsed) ? (
                  <MenuOutlinedIcon sx={{ color: "white" }} />
                ) : undefined
              }
              style={{ margin: "10px 0 20px 0", color: colors.grey[100], display: toggled ? 'none' : 'block' }}
            >
              {(!isCollapsed || toggled) && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  ml="15px"
                >
                  <Typography variant="h3" color={"white"}>
                    {/* SuperAdmin */}
                  </Typography>
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon sx={{ color: "white" }} />
                  </IconButton>
                </Box>
              )}
            </MenuItem>
            {(!isCollapsed || toggled) && (
              <Box mb="10px">
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img
                    alt="profile-user"
                    width="100px"
                    height="100px"
                    src={isSuperAdmin ? adminImage3 : adminImage}
                    style={{ cursor: "pointer", borderRadius: "50%" }}
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    sx={{
                      color: "white !important",
                      fontWeight: "bold",
                      m: "10px 0 0 0",
                      fontSize: "clamp(14px, 2vw, 20px)",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentUser?.name || "USER"}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "white !important" }}>
                    {userType ? capitalizeFirstChar(userType) : "Admin"}
                  </Typography>
                </Box>
              </Box>
            )}
            <Box paddingLeft={isCollapsed ? undefined : "5%"}>
              {/* --- DASHBOARD (Visible to All) --- */}
              <Item
                title="Dashboard"
                to="/"
                icon={<SpaceDashboardOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Patient History"
                to="/patient-history"
                icon={<PersonAddIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              {/* --- EXECUTIVE ITEMS --- */}
              {isExecutive && (
                <>
                  <Item
                    title="Executive Forms"
                    to="/executive-forms"
                    icon={<AssignmentIndOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  {/* <Item
                    title="Reports"
                    to="/reports"
                    icon={<AssessmentOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Call Details"
                    to="/call-details"
                    icon={<PhoneInTalkOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}
                </>
              )}

              {
                isManagement && (
                  <>
                    <Item
                      title="Hospital Management"
                      to="/hospital-management"
                      icon={<LocalHospitalOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                      testId="hospitalmanagementtestid"
                    />
                    {
                      (isSuperAdmin) && (
                        <>
                          <Item
                            title="Admin Managemnt"
                            to="/admin-management"
                            icon={<PeopleAltOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                          />
                        </>
                      )
                    }
                    <Item
                      title="User Management"
                      testId="usermanagementtestid"
                      to="/user-management"
                      icon={<PeopleAltOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </>
                )
              }

              {/* --- SUPERADMIN AND ADMIN ONLY --- */}

              {
                (isSuperAdmin || isAdmin) && (
                  <>
                    <Item
                      title="Audit Logs"
                      to="/admin-audit-logs"
                      icon={<AssessmentOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </>
                )
              }

              {/* --- TEAM LEADER SPECIFIC --- */}
              {
                isTeamLeader && (
                  <>
                    {/* <Item
                    title="Team Reports"
                    to="/team-reports"
                    icon={<AssessmentOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Call Details"
                    to="/team-call-details"
                    icon={<PhoneInTalkOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Live Monitoring"
                    to="/team-live-monitoring"
                    icon={<MonitorHeartOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Team Performance"
                    to="/team-performance"
                    icon={<TrendingUpOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}
                  </>
                )
              }

              {/* --- SUPER MANAGER SPECIFIC --- */}
              {
                isSuperManager && (
                  <>
                    {/* <Item
                    title="Team Performance"
                    to="/supermanager-team-performance"
                    icon={<LocalHospitalOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Call Details"
                    to="/supermanager-calldetails"
                    icon={<LocalHospitalOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}
                    {/* <Item
                    title="Reports"
                    to="/team-reports"
                    icon={<AssessmentOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}
                    {/* <Item
                    title="Action Center"
                    to="/action-center"
                    icon={<AssignmentIndOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Agents"
                    to="/agents"
                    icon={<PeopleAltOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Quality"
                    to="/quality"
                    icon={<ChecklistIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}
                  </>
                )
              }

              {/* --- ADMIN SPECIFIC --- */}
              {
                isAdmin && (
                  <>
                    {/* <Item
    title="Integrations"
    to="/integrations"
    icon={<AllInclusiveIcon />}
    selected={selected}
    setSelected={setSelected}
                  /> */}
                    {/* <Item
                    title="User Management"
                    to="/admin-user-management"
                    icon={<PeopleAltOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}

                    {/* <Item
                    title="Roles & Permissions"
                    to="/roles-permissions"
                    icon={<PeopleAltOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}

                    {/* <Item
                    title="Admin Audit Logs"
                    to="/admin-audit-logs"
                    icon={<SecurityOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  /> */}
                    {/* <Item
                    title="Assigned Hospitals"
                    to="/assigned-hospitals"
                    icon={<ListAltOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}

                  /> */}
                  </>
                )
              }

              {/* --- HOSPITAL SPECIFIC --- */}
              {
                isHospital && (
                  <Item
                    title="Modify Hospital"
                    to="/hospital-parts"
                    icon={<HealingOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )
              }
            </Box >

            {/* Scrollable Content Spacer */}
            < Box sx={{ flex: 1, overflowY: "auto" }}></Box >

            {/* Fixed Bottom Section */}
            < Box
              sx={{
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                position: "sticky",
                bottom: 0,
                background:
                  theme.palette.mode === "dark"
                    ? colors.primary[800]
                    : "#212f3d",
                zIndex: 1,
              }}
            >
              <MenuItem
                icon={<LogoutIcon sx={{ color: "white" }} />}
                style={{
                  color: "white",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  padding: isCollapsed ? "12px 0" : "12px 20px",
                  margin: 0,
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onClick={handleLogout}
              >
                {(!isCollapsed || toggled) && (
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography sx={{ ml: 2 }}>Logout</Typography>
                  </Box>
                )}
              </MenuItem>
            </Box >
          </Menu >
        </ProSidebar >
      </Box >
      <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onLogout={handleLogoutConfirm}
      />
    </>
  );
};
export default Sidebar;
