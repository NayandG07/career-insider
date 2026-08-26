import { Router } from 'express';
import {
  connectKaggle,
  kaggleCallback,
  getKaggle,
  syncKaggle,
  disconnectKaggle,
} from '../controllers/kaggleController.js';
import auth from '../middleware/auth.js';

const router = Router();

// OAuth initiation & direct handle connect
router.get('/connect', auth, connectKaggle);
router.post('/connect', auth, connectKaggle);

// OAuth callback from Kaggle
router.get('/callback', kaggleCallback);

// Profile & Telemetry CRUD
router.get('/', auth, getKaggle);
router.post('/sync', auth, syncKaggle);
router.delete('/disconnect', auth, disconnectKaggle);

export default router;
