import api from './api';

export const adminService = {
  // AI Configs
  listAiConfigs: async () => {
    const res = await api.get('/admin/ai-configs');
    return res.data;
  },
  updateAiConfig: async (taskId, data) => {
    const res = await api.put(`/admin/ai-configs/${taskId}`, data);
    return res.data;
  },

  // API Keys
  listApiKeys: async () => {
    const res = await api.get('/admin/api-keys');
    return res.data;
  },
  addApiKey: async (data) => {
    const res = await api.post('/admin/api-keys', data);
    return res.data;
  },
  updateApiKey: async (keyId, data) => {
    const res = await api.put(`/admin/api-keys/${keyId}`, data);
    return res.data;
  },
  deleteApiKey: async (keyId) => {
    const res = await api.delete(`/admin/api-keys/${keyId}`);
    return res.data;
  },

  // Users
  listUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  updateUserRole: async (userId, role) => {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  },
  deleteUser: async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  // Sync
  getSyncJobs: async () => {
    const res = await api.get('/admin/sync/jobs');
    return res.data;
  },
  triggerUserSync: async (userId) => {
    const res = await api.post(`/admin/sync/trigger/${userId}`);
    return res.data;
  },

  // Health
  getProviderHealth: async () => {
    const res = await api.get('/admin/health/providers');
    return res.data;
  },
};
