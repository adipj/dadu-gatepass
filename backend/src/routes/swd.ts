import { Router } from "express";
import { swdApiKeyGuard } from "../middlewares/authGuard";
import { swdCreatePass, swdDeletePass, swdGetPasses } from "../controllers/swdController";
const router = Router();

router.post('/createPass', swdApiKeyGuard, swdCreatePass);
router.delete('/deletePass/:pass_id', swdApiKeyGuard, swdDeletePass);
router.get('/getPass', swdApiKeyGuard, swdGetPasses);


export default router;