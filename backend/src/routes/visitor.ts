import { Router } from "express";
import { visitorOTP, visitorLogin } from "../controllers/authController";
import { confirmOTP } from "../middlewares/otp";
import { createPass, getQR } from "../controllers/passController";
import { requireAuth } from "../middlewares/authGuard";

const router = Router();

router.post('/getOTP', visitorOTP);
router.post('/login', confirmOTP, visitorLogin);
router.post('/getPass', requireAuth, createPass);
router.post('/getQR/:pass_id', getQR);

export default router;