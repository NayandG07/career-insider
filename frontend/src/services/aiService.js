import api from './api';

export const aiService = {
  getSkillProfile: async () => {
    const res = await api.get('/ai/skills');
    return res.data; // { profile, readiness }
  },

  analyzeSkills: async () => {
    const res = await api.post('/ai/skills/analyze');
    return res.data; // { message, profile }
  },

  getRoadmap: async () => {
    const res = await api.get('/ai/roadmap');
    return res.data; // { roadmap, readiness }
  },
  
  generateRoadmap: async (targetRoles, weeklyHours = 10) => {
    const res = await api.post('/ai/roadmap', { targetRoles, weeklyHours });
    return res.data; // { roadmap }
  },

  matchCompanies: async () => {
    const res = await api.post('/ai/companies');
    return res.data;
  },

  mentorChat: async (message, sessionId = null) => {
    const res = await api.post('/ai/mentor/chat', { message, sessionId });
    return res.data;
  },

  getProgressSummary: async () => {
    const res = await api.get('/ai/progress-summary');
    return res.data; // { summary: "..." }
  },
};

export default aiService;
