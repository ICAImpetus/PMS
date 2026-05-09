import express from "express";
import { updateDoctorAvailability } from "../controllers/doctor.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// PATCH /doctor/:id/availability
router.patch("/doctor/:id/availability", auth, updateDoctorAvailability);

export default router;
