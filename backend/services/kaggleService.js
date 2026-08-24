import axios from 'axios';

/**
 * Fetch Kaggle user data via the public Kaggle API.
 * Requires the user's Kaggle API key (username + key as Basic auth).
 *
 * @param {string} username - Kaggle username
 * @param {string} apiKey - Kaggle API key (the "key" portion)
 * @returns {object} Aggregated Kaggle data
 */
export async function fetchKaggleData(username, apiKey) {
  const BASE = 'https://www.kaggle.com/api/v1';
  const auth = {
    username: username,
    password: apiKey,
  };

  try {
    // Fetch user profile/ranking info via kernels/datasets lists
    // Kaggle doesn't have a direct "user profile" endpoint, but we can
    // infer stats from their kernels (notebooks) and competition listings.

    // Fetch user's notebooks
    let notebooks = [];
    try {
      const kernelsRes = await axios.get(`${BASE}/kernels/list`, {
        auth,
        params: { user: username, pageSize: 20, sortBy: 'dateCreated' },
        timeout: 15000,
      });
      notebooks = kernelsRes.data || [];
    } catch {
      // User might not have notebooks
    }

    // Fetch user's datasets
    let datasets = [];
    try {
      const datasetsRes = await axios.get(`${BASE}/datasets/list`, {
        auth,
        params: { user: username, pageSize: 20, sortBy: 'updated' },
        timeout: 15000,
      });
      datasets = datasetsRes.data || [];
    } catch {
      // User might not have datasets
    }

    // Fetch competitions list (general - not user-specific in this API)
    // For now we report notebook and dataset stats
    const notebookStats = notebooks.map((nb) => ({
      title: nb.title || nb.ref,
      totalVotes: nb.totalVotes || 0,
      language: nb.language || 'unknown',
      lastRunTime: nb.lastRunTime || null,
    }));

    const datasetStats = datasets.map((ds) => ({
      title: ds.title || ds.ref,
      totalVotes: ds.totalVotes || 0,
      totalDownloads: ds.downloadCount || 0,
      usabilityRating: ds.usabilityRating || 0,
    }));

    const totalNotebookVotes = notebookStats.reduce((sum, nb) => sum + nb.totalVotes, 0);
    const totalDatasetDownloads = datasetStats.reduce((sum, ds) => sum + ds.totalDownloads, 0);

    return {
      username,
      totalNotebooks: notebooks.length,
      totalDatasets: datasets.length,
      totalNotebookVotes,
      totalDatasetDownloads,
      topNotebooks: notebookStats.slice(0, 5),
      topDatasets: datasetStats.slice(0, 5),
    };
  } catch (error) {
    console.error(`Kaggle fetch error for ${username}:`, error.message);
    throw new Error(`Failed to fetch Kaggle data: ${error.message}`);
  }
}
