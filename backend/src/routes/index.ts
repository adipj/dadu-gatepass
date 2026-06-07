import { Router } from 'express';
import { login, getOTP } from '../controllers/authController';
import { confirmOTP } from '../middlewares/otp';
import { getQR } from '../controllers/passController'; 
import { scanQR, scanRFID } from '../controllers/gateController'; 
import { requireAuth, requireRoles, swdApiKeyGuard } from '../middlewares/authGuard';
import passRouter from './passes';

const router = Router();

router.post('/login', login);
router.post('/visitor/getOTP', getOTP);
router.post('/vistor/login', confirmOTP, getQR);

router.post('/gate/scan-qr', requireAuth, requireRoles(['GATE_SECURITY']), scanQR);
router.post('/gate/scan-rfid', requireAuth, requireRoles(['GATE_SECURITY']), scanRFID);

router.use('/passes', passRouter);

// const swdRouter = Router();
// swdRouter.get('/student-passes', /* Fetch passes logic */);
// router.use('/swd', swdApiKeyGuard, swdRouter);

export default router;