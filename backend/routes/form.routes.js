import express from 'express';
import * as formController from '../controllers/form.controller.js';
import auth from "../middlewares/auth.js"
import { uploadDoctorAssets } from '../utils/multer.js';
const router = express.Router();

router.post("/filled-forms", auth, formController.createFilledForm);
router.get("/filled-forms", auth, formController.getFilledForms);
router.post("/booked-slots", formController.getBookedSlotsController);
router.post("/bulk-upload", auth, uploadDoctorAssets, formController.uploadFormsCsv);

export default router;
