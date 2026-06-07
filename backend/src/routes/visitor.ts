import { Router } from "express";
import { visitorOTP, visitorLogin } from "../controllers/authController";
import { confirmOTP } from "../middlewares/otp";

const router = Router();

router.post('/visitor/getOTP', visitorOTP);
router.post('/vistor/login', confirmOTP, visitorLogin);

export default router;