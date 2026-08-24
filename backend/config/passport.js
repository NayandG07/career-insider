import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Configure Passport.js OAuth strategies for GitHub and Google.
 * Both strategies find-or-create a user in the database and
 * store provider-specific tokens/IDs on the user record.
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
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user', 'repo'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find an existing user by GitHub ID
        let user = await User.findOne({ 'auth.github.id': profile.id });

        if (user) {
          // Update the access token on every login
          user.auth.github.accessToken = accessToken;
          user.auth.github.username = profile.username;
          await user.save();
          return done(null, user);
        }

        // Check if a user with the same email already exists (e.g. registered via email/password)
        const emails = profile.emails || [];
        const primaryEmail = emails.length > 0 ? emails[0].value : null;

        if (primaryEmail) {
          user = await User.findOne({ email: primaryEmail });
          if (user) {
            // Link GitHub to existing account
            user.auth.github = {
              id: profile.id,
              username: profile.username,
              accessToken,
            };
            user.connectedSources.github = profile.username;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create a new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email: primaryEmail,
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
        // Try to find an existing user by Google ID
        let user = await User.findOne({ 'auth.google.id': profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if a user with the same email already exists
        const primaryEmail = profile.emails?.[0]?.value || null;

        if (primaryEmail) {
          user = await User.findOne({ email: primaryEmail });
          if (user) {
            // Link Google to existing account
            user.auth.google = { id: profile.id };
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create a new user
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
