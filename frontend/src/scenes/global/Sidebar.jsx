import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, Button, Typography, Avatar, IconButton, Divider } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import LogoutModal from "../../components/LogoutModal";
import { UserContextHook } from "../../contexts/UserContexts";
import { logoutApi } from "../../utils/services";

// --- ICONS ---
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import HistoryIcon from "@mui/icons-material/History";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";

// --- CUSTOM ITEM COMPONENT ---
const CustomMenuItem = ({ title, to, icon, selected, setSelected, isCollapsed, testId }) => {
  const isActive = selected === to || (to !== "/" && selected.startsWith(to));

  return (
    <MenuItem
      active={isActive}
      onClick={() => setSelected(to)}
      icon={icon}
      data-testid={testId}
      style={{
        margin: "4px 16px",
        borderRadius: "16px",
        backgroundColor: isActive ? "#EFF6FF" : "transparent",
        color: isActive ? "#0256E8" : "#64748B",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {!isCollapsed && (
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: isActive ? "#0256E8" : "#64748B",
          }}
        >
          {title}
        </Typography>
      )}
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = ({ isSidebar, toggled, setIsToggled }) => {
  const { currentUser } = UserContextHook();

  // Define role groups
  const userType = currentUser?.type;
  const isManagement = [
    "superadmin",
    "admin",
    "supermanager",
    "teamLeader",
    "teamleader",
  ].includes(userType);
  const isSuperAdmin = userType === "superadmin";
  const isAdmin = userType === "admin";
  const isSuperManager = userType === "supermanager";
  const isTeamLeader = userType === "teamLeader" || userType === "teamleader";
  const isExecutive = userType === "executive";
  const isHospital = userType === "hospital";
  const isDoctor = userType === "doctor";

  const [isCollapsed, setIsCollapsed] = useState(
    isExecutive || isDoctor ? false : true
  );

  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

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

  // Toggle Collapse Handler
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          padding: "16px",
          backgroundColor: "#F8FAFC",
          "& .pro-sidebar": {
            height: "100%",
            borderRadius: "24px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF !important",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
            width: isCollapsed ? "80px !important" : "270px !important",
            minWidth: isCollapsed ? "80px !important" : "270px !important",
            transition: "all 0.3s ease",
          },
          "& .pro-sidebar-inner": {
            background: "transparent !important",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "24px 0",
          },
          "& .pro-menu": {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          },
          "& .pro-icon-wrapper": {
            backgroundColor: "transparent !important",
            color: "inherit !important",
          },
          "& .pro-inner-item": {
            padding: "10px 16px !important",
          },
          "& .pro-inner-item:hover": {
            color: "#0256E8 !important",
          },
        }}
      >
        <ProSidebar
          collapsed={toggled ? false : isCollapsed}
          breakPoint="md"
          toggled={toggled}
          onToggle={setIsToggled}
        >
          {/* HEADER / LOGO BRANDING WITH MENU TOGGLE ICON */}
          <Box
            px={isCollapsed ? 1.5 : 3}
            mb={3}
            display="flex"
            alignItems="center"
            justifyContent={isCollapsed ? "center" : "space-between"}
          >
            {(!isCollapsed || toggled) && (
              <Box>
                <Typography variant="h5" fontWeight={900} color="#0F172A">
                  Infinis<span style={{ color: "#0256E8" }}>.</span>
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="#3B82F6"
                  sx={{ letterSpacing: "0.8px", fontSize: "9px" }}
                >
                  PATIENT MANAGEMENT SYSTEM
                </Typography>
              </Box>
            )}

            <IconButton
              onClick={handleToggleCollapse}
              sx={{
                color: "#64748B",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                "&:hover": { bgcolor: "#EFF6FF", color: "#0256E8" },
              }}
            >
              <MenuOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Menu iconShape="square">
            <Box>
              {/* DASHBOARD (Visible to All) */}
              <CustomMenuItem
                title="Dashboard"
                to="/"
                icon={<SpaceDashboardOutlinedIcon fontSize="small" />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />

              {!isDoctor && (
                <CustomMenuItem
                  title="Patient History"
                  to="/patient-history"
                  icon={<HistoryIcon fontSize="small" />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* DOCTOR ITEMS */}
              {isDoctor && (
                <CustomMenuItem
                  title="Profile"
                  to="/profile"
                  icon={<PersonAddIcon fontSize="small" />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* EXECUTIVE ITEMS */}
              {isExecutive && (
                <CustomMenuItem
                  title="Executive Forms"
                  to="/executive-forms"
                  icon={<AssignmentIndOutlinedIcon fontSize="small" />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* MANAGEMENT ITEMS */}
              {isManagement && (
                <>
                  <CustomMenuItem
                    title="Hospital Management"
                    to="/hospital-management"
                    icon={<BusinessOutlinedIcon fontSize="small" />}
                    selected={selected}
                    setSelected={setSelected}
                    isCollapsed={isCollapsed}
                    testId="hospitalmanagementtestid"
                  />

                  {isSuperAdmin && (
                    <CustomMenuItem
                      title="Admin Management"
                      to="/admin-management"
                      icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
                      selected={selected}
                      setSelected={setSelected}
                      isCollapsed={isCollapsed}
                    />
                  )}

                  <CustomMenuItem
                    title="User Management"
                    testId="usermanagementtestid"
                    to="/user-management"
                    icon={<GroupOutlinedIcon fontSize="small" />}
                    selected={selected}
                    setSelected={setSelected}
                    isCollapsed={isCollapsed}
                  />
                </>
              )}

              {/* SUPERADMIN & ADMIN */}
              {(isSuperAdmin || isAdmin) && (
                <CustomMenuItem
                  title="Audit Logs"
                  to="/admin-audit-logs"
                  icon={<ArticleOutlinedIcon fontSize="small" />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* TEAM LEADER SPECIFIC */}
              {isTeamLeader && (
                <CustomMenuItem
                  title="Executive Forms"
                  to="/executive-forms"
                  icon={<AssignmentIndOutlinedIcon fontSize="small" />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              )}

              {/* HOSPITAL SPECIFIC */}
              {isHospital && (
                <CustomMenuItem
                  title="Modify Hospital"
                  to="/hospital-parts"
                  icon={<HealingOutlinedIcon fontSize="small" />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              )}
            </Box>
          </Menu>

          {/* DIVIDER DIRECTLY BELOW NAVIGATION TABS */}
          <Box px={2} my={2}>
            <Divider sx={{ borderColor: "#E2E8F0" }} />
          </Box>

          {/* LOGOUT & USER PROFILE SECTION (MOVED UP) */}
          <Box px={isCollapsed ? 1 : 2.5}>
            <Button
              fullWidth
              variant="contained"
              startIcon={!isCollapsed && <LogoutIcon sx={{ fontSize: "16px !important" }} />}
              onClick={handleLogout}
              sx={{
                bgcolor: "#EF4444", // Distinct bold red background
                color: "#FFFFFF",
                borderRadius: "16px",
                py: 1.2,
                px: isCollapsed ? 0 : 2,
                fontWeight: 800,
                fontSize: "11px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                boxShadow: "0px 2px 6px rgba(239, 68, 68, 0.25)",
                minWidth: "auto",
                "&:hover": {
                  bgcolor: "#DC2626", // Darker red on hover
                  boxShadow: "0px 4px 12px rgba(220, 38, 38, 0.35)",
                },
              }}
            >
              {isCollapsed ? <LogoutIcon fontSize="small" /> : "LOG OUT"}
            </Button>

            <Box
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? "center" : "flex-start"}
              gap={1.5}
              mt={2}
            >
              <Avatar
                src={currentUser?.avatarUrl}
                sx={{ width: 36, height: 36, border: "2px solid #E2E8F0" }}
              >
                {currentUser?.name ? currentUser.name[0] : "D"}
              </Avatar>
              {!isCollapsed && (
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {currentUser?.name || "Dr. Sarah Vance"}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#94A3B8"
                    fontSize="9px"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {currentUser?.type || "CHIEF OPS"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </ProSidebar>
      </Box>

      <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onLogout={handleLogoutConfirm}
      />
    </>
  );
};

export default Sidebar;