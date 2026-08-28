import { Router } from 'express';
import {
  getRoadmap,
  generateRoadmap,
  matchCompanies,
  mentorChat,
  getMentorHistory,
  clearMentorSession,
  getSkillProfile,
  analyzeSkills,
  getProgressSummary,
} from '../controllers/aiController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/roadmap', auth, getRoadmap);
router.post('/roadmap', auth, generateRoadmap);

router.get('/skills', auth, getSkillProfile);
router.post('/skills/analyze', auth, analyzeSkills);

router.post('/companies', auth, matchCompanies);
router.post('/mentor/chat', auth, mentorChat);
router.get('/mentor/history', auth, getMentorHistory);
router.delete('/mentor/history/:sessionId', auth, clearMentorSession);
router.get('/progress-summary', auth, getProgressSummary);

export default router;
