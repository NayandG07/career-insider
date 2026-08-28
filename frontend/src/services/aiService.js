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

  mentorChat: async (message, sessionId = null, taggedContext = null, coachMode = 'general') => {
    const res = await api.post('/ai/mentor/chat', { message, sessionId, taggedContext, coachMode });
    return res.data;
  },

  getMentorHistory: async (sessionId = null) => {
    const res = await api.get('/ai/mentor/history', { params: { sessionId } });
    return res.data;
  },

  clearMentorSession: async (sessionId) => {
    const res = await api.delete(`/ai/mentor/history/${sessionId}`);
    return res.data;
  },

  getProgressSummary: async () => {
    const res = await api.get('/ai/progress-summary');
    return res.data; // { summary: "..." }
  },
};

export default aiService;
