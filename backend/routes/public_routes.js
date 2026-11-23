
import express from 'express';
import * as publicController from '../controllers/public_controller.js';
import auth, { restrictTo } from '../middlewares/auth.js';

const router = express.Router();


// Patient Routes

router.get("/patient/status", publicController.checkPatientIsNewOrOld);

export default router