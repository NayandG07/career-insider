import { Router } from 'express';
import {
  generateRoadmap,
  matchCompanies,
  mentorChat,
  analyzeSkills,
  getProgressSummary,
  updateSubtask,
} from '../controllers/aiController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/roadmap', auth, generateRoadmap);
router.post('/companies', auth, matchCompanies);
router.post('/mentor/chat', auth, mentorChat);
router.post('/skills/analyze', auth, analyzeSkills);
router.get('/progress-summary', auth, getProgressSummary);
router.patch('/roadmap/subtask', auth, updateSubtask);

export default router;
