import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Compass, 
  Zap, 
  AlertCircle, 
  Target, 
  Award, 
  RefreshCw, 
  Clock, 
  Layers, 
  BookOpen,
  ArrowDown,
  Link2,
  CheckCircle2,
  Circle,
  HelpCircle,
  AlertTriangle,
  FolderGit2,
  ChevronRight,
  ExternalLink,
  Code,
  Calendar,
  Settings,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReadinessGate from '../components/ReadinessGate';

const ROLE_OPTIONS = [
  { 
    id: "Senior Backend Engineer", 
    label: "Senior Backend Engineer", 
    desc: "Distributed APIs, microservices, database scaling & high-throughput concurrency",
    skills: ["Node.js / Go", "PostgreSQL", "Redis", "REST / gRPC", "System Design"]
  },
  { 
    id: "DevOps & Cloud Engineer", 
    label: "DevOps / SRE Engineer", 
    desc: "Production automation, cloud infrastructure, container orchestration & observability",
    skills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform", "Observability"]
  },
  { 
    id: "Full Stack Product Lead", 
    label: "Full Stack Engineer", 
    desc: "Modern reactive frontends, full-lifecycle web APIs & high product velocity",
    skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Database Modeling"]
  },
  { 
    id: "Distributed Systems Architect", 
    label: "Systems Architect", 
    desc: "High-scale storage engines, consensus algorithms, event streaming & protocols",
    skills: ["Go / Rust", "Kafka", "Distributed Storage", "Network Protocols", "Consensus"]
  },
  { 
    id: "Machine Learning Engineer", 
    label: "ML & AI Systems", 
    desc: "Model serving pipelines, feature stores, embedding search & LLM workflows",
    skills: ["Python", "FastAPI", "Vector DBs", "PyTorch", "Data Pipelines"]
  },
];

const WEEKLY_BUDGETS = [5, 10, 15, 20];

export default function Roadmap({ setActivePage }) {
  const { 
    userData, 
    roadmap, 
    loadSavedRoadmap,
    fetchRoadmap,
    readiness,
  } = useApp();

  // Loading & Initialization state
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // First-Visit State (NO AUTO-SELECTED ROLE by default)
  const [firstVisitRoles, setFirstVisitRoles] = useState([]);
  const [firstVisitWeeklyHours, setFirstVisitWeeklyHours] = useState(10);

  // Returning User: Active selected milestone for inspector
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);

  // Returning User: Track Settings Popover state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingRoles, setPendingRoles] = useState([]);
  const [pendingWeeklyHours, setPendingWeeklyHours] = useState(10);

  // Load saved roadmap on mount once
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (loadSavedRoadmap) {
        await loadSavedRoadmap().catch(() => {});
      }
      if (isMounted) setHasInitialized(true);
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Synchronize settings state when opening popover
  const savedRoles = useMemo(() => roadmap?.targetRoles || [], [roadmap]);
  const savedWeeklyHours = useMemo(() => roadmap?.weeklyHours || 10, [roadmap]);

  const handleOpenSettings = () => {
    setPendingRoles([...savedRoles]);
    setPendingWeeklyHours(savedWeeklyHours);
    setGenerationError(null);
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setPendingRoles([...savedRoles]);
    setPendingWeeklyHours(savedWeeklyHours);
  };

  // Toggle roles in First-Visit selection
  const handleToggleFirstVisitRole = (roleId) => {
    setFirstVisitRoles(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  // Toggle roles in Track Settings Popover
  const handleTogglePendingRole = (roleId) => {
    setPendingRoles(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  // Calculate Dirty State for Settings
  const isSettingsDirty = useMemo(() => {
    if (pendingRoles.length === 0) return false;
    if (pendingWeeklyHours !== savedWeeklyHours) return true;
    if (pendingRoles.length !== savedRoles.length) return true;
    const sortedPending = [...pendingRoles].sort();
    const sortedSaved = [...savedRoles].sort();
    return sortedPending.some((r, idx) => r !== sortedSaved[idx]);
  }, [pendingRoles, pendingWeeklyHours, savedRoles, savedWeeklyHours]);

  // First Visit: Generate Action
  const handleFirstVisitBuild = async () => {
    if (firstVisitRoles.length === 0) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await fetchRoadmap(firstVisitRoles, firstVisitWeeklyHours);
      triggerToast(`Personalized roadmap created for ${firstVisitRoles.join(' & ')}`);
    } catch (err) {
      console.error('Build roadmap error:', err);
      setGenerationError('Failed to build roadmap. Make sure your telemetry sources are connected and try again.');
      triggerToast('Failed to build roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Returning User: Regenerate from Settings
  const handleRegenerateFromSettings = async () => {
    if (!isSettingsDirty || pendingRoles.length === 0) return;
    setIsGenerating(true);
    setIsSettingsOpen(false);
    setGenerationError(null);
    try {
      await fetchRoadmap(pendingRoles, pendingWeeklyHours);
      triggerToast(`Roadmap updated for ${pendingRoles.join(' & ')}`);
    } catch (err) {
      console.error('Roadmap regeneration error:', err);
      setGenerationError("We couldn't generate the updated roadmap. Your current roadmap is still safe.");
      triggerToast('Update failed. Previous roadmap preserved.');
    } finally {
      setIsGenerating(false);
    }
  };

  const milestones = roadmap?.milestones || [];
  const milestoneMap = useMemo(() => {
    const map = new Map();
    milestones.forEach(m => map.set(m.id, m));
    return map;
  }, [milestones]);

  // Total Hours & Dynamic Weekly duration
  const totalHours = useMemo(() => {
    if (roadmap?.estimatedTotalHours) return roadmap.estimatedTotalHours;
    return milestones.reduce((sum, m) => sum + (m.estimatedHours || 12), 0);
  }, [roadmap, milestones]);

  const activeWeeklyHours = roadmap?.weeklyHours || 10;
  const totalWeeks = useMemo(() => {
    return Math.max(1, Math.ceil(totalHours / Math.max(1, activeWeeklyHours)));
  }, [totalHours, activeWeeklyHours]);

  // Active selected milestone for detail inspector
  const activeMilestone = useMemo(() => {
    if (!selectedMilestoneId && milestones.length > 0) return milestones[0];
    return milestoneMap.get(selectedMilestoneId) || milestones[0] || null;
  }, [selectedMilestoneId, milestoneMap, milestones]);

  // Wait for initialization to complete
  if (!hasInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Roadmap Data...</span>
      </div>
    );
  }


  // Readiness Gate Check
  if (hasInitialized && readiness && !readiness.ready) {
    return (
      <ReadinessGate 
        featureName="Career Roadmap" 
        readiness={readiness} 
        setActivePage={setActivePage} 
        description="Your roadmap needs more verified developer information. Connect LeetCode, Codeforces, and add at least one project so AI can chart a personalized milestone path."
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE A: FIRST VISIT (NO SAVED ROADMAP EXISTS YET)
  // ─────────────────────────────────────────────────────────────────────────────
  if (hasInitialized && !roadmap && !isGenerating) {
    return (
      <div className="space-y-8 pb-16 text-left animate-fadeIn max-w-5xl mx-auto">
        
        {/* First-Visit Header */}
        <div className="space-y-2 text-center sm:text-left pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 text-[#7C3AED] rounded-full text-xs font-bold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Career Growth Roadmap</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
            Choose where you want to go.
          </h1>
          <p className="text-sm text-[#4B5563] font-semibold max-w-2xl leading-relaxed">
            Select one or more target career directions. CareerOS will analyze your verified code repositories, problem-solving telemetry, and project evidence to generate a personalized dependency roadmap.
          </p>
        </div>

        {generationError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{generationError}</span>
          </div>
        )}

        {/* Destination Role Selection Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Select Career Destinations
            </span>
            <span className={`text-xs font-bold ${firstVisitRoles.length > 0 ? 'text-[#7C3AED]' : 'text-gray-400'}`}>
              {firstVisitRoles.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = firstVisitRoles.includes(role.id);
              return (
                <motion.div
                  key={role.id}
                  onClick={() => handleToggleFirstVisitRole(role.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                    isSelected 
                      ? 'border-[#7C3AED] bg-gradient-to-b from-purple-50/60 to-white ring-2 ring-[#7C3AED]/20' 
                      : 'border-[#E5E9F0] bg-white hover:border-gray-300 hover:bg-[#FAFBFC]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#111827] leading-snug">{role.label}</h3>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected 
                          ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-2xs' 
                          : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3 text-transparent" />}
                      </div>
                    </div>

                    <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                      {role.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F3F4F6]">
                    {role.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-purple-100/70 text-[#7C3AED]' : 'bg-[#F3F4F6] text-[#4B5563]'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Weekly Time Budget Selector */}
        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#111827] block">
              How much time can you invest each week?
            </span>
            <p className="text-[11px] text-[#6B7280] font-semibold">
              Used to estimate realistic timeline durations for each milestone stage.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {WEEKLY_BUDGETS.map(hours => (
              <button
                key={hours}
                type="button"
                onClick={() => setFirstVisitWeeklyHours(hours)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  firstVisitWeeklyHours === hours
                    ? 'bg-[#111827] text-white shadow-2xs'
                    : 'bg-[#FAFBFC] border border-[#E5E9F0] text-[#4B5563] hover:bg-gray-100'
                }`}
              >
                {hours}h / wk
              </button>
            ))}
          </div>
        </div>

        {/* Primary Call to Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E9F0]">
          <div className="text-xs text-[#6B7280] font-semibold">
            {firstVisitRoles.length === 0 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Select at least 1 career destination to continue
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ready to synthesize path for {firstVisitRoles.length} target direction{firstVisitRoles.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: firstVisitRoles.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: firstVisitRoles.length > 0 ? 0.98 : 1 }}
            onClick={handleFirstVisitBuild}
            disabled={firstVisitRoles.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white font-extrabold text-sm rounded-2xl shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build My Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FIRST VISIT GENERATION LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (isGenerating && !roadmap) {
    return (
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-16 text-center space-y-4 shadow-xs max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-[#7C3AED]">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-[#111827]">
            Analyzing Profile & Synthesizing Roadmap…
          </h3>
          <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
            Evaluating your LeetCode, Codeforces, GitHub repositories, and showcase projects against target role expectations.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-2">
          {firstVisitRoles.map((r, idx) => (
            <span key={idx} className="text-[10px] font-bold px-2.5 py-1 bg-purple-50 text-[#7C3AED] rounded-lg border border-purple-200">
              {r}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE B: RETURNING USER (SAVED ROADMAP EXISTS)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-16 text-left relative animate-fadeIn">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#334155] flex items-center gap-3 font-semibold text-xs"
          >
            <Zap className="w-4 h-4 text-purple-400 fill-purple-400/20" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regeneration Failure Notice (Preserves Previous Roadmap) */}
      {generationError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-800 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{generationError}</span>
          </div>
          <button
            onClick={handleOpenSettings}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 1. Header with Compact Role Destination and Secondary Settings Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
              Career Growth Roadmap
            </h1>
            <span className="text-[10px] font-extrabold bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded-md uppercase tracking-wider border border-purple-200">
              Personalized Path
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-semibold">
            Targeting: <strong className="text-[#111827]">{roadmap?.targetRoles?.join(' • ') || 'Software Engineer'}</strong>
          </p>
        </div>

        {/* Secondary Track Settings Button */}
        <div className="flex items-center gap-3">
          {isGenerating ? (
            <div className="px-4 py-2 bg-purple-50 border border-purple-200 text-[#7C3AED] text-xs font-bold rounded-xl flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Updating roadmap…</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenSettings}
              className="px-4 py-2.5 bg-white hover:bg-[#FAFBFC] border border-[#E5E9F0] text-[#111827] hover:text-[#7C3AED] font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-2 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-gray-500" />
              <span>Change Track / Settings</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 2. Top Summary HUD */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F3F4F6] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">
                {roadmap?.summary?.currentEvidenceLevel || 'Verified Evidence Context'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#111827] mt-1.5">
              {roadmap?.summary?.title || `Personalized Roadmap for ${roadmap?.targetRoles?.join(' + ') || 'Software Engineer'}`}
            </h3>
            <p className="text-xs text-[#4B5563] font-semibold mt-0.5 leading-relaxed">
              {roadmap?.summary?.description || 'Tailored sequence of milestone competencies based on your verified developer telemetry.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase bg-[#FAFBFC] border border-[#E5E9F0] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{roadmap?.generatedAt ? `Generated ${new Date(roadmap.generatedAt).toLocaleDateString()}` : 'Active'}</span>
            </span>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Total Effort */}
          <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Estimated Total Effort</span>
            <div className="text-2xl font-black text-[#111827]">~{totalHours} Hours</div>
            <p className="text-[10px] text-[#9CA3AF] font-bold">Sum of individual milestone estimates</p>
          </div>

          {/* Dynamic Duration */}
          <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">Target Timeline</span>
            <div className="text-2xl font-black text-[#7C3AED]">≈ {totalWeeks} Weeks</div>
            <p className="text-[10px] text-[#9CA3AF] font-bold">At {activeWeeklyHours}h / week pace</p>
          </div>

          {/* Target Roles Breakdown */}
          <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Target Roles</span>
            <div className="flex flex-wrap gap-1.5">
              {roadmap?.targetRoles?.map((r, idx) => (
                <span key={idx} className="text-[10px] font-extrabold px-2 py-0.5 bg-white border border-[#E5E9F0] text-[#111827] rounded-md">
                  {r}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Primary Focus Areas Pills */}
        {roadmap?.summary?.primaryFocus?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F3F4F6]">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Primary Focus:</span>
            {roadmap?.summary?.primaryFocus?.map((focus, fIdx) => (
              <span key={fIdx} className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 text-[#7C3AED] border border-purple-100">
                {focus}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Milestone Dependency Graph & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Vertical Milestone Cards with Non-Locking Downward Connectors */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <span>Prerequisite Dependency Sequence</span>
              <span className="text-[10px] font-normal text-gray-400">({milestones.length} Stages)</span>
            </h3>
            <span className="text-[11px] font-bold text-[#6B7280]">
              Arrows denote recommended prerequisites
            </span>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, idx) => {
              const isSelected = activeMilestone?.id === milestone.id;
              const prereqObjects = (milestone.prerequisites || [])
                .map(pId => milestoneMap.get(pId))
                .filter(Boolean);

              return (
                <React.Fragment key={milestone.id || idx}>
                  <motion.div
                    layout
                    onClick={() => setSelectedMilestoneId(milestone.id)}
                    whileHover={{ y: -1 }}
                    className={`bg-white border rounded-3xl p-6 shadow-xs cursor-pointer transition-all space-y-4 relative ${
                      isSelected 
                        ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/10 bg-purple-50/5' 
                        : 'border-[#E5E9F0] hover:border-gray-300'
                    }`}
                  >
                    {/* Header: Sequence Index, Title, Type, Effort */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xs font-black text-[#7C3AED] shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-[#111827] leading-snug">
                              {milestone.title}
                            </h4>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                              milestone.type === 'Foundation'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : milestone.type === 'Project'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : milestone.type === 'Advanced Skill'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-purple-50 text-[#7C3AED] border border-purple-200'
                            }`}>
                              {milestone.type || 'Core Skill'}
                            </span>
                          </div>

                          <p className="text-xs text-[#4B5563] font-semibold leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{milestone.estimatedHours}h effort</span>
                        </div>

                        {milestone.gapLevel && (
                          <span className={`block text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            milestone.gapLevel === 'high' 
                              ? 'text-amber-700 bg-amber-50' 
                              : milestone.gapLevel === 'low'
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-purple-700 bg-purple-50'
                          }`}>
                            {milestone.gapLevel} Gap
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Why this milestone matters */}
                    {milestone.whyItMatters && (
                      <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3.5 text-xs text-[#4B5563] space-y-0.5">
                        <span className="font-bold text-[#111827] text-[11px] block">
                          Why this matters for target role:
                        </span>
                        <p className="font-semibold text-[11px] leading-relaxed text-[#4B5563]">
                          {milestone.whyItMatters}
                        </p>
                      </div>
                    )}

                    {/* Concrete Outcome */}
                    {milestone.outcome && (
                      <div className="text-xs text-[#111827] font-semibold flex items-start gap-2 pt-1">
                        <Target className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">
                          <strong className="text-[#111827]">Expected Outcome:</strong> {milestone.outcome}
                        </span>
                      </div>
                    )}

                    {/* Suggested Project */}
                    {milestone.suggestedProject && (
                      <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                        <FolderGit2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px]">Recommended Showcase Project:</span>
                          <p className="text-[11px] font-semibold leading-relaxed mt-0.5">{milestone.suggestedProject}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer: Skills Tags & Prerequisite Links */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F3F4F6]">
                      {/* Skills badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {milestone.skills?.map((skill, sIdx) => (
                          <span 
                            key={sIdx}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Prerequisites info */}
                      {prereqObjects.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#6B7280]">
                          <span className="text-gray-400">Prereq:</span>
                          {prereqObjects.map((p, pIdx) => (
                            <span 
                              key={pIdx} 
                              className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                              title={`Recommended prerequisite: ${p.title}`}
                            >
                              <Link2 className="w-2.5 h-2.5 text-slate-500" />
                              <span>{p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">
                          Direct Foundation
                        </span>
                      )}
                    </div>
                  </motion.div>

                  {/* Visual Downward Dependency Connector Line */}
                  {idx < milestones.length - 1 && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-3 bg-gradient-to-b from-[#7C3AED]/40 to-[#7C3AED]" />
                        <ArrowDown className="w-3.5 h-3.5 text-[#7C3AED] -mt-1" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Selected Milestone Deep-Dive Inspector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-5 sticky top-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">
                Milestone Details & Guidance
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Stage {activeMilestone?.sequenceIndex || 1} of {milestones.length}
              </span>
            </div>

            {activeMilestone ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                      activeMilestone.type === 'Foundation'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : activeMilestone.type === 'Project'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-purple-50 text-[#7C3AED] border border-purple-200'
                    }`}>
                      {activeMilestone.type || 'Core Skill'}
                    </span>
                    <span className="text-[10px] font-bold text-[#6B7280]">
                      ~{activeMilestone.estimatedHours} Hours Estimated Effort
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111827]">
                    {activeMilestone.title}
                  </h4>
                  <p className="text-xs text-[#4B5563] font-semibold mt-1 leading-relaxed">
                    {activeMilestone.description}
                  </p>
                </div>

                {/* Rationale */}
                {activeMilestone.whyItMatters && (
                  <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#111827] uppercase tracking-wider block">
                      Role Competency Rationale
                    </span>
                    <p className="text-xs text-[#4B5563] font-semibold leading-relaxed">
                      {activeMilestone.whyItMatters}
                    </p>
                  </div>
                )}

                {/* Expected Outcome */}
                {activeMilestone.outcome && (
                  <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider block">
                      Target Competency Outcome
                    </span>
                    <p className="text-xs text-[#111827] font-semibold leading-relaxed">
                      {activeMilestone.outcome}
                    </p>
                  </div>
                )}

                {/* Suggested Project Showcase */}
                {activeMilestone.suggestedProject && (
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Hands-on Project Blueprint
                    </span>
                    <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                      {activeMilestone.suggestedProject}
                    </p>
                  </div>
                )}

                {/* Non-locking Navigation Tip */}
                <div className="border-t border-[#F3F4F6] pt-3 text-[11px] text-[#6B7280] font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Click any milestone to inspect its prerequisite relationship and learning objectives.</span>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs font-semibold">
                Select a milestone to inspect detailed requirements.
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TRACK SETTINGS POPOVER / MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-2xl w-full max-w-lg space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#7C3AED]" />
                  <h3 className="text-sm font-bold text-[#111827]">
                    Roadmap Track Settings
                  </h3>
                </div>
                <button
                  onClick={handleCloseSettings}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Roles Multi-Select List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#6B7280]">Target Career Destinations</span>
                  <span className="text-[#7C3AED]">{pendingRoles.length} selected</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {ROLE_OPTIONS.map((role) => {
                    const isChecked = pendingRoles.includes(role.id);
                    return (
                      <div
                        key={role.id}
                        onClick={() => handleTogglePendingRole(role.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isChecked 
                            ? 'bg-purple-50/50 border-[#7C3AED] text-[#111827]' 
                            : 'bg-[#FAFBFC] border-[#E5E9F0] text-[#4B5563] hover:bg-white'
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold">{role.label}</h5>
                          <p className="text-[10px] text-[#6B7280]">{role.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                          isChecked ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-[#CBD5E1] bg-white'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Time Budget Selector */}
              <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
                <span className="text-xs font-bold text-[#6B7280] block">Weekly Time Budget</span>
                <div className="flex items-center gap-2">
                  {WEEKLY_BUDGETS.map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setPendingWeeklyHours(hours)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        pendingWeeklyHours === hours
                          ? 'bg-[#111827] text-white shadow-2xs'
                          : 'bg-[#FAFBFC] border border-[#E5E9F0] text-[#4B5563] hover:bg-gray-100'
                      }`}
                    >
                      {hours}h / wk
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={handleCloseSettings}
                  className="px-4 py-2.5 text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ scale: isSettingsDirty && pendingRoles.length > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: isSettingsDirty && pendingRoles.length > 0 ? 0.98 : 1 }}
                  onClick={handleRegenerateFromSettings}
                  disabled={!isSettingsDirty || pendingRoles.length === 0}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Roadmap</span>
                </motion.button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
