import { Router } from 'express';
import { upload, uploadResume } from '../controllers/resumeController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/upload', auth, upload.single('resume'), uploadResume);

export default router;
