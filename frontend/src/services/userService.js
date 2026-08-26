import api from './api';

export const userService = {
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateMe: async (data) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.post('/users/change-password', data);
    return res.data;
  },
};