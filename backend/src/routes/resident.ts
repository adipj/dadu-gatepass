import { Router } from "express";
import { residentLogin, residentSignup } from "../controllers/authController";

const router = Router();

router.post('/resident/login', residentLogin);
router.post('/resident/signup', residentSignup);

export default router;