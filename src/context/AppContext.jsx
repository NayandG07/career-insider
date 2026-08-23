import React, { createContext, useState, useContext } from 'react';
import {
  initialUserData,
  skillsData,
  roadmapData as initialRoadmapData,
  companyMatchesData as initialCompanyMatchesData,
  initialConversation,
  reportsData,
  weeklyProgressData as initialWeeklyProgress
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [skills, setSkills] = useState(skillsData);
  const [roadmap, setRoadmap] = useState(initialRoadmapData);
  const [companies, setCompanies] = useState(initialCompanyMatchesData);
  const [conversation, setConversation] = useState(initialConversation);
  const [weeklyProgress, setWeeklyProgress] = useState(initialWeeklyProgress);
  const [pinnedCompanies, setPinnedCompanies] = useState({
    Dream: ["Google", "Uber", "Atlassian"],
    Target: ["Razorpay", "PhonePe", "Groww"],
    Reach: []
  });

  // Action to complete a roadmap item and update related scores
  const completeRoadmapItem = (title) => {
    // Find the item in recommended
    const itemIndex = roadmap.recommended.findIndex(item => item.title === title);
    if (itemIndex === -1) return;
    const item = roadmap.recommended[itemIndex];

    // Remove from recommended list
    const updatedRecommended = roadmap.recommended.filter(i => i.title !== title);

    // Update blueprint item
    const updatedBlueprint = roadmap.blueprint.map(bp => {
      if (bp.name.toLowerCase().includes(title.toLowerCase().replace('learn ', '').replace(' essentials', '')) ||
          title.toLowerCase().includes(bp.name.toLowerCase())) {
        return { ...bp, status: 'completed' };
      }
      return bp;
    });

    // Calculate score increase
    const scoreBoost = item.impact;
    const newReadiness = Math.min(userData.readinessScore + scoreBoost, 100);

    // Update user data
    setUserData(prev => ({
      ...prev,
      readinessScore: newReadiness,
      weeklyGrowth: prev.weeklyGrowth + scoreBoost
    }));

    // Update skill score (Docker is DevOps, Redis is System Design, Kafka is System Design)
    let updatedSkillName = 'DevOps';
    if (title.includes('Redis') || title.includes('Kafka')) updatedSkillName = 'System Design';
    
    const updatedSkills = skills.map(sk => {
      if (sk.subject === updatedSkillName) {
        const newLvl = Math.min(sk.level + 15, 100);
        return { ...sk, A: newLvl, level: newLvl, growth: sk.growth + 15, evidence: `${sk.evidence.split(' ')[0] * 1 + 1} Projects` };
      }
      return sk;
    });
    setSkills(updatedSkills);

    // Update progress stats
    const newCompletedCount = roadmap.progress.completedItems + 1;
    const newPercent = Math.round((newCompletedCount / roadmap.progress.totalItems) * 100);
    const newProgress = {
      ...roadmap.progress,
      completedItems: newCompletedCount,
      percentage: newPercent,
      achievements: [
        { id: `ach-${Date.now()}`, title: `Mastered ${title.replace('Learn ', '')}`, date: 'Just now' },
        ...roadmap.progress.achievements
      ]
    };

    setRoadmap({
      blueprint: updatedBlueprint,
      recommended: updatedRecommended,
      progress: newProgress
    });

    // Boost matching scores slightly
    const updatedCompanies = companies.map(comp => {
      if (comp.missing.some(m => title.toLowerCase().includes(m.toLowerCase().replace(' learn', '').split(' ')[0]))) {
        const matchIncrease = Math.min(comp.matchScore + 5, 100);
        const updatedMissing = comp.missing.filter(m => !title.toLowerCase().includes(m.toLowerCase().replace(' learn', '').split(' ')[0]));
        const updatedStrong = [...comp.strong, title.replace('Learn ', '').replace(' Caching', '').replace(' Essentials', '')];
        return {
          ...comp,
          matchScore: matchIncrease,
          missing: updatedMissing,
          strong: updatedStrong
        };
      }
      return comp;
    });
    setCompanies(updatedCompanies);

    // Update progress chart
    const updatedWeeklyProgress = [...weeklyProgress];
    updatedWeeklyProgress[updatedWeeklyProgress.length - 1].score = newReadiness;
    setWeeklyProgress(updatedWeeklyProgress);

    // Add mentor follow up
    const followUp = {
      sender: "ai",
      text: `Awesome! You completed **${title}**. I've recalculated your metrics. Your Career Readiness is now **${newReadiness}%** (up by +${scoreBoost}%). You've successfully addressed a critical gap for your target companies. Razorpay match is now higher!`
    };
    setConversation(prev => [...prev, followUp]);
  };

  const addMentorMessage = (text) => {
    const userMsg = { sender: 'user', text };
    setConversation(prev => [...prev, userMsg]);

    // Simulate AI response after 1s
    setTimeout(() => {
      let aiText = "I see. Let's analyze how that impacts your target timeline. What specific part would you like to drill down into?";
      let suggestedActions = ["Show my readiness roadmap", "Analyze missing skills for Google", "How can I improve my System Design?"];

      const query = text.toLowerCase();
      if (query.includes('docker') || query.includes('learn next')) {
        aiText = "Your next logical step is **Docker Containerization**. Completing this will boost your Career Readiness to **76%** and unlock new microservice templates. Should we start the Docker module?";
        suggestedActions = ["Start Docker module", "What does Google look for?", "Help me with DSA prep"];
      } else if (query.includes('google') || query.includes('interview')) {
        aiText = "For **Google**, your DSA is strong (75%) but your **System Design** (55%) and **Cloud Architecture** (50%) are major bottlenecks. I recommend focusing on Distributed Caching and Load Balancer designs. I've updated your Suggested Insights panel.";
        suggestedActions = ["Practice System Design Questions", "View Atlassian Match Gaps", "Optimize LeetCode Stats"];
      } else if (query.includes('projects') || query.includes('project')) {
        aiText = "Based on your stack, building a **high-throughput notification service** using Redis and Docker is your highest-impact action. It proves evidence for 2 skills simultaneously (DevOps & System Design).";
        suggestedActions = ["Review Razorpay requirements", "Start Docker module", "Go to Roadmap"];
      } else if (query.includes('80%') || query.includes('reach 80%')) {
        aiText = "To reach **80% Career Readiness**, you need to:\n\n1. Master **Docker Containerization** (+4%)\n2. Complete **Redis Caching** (+3%)\n3. Solve 20 more LeetCode System Design/Array medium problems (+1.5%)\n\nThis will take approximately 8-10 days of targeted learning.";
        suggestedActions = ["Add Redis to Roadmap", "Generate Docker Checklist", "Show my matched jobs"];
      }

      setConversation(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        suggestedActions
      }]);
    }, 1000);
  };

  const pinCompany = (companyName, newTier) => {
    setPinnedCompanies(prev => {
      const updated = { ...prev };
      // Remove from all existing lists
      Object.keys(updated).forEach(tier => {
        updated[tier] = updated[tier].filter(c => c !== companyName);
      });
      // Add to new list if valid
      if (newTier && updated[newTier]) {
        updated[newTier].push(companyName);
      }
      return updated;
    });
  };

  const updateGoal = (targetRole, targetScore) => {
    setUserData(prev => ({
      ...prev,
      targetRole: targetRole || prev.targetRole,
      targetScore: targetScore ? parseInt(targetScore) : prev.targetScore
    }));
  };

  return (
    <AppContext.Provider value={{
      userData,
      setUserData,
      skills,
      setSkills,
      roadmap,
      companies,
      conversation,
      weeklyProgress,
      pinnedCompanies,
      completeRoadmapItem,
      addMentorMessage,
      pinCompany,
      updateGoal,
      reportsData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
