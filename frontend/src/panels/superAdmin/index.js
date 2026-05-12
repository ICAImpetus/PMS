/**
 * SuperAdmin Panel - Production-level exports
 * Role: superadmin
 */

// Dashboard
export { default as SuperAdminDashboard } from "./dashboard/Dashboard";
export { default as AuditLogs } from "./dashboard/AuditLogs";

// Hospital Management
export { default as EditHospitalSuperadmin } from "./hospitalManagement/editHospital";
export { default as EditBranches } from "./hospitalManagement/editHospital/EditBranches";
export { default as BranchInfo } from "./hospitalManagement/editHospital/BranchInfo";
export { default as HospitalCreationNew } from "./hospitalManagement/hospitalForm/index3";
export { default as HospitalCreation } from "../../scenes/hospitalform/HospitalCreation";
export { default as HospitalList } from "./hospitalManagement/hospitalList";

// User Management
export { default as UserManagement } from "./userManagement";
export { default as AllUsers } from "./userManagement/AllUsers";
