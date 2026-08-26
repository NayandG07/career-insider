import User from '../models/User.js';
import Telemetry from '../models/Telemetry.js';
import { fetchLeetCodeData } from '../services/leetcodeService.js';

/**
 * POST /api/leetcode/connect
 * Connect a LeetCode handle for the current user.
 */
export const connectLeetCode = async (req, res) => {
  const { handle } = req.body;

  if (!handle || typeof handle !== 'string' || !handle.trim()) {
    return res.status(400).json({ error: 'Please enter a valid LeetCode username.' });
  }

  const cleanHandle = handle.trim().replace(/^@/, '');

  try {
    const normalizedData = await fetchLeetCodeData(cleanHandle);

    const telemetry = await Telemetry.findOneAndUpdate(
      { userId: req.user._id, source: 'leetcode' },
      {
        data: normalizedData,
        fetchedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      'connectedSources.leetcode': normalizedData.username,
      lastSyncedAt: new Date(),
    });

    res.json({
      message: 'LeetCode connected successfully.',
      connected: true,
      data: telemetry.data,
      lastSyncedAt: telemetry.fetchedAt,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: `LeetCode user '${cleanHandle}' not found.` });
    }
    console.error('LeetCode connect error:', error);
    res.status(500).json({ error: error.message || 'Unable to connect to LeetCode right now. Please try again.' });
  }
};

/**
 * GET /api/leetcode
 * Get the current user's stored LeetCode profile.
 */
export const getLeetCode = async (req, res) => {
  try {
    const record = await Telemetry.findOne({ userId: req.user._id, source: 'leetcode' });

    if (!record) {
      const user = await User.findById(req.user._id);
      if (user?.connectedSources?.leetcode) {
        try {
          const freshData = await fetchLeetCodeData(user.connectedSources.leetcode);
          const newRecord = await Telemetry.findOneAndUpdate(
            { userId: req.user._id, source: 'leetcode' },
            { data: freshData, fetchedAt: new Date() },
            { upsert: true, new: true }
          );
          return res.json({
            connected: true,
            data: newRecord.data,
            lastSyncedAt: newRecord.fetchedAt,
          });
        } catch (err) {
          console.warn('Auto-sync LeetCode failed:', err.message);
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
    console.error('Get LeetCode profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/leetcode/sync
 * Manually trigger fresh sync of LeetCode profile for the current user.
 */
export const syncLeetCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const handle = user?.connectedSources?.leetcode;

    if (!handle) {
      return res.status(400).json({ error: 'LeetCode account is not connected.' });
    }

    const freshData = await fetchLeetCodeData(handle);

    const telemetry = await Telemetry.findOneAndUpdate(
      { userId: req.user._id, source: 'leetcode' },
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
      message: 'LeetCode synced successfully.',
      connected: true,
      data: telemetry.data,
      lastSyncedAt: telemetry.fetchedAt,
    });
  } catch (error) {
    console.error('Sync LeetCode error:', error);
    res.status(500).json({ error: error.message || 'Unable to sync LeetCode right now. Please try again.' });
  }
};

/**
 * DELETE /api/leetcode/disconnect
 * Disconnect LeetCode and purge telemetry data for the current user.
 */
export const disconnectLeetCode = async (req, res) => {
  try {
    await Telemetry.deleteOne({ userId: req.user._id, source: 'leetcode' });

    await User.findByIdAndUpdate(req.user._id, {
      'connectedSources.leetcode': '',
    });

    res.json({ message: 'LeetCode disconnected successfully.', connected: false });
  } catch (error) {
    console.error('Disconnect LeetCode error:', error);
    res.status(500).json({ error: 'Failed to disconnect LeetCode.' });
  }
};
