import axios from 'axios';
import User from '../models/User.js';
import Telemetry from '../models/Telemetry.js';
import SkillProfile from '../models/SkillProfile.js';
import Roadmap from '../models/Roadmap.js';
import Project from '../models/Project.js';
import ChatHistory from '../models/ChatHistory.js';
import { extractSkillEvidence } from '../utils/skillEvidenceExtractor.js';
import logger from '../utils/logger.js';

const getAiUrl = () => process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

async function checkUserReadiness(user) {
  const hasLeetCode = Boolean(user?.connectedSources?.leetcode?.trim());
  const hasCodeforces = Boolean(user?.connectedSources?.codeforces?.trim());
  const hasGitHub = Boolean(user?.connectedSources?.github?.trim() || user?.auth?.github?.username);
  const projects = await Project.find({ userId: user._id });
  const hasProject = projects.length > 0;
  
  // Either condition: user has connected at least one profile or added a project
  const isReady = hasLeetCode || hasCodeforces || hasGitHub || hasProject;

  const missing = [];
  if (!isReady) {
    missing.push('Connect at least one platform (GitHub, LeetCode, Codeforces) or add a showcase project');
  }

  return {
    leetcode: hasLeetCode,
    codeforces: hasCodeforces,
    github: hasGitHub,
    hasProject,
    ready: isReady,
    missing,
    projects,
  };
}

/**
 * GET /api/ai/skills
 * Retrieve current saved skill profile for the user.
 */
export const getSkillProfile = async (req, res) => {
  try {
    const readiness = await checkUserReadiness(req.user);
    if (!readiness.ready) {
      return res.json({
        profile: null,
        readiness: {
          leetcode: readiness.leetcode,
          codeforces: readiness.codeforces,
          github: readiness.github,
          hasProject: readiness.hasProject,
          ready: false,
          missing: readiness.missing,
        },
      });
    }

    let profile = await SkillProfile.findOne({ userId: req.user._id });
    if (!profile) {
      // Build baseline deterministic metrics if not computed yet
      const telemetryRecords = await Telemetry.find({ userId: req.user._id });
      const telemetry = {};
      for (const r of telemetryRecords) {
        telemetry[r.source] = r.data;
      }
      const evidence = extractSkillEvidence({ telemetry, projects: readiness.projects });

      profile = {
        userId: req.user._id,
        readinessScore: req.user.readinessScore || 50,
        scoreVersion: 2,
        scoringModel: 'v2-5dim',
        categories: evidence.categories,
        skills: Object.entries(evidence.skillEvidenceMap).map(([name, evList]) => ({
          name,
          category: 'General',
          level: evList.length >= 3 ? 'Strong' : 'Developing',
          confidence: evList.length >= 3 ? 'High' : evList.length >= 2 ? 'Moderate' : 'Low',
          evidenceStrength: Math.min(95, evList.length * 20),
          evidenceCount: evList.length,
          evidenceSummary: `${evList.length} verified evidence items`,
          evidenceRefs: evList.map(e => e.id),
          explanation: `Derived from ${evList.map(e => e.source).join(', ')} telemetry.`,
          whyItMatters: 'Foundational capability for engineering roles.',
          focusNext: 'Continue building practical project proof points.',
        })),
        gapAnalysis: [],
        sourceContributions: evidence.sourceContributions,
        rawMetrics: evidence.rawMetrics,
        previousSnapshots: [],
        lastComputedAt: null,
      };
    }
    res.json({ profile, readiness });
  } catch (error) {
    console.error('Get skill profile error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve skill profile.' });
  }
};

/**
 * POST /api/ai/skills/analyze
 * Re-analyze the user's skill profile using deterministic facts + LLM interpretation.
 */
export const analyzeSkills = async (req, res) => {
  try {
    const readiness = await checkUserReadiness(req.user);
    if (!readiness.ready) {
      return res.status(400).json({
        error: 'Insufficient source data for analytical generation.',
        readiness,
      });
    }

    // Gather existing profile to create an immutable snapshot before updating
    const existingProfile = await SkillProfile.findOne({ userId: req.user._id });
    const previousSnapshots = existingProfile?.previousSnapshots ? [...existingProfile.previousSnapshots] : [];
    if (existingProfile && existingProfile.lastComputedAt) {
      previousSnapshots.push({
        computedAt: existingProfile.lastComputedAt,
        readinessScore: existingProfile.readinessScore || 50,
        categories: existingProfile.categories || [],
        topSkills: (existingProfile.skills || []).slice(0, 8),
      });
      // Keep last 10 snapshots
      if (previousSnapshots.length > 10) previousSnapshots.shift();
    }

    // Gather all telemetry
    const telemetryRecords = await Telemetry.find({ userId: req.user._id });
    const telemetry = {};
    for (const record of telemetryRecords) {
      telemetry[record.source] = record.data;
    }

    const projects = readiness.projects;

    // Extract deterministic evidence and 5-dimension scores
    const evidencePackage = extractSkillEvidence({ telemetry, projects });

    const aiTask = logger.startTask('AI SKILLS', 'Skill Analysis', {
      user: req.user.email || req.user.name,
      projects: projects.length,
      sources: Object.keys(telemetry).join(', ') || 'none',
    });

    let profileData = null;

    try {
      const aiResponse = await axios.post(
        `${getAiUrl()}/ai/skills/analyze`,
        {
          evidence_package: evidencePackage,
          user_context: {
            name: req.user.name,
            readinessScore: req.user.readinessScore,
            connectedSources: req.user.connectedSources,
          },
        },
        { timeout: 90000 }
      );
      profileData = aiResponse.data;
      aiTask.success({
        readinessScore: profileData.readiness_score || 50,
        skillsCount: profileData.skills?.length || 0,
        categories: (profileData.categories || []).map(c => `${c.name}: ${c.score}%`).join(' | '),
      });
    } catch (aiErr) {
      aiTask.error(aiErr, 'AI Service unavailable, falling back to deterministic calculation');
      // Construct robust deterministic fallback with confidence and evidenceRefs from candidateSkills
      const avgCatScore = Math.round(evidencePackage.categories.reduce((sum, c) => sum + c.score, 0) / Math.max(1, evidencePackage.categories.length));
      profileData = {
        readiness_score: Math.min(95, Math.max(25, avgCatScore)),
        score_version: 2,
        scoring_model: 'v2-5dim',
        categories: evidencePackage.categories.map(c => ({
          name: c.name,
          score: c.score,
          level: c.level,
          dimensions: c.dimensions,
          skills: c.skills,
        })),
        skills: (evidencePackage.candidateSkills || []).map(s => ({
          name: s.name,
          category: s.category,
          level: s.level,
          confidence: s.confidence,
          evidenceStrength: s.evidenceStrength,
          evidenceCount: s.evidenceCount,
          evidenceSummary: s.evidenceSummary,
          evidenceRefs: s.evidenceRefs,
          explanation: s.explanation,
          whyItMatters: s.whyItMatters,
          focusNext: s.focusNext,
        })),
        gap_analysis: [
          {
            name: 'System Observability & Load Benchmarks',
            category: 'Backend Engineering',
            delta: 'Moderate Delta',
            priority: 'P1 PRIORITY',
            recommendation: 'Implement structured logging and conduct load testing benchmarks on your API services.',
            evidenceRefs: ['project:tech:express', 'project:tech:mongodb'],
          }
        ],
        source_contributions: evidencePackage.sourceContributions,
      };
    }

    const readinessScore = profileData.readiness_score || 50;

    const updated = await SkillProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        readinessScore,
        scoreVersion: 2,
        scoringModel: 'v2-5dim',
        categories: profileData.categories || evidencePackage.categories,
        skills: profileData.skills || [],
        gapAnalysis: profileData.gap_analysis || [],
        sourceContributions: profileData.source_contributions || evidencePackage.sourceContributions,
        rawMetrics: evidencePackage.rawMetrics,
        previousSnapshots,
        lastComputedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update user readiness score & snapshot history
    await User.findByIdAndUpdate(req.user._id, {
      readinessScore,
      lastAnalyzedAt: new Date(),
      $push: {
        readinessHistory: {
          $each: [{ score: readinessScore, date: new Date() }],
          $slice: -10,
        },
      },
    });

    res.json({
      message: 'Skill analysis completed.',
      profile: updated,
    });
  } catch (error) {
    console.error('Skill analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze skills.' });
  }
};

/**
 * Validate and topologically sort milestones dependency graph.
 * Performs cycle detection, removes broken edges, ensures prerequisite existence,
 * computes sequence ordering, and calculates total effort hours and duration.
 */
function validateAndSortRoadmap(rawMilestones, weeklyHours = 10) {
  if (!Array.isArray(rawMilestones) || rawMilestones.length === 0) {
    return {
      milestones: [],
      estimatedTotalHours: 0,
      estimatedTotalWeeks: 0,
    };
  }

  // 1. Sanitize IDs and build ID set
  const milestoneMap = new Map();
  for (let i = 0; i < rawMilestones.length; i++) {
    const m = rawMilestones[i];
    let id = String(m.id || `m_${i + 1}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    let uniqueId = id;
    let counter = 1;
    while (milestoneMap.has(uniqueId)) {
      uniqueId = `${id}_${counter++}`;
    }
    const cleanHours = Math.max(4, Math.min(40, Number(m.estimatedHours) || 12));
    milestoneMap.set(uniqueId, {
      ...m,
      id: uniqueId,
      estimatedHours: cleanHours,
      prerequisites: Array.isArray(m.prerequisites) ? m.prerequisites.map(p => String(p).toLowerCase().replace(/[^a-z0-9_-]/g, '-')) : [],
    });
  }

  // 2. Clean prerequisite lists: remove non-existent IDs and self-dependencies
  for (const [id, m] of milestoneMap.entries()) {
    m.prerequisites = m.prerequisites.filter(p => p !== id && milestoneMap.has(p));
  }

  // 3. Cycle Detection & Removal (DFS)
  const visited = new Set();
  const recStack = new Set();

  function checkCycle(nodeId) {
    visited.add(nodeId);
    recStack.add(nodeId);

    const node = milestoneMap.get(nodeId);
    if (!node) return;

    const validPrereqs = [];
    for (const p of node.prerequisites) {
      if (!visited.has(p)) {
        checkCycle(p);
        validPrereqs.push(p);
      } else if (recStack.has(p)) {
        // Break cycle edge
        console.warn(`[Roadmap Graph] Circular dependency detected between ${nodeId} and ${p}, breaking edge.`);
      } else {
        validPrereqs.push(p);
      }
    }
    node.prerequisites = validPrereqs;
    recStack.delete(nodeId);
  }

  for (const id of milestoneMap.keys()) {
    if (!visited.has(id)) {
      checkCycle(id);
    }
  }

  // 4. Compute dependency depth for natural sequence ordering
  const depthMap = new Map();
  function getDepth(nodeId, seen = new Set()) {
    if (depthMap.has(nodeId)) return depthMap.get(nodeId);
    if (seen.has(nodeId)) return 0;
    seen.add(nodeId);

    const node = milestoneMap.get(nodeId);
    if (!node || node.prerequisites.length === 0) {
      depthMap.set(nodeId, 0);
      return 0;
    }

    let maxPrereqDepth = 0;
    for (const p of node.prerequisites) {
      maxPrereqDepth = Math.max(maxPrereqDepth, getDepth(p, new Set(seen)) + 1);
    }
    depthMap.set(nodeId, maxPrereqDepth);
    return maxPrereqDepth;
  }

  for (const id of milestoneMap.keys()) {
    getDepth(id);
  }

  const sortedMilestones = Array.from(milestoneMap.values()).sort((a, b) => {
    const depthA = depthMap.get(a.id) || 0;
    const depthB = depthMap.get(b.id) || 0;
    if (depthA !== depthB) return depthA - depthB;
    return (a.sequenceIndex || 0) - (b.sequenceIndex || 0);
  });

  sortedMilestones.forEach((m, idx) => {
    m.sequenceIndex = idx + 1;
  });

  // 5. Backend Arithmetic for Total Effort
  const estimatedTotalHours = sortedMilestones.reduce((sum, m) => sum + m.estimatedHours, 0);
  const hoursPerWeek = Math.max(1, Number(weeklyHours) || 10);
  const estimatedTotalWeeks = Math.ceil(estimatedTotalHours / hoursPerWeek);

  return {
    milestones: sortedMilestones,
    estimatedTotalHours,
    estimatedTotalWeeks,
  };
}

/**
 * GET /api/ai/roadmap
 * Fetch the latest saved career roadmap for the user.
 */
export const getRoadmap = async (req, res) => {
  try {
    const readiness = await checkUserReadiness(req.user);
    if (!readiness.ready) {
      return res.json({
        roadmap: null,
        readiness: {
          leetcode: readiness.leetcode,
          codeforces: readiness.codeforces,
          github: readiness.github,
          hasProject: readiness.hasProject,
          ready: false,
          missing: readiness.missing,
        },
      });
    }

    const roadmap = await Roadmap.findOne({ userId: req.user._id });
    res.json({ roadmap: roadmap || null, readiness });
  } catch (error) {
    console.error('Get roadmap error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve roadmap.' });
  }
};

/**
 * POST /api/ai/roadmap
 * Generate a career roadmap for the user based on target roles + verified telemetry and skill profile.
 */
export const generateRoadmap = async (req, res) => {
  try {
    const readiness = await checkUserReadiness(req.user);
    if (!readiness.ready) {
      return res.status(400).json({
        error: 'Insufficient source data for roadmap generation. Please connect all required sources and add at least one project.',
        readiness,
      });
    }

    const { targetRoles, weeklyHours = 10 } = req.body;
    if (!targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0) {
      return res.status(400).json({ error: 'targetRoles (array) is required.' });
    }

    // Gather current skill profile and telemetry metrics
    const skillProfile = await SkillProfile.findOne({ userId: req.user._id });
    const telemetryRecords = await Telemetry.find({ userId: req.user._id });
    const telemetry = {};
    for (const record of telemetryRecords) {
      telemetry[record.source] = record.data;
    }
    const projects = readiness.projects;
    const evidence = extractSkillEvidence({ telemetry, projects });

    const roadmapTask = logger.startTask('ROADMAP', 'Roadmap Generation', {
      user: req.user.email || req.user.name,
      targetRoles: targetRoles.join(', '),
      weeklyHours: `${weeklyHours}h/wk`,
    });

    let roadmapData = null;

    try {
      const aiResponse = await axios.post(
        `${getAiUrl()}/ai/roadmap`,
        {
          target_roles: targetRoles,
          skill_profile: skillProfile ? skillProfile.toObject() : { categories: [] },
          gaps: (skillProfile?.gapAnalysis || []).map(g => `${g.name}: ${g.recommendation}`).join('; '),
          user_context: {
            name: req.user.name,
            readinessScore: req.user.readinessScore || 50,
            metrics: evidence.rawMetrics,
            weeklyHours: Number(weeklyHours) || 10,
          },
        },
        { timeout: 90000 }
      );
      roadmapData = aiResponse.data;
      roadmapTask.success({
        milestones: roadmapData.milestones?.length || 0,
        primaryFocus: roadmapData.summary?.primaryFocus?.join(', ') || 'N/A',
      });
    } catch (aiErr) {
      roadmapTask.error(aiErr, 'AI Service unavailable for roadmap, using structured gap-based baseline');
      const mainRole = targetRoles[0] || 'Software Engineer';
      roadmapData = {
        targetRoles,
        summary: {
          title: `Personalized Roadmap for ${targetRoles.join(' + ')}`,
          description: `Targeted milestone trajectory synthesizing your verified telemetry against ${targetRoles.join(', ')} engineering competencies.`,
          primaryFocus: ['API Reliability', 'Containerization', 'Distributed Systems'],
          currentEvidenceLevel: 'Moderate Evidence',
        },
        weeklyHours: Number(weeklyHours) || 10,
        milestones: [
          {
            id: 'system-linux-foundations',
            title: 'Linux & System Architecture Foundations',
            type: 'Foundation',
            description: 'Master server operating environments, process hierarchy, POSIX file systems, and bash automation.',
            whyItMatters: `Standard infrastructure baseline required for ${mainRole} competencies.`,
            skills: ['Linux', 'Shell Scripting', 'OS Architecture'],
            evidenceState: 'partial',
            gapLevel: 'medium',
            estimatedHours: 12,
            prerequisites: [],
            outcome: 'Ability to automate server setup, parse logs, and manage network sockets.',
            suggestedProject: null,
            evidenceRefs: ['github:lang:shell']
          },
          {
            id: 'scalable-api-architecture',
            title: 'Scalable API Services & Connection Pooling',
            type: 'Core Skill',
            description: 'Design resilient REST/gRPC interfaces with database indexing, connection pooling, and error handling.',
            whyItMatters: 'Directly addresses backend data transport and service reliability requirements.',
            skills: ['REST API', 'Databases', 'Indexing'],
            evidenceState: 'partial',
            gapLevel: 'medium',
            estimatedHours: 16,
            prerequisites: ['system-linux-foundations'],
            outcome: 'Production-ready API service adhering to 12-factor application standards.',
            suggestedProject: null,
            evidenceRefs: ['project:tech:express', 'project:tech:mongodb']
          },
          {
            id: 'container-orchestration',
            title: 'Docker Multi-Stage Containerization',
            type: 'Core Skill',
            description: 'Package multi-tier applications into hardened, slim multi-stage Docker images.',
            whyItMatters: 'Essential for reproducible continuous integration and cloud deployment.',
            skills: ['Docker', 'DevOps', 'Containers'],
            evidenceState: 'missing',
            gapLevel: 'high',
            estimatedHours: 14,
            prerequisites: ['system-linux-foundations'],
            outcome: 'Minimized Docker images with healthcheck probes and isolated networking.',
            suggestedProject: null,
            evidenceRefs: []
          },
          {
            id: 'distributed-caching-benchmarks',
            title: 'Distributed Caching & Concurrency Optimization',
            type: 'Advanced Skill',
            description: 'Implement distributed memory caching with Redis, cache eviction strategies, and load testing.',
            whyItMatters: 'Closes latency and throughput scaling requirements for high-concurrency systems.',
            skills: ['Redis', 'Caching', 'Load Testing'],
            evidenceState: 'missing',
            gapLevel: 'high',
            estimatedHours: 18,
            prerequisites: ['scalable-api-architecture', 'container-orchestration'],
            outcome: 'Sub-15ms response latency under benchmarked synthetic concurrent loads.',
            suggestedProject: null,
            evidenceRefs: []
          },
          {
            id: 'production-showcase-project',
            title: `Production ${mainRole} Showcase Project`,
            type: 'Project',
            description: 'Build, benchmark, and deploy an end-to-end multi-service application with automated CI/CD.',
            whyItMatters: 'Definitive portfolio proof point validating end-to-end full-lifecycle development.',
            skills: ['Full-Stack', 'CI/CD', 'Docker', 'Architecture'],
            evidenceState: 'missing',
            gapLevel: 'high',
            estimatedHours: 24,
            prerequisites: ['distributed-caching-benchmarks'],
            outcome: 'A live deployed application demonstrating full architecture and automated pipeline hygiene.',
            suggestedProject: `High-concurrency distributed data processing pipeline with containerized worker nodes and automated GitHub Actions deployment.`,
            evidenceRefs: []
          }
        ]
      };
    }

    // Validate graph, eliminate cycles, and compute effort arithmetic
    const validated = validateAndSortRoadmap(roadmapData.milestones || [], weeklyHours);

    const savedRoadmap = await Roadmap.findOneAndUpdate(
      { userId: req.user._id },
      {
        targetRoles,
        summary: roadmapData.summary || {
          title: `Roadmap for ${targetRoles.join(' + ')}`,
          description: 'Personalized career trajectory based on verified developer evidence.',
          primaryFocus: ['Architecture', 'Infrastructure'],
          currentEvidenceLevel: 'Moderate',
        },
        weeklyHours: Number(weeklyHours) || 10,
        estimatedTotalHours: validated.estimatedTotalHours,
        estimatedTotalWeeks: validated.estimatedTotalWeeks,
        milestones: validated.milestones,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ roadmap: savedRoadmap });
  } catch (error) {
    console.error('Roadmap generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
};

/**
 * POST /api/ai/companies
 * Run the company compatibility matcher.
 */
export const matchCompanies = async (req, res) => {
  const matchTask = logger.startTask('AI MATCH', 'Company Matcher', {
    user: req.user.email || req.user.name,
  });

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

    matchTask.success({
      matchesCount: aiResponse.data?.matches?.length || 0,
    });

    res.json(aiResponse.data);
  } catch (error) {
    matchTask.error(error, 'Company matching failed');
    res.status(502).json({ error: 'AI service failed to match companies.' });
  }
};

/**
 * POST /api/ai/mentor/chat
 * Send a message to the AI mentor and get a contextual response.
 */
export const mentorChat = async (req, res) => {
  try {
    const { message, sessionId, taggedContext, coachMode } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required.' });
    }

    const session = sessionId || `session-${Date.now()}`;

    const mentorTask = logger.startTask('AI MENTOR', 'Mentor Chat Response', {
      user: req.user.email || req.user.name,
      session: session.slice(-8),
      promptLen: `${message.length} chars`,
      coachMode: coachMode || 'general',
      hasTags: Boolean(taggedContext && Object.keys(taggedContext).length > 0),
    });

    let chatDoc = await ChatHistory.findOne({ userId: req.user._id, sessionId: session });
    const existingMessages = chatDoc?.messages || [];

    const [skillProfile, roadmap, projects] = await Promise.all([
      SkillProfile.findOne({ userId: req.user._id }),
      Roadmap.findOne({ userId: req.user._id }),
      Project.find({ userId: req.user._id }).select('title technologies repositoryUrl liveUrl'),
    ]);

    const hasLeetCode = Boolean(req.user?.connectedSources?.leetcode?.trim());
    const hasCodeforces = Boolean(req.user?.connectedSources?.codeforces?.trim());
    const hasGitHub = Boolean(req.user?.connectedSources?.github?.trim() || req.user?.auth?.github?.username);
    const hasProject = Array.isArray(projects) && projects.length > 0;
    const prompt = (message || '').toLowerCase();

    let smartReply = null;

    // Rule A: If user only has Codeforces connected and asks about projects, LeetCode, or overall readiness
    if (hasCodeforces && !hasLeetCode && !hasGitHub && !hasProject) {
      if (prompt.includes('project') || prompt.includes('leetcode') || prompt.includes('github') || prompt.includes('repo') || prompt.includes('dsa') || prompt.includes('ready') || prompt.includes('score')) {
        smartReply = `Looking at your verified telemetry, you currently have Codeforces connected with an active rating and contest track record (@${req.user.connectedSources.codeforces}). However, your LeetCode, GitHub, and showcase projects are not yet linked.\n\nOnce you connect LeetCode and add your development projects in Settings, I will be able to synthesize your algorithmic strength with your software engineering footprint for a comprehensive career benchmark!`;
      }
    }

    // Rule B: If user asks specifically about LeetCode/DSA metrics, but LeetCode is not connected
    if (!smartReply && !hasLeetCode && (prompt.includes('leetcode') || prompt.includes('easy/medium') || (prompt.includes('dsa') && prompt.includes('solve')) || prompt.includes('acceptance rate') || prompt.includes('problem solving metrics'))) {
      const sources = [];
      if (hasCodeforces) sources.push(`Codeforces (@${req.user.connectedSources.codeforces})`);
      if (hasGitHub) sources.push(`GitHub (@${req.user.connectedSources?.github || req.user?.auth?.github?.username})`);
      if (hasProject) sources.push(`${projects.length} showcase project${projects.length > 1 ? 's' : ''}`);

      const sourcesText = sources.length > 0 
        ? `Currently, I only have access to your verified data from ${sources.join(' and ')}.` 
        : `Currently, I don't see any connected problem-solving accounts in your workspace.`;

      smartReply = `I've analyzed your question regarding LeetCode problem solving. However, your LeetCode account is not connected yet. ${sourcesText}\n\nTo unlock verified analysis of your algorithmic problem solving, easy/medium/hard breakdown, and topic masteries, please connect your LeetCode username in Settings!`;
    }

    // Rule C: If user asks about projects/codebase, but has no projects and no GitHub connected
    if (!smartReply && !hasProject && !hasGitHub && (prompt.includes('project') || prompt.includes('repository') || prompt.includes('repos') || prompt.includes('codebase') || prompt.includes('github') || prompt.includes('tech stack'))) {
      const cfText = hasCodeforces ? `I can see your competitive programming rating on Codeforces (@${req.user.connectedSources.codeforces}), but ` : ``;
      smartReply = `I've evaluated your portfolio inquiry. ${cfText}I don't find any showcase projects or connected GitHub repositories in your workspace.\n\nTo analyze your production architecture, tech stack competencies, and code consistency, please add a showcase project or connect your GitHub profile in Settings!`;
    }

    let mentorReply = smartReply;

    if (!mentorReply) {
      const aiResponse = await axios.post(
        `${getAiUrl()}/ai/mentor/chat`,
        {
          message,
          chat_history: existingMessages.map((m) => ({ role: m.sender, content: m.text })),
          user_context: {
            name: req.user.name,
            readinessScore: req.user.readinessScore || skillProfile?.readinessScore || 50,
            target_roles: roadmap?.targetRoles || [req.user?.targetRole || 'Full-Stack Software Engineer'],
            skill_profile: skillProfile ? skillProfile.toObject() : {},
            roadmap: roadmap ? roadmap.toObject() : {},
            projects: projects ? projects.map(p => p.toObject()) : [],
            tagged_context: taggedContext || null,
            coach_mode: coachMode || 'general',
          },
        },
        { timeout: 60000 }
      );
      mentorReply = aiResponse.data.response || '';
    }

    mentorTask.success({
      responseLen: `${mentorReply.length} chars`,
    });

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
    logger.error('AI MENTOR', 'Mentor chat failed', error);
    res.status(502).json({ error: 'AI mentor is currently unavailable.' });
  }
};

/**
 * GET /api/ai/mentor/history
 * Retrieve message history for active session or all sessions.
 */
export const getMentorHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (sessionId) {
      const chatDoc = await ChatHistory.findOne({ userId: req.user._id, sessionId });
      return res.json({ messages: chatDoc?.messages || [] });
    }
    const sessions = await ChatHistory.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(10);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentor history.' });
  }
};

/**
 * DELETE /api/ai/mentor/history/:sessionId
 * Delete a specific chat session.
 */
export const clearMentorSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await ChatHistory.deleteOne({ userId: req.user._id, sessionId });
    res.json({ message: 'Session cleared.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear session.' });
  }
};

/**
 * GET /api/ai/progress-summary
 * Generate a short AI-written progress summary for the Reports page.
 */
export const getProgressSummary = async (req, res) => {
  try {
    const skillProfile = await SkillProfile.findOne({ userId: req.user._id });
    const roadmap = await Roadmap.findOne({ userId: req.user._id });

    const aiResponse = await axios.post(
      `${getAiUrl()}/ai/progress-summary`,
      {
        skill_profile: skillProfile ? skillProfile.toObject() : {},
        roadmap: roadmap ? { milestones: roadmap.milestones, readiness: roadmap.readiness } : {},
        user_context: {
          name: req.user.name,
          readinessScore: req.user.readinessScore,
          lastAnalyzedAt: req.user.lastAnalyzedAt,
        },
      },
      { timeout: 60000 }
    );

    res.json({ summary: aiResponse.data.summary || '' });
  } catch (error) {
    console.error('Progress summary error:', error.message);
    res.json({ summary: null });
  }
};
