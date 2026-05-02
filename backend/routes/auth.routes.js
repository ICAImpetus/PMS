import * as authController from "../controllers/auth.controller.js"
import express from 'express';
const router = express.Router();

router.post("/create", authController.createUser);
router.post("/login", authController.userLogin);
router.post("/logout", authController.userLogout);

export default router;
