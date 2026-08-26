import { Router } from 'express';
import {
  connectLeetCode,
  getLeetCode,
  syncLeetCode,
  disconnectLeetCode,
} from '../controllers/leetcodeController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/connect', auth, connectLeetCode);
router.get('/', auth, getLeetCode);
router.post('/sync', auth, syncLeetCode);
router.delete('/disconnect', auth, disconnectLeetCode);

export default router;
