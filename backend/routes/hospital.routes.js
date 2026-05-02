import express from 'express';
import * as hospitalController from '../controllers/hospitalController.js';
import auth, { preventAdminDelete, restrictTo } from '../middlewares/auth.js';
import { uploadDoctorAssets } from '../utils/multer.js';
import { dbMiddleware } from '../middlewares/db.middleware.js';

const router = express.Router();

router.get("/get-audit-logs", auth, hospitalController.getLogs);

// ===== HOSPITALS (legacy paths) =====
router.post(
    "/addOrUpdateHospital",
    auth,
    restrictTo("superadmin"),
    uploadDoctorAssets,
    hospitalController.AddHospital,
);
router.put(
    "/updateHospital/:id",
    auth,
    restrictTo("superadmin", "admin"),
    uploadDoctorAssets,
    hospitalController.updateHospitalById,
);
// router.post(
//     "/updateHospitals",
//     auth,
//     restrictTo("superadmin", "admin"),
//     preventAdminDelete,
//     hospitalController.updateHospital,
// );
router.post(
    "/add-branch/:id",
    auth,
    hospitalController.createBranch,
);
router.post(
    "/update-branch",
    auth,
    hospitalController.updateBranch,
);

router.get("/all-hospital-branches/:id", auth, hospitalController.getAllHospitalBranches);
router.get("/single-branch/:hosId/:id", hospitalController.getSingleBranch);
router.get("/getBranchesByRole", auth, hospitalController.getBranchesByRole)


router.get("/get-doctors/:depId", auth, hospitalController.getDoctorsByDepId);
router.get("/doctor-profile/:id", hospitalController.getDoctorFullProfile);
router.post(
    "/add-doctor",
    auth,
    restrictTo("superadmin", "admin"),
    uploadDoctorAssets,
    hospitalController.addDoctor,
);
router.put(
    "/update-doctor/:id",
    auth,
    restrictTo("superadmin", "admin"),
    uploadDoctorAssets,
    hospitalController.updateDoctor,
);
router.put(
    "/update-doctor-status/:id",
    auth,
    restrictTo("superadmin", "admin"),
    uploadDoctorAssets,
    hospitalController.updateDoctorStatus,
);
router.delete(
    "/remove-doctor/:id",
    auth,
    restrictTo("superadmin", "admin"),
    hospitalController.removeDoctor,
);
router.post(
    "/add-dep",
    auth,
    restrictTo("superadmin", "admin"),
    hospitalController.addDepartment,
);

router.put(
    "/update-dep/:id",
    auth,
    restrictTo("superadmin", "admin"),
    hospitalController.updateDepartment,
);

router.delete("/remove-dep/:id", auth, hospitalController.removeDepartment);

router.post("/add-empanelment", auth, hospitalController.addEmpanelment);
router.put("/update-empanelment/:id", auth, hospitalController.updateEmpanelment);
router.delete("/remove-empanelment/:id", auth, hospitalController.removeEmpanelment);

router.post("/add-labtest", auth, hospitalController.createLabTest);
router.put("/update-labtest/:id", auth, hospitalController.updateLabTest);
router.delete("/remove-labtest/:id", auth, hospitalController.removeLabTest);

router.post("/add-ipd-day-care", auth, hospitalController.createIPDAndDayCare);
router.put("/update-ipd-day-care/:id", auth, hospitalController.updateIPDAndDayCare);
router.delete("/remove-iPDandDayCare/:id", auth, hospitalController.removeIPDAndDayCare);

router.post("/add-procedure", auth, hospitalController.createProcedure);
router.put("/update-procedure/:id", auth, hospitalController.updateProcedure);
router.delete("/remove-procedure/:id", auth, hospitalController.removeProcedure);

router.post("/add-incharge", auth, hospitalController.createIncharge);
router.put("/update-incharge/:id", auth, hospitalController.updateIncharge);
router.delete("/remove-incharge/:id", auth, hospitalController.removeIncharge);

router.post("/add-code-announcement", auth, hospitalController.createCodeAnnouncement);
router.put("/update-code-announcement/:id", auth, hospitalController.updateCodeAnnouncement);
router.delete("/remove-code-announcement/:id", auth, hospitalController.removeCodeAnnouncement);

router.delete(
    "/deleteHospital/:id",
    auth,
    restrictTo("superadmin"),
    hospitalController.deleteHospitalById,
);
router.get("/getHospitalsNames", auth, hospitalController.getHospitalsNames);
router.get("/getHospitalByName/:hospitalName", auth, hospitalController.getHospitalByName);
router.get("/getAllHospitals", auth, hospitalController.getAllHospitals);
router.get("/hospitalsBasicInfo", auth, hospitalController.hospitalsWithBasicInfo);
router.get("/getAllHospitals/:id", auth, hospitalController.getHospitalById);
router.get("/get-branches", auth, hospitalController.getBranchesByHospital);
router.put(
    "/hospitals/:hospitalId/branch",
    auth,
    restrictTo("superadmin", "admin"),
    hospitalController.updateBranchInHospital,
);
router.post(
    "/hospitals/:hospitalId/branch",
    auth,
    restrictTo("superadmin", "admin"),
    hospitalController.addBranchToHospital,
);
router.get(
    "/hospitals/:hospitalName/branches",
    auth,
    hospitalController.getBranchesByHosptialName,
);
router.get("/hospitals/:hospitalId/branch/:branchId", auth, hospitalController.getBranchById);
router.get(
    "/hospitals/:hospitalName/branch/:branchId/doctorsAndDepartments",
    auth,
    hospitalController.getDoctorsAndDepartmentsNames,
);
router.delete(
    "/hospitals/:hospitalId/branch/:branchId",
    auth,
    restrictTo("superadmin", "admin"),
    hospitalController.deleteBranchById,
);


// router.get(
//     "/getSuggestions",
//     auth,
//     hospitalController.getSuggestions
// )

router.get(
    "/getCodeAlert",
    auth,
    hospitalController.getCodeAlerts
)
router.get("/get-master-suggestions", auth, hospitalController.getMasterSuggestions);
router.post("/add-code-alert", auth, hospitalController.createCodeAlert)
router.put("/toggle-alert/:id", auth, hospitalController.toggleCodeAlertStatus);
router.get(
    "/get-created-code-alert",
    auth,
    hospitalController.getCreatedCodeAlerts
)

router.get("/dashboard", auth, hospitalController.getDashboard);

router.get("/get-audit-logs", auth, hospitalController.getLogs);

router.post(
    "/upload-branch-csv",
    uploadDoctorAssets,
    hospitalController.uploadBranchCSV
);


router.get("/get-notifications", auth, hospitalController.getNotifications);
router.put("/mark-notifications-read", auth, hospitalController.markNotificationsRead);
router.delete("/clear-notifications", auth, hospitalController.clearNotifications);


// patient
router.get("/get-patients", auth, hospitalController.getPatientByRole);
router.get("/single-patient-history", auth, hospitalController.singlePatientHistory);

export default router;
