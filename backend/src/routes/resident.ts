import { Router } from "express";
import { residentLogin, residentSignup } from "../controllers/authController";
import { createPass, createBulkPass, getQR, createRFID, getPassesList, getMyPasses } from "../controllers/passController";
import { requireAuth, requireRoles } from "../middlewares/authGuard";

const router = Router();

router.post('/login', residentLogin);

router.post('/signup', residentSignup);

router.post(
    '/createPass', 
    requireAuth, 
    requireRoles(['STUDENT', 'FACULTY', 'HOSTEL_SUPERINTENDENT', 'CONFERENCE_SUPERVISOR', 'ADMIN']), 
    createPass
);
router.post(
    '/visitorPass', 
    requireAuth, 
    requireRoles(['STUDENT', 'FACULTY']), 
    createBulkPass
);

router.get(
    '/getQR/:pass_id',
    requireAuth, 
    getQR
)

router.put(
    '/applyRFID/:vehicleNum',
    requireAuth, 
    requireRoles(['FACULTY']),
    createRFID
)

router.get(
    '/passes',
    requireAuth,
    requireRoles(['STUDENT', 'FACULTY']),
    getMyPasses
)

export default router;