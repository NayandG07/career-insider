import { Router } from 'express';
import { getTelemetry, triggerSync } from '../controllers/telemetryController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getTelemetry);
router.post('/sync', auth, triggerSync);

export default router;
