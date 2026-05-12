import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./model.css";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { GlobalHospitalContextProvider } from "./contexts/HospitalContexts";
import Login from "./components/Login/Login";
import { UserContextHook } from "./contexts/UserContexts";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "./components/GlobalLoader";
import { Outlet } from "react-router-dom";

// Panel imports - Production-level structure
import {
  SuperAdminDashboard,
  EditHospitalSuperadmin,
  EditBranches,
  BranchInfo,
  HospitalCreationNew,
  HospitalCreation,
  HospitalList,
  UserManagement,
  AuditLogs,
} from "./panels/superAdmin";

import {
  AdminDashboard,
  UserManagementAdmin,
  UserManagement as AdminUserManagement,
  RolesPermissions,
  AuditLog,
} from "./panels/admin";

import {
  SuperManagerDashboard,
  UserManagementSuperManager,
} from "./panels/superManager";

import {
  TeamDashboard,
  UserManagementTeamLeader,
} from "./panels/teamLeader";

import {
  ExecutiveDashboard,
  ExecutiveForms,
} from "./panels/executive";
import AdminManagement from "./panels/superAdmin/adminManagement/AdminManagement";
import { PatientHistory } from "./scenes/global/Patient_Management/PatientHistory";
import { PatientHistory as PatientHistoryForNonAdmins } from "./scenes/global/Patient_Management/PatientHistoryForNonAdmins";
import { SInglePatientDetails } from "./scenes/global/Patient_Management/SInglePatientDetails";


const HospitalManagementLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

function App() {
  const [theme, colorMode] = useMode();
  const { currentUser } = UserContextHook();
  // const colors = tokens(theme.palette.mode);
  const [isSidebar, setIsSidebar] = useState(true);
  const [toggled, setIsToggled] = useState(false);
  const [refresh, setRefresh] = useState(false);
  // const isLoggedIn = !!currentUser;

  const userRole = currentUser?.type;
  const hasAdminPrivileges = [
    "superadmin",
    "admin",
    "supermanager",
    "teamLeader",
    "teamleader"
  ].includes(userRole);

  const adminRoutes = (
    <>
      {userRole === "superadmin" && (
        <>
          <Route path="/admin-management" element={<AdminManagement />} />
          <Route path="/patient-history" element={<PatientHistory />} />
          <Route path="/single-patient-history/:id" element={<SInglePatientDetails />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/admin-audit-logs" element={<AuditLog />} />
        </>
      )}
      {userRole === "admin" && (
        <>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/patient-history" element={<PatientHistory />} />
          <Route path="/single-patient-history/:id" element={<SInglePatientDetails />} />
          <Route path="/user-management" element={<UserManagementAdmin />} />
          <Route path="/roles-permissions" element={<RolesPermissions />} />
          <Route path="/admin-user-management" element={<AdminUserManagement />} />
        </>
      )}

      {userRole === "teamLeader" || userRole === "teamleader" && (
        <>
          <Route path="/" element={<TeamDashboard />} />
          <Route path="/patient-history" element={<PatientHistoryForNonAdmins />} />
          <Route path="/single-patient-history/:id" element={<SInglePatientDetails />} />
          <Route path="/user-management" element={<UserManagementTeamLeader />} />
        </>
      )}

      {userRole === "supermanager" && (
        <>
          <Route path="/" element={<SuperManagerDashboard />} />
          <Route path="/patient-history" element={<PatientHistoryForNonAdmins />} />
          <Route path="/single-patient-history:/id" element={<SInglePatientDetails />} />
          <Route path="/user-management" element={<UserManagementSuperManager />} />
        </>
      )}

      {(userRole === "superadmin" || userRole === "admin") && (
        <>
          {userRole === "superadmin" && (
            <Route path="/" element={<SuperAdminDashboard />} />
          )}
          {userRole === "admin" && (
            <Route path="/" element={<AdminDashboard />} />
          )}
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/admin-audit-logs" element={<AuditLog />} />
        </>
      )}

      {hasAdminPrivileges && (
        <Route path="/hospital-management" element={<HospitalManagementLayout />}>
          <Route
            index
            element={<HospitalCreationNew />}
          />
          <Route index element={<HospitalCreationNew />} />
          <Route path="edit-branches/:id" element={<EditBranches />} />
          <Route path="edit-branches/:id/edit" element={<BranchInfo />} />
          <Route path="edit/:id" element={<EditHospitalSuperadmin />} />
          <Route path="create" element={<HospitalCreation />} />
          <Route path="assigned" element={<HospitalList />} />
        </Route>
      )}
    </>
  );

  const nonAdminRoutes = (
    <>
      {userRole === "teamLeader" || userRole === "teamleader" ? (
        <Route path="/" element={<TeamDashboard />} />
      ) : userRole === "executive" ? (
        <>
          <Route path="/" element={<ExecutiveDashboard />} />
          <Route path="/patient-history" element={<PatientHistoryForNonAdmins />} />
          <Route path="/single-patient-history/:id" element={<SInglePatientDetails />} />
        </>
      ) : null}

      {userRole === "executive" && (

        <Route path="/executive-forms" element={<ExecutiveForms />} />
      )}
    </>
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {currentUser ? (
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalLoader />
            <div className="app-container">
              <div className="topbar-wrapper">
                <Topbar
                  setIsSidebar={setIsSidebar}
                  setIsToggled={setIsToggled}
                  toggled={toggled}
                  setRefresh={setRefresh}
                />
              </div>

              <div className="main-layout">
                <Sidebar
                  isSidebar={isSidebar}
                  toggled={toggled}
                  setIsToggled={setIsToggled}
                />
                <main className="main-content">
                  <GlobalHospitalContextProvider>
                    <Routes>
                      <Route path="/login" element={<Navigate to="/" />} />
                      {hasAdminPrivileges ? adminRoutes : nonAdminRoutes}
                    </Routes>
                  </GlobalHospitalContextProvider>
                </main>
              </div>
            </div>


          </ThemeProvider>
        </ColorModeContext.Provider>
      ) : (

        <Routes>
          <Route path="/*" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<Login setRefresh={setRefresh} />}
          />
        </Routes>

      )}
    </>
  )

}

export default App;
