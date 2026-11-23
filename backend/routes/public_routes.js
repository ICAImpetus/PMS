
import express from 'express';
import * as publicController from '../controllers/public_controller.js';
import auth, { restrictTo } from '../middlewares/auth.js';

const router = express.Router();


// Patient Routes

router.get("/patient/status", publicController.checkPatientIsNewOrOld);
router.post("/camp-feed", auth, publicController.saveCampFeedData);
router.get("/get-camp-feed", auth, publicController.getCampFeedData);
router.get("/get-doctors", auth, publicController.getDoctors);


export default router