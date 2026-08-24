import { Router } from 'express';
import { getMe, updateMe, deleteMe } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.delete('/me', auth, deleteMe);

export default router;
