import express from 'express';
import * as whatsController from '../controllers/whatsappController.js';
import auth, { restrictTo } from '../middlewares/auth.js';

const router = express.Router();

router.post(
    "/whatsapp-connect",
    whatsController.connectWhatsApp,
);


router.get(
    "/whatsapp/webhook",
    whatsController.verifyWebhook,
);

router.post(
    "/whatsapp/webhook",
    whatsController.handleWebhook,
);


// Bulk save/update flow nodes
router.post("/hospital-nodes", whatsController.saveHospitalNodes);

// Get all flow nodes for admin UI rendering
router.get("/hospital-nodes", whatsController.getHospitalNodes);

// router.post(
//     "/register",
//     auth,
//     restrictTo("superadmin", "admin", "supermanager", "teamLeader", "teamleader"),
//     whatsController.registerWhatsAppAccount,
// );

export default router;