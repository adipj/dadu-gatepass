import { Router } from "express";
import { scanQR, scanRFID } from '../controllers/gateController'; 
import { requireAuth, requireRoles } from "../middlewares/authGuard";

const router = Router();

router.post('/scan-qr', requireAuth, requireRoles(['GATE_SECURITY']), scanQR);
router.post('/scan-rfid', requireAuth, requireRoles(['GATE_SECURITY']), scanRFID);

export default router;