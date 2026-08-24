import { Router } from 'express';
import passport from 'passport';
import { register, login, oauthCallback, refreshToken, logout } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

// ─── Email / Password ─────────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ─── GitHub OAuth ──────────────────────────────────────────
router.get('/github', passport.authenticate('github', { session: false }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// ─── Google OAuth ──────────────────────────────────────────
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// ─── Token Management ─────────────────────────────────────
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);

export default router;
