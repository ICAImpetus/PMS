import express from 'express';
import * as userController from '../controllers/userController.js';
import auth, { restrictTo } from '../middlewares/auth.js';

const router = express.Router();
router.post(
    "/addUsers",
    auth,
    // restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
    userController.createUser,
);
router.get(
    "/getAllUsers",
    auth,
    restrictTo("superadmin", "admin", "supermanager", "teamLeader"),
    userController.getAllUsers,
);
router.get(
    "/getUsersBySuperadmin",
    auth,
    restrictTo("superadmin"),
    userController.getUsersBySuperadmin,
);
router.get(
    "/getUsersByAdmin/:adminName",
    auth,
    restrictTo("superadmin", "admin"),
    userController.getUsersByAdmin,
);
router.put(
    "/updateUser/:id",
    auth,
    restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
    userController.updateUser,
);
router.put(
    "/updatePassword",
    auth,
    restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
    userController.updatePassword,
);
router.delete(
    "/deleteUser/:id",
    auth,
    restrictTo("superadmin", "admin"),
    userController.deleteUserById,
);
router.get("/getMe", auth, userController.getMe);

router.put("/assign-data", auth, userController.handleMigrateData)

export default router;
