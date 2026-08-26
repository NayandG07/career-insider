import api from './api';

export const codeforcesService = {
  /**
   * Connect a Codeforces handle for the logged-in user.
   * @param {string} handle
   */
  connect: async (handle) => {
    const res = await api.post('/codeforces/connect', { handle });
    return res.data;
  },

  /**
   * Get the stored Codeforces profile for the logged-in user.
   */
  getProfile: async () => {
    const res = await api.get('/codeforces');
    return res.data;
  },

  /**
   * Manually trigger a fresh data sync for the user's Codeforces account.
   */
  sync: async () => {
    const res = await api.post('/codeforces/sync');
    return res.data;
  },

  /**
   * Disconnect the user's Codeforces account.
   */
  disconnect: async () => {
    const res = await api.delete('/codeforces/disconnect');
    return res.data;
  },
};

export default codeforcesService;
