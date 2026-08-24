import Telemetry from '../models/Telemetry.js';
import { syncUserSources } from '../services/syncOrchestrator.js';

/**
 * GET /api/telemetry
 * Get all aggregated telemetry data for the current user.
 */
export const getTelemetry = async (req, res) => {
  try {
    const telemetryRecords = await Telemetry.find({ userId: req.user._id }).sort({ fetchedAt: -1 });

    // Group by source for easy frontend consumption
    const grouped = {};
    for (const record of telemetryRecords) {
      grouped[record.source] = {
        data: record.data,
        fetchedAt: record.fetchedAt,
      };
    }

    res.json({
      sources: grouped,
      lastSyncedAt: req.user.lastSyncedAt,
    });
  } catch (error) {
    console.error('Get telemetry error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/telemetry/sync
 * Trigger a manual data sync for the current user.
 */
export const triggerSync = async (req, res) => {
  try {
    const results = await syncUserSources(req.user);
    res.json({
      message: 'Sync completed.',
      results,
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed. Please try again.' });
  }
};
