import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '../services/userService';
import { telemetryService } from '../services/telemetryService';
import { aiService } from '../services/aiService';
import { authService } from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [userData, setUserData] = useState(null);
  const [telemetry, setTelemetry] = useState(null);

  // Data state populated by API calls
  const [skills, setSkills] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [conversation, setConversation] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // Role is derived from the authenticated backend user, not a local toggle.
  const isAdmin = userData?.role === 'admin';

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
      const [userRes, telRes] = await Promise.all([
        userService.getMe(),
        telemetryService.getTelemetry().catch(() => null)
      ]);
      setUserData(userRes);
      setTelemetry(telRes);
    } catch (err) {
      console.error('Failed to load user data', err);
      // Token is invalid or expired — clear auth state
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
    // register() already returns valid tokens and stores them in localStorage.
    // Do NOT call login() again — that would make a second bcrypt comparison
    // and second network round-trip, which can cause 502 under load.
    await authService.register(name, email, password);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUserData(null);
  };

  // Generate real data from AI endpoints
  const fetchSkillProfile = async () => {
    try {
      const res = await aiService.analyzeSkills();
      setSkills(res.profile);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoadmap = async (roles) => {
    try {
      const res = await aiService.generateRoadmap(roles);
      setRoadmap(res);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await aiService.matchCompanies();
      setCompanies(res.matches);
    } catch (e) {
      console.error(e);
    }
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

  const refreshUser = async () => {
    try {
      const [userRes, telRes] = await Promise.all([
        userService.getMe(),
        telemetryService.getTelemetry().catch(() => null)
      ]);
      setUserData(userRes);
      setTelemetry(telRes);
      return { user: userRes, telemetry: telRes };
    } catch (err) {
      console.error('Failed to refresh user data', err);
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
      isAdmin,
      skills,
      fetchSkillProfile,
      roadmap,
      fetchRoadmap,
      setRoadmap,
      companies,
      fetchCompanies,
      conversation,
      addMentorMessage,
      setConversation,
      completeRoadmapItem: () => {}, // Mocked to avoid errors in Roadmap.jsx
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
