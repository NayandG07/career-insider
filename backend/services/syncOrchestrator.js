import cron from 'node-cron';
import User from '../models/User.js';
import Telemetry from '../models/Telemetry.js';
import { fetchGitHubData } from './githubService.js';
import { fetchLeetCodeData } from './leetcodeService.js';
import { fetchCodeforcesData } from './codeforcesService.js';
import { fetchCodeChefData } from './codechefService.js';
import { fetchKaggleData } from './kaggleService.js';
import { decrypt } from '../utils/encrypt.js';

/**
 * Sync all connected sources for a single user.
 * Fetches data from each connected platform and stores it in Telemetry.
 *
 * @param {object} user - Mongoose user document (must include auth for GitHub token)
 * @returns {object} Results per source { source: 'success' | 'skipped' | error message }
 */
export async function syncUserSources(user) {
  const results = {};

  // Fetch the user with provider access tokens
  const fullUser = await User.findById(user._id).select('+auth.github.accessToken +auth.kaggle.accessToken');

  // ─── GitHub ─────────────────────────────────────────────
  if (fullUser.connectedSources?.github) {
    try {
      const token = fullUser.auth?.github?.accessToken || null;
      const data = await fetchGitHubData(fullUser.connectedSources.github, token);
      await Telemetry.findOneAndUpdate(
        { userId: user._id, source: 'github' },
        { data, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      results.github = 'success';
    } catch (err) {
      results.github = err.message;
    }
  } else {
    results.github = 'skipped';
  }

  // ─── LeetCode ───────────────────────────────────────────
  if (fullUser.connectedSources?.leetcode) {
    try {
      const data = await fetchLeetCodeData(fullUser.connectedSources.leetcode);
      await Telemetry.findOneAndUpdate(
        { userId: user._id, source: 'leetcode' },
        { data, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      results.leetcode = 'success';
    } catch (err) {
      results.leetcode = err.message;
    }
  } else {
    results.leetcode = 'skipped';
  }

  // ─── Codeforces ─────────────────────────────────────────
  if (fullUser.connectedSources?.codeforces) {
    try {
      const data = await fetchCodeforcesData(fullUser.connectedSources.codeforces);
      await Telemetry.findOneAndUpdate(
        { userId: user._id, source: 'codeforces' },
        { data, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      results.codeforces = 'success';
    } catch (err) {
      results.codeforces = err.message;
    }
  } else {
    results.codeforces = 'skipped';
  }

  // ─── CodeChef ───────────────────────────────────────────
  if (fullUser.connectedSources?.codechef) {
    try {
      const data = await fetchCodeChefData(fullUser.connectedSources.codechef);
      await Telemetry.findOneAndUpdate(
        { userId: user._id, source: 'codechef' },
        { data, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      results.codechef = 'success';
    } catch (err) {
      results.codechef = err.message;
    }
  } else {
    results.codechef = 'skipped';
  }

  // ─── Kaggle ─────────────────────────────────────────────
  const kaggleUsername = fullUser.connectedSources?.kaggle?.username || (typeof fullUser.connectedSources?.kaggle === 'string' ? fullUser.connectedSources.kaggle : '');
  if (kaggleUsername) {
    try {
      const accessToken = fullUser.auth?.kaggle?.accessToken || null;
      const data = await fetchKaggleData(kaggleUsername, accessToken);
      await Telemetry.findOneAndUpdate(
        { userId: user._id, source: 'kaggle' },
        { data, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
      results.kaggle = 'success';
    } catch (err) {
      results.kaggle = err.message;
    }
  } else {
    results.kaggle = 'skipped';
  }

  // Update lastSyncedAt on user
  await User.findByIdAndUpdate(user._id, { lastSyncedAt: new Date() });

  return results;
}

/**
 * Start the cron job that syncs all users every 6 hours.
 */
export function startSyncCron() {
  // Run every 6 hours: at minute 0, every 6th hour
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ [Cron] Starting scheduled sync for all users...');
    try {
      const users = await User.find({});
      for (const user of users) {
        try {
          const results = await syncUserSources(user);
          console.log(`  ✅ Synced user ${user.email || user._id}:`, results);
        } catch (err) {
          console.error(`  ❌ Sync failed for ${user.email || user._id}:`, err.message);
        }
      }
      console.log('⏰ [Cron] Sync complete.');
    } catch (err) {
      console.error('⏰ [Cron] Fatal sync error:', err.message);
    }
  });

  console.log('⏰ Sync cron job scheduled (every 6 hours).');
}
