import User from '../models/User.js';
import Telemetry from '../models/Telemetry.js';
import { fetchCodeforcesData } from '../services/codeforcesService.js';
import logger from '../utils/logger.js';

/**
 * POST /api/codeforces/connect
 * Connect a Codeforces handle for the current user.
 */
export const connectCodeforces = async (req, res) => {
  const { handle } = req.body;

  if (!handle || typeof handle !== 'string' || !handle.trim()) {
    return res.status(400).json({ error: 'Please enter a valid Codeforces handle.' });
  }

  const cleanHandle = handle.trim().replace(/^@/, '');
  const task = logger.startTask('CODEFORCES', 'Connect Handle', { user: req.user.email || req.user._id, handle: cleanHandle });

  try {
    // 1. Fetch public profile & stats from Codeforces
    const normalizedData = await fetchCodeforcesData(cleanHandle);

    // 2. Upsert telemetry record isolated to this authenticated user
    const telemetry = await Telemetry.findOneAndUpdate(
      { userId: req.user._id, source: 'codeforces' },
      {
        data: normalizedData,
        fetchedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. Update User's connectedSources and lastSyncedAt
    await User.findByIdAndUpdate(req.user._id, {
      'connectedSources.codeforces': normalizedData.handle,
      lastSyncedAt: new Date(),
    });

    task.success({
      rating: `${normalizedData.rating || 0} (${normalizedData.rank || 'unranked'})`,
      contests: normalizedData.contestHistory?.length || 0,
      solved: normalizedData.problemsSolved || 0
    });

    res.json({
      message: 'Codeforces connected successfully.',
      connected: true,
      data: telemetry.data,
      lastSyncedAt: telemetry.fetchedAt,
    });
  } catch (error) {
    task.error(error, `Codeforces connection failed for ${cleanHandle}`);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: `Codeforces handle '${cleanHandle}' not found.` });
    }
    res.status(500).json({ error: error.message || 'Unable to connect to Codeforces right now. Please try again.' });
  }
};

/**
 * GET /api/codeforces
 * Get the current user's stored Codeforces profile.
 */
export const getCodeforces = async (req, res) => {
  try {
    const record = await Telemetry.findOne({ userId: req.user._id, source: 'codeforces' });

    if (!record) {
      const user = await User.findById(req.user._id);
      if (user?.connectedSources?.codeforces) {
        // Auto-fetch if handle exists but telemetry was missing
        try {
          const freshData = await fetchCodeforcesData(user.connectedSources.codeforces);
          const newRecord = await Telemetry.findOneAndUpdate(
            { userId: req.user._id, source: 'codeforces' },
            { data: freshData, fetchedAt: new Date() },
            { upsert: true, new: true }
          );
          return res.json({
            connected: true,
            data: newRecord.data,
            lastSyncedAt: newRecord.fetchedAt,
          });
        } catch (err) {
          console.warn('Auto-sync Codeforces failed:', err.message);
        }
      }
      return res.json({ connected: false, data: null });
    }

    res.json({
      connected: true,
      data: record.data,
      lastSyncedAt: record.fetchedAt,
    });
  } catch (error) {
    console.error('Get Codeforces profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/codeforces/sync
 * Manually trigger fresh sync of Codeforces profile for the current user.
 */
export const syncCodeforces = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const handle = user?.connectedSources?.codeforces;

    if (!handle) {
      return res.status(400).json({ error: 'Codeforces account is not connected.' });
    }

    const freshData = await fetchCodeforcesData(handle);

    const telemetry = await Telemetry.findOneAndUpdate(
      { userId: req.user._id, source: 'codeforces' },
      {
        data: freshData,
        fetchedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      lastSyncedAt: new Date(),
    });

    res.json({
      message: 'Codeforces synced successfully.',
      connected: true,
      data: telemetry.data,
      lastSyncedAt: telemetry.fetchedAt,
    });
  } catch (error) {
    console.error('Sync Codeforces error:', error);
    res.status(500).json({ error: error.message || 'Unable to sync Codeforces right now. Please try again.' });
  }
};

/**
 * DELETE /api/codeforces/disconnect
 * Disconnect Codeforces and purge telemetry data for the current user.
 */
export const disconnectCodeforces = async (req, res) => {
  try {
    await Telemetry.deleteOne({ userId: req.user._id, source: 'codeforces' });

    await User.findByIdAndUpdate(req.user._id, {
      'connectedSources.codeforces': '',
    });

    res.json({ message: 'Codeforces disconnected successfully.', connected: false });
  } catch (error) {
    console.error('Disconnect Codeforces error:', error);
    res.status(500).json({ error: 'Failed to disconnect Codeforces.' });
  }
};
