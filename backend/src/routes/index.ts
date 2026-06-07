import { Router } from 'express';
import passRouter from './passes';
import visitorRouter from './visitor';
import residentRouter from './resident';
import swdRouter from './swd';
import gateRouter from './gate';

const router = Router();

router.use('/passes', passRouter);
router.use('/visitor', visitorRouter);
router.use('/resident', residentRouter);
router.use('/swd', swdRouter);
router.use('/gate', gateRouter);

export default router;