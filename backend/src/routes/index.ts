import { Router } from 'express';
import { login, visitorQR } from '../controllers/authController';
import { getOTP, confirmOTP } from '../middlewares/otp';
import { approvePass } from '../controllers/passController'; 
import { scanQR, scanRFID } from '../controllers/gateController'; 
import { requireAuth, requireRoles, swdApiKeyGuard } from '../middlewares/authGuard';

const router = Router();

router.post('/auth/login', login);
router.post('/visitor/login', getOTP, confirmOTP, visitorQR);

router.post('/gate/scan-qr', requireAuth, requireRoles(['GATE_SECURITY']), scanQR);
router.post('/gate/scan-rfid', requireAuth, requireRoles(['GATE_SECURITY']), scanRFID);

router.put(
    '/passes/:pass_id/approve-hostel',
    requireAuth,
    requireRoles(['HOSTEL_SUPERINTENDENT']),
    approvePass
);
router.put(
    '/passes/:pass_id/approve-rfid',
    requireAuth,
    requireRoles(['SWD_ADMIN']),
    approvePass
);

const swdRouter = Router();
swdRouter.get('/student-passes', /* Fetch passes logic */);
router.use('/swd', swdApiKeyGuard, swdRouter);

export default router;