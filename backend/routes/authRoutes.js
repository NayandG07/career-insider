import 'dotenv/config';
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, oauthCallback, refreshToken, logout } from '../controllers/authController.js';
import auth from '../middleware/auth.js';


const router = Router();

// ─── Email / Password ─────────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ─── GitHub OAuth ──────────────────────────────────────────
router.get('/github', (req, res, next) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const isUnconfigured = !clientId || clientId.includes('your_github_client_id');

  if (isUnconfigured) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Integration</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #F9FAFB; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: white; border: 1px solid #E5E9F0; padding: 36px 28px; border-radius: 24px; max-width: 440px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .icon { width: 48px; height: 48px; background: #EEF2FF; color: #6366F1; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
            h2 { color: #111827; margin: 0 0 8px 0; font-size: 18px; }
            p { color: #6B7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0; font-weight: 500; }
            .btn { display: inline-block; margin-top: 12px; background: #111827; color: white; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-size: 12px; font-weight: 700; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">⚙️</div>
            <h2>GitHub Integration Unavailable</h2>
            <p>The GitHub integration service is currently unavailable. Please contact your system administrator.</p>
            <a href="javascript:window.close()" class="btn">Close Window</a>
          </div>
        </body>
      </html>
    `);
  }

  // If token query is passed from Settings (Connect flow for logged-in user), encode in state
  let stateParam = undefined;
  if (req.query.token) {
    try {
      const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
      stateParam = JSON.stringify({ userId: decoded.userId, action: 'connect' });
    } catch {
      // Ignore invalid token
    }
  }

  passport.authenticate('github', {
    session: false,
    state: stateParam,
    scope: ['user:email', 'read:user', 'repo'],
  })(req, res, next);
});

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_failed' }),
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
