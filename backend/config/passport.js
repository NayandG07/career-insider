import 'dotenv/config';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';


/**
 * Configure Passport.js OAuth strategies for GitHub and Google.
 * Handles:
 * 1. "Continue with GitHub" (Login / Sign up with automatic GitHub connection)
 * 2. "Connect GitHub" (Attaching GitHub to an existing logged-in CareerOS user via OAuth state)
 * 3. "Continue with Google"
 */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── GitHub OAuth Strategy ────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
      scope: ['user:email', 'read:user', 'repo'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let targetUserId = null;
        if (req.query?.state) {
          try {
            const parsedState = JSON.parse(req.query.state);
            if (parsedState.action === 'connect' && parsedState.userId) {
              targetUserId = parsedState.userId;
            }
          } catch {
            // Ignore non-JSON state
          }
        }

        let user = req.user;
        if (!user && targetUserId) {
          user = await User.findById(targetUserId);
        }

        // ── Case A: Connect GitHub to Existing Authenticated User ──
        if (user) {
          user.auth = user.auth || {};
          user.auth.github = {
            id: profile.id,
            username: profile.username,
            accessToken,
          };
          user.connectedSources = user.connectedSources || {};
          user.connectedSources.github = profile.username;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // ── Case B: Login / Register with GitHub ──────────────────
        // 1. Try to find an existing user by GitHub ID
        user = await User.findOne({ 'auth.github.id': profile.id });

        if (user) {
          user.auth.github.accessToken = accessToken;
          user.auth.github.username = profile.username;
          user.connectedSources = user.connectedSources || {};
          user.connectedSources.github = profile.username;
          await user.save();
          return done(null, user);
        }

        // 2. Try to find existing user by primary email
        const emails = profile.emails || [];
        const primaryEmail = emails.length > 0 ? emails[0].value : null;

        if (primaryEmail) {
          user = await User.findOne({ email: primaryEmail });
          if (user) {
            user.auth = user.auth || {};
            user.auth.github = {
              id: profile.id,
              username: profile.username,
              accessToken,
            };
            user.connectedSources = user.connectedSources || {};
            user.connectedSources.github = profile.username;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // 3. Create new CareerOS user with GitHub connection automatically linked
        user = await User.create({
          name: profile.displayName || profile.username,
          email: primaryEmail || `${profile.username}@github.user`,
          avatar: profile.photos?.[0]?.value || '',
          auth: {
            github: {
              id: profile.id,
              username: profile.username,
              accessToken,
            },
          },
          connectedSources: {
            github: profile.username,
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ─── Google OAuth Strategy ────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'auth.google.id': profile.id });

        if (user) {
          return done(null, user);
        }

        const primaryEmail = profile.emails?.[0]?.value || null;

        if (primaryEmail) {
          user = await User.findOne({ email: primaryEmail });
          if (user) {
            user.auth.google = { id: profile.id };
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        user = await User.create({
          name: profile.displayName,
          email: primaryEmail,
          avatar: profile.photos?.[0]?.value || '',
          auth: {
            google: { id: profile.id },
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
