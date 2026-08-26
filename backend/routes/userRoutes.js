import { Router } from 'express';
import { getMe, updateMe, deleteMe, changePassword } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.delete('/me', auth, deleteMe);
router.post('/change-password', auth, changePassword);

export default router;
