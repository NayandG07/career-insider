import api from './api';

export const aiService = {
  analyzeSkills: async () => {
    const res = await api.post('/ai/skills/analyze');
    return res.data;
  },
  
  generateRoadmap: async (targetRoles) => {
    const res = await api.post('/ai/roadmap', { targetRoles });
    return res.data;
  },

  matchCompanies: async () => {
    const res = await api.post('/ai/companies');
    return res.data;
  },

  mentorChat: async (message, sessionId = null) => {
    const res = await api.post('/ai/mentor/chat', { message, sessionId });
    return res.data;
  },
};
