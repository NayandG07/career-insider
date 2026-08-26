import api from './api';

export const githubService = {
  getProfile: async () => {
    const res = await api.get('/telemetry');
    const ghData = res.data?.sources?.github?.data || null;
    return { data: ghData };
  },

  getRepositories: async () => {
    const res = await api.get('/github/repositories');
    return res.data;
  },

  importRepositories: async (repoIds) => {
    const res = await api.post('/github/import', { repoIds });
    return res.data;
  },

  removeImportedRepository: async (githubRepositoryId) => {
    const res = await api.delete(`/github/repositories/${githubRepositoryId}`);
    return res.data;
  },

  disconnect: async () => {
    const res = await api.post('/github/disconnect');
    return res.data;
  },
};

export default githubService;
