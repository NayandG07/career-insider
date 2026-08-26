import { Router } from 'express';
import {
  connectCodeforces,
  getCodeforces,
  syncCodeforces,
  disconnectCodeforces,
} from '../controllers/codeforcesController.js';
import auth from '../middleware/auth.js';

const router = Router();

// All Codeforces integration routes require authentication
router.post('/connect', auth, connectCodeforces);
router.get('/', auth, getCodeforces);
router.post('/sync', auth, syncCodeforces);
router.delete('/disconnect', auth, disconnectCodeforces);

export default router;
