import { Router } from "express";
import { residentLogin, residentSignup } from "../controllers/authController";
import { createPass, createBulkPass } from "../controllers/passController";

const router = Router();

router.post('/login', residentLogin);
router.post('/signup', residentSignup);
router.post('/createPass', createPass);
router.post('/visitorPass', createBulkPass);

export default router;