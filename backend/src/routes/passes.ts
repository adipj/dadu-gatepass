import { Router } from 'express';
import { approvePass, rejectPass } from '../controllers/passController';
import { requireAuth, requireRoles, swdApiKeyGuard } from '../middlewares/authGuard';

const router = Router();

router.put(
    '/:pass_id/approve-hostel',
    requireAuth,
    requireRoles(['HOSTEL_SUPERINTENDENT']),
    approvePass
);
router.put(
    '/:pass_id/approve-admin',
    requireAuth,
    requireRoles(['ADMIN']),
    approvePass
);
router.put(
    '/:pass_id/approve-conference',
    requireAuth,
    requireRoles(['CONFERENCE_SUPERVISOR']),
    approvePass
)
router.put(
    '/:pass_id/approve-security',
    requireAuth,
    requireRoles(['GATE_SECURITY']),
    approvePass
)

router.put(
    '/:pass_id/reject-hostel',
    requireAuth,
    requireRoles(['HOSTEL_SUPERINTENDENT']),
    rejectPass
);
router.put(
    '/:pass_id/reject-admin',
    requireAuth,
    requireRoles(['ADMIN']),
    rejectPass
);
router.put(
    '/:pass_id/reject-conference',
    requireAuth,
    requireRoles(['CONFERENCE_SUPERVISOR']),
    rejectPass
)
router.put(
    '/:pass_id/reject-security',
    requireAuth,
    requireRoles(['GATE_SECURITY']),
    rejectPass
)

export default router;