import { Router } from "express";
import { scanQR, scanRFID } from '../controllers/gateController'; 
import { requireAuth, requireRoles } from "../middlewares/authGuard";

const router = Router();

router.post('/gate/scan-qr', requireAuth, requireRoles(['GATE_SECURITY']), scanQR);
router.post('/gate/scan-rfid', requireAuth, requireRoles(['GATE_SECURITY']), scanRFID);

export default router;