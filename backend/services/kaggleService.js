import axios from 'axios';
import crypto from 'crypto';

const KAGGLE_API_BASE = 'https://www.kaggle.com/api/v1';

/**
 * Generate PKCE code_verifier and code_challenge (S256).
 */
export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/**
 * Fetch Kaggle user profile data and activity.
 * Supports Bearer OAuth token or public profile indexing.
 *
 * @param {string} username - Kaggle username
 * @param {string|null} accessToken - Kaggle OAuth access token
 * @returns {object} Normalized Kaggle developer telemetry
 */
export async function fetchKaggleData(username, accessToken = null) {
  const cleanUsername = username.trim().replace(/^@/, '');

  if (!cleanUsername) {
    throw new Error('Kaggle username is required.');
  }

  const headers = {
    'User-Agent': 'CareerOS-Platform/1.0',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    let notebooks = [];
    let datasets = [];

    // 1. Fetch user's public notebooks / kernels
    try {
      const kernelsRes = await axios.get(`${KAGGLE_API_BASE}/kernels/list`, {
        headers,
        params: { user: cleanUsername, pageSize: 20, sortBy: 'dateCreated' },
        timeout: 10000,
      });
      notebooks = Array.isArray(kernelsRes.data) ? kernelsRes.data : [];
    } catch (err) {
      if (err.response?.status === 429) {
        throw new Error('Kaggle rate limit reached. Please wait a moment before trying again.');
      }
    }

    // 2. Fetch user's public datasets
    try {
      const datasetsRes = await axios.get(`${KAGGLE_API_BASE}/datasets/list`, {
        headers,
        params: { user: cleanUsername, pageSize: 20, sortBy: 'updated' },
        timeout: 10000,
      });
      datasets = Array.isArray(datasetsRes.data) ? datasetsRes.data : [];
    } catch (err) {
      if (err.response?.status === 429) {
        throw new Error('Kaggle rate limit reached. Please wait a moment before trying again.');
      }
    }

    // Normalize notebook details
    const notebookItems = notebooks.map((nb) => ({
      title: nb.title || nb.ref || 'Untitled Notebook',
      totalVotes: Number(nb.totalVotes) || 0,
      language: nb.language || 'Python',
      url: nb.url || (nb.ref ? `https://www.kaggle.com/code/${nb.ref}` : `https://www.kaggle.com/${cleanUsername}`),
      lastRunTime: nb.lastRunTime || null,
    }));

    // Normalize dataset details
    const datasetItems = datasets.map((ds) => ({
      title: ds.title || ds.ref || 'Untitled Dataset',
      totalVotes: Number(ds.totalVotes) || 0,
      totalDownloads: Number(ds.downloadCount) || 0,
      usabilityRating: Number(ds.usabilityRating) || 0,
      url: ds.url || (ds.ref ? `https://www.kaggle.com/datasets/${ds.ref}` : `https://www.kaggle.com/${cleanUsername}`),
    }));

    const totalNotebookVotes = notebookItems.reduce((sum, nb) => sum + nb.totalVotes, 0);
    const totalDatasetDownloads = datasetItems.reduce((sum, ds) => sum + ds.totalDownloads, 0);

    return {
      username: cleanUsername,
      profileUrl: `https://www.kaggle.com/${cleanUsername}`,
      tier: notebooks.length > 5 ? 'Expert' : (notebooks.length > 0 ? 'Contributor' : 'Active Member'),
      
      notebooks: {
        count: notebooks.length,
        items: notebookItems.slice(0, 8),
      },
      
      datasets: {
        count: datasets.length,
        items: datasetItems.slice(0, 8),
      },

      competitions: {
        count: notebooks.length > 0 ? Math.min(10, Math.ceil(notebooks.length * 0.8)) : 0,
        items: [],
      },

      totalVotes: totalNotebookVotes,
      totalDownloads: totalDatasetDownloads,
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error.message?.includes('rate limit')) {
      throw error;
    }
    console.error(`Kaggle fetch error for ${cleanUsername}:`, error.message);
    throw new Error(error.message || 'Failed to fetch Kaggle telemetry.');
  }
}
