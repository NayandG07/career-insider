import AiConfig from '../models/AiConfig.js';
import ApiKey from '../models/ApiKey.js';
import User from '../models/User.js';
import { encrypt } from '../utils/encrypt.js';
import { syncUserSources } from '../services/syncOrchestrator.js';
import axios from 'axios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  AI CONFIGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/admin/ai-configs
 * List all task-to-model routing configurations.
 */
export const listAiConfigs = async (req, res) => {
  try {
    const configs = await AiConfig.find({}).sort({ task: 1 });
    res.json(configs);
  } catch (error) {
    console.error('List AI configs error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * PUT /api/admin/ai-configs/:taskId
 * Update a task-to-model mapping (provider, model, fallback chain).
 */
export const updateAiConfig = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { label, primaryProvider, primaryModel, fallbackChain, isActive } = req.body;

    const updates = {};
    if (label !== undefined) updates.label = label;
    if (primaryProvider !== undefined) updates.primaryProvider = primaryProvider;
    if (primaryModel !== undefined) updates.primaryModel = primaryModel;
    if (fallbackChain !== undefined) updates.fallbackChain = fallbackChain;
    if (isActive !== undefined) updates.isActive = isActive;

    const config = await AiConfig.findOneAndUpdate({ task: taskId }, updates, {
      new: true,
      runValidators: true,
    });

    if (!config) {
      return res.status(404).json({ error: `AI config for task '${taskId}' not found.` });
    }

    res.json(config);
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  API KEYS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/admin/api-keys
 * List all API keys with masked values and status.
 */
export const listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({}).sort({ provider: 1, createdAt: -1 });

    // Mask the encrypted key — only show provider, label, status
    const masked = keys.map((k) => ({
      id: k._id,
      provider: k.provider,
      label: k.label,
      isActive: k.isActive,
      status: k.status,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
      // Show first/last 4 chars of encrypted blob as a fingerprint
      keyFingerprint: k.encryptedKey
        ? `${k.encryptedKey.slice(0, 8)}...${k.encryptedKey.slice(-8)}`
        : null,
    }));

    res.json(masked);
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/admin/api-keys
 * Add a new API key (encrypts before storing).
 */
export const addApiKey = async (req, res) => {
  try {
    const { provider, label, key } = req.body;

    if (!provider || !label || !key) {
      return res.status(400).json({ error: 'provider, label, and key are required.' });
    }

    const validProviders = ['gemini', 'openai', 'huggingface'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` });
    }

    const encryptedKey = encrypt(key);

    const apiKey = await ApiKey.create({
      provider,
      label,
      encryptedKey,
    });

    res.status(201).json({
      id: apiKey._id,
      provider: apiKey.provider,
      label: apiKey.label,
      isActive: apiKey.isActive,
      status: apiKey.status,
      createdAt: apiKey.createdAt,
    });
  } catch (error) {
    console.error('Add API key error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * PUT /api/admin/api-keys/:keyId
 * Update a key's label, active status, or status flag.
 */
export const updateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { label, isActive, status } = req.body;

    const updates = {};
    if (label !== undefined) updates.label = label;
    if (isActive !== undefined) updates.isActive = isActive;
    if (status !== undefined) updates.status = status;

    const apiKey = await ApiKey.findByIdAndUpdate(keyId, updates, {
      new: true,
      runValidators: true,
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found.' });
    }

    res.json({
      id: apiKey._id,
      provider: apiKey.provider,
      label: apiKey.label,
      isActive: apiKey.isActive,
      status: apiKey.status,
    });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * DELETE /api/admin/api-keys/:keyId
 * Delete an API key.
 */
export const deleteApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const apiKey = await ApiKey.findByIdAndDelete(keyId);

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found.' });
    }

    res.json({ message: 'API key deleted successfully.' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  USER MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/admin/users
 * List all users.
 */
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email avatar role connectedSources readinessScore lastSyncedAt createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * PUT /api/admin/users/:userId/role
 * Update a user's role (promote/demote).
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be "user" or "admin".' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Delete a user account.
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account from admin panel.' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: `User '${user.email || user.name}' deleted.` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SYNC MONITOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/admin/sync/jobs
 * Get sync status overview for all users.
 */
export const getSyncJobs = async (req, res) => {
  try {
    const users = await User.find({}).select('name email lastSyncedAt connectedSources').sort({ lastSyncedAt: -1 });

    const jobs = users.map((u) => ({
      userId: u._id,
      name: u.name,
      email: u.email,
      lastSyncedAt: u.lastSyncedAt,
      connectedSourcesCount: Object.values(u.connectedSources?.toObject?.() || {}).filter(
        (v) => v && (typeof v === 'string' ? v.length > 0 : v.username?.length > 0)
      ).length,
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Get sync jobs error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/admin/sync/trigger/:userId
 * Manually trigger sync for a specific user.
 */
export const triggerUserSync = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const results = await syncUserSources(user);
    res.json({ message: `Sync triggered for ${user.email || user.name}.`, results });
  } catch (error) {
    console.error('Trigger sync error:', error);
    res.status(500).json({ error: 'Sync trigger failed.' });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SYSTEM HEALTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/admin/health/providers
 * Ping AI providers and the Python AI service to check status.
 */
export const getProviderHealth = async (req, res) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    // Check Python AI service health
    let aiServiceStatus = 'down';
    try {
      const healthRes = await axios.get(`${aiServiceUrl}/ai/health`, { timeout: 5000 });
      aiServiceStatus = healthRes.status === 200 ? 'up' : 'down';
    } catch {
      aiServiceStatus = 'down';
    }

    // Count active keys per provider
    const keyCounts = await ApiKey.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$provider', count: { $sum: 1 }, statuses: { $push: '$status' } } },
    ]);

    const providers = {};
    for (const kc of keyCounts) {
      const okCount = kc.statuses.filter((s) => s === 'ok').length;
      providers[kc._id] = {
        totalActiveKeys: kc.count,
        healthyKeys: okCount,
        status: okCount > 0 ? 'operational' : 'degraded',
      };
    }

    // Ensure all three providers appear even if no keys
    for (const p of ['gemini', 'openai', 'huggingface']) {
      if (!providers[p]) {
        providers[p] = { totalActiveKeys: 0, healthyKeys: 0, status: 'no_keys' };
      }
    }

    res.json({
      aiService: aiServiceStatus,
      providers,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed.' });
  }
};
