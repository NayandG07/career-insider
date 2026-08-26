import api from './api';

export const leetcodeService = {
  /**
   * Connect a LeetCode handle for the logged-in user.
   * @param {string} handle
   */
  connect: async (handle) => {
    const res = await api.post('/leetcode/connect', { handle });
    return res.data;
  },

  /**
   * Get the stored LeetCode profile for the logged-in user.
   */
  getProfile: async () => {
    const res = await api.get('/leetcode');
    return res.data;
  },

  /**
   * Manually trigger a fresh data sync for the user's LeetCode account.
   */
  sync: async () => {
    const res = await api.post('/leetcode/sync');
    return res.data;
  },

  /**
   * Disconnect the user's LeetCode account.
   */
  disconnect: async () => {
    const res = await api.delete('/leetcode/disconnect');
    return res.data;
  },
};

export default leetcodeService;
