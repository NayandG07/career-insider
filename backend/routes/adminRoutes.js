import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import {
  listAiConfigs,
  updateAiConfig,
  listApiKeys,
  addApiKey,
  updateApiKey,
  deleteApiKey,
  listUsers,
  updateUserRole,
  deleteUser,
  getSyncJobs,
  triggerUserSync,
  getProviderHealth,
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require auth + admin role
router.use(auth, isAdmin);

// ─── AI Config Routes ─────────────────────────────────────
router.get('/ai-configs', listAiConfigs);
router.put('/ai-configs/:taskId', updateAiConfig);

// ─── API Key Routes ───────────────────────────────────────
router.get('/api-keys', listApiKeys);
router.post('/api-keys', addApiKey);
router.put('/api-keys/:keyId', updateApiKey);
router.delete('/api-keys/:keyId', deleteApiKey);

// ─── User Management Routes ──────────────────────────────
router.get('/users', listUsers);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// ─── Sync Monitor Routes ─────────────────────────────────
router.get('/sync/jobs', getSyncJobs);
router.post('/sync/trigger/:userId', triggerUserSync);

// ─── Health Routes ────────────────────────────────────────
router.get('/health/providers', getProviderHealth);

export default router;
