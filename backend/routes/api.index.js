// import express from "express";
// import auth, { restrictTo, preventAdminDelete } from "../middlewares/auth.js";

// // Auth
// import {
//   getLogs,
//   userLogin,
//   userLogout,
// } from "../controllers/userAuthController.js";

// // User
// import {
//   getAllUsers,
//   createUser,
//   updateUser,
//   updatePassword,
//   getUsersByAdmin,
//   getUsersBySuperadmin,
//   deleteUserById,
//   getMe,
//   checkUserName,
//   handleMigrateData,
// } from "../controllers/userController.js";

// // Hospital
// import {
//   updateOrAddHospital,
//   updateHospital,
//   getHospitalsNames,
//   getHospitalByName,
//   getAllHospitals,
//   getHospitalById,
//   updateBranchInHospital,
//   addBranchToHospital,
//   getBranchesByHosptialName,
//   hospitalsWithBasicInfo,
//   getBranchById,
//   updateHospitalById,
//   deleteHospitalById,
//   deleteBranchById,
//   getDoctorsAndDepartmentsNames,
//   getAllHospitalBranches,
//   getSingleBranch,
//   updateDoctor,
//   addDoctor,
//   addDepartment,
//   removeDepartment,
//   removeDoctor,
//   updateDepartment,
//   addEmpanelment,
//   updateEmpanelment,
//   removeEmpanelment,
//   getBranchesByHospital,
//   createLabTest,
//   createIPDAndDayCare,
//   createProcedure,
//   createIncharge,
//   createCodeAnnouncement,
//   updateLabTest,
//   updateIPDAndDayCare,
//   getDoctorsByDepId,
//   updateProcedure,
//   updateIncharge,
//   updateCodeAnnouncement,
//   removeLabTest,
//   removeCodeAnnouncement,
//   removeIncharge,
//   removeProcedure,
//   removeIPDAndDayCare,
//   createBranch,
//   updateBranch,
//   getSuggestions,
//   getDoctorFullProfile,
//   getDashboard,
//   getBranchesByRole,
//   getCodeAlerts,
//   getCreatedCodeAlerts,
//   createCodeAlert,
//   toggleCodeAlertStatus,
// } from "../controllers/hospitalController.js";

// // Filled Forms
// import {
//   createFilledForm,
//   getFilledForms,
// } from "../controllers/filledFormController.js";

// // User Stats
// import { getUserLoginHours } from "../controllers/userStatsController.js";

// // Call
// // import {
// //   logCallEvent,
// //   getCallData,
// //   getMissedCalls,
// //   reassignCall,
// //   updateCallDetails,
// // } from "../controllers/callController.js";
// import { getCallStatsByAgent } from "../controllers/controller/callStatsController.js";
// import { getTeamMemberStats } from "../controllers/controller/teamStatsController.js";
// import { uploadDoctorImage } from "../utils/multer.js";

// const router = express.Router();

// // ===== AUTH (legacy paths) =====
// router.post("/login", userLogin);
// router.post("/logout", auth, userLogout);

// router.post(
//   "/addUsers",
//   auth,
//   // restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
//   createUser,
// );
// router.get(
//   "/getAllUsers",
//   auth,
//   restrictTo("superadmin", "admin", "supermanager", "teamLeader"),
//   getAllUsers,
// );
// router.get(
//   "/getUsersBySuperadmin",
//   auth,
//   restrictTo("superadmin"),
//   getUsersBySuperadmin,
// );
// router.get(
//   "/getUsersByAdmin/:adminName",
//   auth,
//   restrictTo("superadmin", "admin"),
//   getUsersByAdmin,
// );
// router.put(
//   "/updateUser/:id",
//   auth,
//   restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
//   updateUser,
// );
// router.put(
//   "/updatePassword",
//   auth,
//   restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
//   updatePassword,
// );
// router.delete(
//   "/deleteUser/:id",
//   auth,
//   restrictTo("superadmin", "admin"),
//   deleteUserById,
// );
// router.get("/getMe", auth, getMe);

// router.get("/get-audit-logs", auth, getLogs);

// // ===== HOSPITALS (legacy paths) =====
// router.post(
//   "/addOrUpdateHospital",
//   auth,
//   restrictTo("superadmin"),
//   updateOrAddHospital,
// );
// router.post(
//   "/updateHospitals",
//   auth,
//   restrictTo("superadmin", "admin"),
//   preventAdminDelete,
//   updateHospital,
// );
// router.post(
//   "/add-branch/:id",
//   auth,
//   createBranch,
// );
// router.post(
//   "/update-branch/:branchId",
//   auth,
//   updateBranch,
// );

// router.get("/all-hospital-branches/:id", auth, getAllHospitalBranches);
// router.get("/single-branch/:id", getSingleBranch);
// router.get("/getBranchesByRole", auth, getBranchesByRole)


// router.get("/get-doctors/:depId", auth, getDoctorsByDepId);
// router.get("/doctor-profile/:id", getDoctorFullProfile);
// router.post(
//   "/add-doctor/:id",
//   auth,
//   restrictTo("superadmin", "admin"),
//   uploadDoctorImage,
//   addDoctor,
// );
// router.put(
//   "/update-doctor/:id",
//   auth,
//   restrictTo("superadmin", "admin"),
//   uploadDoctorImage,
//   updateDoctor,
// );
// router.delete(
//   "/remove-doctor/:id",
//   auth,
//   restrictTo("superadmin", "admin"),
//   removeDoctor,
// );
// router.post(
//   "/add-dep/:id",
//   auth,
//   restrictTo("superadmin", "admin"),
//   addDepartment,
// );

// router.put(
//   "/update-dep/:id",
//   auth,
//   restrictTo("superadmin", "admin"),
//   updateDepartment,
// );

// router.delete("/remove-dep/:id", auth, removeDepartment);

// router.post("/add-empanelment/:id", auth, addEmpanelment);
// router.put("/update-empanelment/:id", auth, updateEmpanelment);
// router.delete("/remove-empanelment/:id", auth, removeEmpanelment);

// router.post("/add-labtest/:id", auth, createLabTest);
// router.put("/update-labtest/:id", auth, updateLabTest);
// router.delete("/remove-labtest/:id", auth, removeLabTest);

// router.post("/add-ipd-day-care/:id", auth, createIPDAndDayCare);
// router.put("/update-ipd-day-care/:id", auth, updateIPDAndDayCare);
// router.delete("/remove-iPDandDayCare/:id", auth, removeIPDAndDayCare);

// router.post("/add-procedure/:id", auth, createProcedure);
// router.put("/update-procedure/:id", auth, updateProcedure);
// router.delete("/remove-procedure/:id", auth, removeProcedure);

// router.post("/add-incharge/:id", auth, createIncharge);
// router.put("/update-incharge/:id", auth, updateIncharge);
// router.delete("/remove-incharge/:id", auth, removeIncharge);

// router.post("/add-code-announcement/:id", auth, createCodeAnnouncement);
// router.put("/update-code-announcement/:id", auth, updateCodeAnnouncement);
// router.delete("/remove-code-announcement/:id", auth, removeCodeAnnouncement);

// router.put(
//   "/updateHospital/:ID",
//   auth,
//   restrictTo("superadmin", "admin"),
//   updateHospitalById,
// );
// router.delete(
//   "/deleteHospital/:id",
//   auth,
//   restrictTo("superadmin"),
//   deleteHospitalById,
// );
// router.get("/getHospitalsNames", auth, getHospitalsNames);
// router.get("/getHospitalByName/:hospitalName", auth, getHospitalByName);
// router.get("/getAllHospitals", auth, getAllHospitals);
// router.get("/hospitalsBasicInfo", auth, hospitalsWithBasicInfo);
// router.get("/getAllHospitals/:id", auth, getHospitalById);
// router.get("/get-branches", auth, getBranchesByHospital);
// router.put(
//   "/hospitals/:hospitalId/branch",
//   auth,
//   restrictTo("superadmin", "admin"),
//   updateBranchInHospital,
// );
// router.post(
//   "/hospitals/:hospitalId/branch",
//   auth,
//   restrictTo("superadmin", "admin"),
//   addBranchToHospital,
// );
// router.get(
//   "/hospitals/:hospitalName/branches",
//   auth,
//   getBranchesByHosptialName,
// );
// router.get("/hospitals/:hospitalId/branch/:branchId", auth, getBranchById);
// router.get(
//   "/hospitals/:hospitalName/branch/:branchId/doctorsAndDepartments",
//   auth,
//   getDoctorsAndDepartmentsNames,
// );
// router.delete(
//   "/hospitals/:hospitalId/branch/:branchId",
//   auth,
//   restrictTo("superadmin", "admin"),
//   deleteBranchById,
// );



// // ===== FILLED FORMS =====
// router.post("/filled-forms", auth, createFilledForm);
// router.get("/filled-forms", auth, getFilledForms);

// // ===== USER STATS =====
// router.get("/login-hours/:agentId", auth, getUserLoginHours);

// router.get(
//   "/getSuggestions",
//   auth,
//   getSuggestions
// )

// router.get(
//   "/getCodeAlert",
//   auth,
//   getCodeAlerts
// )
// router.post("/add-code-alert/:id", auth, createCodeAlert)
// router.put("/toggle-alert/:id", auth, toggleCodeAlertStatus);
// router.get(
//   "/get-created-code-alert",
//   auth,
//   getCreatedCodeAlerts
// )

// router.put("/assign-data", auth, handleMigrateData)

// router.get("/dashboard", auth, getDashboard);
// export default router;
