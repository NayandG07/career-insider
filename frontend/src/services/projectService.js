import api from './api';

export const projectService = {
  getAll: async () => {
    const res = await api.get('/projects');
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};
