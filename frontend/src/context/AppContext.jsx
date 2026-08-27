import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { userService } from '../services/userService';
import { telemetryService } from '../services/telemetryService';
import { projectService } from '../services/projectService';
import { aiService } from '../services/aiService';
import { authService } from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [userData, setUserData] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [projects, setProjects] = useState([]);

  // Data state populated by API calls
  const [skills, setSkills] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [conversation, setConversation] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // Role is derived from the authenticated backend user
  const isAdmin = userData?.role === 'admin';

  // ─── Single Canonical Readiness Gate ─────────────────────────────────────────
  const hasLeetCode = Boolean(userData?.connectedSources?.leetcode?.trim());
  const hasCodeforces = Boolean(userData?.connectedSources?.codeforces?.trim());
  const hasProject = Array.isArray(projects) && projects.length > 0;
  const isReady = hasLeetCode && hasCodeforces && hasProject;

  const readiness = useMemo(() => {
    const missing = [];
    if (!hasLeetCode) missing.push('LeetCode account connection');
    if (!hasCodeforces) missing.push('Codeforces handle connection');
    if (!hasProject) missing.push('At least 1 showcase project');

    return {
      leetcode: hasLeetCode,
      codeforces: hasCodeforces,
      hasProject: hasProject,
      ready: isReady,
      missing,
    };
  }, [hasLeetCode, hasCodeforces, hasProject, isReady]);

  // Load initial user data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [userRes, telRes, projRes] = await Promise.all([
        userService.getMe(),
        telemetryService.getTelemetry().catch(() => null),
        projectService.getProjects().catch(() => []),
      ]);
      setUserData(userRes);
      setTelemetry(telRes);
      setProjects(projRes || []);
    } catch (err) {
      console.error('Failed to load initial user data', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    await authService.login(email, password);
    setIsAuthenticated(true);
  };

  const register = async (name, email, password) => {
    await authService.register(name, email, password);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUserData(null);
    setTelemetry(null);
    setProjects([]);
    setSkills(null);
    setRoadmap(null);
  };

  const refreshProjects = useCallback(async () => {
    try {
      const res = await projectService.getProjects();
      setProjects(res || []);
      return res || [];
    } catch (e) {
      console.error('Failed to refresh projects', e);
      return [];
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const [userRes, telRes, projRes] = await Promise.all([
        userService.getMe(),
        telemetryService.getTelemetry().catch(() => null),
        projectService.getProjects().catch(() => []),
      ]);
      setUserData(userRes);
      setTelemetry(telRes);
      setProjects(projRes || []);
      return { user: userRes, telemetry: telRes, projects: projRes };
    } catch (err) {
      console.error('Failed to refresh user data', err);
    }
  }, []);

  // ─── Skill Profile Actions ──────────────────────────────────────────────────
  const loadSavedSkillProfile = async () => {
    if (!isReady) {
      setSkills(null);
      return null;
    }
    try {
      const res = await aiService.getSkillProfile();
      if (res?.profile) {
        setSkills(res.profile);
        return res.profile;
      }
      return null;
    } catch (err) {
      console.error('Failed to load saved skill profile:', err);
      return null;
    }
  };

  const fetchSkillProfile = async () => {
    if (!isReady) {
      setSkills(null);
      throw new Error('Insufficient sources connected for skill analysis.');
    }
    const res = await aiService.analyzeSkills();
    setSkills(res.profile);
    userService.getMe().then(setUserData).catch(() => {});
    return res.profile;
  };

  // ─── Roadmap Actions ─────────────────────────────────────────────────────────
  const loadSavedRoadmap = async () => {
    if (!isReady) {
      setRoadmap(null);
      return null;
    }
    try {
      const res = await aiService.getRoadmap();
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
        return res.roadmap;
      }
      return null;
    } catch (err) {
      console.error('Failed to load saved roadmap:', err);
      return null;
    }
  };

  const fetchRoadmap = async (roles, weeklyHours = 10) => {
    if (!isReady) {
      setRoadmap(null);
      throw new Error('Insufficient sources connected for roadmap generation.');
    }
    const res = await aiService.generateRoadmap(roles, weeklyHours);
    const generated = res.roadmap || res;
    setRoadmap(generated);
    return generated;
  };

  const fetchCompanies = async () => {
    const res = await aiService.matchCompanies();
    setCompanies(res.matches);
    return res.matches;
  };

  const addMentorMessage = async (text, sessionId) => {
    const userMsg = { sender: 'user', text };
    setConversation(prev => [...prev, userMsg]);

    try {
      const res = await aiService.mentorChat(text, sessionId);
      setConversation(prev => [...prev, { sender: 'ai', text: res.response }]);
      return res.sessionId;
    } catch (e) {
      console.error(e);
      setConversation(prev => [...prev, { sender: 'ai', text: 'Error reaching mentor.' }]);
    }
  };

  const updateSubtask = async (milestoneId, subtaskId, completed) => {
    try {
      const res = await aiService.updateSubtask(milestoneId, subtaskId, completed);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
      } else if (res?.milestones) {
        setRoadmap(prev => prev ? { ...prev, milestones: res.milestones } : prev);
      }
    } catch (e) {
      console.error('Failed to persist subtask update', e);
    }
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      login,
      register,
      logout,
      isLoading,
      userData,
      setUserData,
      refreshUser,
      telemetry,
      projects,
      setProjects,
      refreshProjects,
      readiness,
      isAdmin,
      skills,
      setSkills,
      loadSavedSkillProfile,
      fetchSkillProfile,
      roadmap,
      setRoadmap,
      loadSavedRoadmap,
      fetchRoadmap,
      companies,
      fetchCompanies,
      conversation,
      addMentorMessage,
      setConversation,
      updateSubtask,
      completeRoadmapItem: () => {},
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
