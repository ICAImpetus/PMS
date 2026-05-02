import express from 'express';
import * as formController from '../controllers/form.controller.js';
import auth from "../middlewares/auth.js"
const router = express.Router();

router.post("/filled-forms", auth, formController.createFilledForm);
router.get("/filled-forms", auth, formController.getFilledForms);

export default router;
