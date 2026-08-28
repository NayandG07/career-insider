import cron from 'node-cron';
import User from '../models/User.js';
import Telemetry from '../models/Telemetry.js';
import { fetchGitHubData } from './githubService.js';
import { fetchLeetCodeData } from './leetcodeService.js';
import { fetchCodeforcesData } from './codeforcesService.js';
import logger from '../utils/logger.js';

/**
 * Sync all connected sources for a single user.
 * Fetches data from each connected platform (GitHub, LeetCode, Codeforces) and stores it in Telemetry.
 *
 * @param {object} user - Mongoose user document (must include auth for GitHub token)
 * @returns {object} Results per source { source: 'success' | 'skipped' | error message }
 */
export async function syncUserSources(user) {
  const results = {};

  // Fetch the user with GitHub access token
  const fullUser = await User.findById(user._id).select('+auth.github.accessToken');

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

  // Update lastSyncedAt on user
  await User.findByIdAndUpdate(user._id, { lastSyncedAt: new Date() });

  return results;
}

/**
 * Run sync for all users.
 * This is triggered by the external cron webhook.
 */
export async function runAllSyncs() {
  logger.info('CRON', 'Starting webhook telemetry sync sweep for all users...');
  const users = await User.find({});
  for (const user of users) {
    try {
      const results = await syncUserSources(user);
      logger.success('CRON', `Synced telemetry for user ${user.email || user._id}`, results);
    } catch (err) {
      logger.error('CRON', `Sync failed for user ${user.email || user._id}`, err);
    }
  }
  logger.success('CRON', 'Webhook telemetry sync sweep completed.');
}
