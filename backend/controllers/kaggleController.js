import User from '../models/User.js';
import Telemetry from '../models/Telemetry.js';
import { fetchKaggleData, generatePKCE } from '../services/kaggleService.js';
import axios from 'axios';

// In-memory PKCE state map for OAuth handshakes
const oauthStateMap = new Map();

/**
 * GET /api/kaggle/connect
 * Or POST /api/kaggle/connect (if passing handle directly)
 * Initiate Kaggle connection via OAuth 2.0 with PKCE or direct handle lookup.
 */
export const connectKaggle = async (req, res) => {
  const clientId = process.env.KAGGLE_CLIENT_ID;
  const redirectUri = process.env.KAGGLE_CALLBACK_URL || `${process.env.CLIENT_URL || 'http://localhost:5173'}/api/kaggle/callback`;

  // Check if a direct handle was sent via POST/body
  const handle = req.body?.handle;
  if (handle && typeof handle === 'string' && handle.trim()) {
    const cleanHandle = handle.trim().replace(/^@/, '');
    try {
      const data = await fetchKaggleData(cleanHandle);
      
      const telemetry = await Telemetry.findOneAndUpdate(
        { userId: req.user._id, source: 'kaggle' },
        { data, fetchedAt: new Date() },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(req.user._id, {
        'connectedSources.kaggle.username': cleanHandle,
        'auth.kaggle.username': cleanHandle,
        lastSyncedAt: new Date(),
      });

      return res.json({
        message: 'Kaggle connected successfully.',
        connected: true,
        data: telemetry.data,
        lastSyncedAt: telemetry.fetchedAt,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Unable to connect Kaggle right now.' });
    }
  }

  // OAuth 2.0 Flow with PKCE
  if (!clientId) {
    // If OAuth app is not configured, inform the client or fallback
    return res.status(400).json({
      error: 'Kaggle OAuth credentials are not configured in .env. Please enter your Kaggle username.',
      requiresHandle: true,
    });
  }

  const { verifier, challenge } = generatePKCE();
  const stateToken = `${req.user._id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  oauthStateMap.set(stateToken, {
    userId: req.user._id,
    verifier,
    createdAt: Date.now(),
  });

  // Clean up state older than 10 minutes
  setTimeout(() => oauthStateMap.delete(stateToken), 10 * 60 * 1000);

  const authUrl = new URL('https://www.kaggle.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'kernels.viewer competitions.viewer');
  authUrl.searchParams.set('state', stateToken);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  if (req.method === 'GET' && !req.xhr && req.headers.accept?.includes('text/html')) {
    return res.redirect(authUrl.toString());
  }

  res.json({ url: authUrl.toString() });
};

/**
 * GET /api/kaggle/callback
 * Kaggle OAuth 2.0 callback with code and state.
 */
export const kaggleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (error) {
    console.warn('Kaggle OAuth error:', error);
    return res.redirect(`${clientUrl}/#settings?kaggle_error=${encodeURIComponent('Kaggle authorization was cancelled.')}`);
  }

  if (!code || !state) {
    return res.redirect(`${clientUrl}/#settings?kaggle_error=${encodeURIComponent('Missing authorization parameters.')}`);
  }

  const stateData = oauthStateMap.get(state);
  if (!stateData) {
    return res.redirect(`${clientUrl}/#settings?kaggle_error=${encodeURIComponent('OAuth session expired. Please try again.')}`);
  }

  oauthStateMap.delete(state);
  const { userId, verifier } = stateData;

  try {
    const tokenRes = await axios.post(
      'https://www.kaggle.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAGGLE_CLIENT_ID || '',
        client_secret: process.env.KAGGLE_CLIENT_SECRET || '',
        code,
        redirect_uri: process.env.KAGGLE_CALLBACK_URL || `${clientUrl}/api/kaggle/callback`,
        code_verifier: verifier,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      }
    );

    const accessToken = tokenRes.data.access_token;
    const refreshToken = tokenRes.data.refresh_token || '';

    // Identify Kaggle account
    let kaggleUsername = tokenRes.data.username;
    if (!kaggleUsername) {
      try {
        const meRes = await axios.get('https://www.kaggle.com/api/v1/user/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        kaggleUsername = meRes.data.userName || meRes.data.username;
      } catch {
        kaggleUsername = 'kaggle_user';
      }
    }

    const telemetryData = await fetchKaggleData(kaggleUsername, accessToken);

    await Telemetry.findOneAndUpdate(
      { userId, source: 'kaggle' },
      { data: telemetryData, fetchedAt: new Date() },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, {
      'connectedSources.kaggle.username': kaggleUsername,
      'auth.kaggle': {
        username: kaggleUsername,
        accessToken,
        refreshToken,
      },
      lastSyncedAt: new Date(),
    });

    res.redirect(`${clientUrl}/#settings?kaggle=connected`);
  } catch (err) {
    console.error('Kaggle token exchange error:', err.response?.data || err.message);
    res.redirect(`${clientUrl}/#settings?kaggle_error=${encodeURIComponent('Unable to connect Kaggle right now. Please try again.')}`);
  }
};

/**
 * GET /api/kaggle
 * Get the current user's stored Kaggle profile.
 */
export const getKaggle = async (req, res) => {
  try {
    const record = await Telemetry.findOne({ userId: req.user._id, source: 'kaggle' });

    if (!record) {
      const user = await User.findById(req.user._id);
      const username = user?.connectedSources?.kaggle?.username || (typeof user?.connectedSources?.kaggle === 'string' ? user.connectedSources.kaggle : '');

      if (username) {
        try {
          const freshData = await fetchKaggleData(username);
          const newRecord = await Telemetry.findOneAndUpdate(
            { userId: req.user._id, source: 'kaggle' },
            { data: freshData, fetchedAt: new Date() },
            { upsert: true, new: true }
          );
          return res.json({
            connected: true,
            data: newRecord.data,
            lastSyncedAt: newRecord.fetchedAt,
          });
        } catch (err) {
          console.warn('Auto-sync Kaggle failed:', err.message);
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
    console.error('Get Kaggle profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/kaggle/sync
 * Manually trigger a fresh Kaggle sync for the current user.
 */
export const syncKaggle = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+auth.kaggle.accessToken');
    const username = user?.connectedSources?.kaggle?.username || (typeof user?.connectedSources?.kaggle === 'string' ? user.connectedSources.kaggle : '');

    if (!username) {
      return res.status(400).json({ error: 'Kaggle account is not connected.' });
    }

    const accessToken = user?.auth?.kaggle?.accessToken || null;
    const freshData = await fetchKaggleData(username, accessToken);

    const telemetry = await Telemetry.findOneAndUpdate(
      { userId: req.user._id, source: 'kaggle' },
      { data: freshData, fetchedAt: new Date() },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      lastSyncedAt: new Date(),
    });

    res.json({
      message: 'Kaggle synced successfully.',
      connected: true,
      data: telemetry.data,
      lastSyncedAt: telemetry.fetchedAt,
    });
  } catch (error) {
    console.error('Sync Kaggle error:', error);
    res.status(500).json({ error: error.message || 'Kaggle data could not be loaded right now.' });
  }
};

/**
 * DELETE /api/kaggle/disconnect
 * Disconnect Kaggle and purge stored Kaggle telemetry for the current user.
 */
export const disconnectKaggle = async (req, res) => {
  try {
    await Telemetry.deleteOne({ userId: req.user._id, source: 'kaggle' });

    await User.findByIdAndUpdate(req.user._id, {
      'connectedSources.kaggle': { username: '', apiKey_encrypted: '' },
      'auth.kaggle': { id: '', username: '', accessToken: '', refreshToken: '' },
    });

    res.json({ message: 'Kaggle disconnected successfully.', connected: false });
  } catch (error) {
    console.error('Disconnect Kaggle error:', error);
    res.status(500).json({ error: 'Failed to disconnect Kaggle.' });
  }
};
