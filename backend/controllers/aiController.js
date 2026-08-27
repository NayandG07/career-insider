import axios from 'axios';
import Telemetry from '../models/Telemetry.js';
import SkillProfile from '../models/SkillProfile.js';
import Roadmap from '../models/Roadmap.js';
import ChatHistory from '../models/ChatHistory.js';

const getAiUrl = () => process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/ai/skills/analyze
 * Re-analyze the user's skill profile from all telemetry data.
 */
export const analyzeSkills = async (req, res) => {
  try {
    // Gather all telemetry
    const telemetryRecords = await Telemetry.find({ userId: req.user._id });
    const telemetryData = {};
    for (const record of telemetryRecords) {
      telemetryData[record.source] = record.data;
    }

    // Include connected sources usernames as context
    const connectedSources = req.user.connectedSources || {};

    const aiResponse = await axios.post(
      `${getAiUrl()}/ai/skills/analyze`,
      {
        telemetry: telemetryData,
        user_context: {
          name: req.user.name,
          connectedSources,
        },
      },
      { timeout: 90000 }
    );

    const profileData = aiResponse.data;

    // Map Python output to Mongoose SkillProfile schema
    // Python returns: { categories: [{name, score, tags}], mastery_items: [{title, level, score, trend}],
    //                   gap_analysis: [{name, delta, priority}], trending_skills: [{name, demand}], readiness_score }
    const categories = (profileData.categories || []).map(c => ({
      name: c.name || c.category || 'Unknown',
      score: c.score || 0,
      tags: c.tags || [],
    }));

    const masteryItems = (profileData.mastery_items || []).map(m => ({
      title: m.title || m,
      level: m.level || 'Beginner',
      score: m.score || 0,
      trend: m.trend || 'stable',
    }));

    const gapAnalysis = (profileData.gap_analysis || []).map(g => ({
      name: g.name || g,
      delta: g.delta || '',
      priority: g.priority || '',
    }));

    const trendingSkills = (profileData.trending_skills || []).map(t => ({
      name: t.name || t,
      demand: t.demand || '',
    }));

    const updated = await SkillProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        categories,
        masteryItems,
        gapAnalysis,
        trendingSkills,
        lastComputedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update readiness score on user
    if (profileData.readiness_score != null) {
      await req.user.updateOne({ readinessScore: profileData.readiness_score });
    }

    res.json({
      message: 'Skill analysis completed.',
      profile: updated,
    });
  } catch (error) {
    console.error('Skill analysis error:', error.response?.data || error.message);
    res.status(502).json({ error: 'AI service failed to analyze skills.' });
  }
};

/**
 * POST /api/ai/roadmap
 * Generate a career roadmap for the user based on target roles + current profile.
 */
export const generateRoadmap = async (req, res) => {
  try {
    const { targetRoles } = req.body;
    if (!targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0) {
      return res.status(400).json({ error: 'targetRoles (array) is required.' });
    }

    // Gather current skill profile
    const skillProfile = await SkillProfile.findOne({ userId: req.user._id });

    const aiResponse = await axios.post(
      `${getAiUrl()}/ai/roadmap`,
      {
        target_roles: targetRoles,
        skill_profile: skillProfile ? skillProfile.toObject() : {},
        user_context: {
          name: req.user.name,
          readinessScore: req.user.readinessScore,
        },
      },
      { timeout: 90000 }
    );

    // Python now returns { milestones: [{id, title, desc, tags, status, progress, subtasks: [{id, text, completed}]}], readiness }
    const roadmapData = aiResponse.data;

    const milestones = (roadmapData.milestones || []).map((m, idx) => ({
      id: m.id || `m${idx + 1}`,
      title: m.title || 'Untitled Milestone',
      desc: m.desc || m.description || '',
      tags: m.tags || [],
      status: m.status || 'locked',
      progress: m.progress || 0,
      subtasks: (m.subtasks || []).map((s, sIdx) => ({
        id: s.id || `s${idx + 1}_${sIdx + 1}`,
        text: s.text || s.task || '',
        completed: s.completed || false,
      })),
    }));

    await Roadmap.findOneAndUpdate(
      { userId: req.user._id },
      {
        targetRoles,
        milestones,
        readiness: roadmapData.readiness || 0,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ milestones, readiness: roadmapData.readiness || 0 });
  } catch (error) {
    console.error('Roadmap generation error:', error.response?.data || error.message);
    res.status(502).json({ error: 'AI service failed to generate roadmap.' });
  }
};

/**
 * POST /api/ai/companies
 * Run the company compatibility matcher.
 */
export const matchCompanies = async (req, res) => {
  try {
    const skillProfile = await SkillProfile.findOne({ userId: req.user._id });

    const aiResponse = await axios.post(
      `${getAiUrl()}/ai/companies`,
      {
        skill_profile: skillProfile ? skillProfile.toObject() : {},
        user_context: {
          name: req.user.name,
          readinessScore: req.user.readinessScore,
        },
      },
      { timeout: 90000 }
    );

    // Python returns { matches: [{name, matchScore, tier, hiringInsights, strong, missing}] }
    // This shape matches the frontend CompanyMatches.jsx directly — pass through
    res.json(aiResponse.data);
  } catch (error) {
    console.error('Company matching error:', error.response?.data || error.message);
    res.status(502).json({ error: 'AI service failed to match companies.' });
  }
};

/**
 * POST /api/ai/mentor/chat
 * Send a message to the AI mentor and get a contextual response.
 */
export const mentorChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required.' });
    }

    const session = sessionId || `session-${Date.now()}`;

    // Fetch existing chat history for this session
    let chatDoc = await ChatHistory.findOne({ userId: req.user._id, sessionId: session });
    const existingMessages = chatDoc?.messages || [];

    // Gather context
    const skillProfile = await SkillProfile.findOne({ userId: req.user._id });

    const aiResponse = await axios.post(
      `${getAiUrl()}/ai/mentor/chat`,
      {
        message,
        chat_history: existingMessages.map((m) => ({ role: m.sender, content: m.text })),
        user_context: {
          name: req.user.name,
          readinessScore: req.user.readinessScore,
          skill_profile: skillProfile ? skillProfile.toObject() : {},
        },
      },
      { timeout: 60000 }
    );

    const mentorReply = aiResponse.data.response || '';

    // Save both messages to history
    const newMessages = [
      { sender: 'user', text: message, timestamp: new Date() },
      { sender: 'mentor', text: mentorReply, timestamp: new Date() },
    ];

    if (chatDoc) {
      chatDoc.messages.push(...newMessages);
      await chatDoc.save();
    } else {
      await ChatHistory.create({
        userId: req.user._id,
        sessionId: session,
        messages: newMessages,
      });
    }

    res.json({ sessionId: session, response: mentorReply });
  } catch (error) {
    console.error('Mentor chat error:', error.response?.data || error.message);
    res.status(502).json({ error: 'AI mentor is currently unavailable.' });
  }
};
