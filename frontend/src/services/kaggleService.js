import api from './api';

export const kaggleService = {
  /**
   * Connect Kaggle:
   * If handle is provided, calls POST /kaggle/connect { handle }.
   * If no handle provided, calls GET /kaggle/connect to obtain OAuth authorization URL.
   */
  connect: async (handle = null) => {
    if (handle) {
      const res = await api.post('/kaggle/connect', { handle });
      return res.data;
    }
    const res = await api.get('/kaggle/connect');
    return res.data;
  },

  /**
   * Get current stored Kaggle profile telemetry.
   */
  getProfile: async () => {
    const res = await api.get('/kaggle');
    return res.data;
  },

  /**
   * Trigger a fresh sync of Kaggle telemetry.
   */
  sync: async () => {
    const res = await api.post('/kaggle/sync');
    return res.data;
  },

  /**
   * Disconnect Kaggle and remove telemetry.
   */
  disconnect: async () => {
    const res = await api.delete('/kaggle/disconnect');
    return res.data;
  },
};

export default kaggleService;
