import { Router } from "express";
import { visitorOTP, visitorLogin, visitorSignup } from "../controllers/authController";
import { confirmOTP } from "../middlewares/otp";
import { createPass, getQR } from "../controllers/passController";
import { requireAuth, requireRoles } from "../middlewares/authGuard";

const router = Router();

router.post('/signup', visitorSignup);
router.post('/getOTP', visitorOTP);
router.post('/login', confirmOTP, visitorLogin);
router.post('/getPass', requireAuth, createPass);
router.get('/getQR/:pass_id', requireAuth, getQR);

export default router;