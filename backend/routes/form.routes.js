import express from 'express';
import * as formController from '../controllers/form.controller.js';
import auth from "../middlewares/auth.js"
import { uploadDoctorAssets } from '../utils/multer.js';
const router = express.Router();

router.post("/filled-forms", auth, formController.createFilledForm);
router.get("/filled-forms", auth, formController.getFilledForms);
router.get("/edit-changes", auth, formController.getFormEditChanges);
router.put("/edit-status", auth, formController.updateFormEditStatus);
router.get("/forms/:formId", auth, formController.getFormById);
router.put("/forms/:formId", auth, formController.updateFilledForm);
router.post("/booked-slots", auth, formController.getBookedSlotsController);
router.put("/booked-slots/:slotId/unbook", formController.unbookSlotController);
router.post("/bulk-upload", auth, uploadDoctorAssets, formController.uploadFormsCsv);

export default router;
