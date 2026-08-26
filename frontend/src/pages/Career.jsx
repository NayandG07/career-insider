import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Compass, 
  ChevronRight, 
  Lock, 
  Zap, 
  AlertCircle, 
  Shuffle, 
  CheckSquare, 
  Square, 
  Sliders, 
  Globe, 
  Target, 
  Info,
  Award,
  Activity,
  Navigation,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend
} from 'recharts';

export default function Roadmap() {
  const { 
    userData, 
    setUserData, 
    skills, 
    setSkills,
    companies,
    roadmap: consolidatedPath,
    fetchRoadmap,
    completeRoadmapItem
  } = useApp();

  const [selectedRoles, setSelectedRoles] = useState(["Senior Backend Engineer"]);
  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" or "skills"
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null); // Razorpay, Google, Uber, Atlassian
  const [isSelfAssessMode, setIsSelfAssessMode] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  
  // AI detour/bypass states
  const [showDetourModal, setShowDetourModal] = useState(false);
  const [detourApplied, setDetourApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch roadmap from backend when selected roles change
  useEffect(() => {
    if (selectedRoles.length > 0) {
      setIsRerouting(true);
      fetchRoadmap(selectedRoles).finally(() => setIsRerouting(false));
    }
  }, [selectedRoles]);

  // Toggle roles multi-selection filter
  const handleToggleRoleFilter = (roleName) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync consolidation outputs with global AppContext variables
  useEffect(() => {
    if (consolidatedPath) {
      setUserData(prev => {
        if (prev.readinessScore !== consolidatedPath.readiness || prev.targetRole !== selectedRoles.join(" + ")) {
          return {
            ...prev,
            readinessScore: consolidatedPath.readiness,
            targetRole: selectedRoles.join(" + "),
            targetScore: consolidatedPath.targetScore
          };
        }
        return prev;
      });

      // Default the selected milestone details panel to the active one
      const inProgress = consolidatedPath.milestones.find(m => m.status === 'in-progress');
      if (inProgress) {
        setSelectedMilestone(prev => {
          if (!prev || !consolidatedPath.milestones.some(m => m.id === prev.id)) {
            return inProgress;
          }
          // return refreshed version of currently selected milestone
          return consolidatedPath.milestones.find(m => m.id === prev.id) || inProgress;
        });
      } else if (consolidatedPath.milestones.length > 0) {
        setSelectedMilestone(prev => {
          if (!prev || !consolidatedPath.milestones.some(m => m.id === prev.id)) {
            return consolidatedPath.milestones[0];
          }
          return consolidatedPath.milestones.find(m => m.id === prev.id) || consolidatedPath.milestones[0];
        });
      }
    }
  }, [consolidatedPath, selectedRoles, setUserData]);

  // Toggle tasks list and recalculate readiness
  const handleToggleSubtask = (milestoneId, subtaskId) => {
    if (!consolidatedPath) return;

    // We locate the milestone in rolesConfig lists and toggle the status
    // To make this simple and robust, we can keep the checklist state in the roleConfigs or local overrides.
    // Let's modify the subtask completed status locally in the rolesConfig milestones lists
    const updatedMilestones = consolidatedPath.milestones.map(m => {
      if (m.id === milestoneId) {
        const updatedSubtasks = m.subtasks.map(s => {
          if (s.id === subtaskId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const totalCount = updatedSubtasks.length;
        const pct = Math.round((completedCount / totalCount) * 100);
        
        let newStatus = m.status;
        if (pct === 100) {
          newStatus = "completed";
        } else if (pct > 0) {
          newStatus = "in-progress";
        } else {
          newStatus = "locked";
        }

        return {
          ...m,
          subtasks: updatedSubtasks,
          progress: pct,
          status: newStatus
        };
      }
      return m;
    });

    // Update active milestone details panel
    const updatedSelected = updatedMilestones.find(m => m.id === milestoneId);
    setSelectedMilestone(updatedSelected);

    // Call context complete action if relevant to keep mock outputs synchronized
    if (updatedSelected.status === "completed") {
      if (updatedSelected.title.includes("Docker")) {
        completeRoadmapItem("Learn Docker");
      } else if (updatedSelected.title.includes("Redis")) {
        completeRoadmapItem("Redis Caching Essentials");
      }
      triggerToast(`🎉 Milestone Mastered: ${updatedSelected.title}!`);
    } else {
      triggerToast(`⏱️ Checklist updated.`);
    }
  };

  // Adjust skill self-assessment sliders
  const handleSkillSliderChange = (skillIndex, value) => {
    if (!consolidatedPath) return;
    
    const updatedSkills = [...consolidatedPath.skills];
    const skillName = updatedSkills[skillIndex].subject;
    
    // Sync back to global AppContext skills data
    const currentGlobalSkills = [...skills];
    const targetIdx = currentGlobalSkills.findIndex(s => s.subject === skillName);
    if (targetIdx !== -1) {
      currentGlobalSkills[targetIdx] = {
        ...currentGlobalSkills[targetIdx],
        A: parseInt(value),
        level: parseInt(value)
      };
      setSkills(currentGlobalSkills);
    }
  };

  // Handle Target Company Optimizer click
  const handleCompanyRouteOptimize = (company) => {
    setIsRerouting(true);
    setSelectedCompany(company);
    setTimeout(() => {
      setIsRerouting(false);
      triggerToast(`🛰️ GPS optimized for ${company.name} gaps!`);
    }, 450);
  };

  // AI Detour accept flow
  const handleAcceptDetour = () => {
    setIsRerouting(true);
    setShowDetourModal(false);
    
    setTimeout(() => {
      setDetourApplied(true);
      setIsRerouting(false);
      triggerToast("🚀 AI Shortcut accepted! Milestone 1 marked completed using commit evidence.");
    }, 1000);
  };

  // Identify critical nodes based on selected target company
  const isMilestoneCritical = (milestoneTitle) => {
    if (!selectedCompany) return false;
    
    const companyGaps = {
      "Razorpay": ["Docker", "Redis", "Caching", "Containerization"],
      "Google": ["Distributed", "Kubernetes", "Orchestration", "SRE"],
      "Uber": ["Kafka", "Docker", "Event-Driven", "Distributed"],
      "Atlassian": ["Docker", "Kubernetes", "Orchestration"]
    };

    const gaps = companyGaps[selectedCompany.name] || [];
    return gaps.some(gap => milestoneTitle.toLowerCase().includes(gap.toLowerCase()));
  };

  return (
    <div className="space-y-6 pb-16 text-left relative">
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .gps-grid {
          background-size: 24px 24px;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.02) 1px, transparent 1px);
        }
      `}</style>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#334155] flex items-center gap-3 font-semibold text-xs animate-pulse"
          >
            <Zap className="w-4 h-4 text-purple-400 fill-purple-400/20" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight leading-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-[#6366F1] animate-pulse-slow" />
            Career Roadmap GPS
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 font-semibold">
            Telemetry mappings are updating. Select target roles below to plan your navigation track.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 bg-white border border-[#E5E9F0] text-[#4B5563] font-bold text-xs rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Path
          </motion.button>
        </div>
      </div>

      {/* Reroute / Recalculating Overlay */}
      {isRerouting && (
        <div className="absolute inset-0 bg-[#F6F8FC]/50 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-3xl min-h-[400px]">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xl text-center space-y-3 max-w-xs">
            <Compass className="w-10 h-10 text-[#6366F1] animate-spin-slow mx-auto" />
            <h3 className="font-bold text-[#111827] text-sm">Recalculating GPS Path...</h3>
            <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">
              Consolidating skill targets and plotting trajectory vectors.
            </p>
          </div>
        </div>
      )}

      {/* ORGANISED TARGET PATH SELECTOR FILTERS */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-[#6366F1]" />
            Target Positions Filter Map
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            Select one or multiple to merge trajectories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: "Senior Backend Engineer", label: "Senior Backend Engineer", desc: "APIs, Caching, Databases & Scale" },
            { id: "DevOps", label: "DevOps & Pipeline Infrastructure", desc: "CI/CD, Linux Shell, Container setups" },
            { id: "Cloud Architect", label: "Cloud Solution Architect", desc: "Terraform IaC, VPC, CDN caching" },
            { id: "Staff Fullstack Engineer", label: "Staff Fullstack Engineer", desc: "NextJS, monorepos, Edge BFF layers" },
            { id: "Distributed Systems & Cloud Engineer", label: "Distributed Systems & Cloud", desc: "Raft consensus, sharding, global caches" },
            { id: "AI/ML Platform Engineer", label: "AI/ML Platform Engineer", desc: "Triton servers, GPU scaling, Ray clusters" }
          ].map((role) => {
            const isChecked = selectedRoles.includes(role.id);
            return (
              <div 
                key={role.id}
                onClick={() => handleToggleRoleFilter(role.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                  isChecked 
                    ? 'border-[#6366F1] bg-[#EEF2FF]/40 ring-1 ring-[#6366F1]/10' 
                    : 'border-[#E5E9F0] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div className="mt-1">
                  {isChecked ? (
                    <div className="w-4 h-4 rounded bg-[#6366F1] flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border border-[#CBD5E1] bg-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">{role.label}</h4>
                  <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">{role.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RENDER DYNAMIC PATH CONTENT */}
      {selectedRoles.length === 0 || !consolidatedPath ? (
        /* Empty State Prompting User to Select Filters */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-dashed border-[#E5E9F0] rounded-3xl p-16 text-center space-y-4 shadow-sm"
        >
          <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mx-auto text-[#6366F1] animate-pulse">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-extrabold text-[#111827]">Satellite GPS Standby</h3>
            <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
              {selectedRoles.length === 0 
                ? "No target roles selected. Please check one or more boxes in the target filters dashboard above to plot your consolidated developer trajectory."
                : "Calculating route via AI backend... Please wait."}
            </p>
          </div>
        </motion.div>
      ) : (
        /* Active GPS Trajectory Details */
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LIGHT THEMED TELEMETRY HUD (Redesigned completely as requested) */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="lg:col-span-8 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[260px] relative overflow-hidden gps-grid text-[#111827]"
            >
              {/* Telemetry Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F3F4F6] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#6366F1] uppercase tracking-wider block">GPS Route Plotted</span>
                    <h3 className="text-sm font-extrabold text-[#111827] mt-0.5">
                      Destination: {selectedRoles.length > 2 ? `${selectedRoles[0]} & More` : selectedRoles.join(" + ")}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-5 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">ESTIMATED TIME</span>
                    <span className="font-extrabold text-slate-700">{consolidatedPath.timeframe}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">ROUTE STATUS</span>
                    <span className="font-extrabold text-emerald-600">Optimal (1.2x)</span>
                  </div>
                </div>
              </div>

              {/* HUD Telemetry Stats and Dial */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-5 items-center">
                
                {/* Radial Gauge */}
                <div className="sm:col-span-4 flex justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center bg-[#F8FAFC] rounded-full border border-[#E2E8F0] p-1.5 shadow-inner">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#EEF2FF" strokeWidth="6" fill="transparent" />
                      <motion.circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        stroke="url(#indigoGrad)" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={339.2}
                        initial={{ strokeDashoffset: 339.2 }}
                        animate={{ strokeDashoffset: 339.2 - (339.2 * consolidatedPath.readiness) / 100 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-[#111827]">{consolidatedPath.readiness}%</span>
                      <span className="text-[8px] font-extrabold text-[#6366F1] uppercase tracking-wider block">COMPATIBLE</span>
                    </div>
                  </div>
                </div>

                {/* Next Turn Instruction */}
                <div className="sm:col-span-8 space-y-3">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/15 flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4 text-[#6366F1] transform rotate-45" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-[#6366F1] uppercase tracking-wider">Navigation Instruction</h4>
                      <p className="text-xs font-semibold text-[#4B5563] mt-0.5 leading-relaxed">
                        {consolidatedPath.nextAction}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg">
                      Goal Target: {consolidatedPath.targetScore}%
                    </span>
                    <span className="text-[9px] font-bold bg-[#E6F4EA] border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">
                      {consolidatedPath.milestones.filter(m => m.status === 'completed').length} / {consolidatedPath.milestones.length} Milestones Complete
                    </span>
                  </div>
                </div>

              </div>

              {/* Status Ticks bottom */}
              <div className="flex justify-between items-center text-[9px] text-[#9CA3AF] border-t border-[#F3F4F6] pt-3">
                <span className="font-mono">TELEMETRY LOCK ACTIVE</span>
                <span className="font-semibold">GPS ENGINE V2.9 // MULTI-TRAJECTORY OPTIMIZATION</span>
              </div>
            </motion.div>

            {/* AI Detour Prompt */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="lg:col-span-4 bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase text-purple-200">
                    AI Reroute Recommendation
                  </span>
                  <span className="bg-white/20 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                    Bypass Ready
                  </span>
                </div>
                <h3 className="text-sm font-extrabold leading-snug">
                  Accelerate through Caching?
                </h3>
                <p className="text-[11px] leading-relaxed text-purple-100 font-medium">
                  Scanned repository commits in <code>/scaling-db</code> contain Redis/Kafka queue configurations. Accept the detour to bypass Milestone 1 basics?
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => setShowDetourModal(true)}
                  className="px-4 py-2 bg-white text-[#7C3AED] hover:bg-purple-50 font-bold text-xs rounded-xl shadow w-full text-center block cursor-pointer"
                >
                  Review Reroute Path
                </button>
              </div>
            </motion.div>

          </div>

          {/* Company Optimizer Gaps */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#6366F1]" />
                Optimize Route for Target Company Match
              </h3>
              {selectedCompany && (
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="text-[10px] font-bold text-[#6366F1] hover:underline"
                >
                  Clear alignment
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {companies.map((comp) => {
                const isSelected = selectedCompany?.name === comp.name;
                return (
                  <motion.button
                    key={comp.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompanyRouteOptimize(comp)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 relative cursor-pointer ${
                      isSelected 
                        ? 'border-[#6366F1] bg-[#EEF2FF]/40 ring-1 ring-[#6366F1]/10' 
                        : 'border-[#E5E9F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={comp.logo} alt={comp.name} className="w-5.5 h-5.5 rounded-lg object-cover border border-[#F3F4F6]" />
                      <span className="text-xs font-bold text-[#111827]">{comp.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#111827]">{comp.matchScore}% Match</span>
                      <span className="text-[9px] font-bold text-[#6366F1] block mt-0.5 uppercase tracking-wide">
                        {comp.tier} Tier
                      </span>
                    </div>
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-ping"></span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {selectedCompany && (
              <div className="p-3 bg-[#EEF2FF]/70 border border-[#C7D2FE] rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900 leading-normal">
                <Info className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">GPS Optimizer Target: {selectedCompany.name}</p>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Critical gaps to target: <span className="font-bold text-red-600">{selectedCompany.missing.join(', ')}</span>. Leveling these will prioritize matching index scores.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC TIMELINE ROADMAP TRACK & SIDE DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left page: track or radar */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Tab toggles */}
              <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab("timeline")}
                    className={`text-xs font-bold uppercase tracking-wider pb-3 -mb-3 border-b-2 transition-all ${
                      activeTab === "timeline" ? "text-[#111827] border-[#6366F1]" : "text-[#9CA3AF] border-transparent"
                    }`}
                  >
                    GPS Timeline Track
                  </button>
                  <button 
                    onClick={() => setActiveTab("skills")}
                    className={`text-xs font-bold uppercase tracking-wider pb-3 -mb-3 border-b-2 transition-all ${
                      activeTab === "skills" ? "text-[#111827] border-[#6366F1]" : "text-[#9CA3AF] border-transparent"
                    }`}
                  >
                    Skills Gap Analysis
                  </button>
                </div>
              </div>

              {activeTab === "timeline" ? (
                /* Dynamic Timeline List */
                <div className="space-y-5 relative pl-9 before:absolute before:top-4 before:left-[17px] before:bottom-4 before:w-0.5 before:bg-[#E5E9F0] before:border-dashed">
                  {consolidatedPath.milestones.map((ms, idx) => {
                    const isSelected = selectedMilestone?.id === ms.id;
                    const isCritical = isMilestoneCritical(ms.title);
                    
                    return (
                      <div key={ms.id} className="relative">
                        
                        {/* Dot indicator */}
                        <div className="absolute -left-[34px] top-2">
                          {ms.status === 'completed' ? (
                            <div className="w-7 h-7 rounded-full bg-[#E8F5E9] border border-white flex items-center justify-center text-[#10B981] shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                            </div>
                          ) : ms.status === 'in-progress' ? (
                            <div className="w-7 h-7 rounded-full bg-[#EEF2FF] border border-[#6366F1] flex items-center justify-center shadow relative">
                              <span className="w-2 h-2 bg-[#6366F1] rounded-full animate-ping absolute inline-flex"></span>
                              <span className="w-2 h-2 bg-[#6366F1] rounded-full relative inline-flex"></span>
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white border border-[#E5E9F0] flex items-center justify-center text-[#9CA3AF] shadow-sm">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Node Card */}
                        <motion.div
                          whileHover={{ y: -1 }}
                          onClick={() => setSelectedMilestone(ms)}
                          className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all cursor-pointer flex flex-col justify-between gap-3.5 ${
                            isSelected 
                              ? 'border-[#6366F1] ring-1 ring-[#6366F1]/10' 
                              : 'border-[#E5E9F0]'
                          } ${ms.status === 'locked' ? 'opacity-70' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-extrabold text-[#6366F1] uppercase tracking-wide">
                                  STAGE {idx + 1}
                                </span>
                                {isCritical && (
                                  <span className="bg-red-50 border border-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <AlertCircle className="w-2.5 h-2.5" /> Gaps block for {selectedCompany?.name}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-[#111827] mt-0.5">{ms.title}</h4>
                            </div>

                            {ms.status !== 'locked' && (
                              <div className="text-right">
                                <span className="text-xs font-black text-slate-800">{ms.progress}%</span>
                                <span className="text-[8px] font-semibold text-slate-400 block uppercase">Completed</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                            {ms.desc}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F3F4F6] pt-3">
                            <div className="flex flex-wrap gap-1">
                              {ms.tags.map((tag, tIdx) => (
                                <span 
                                  key={tIdx} 
                                  className="text-[9px] px-2.5 py-0.5 rounded-md border bg-[#FAFBFC] border-[#E5E9F0] text-[#4B5563] font-bold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-[#6366F1] font-bold flex items-center gap-0.5">
                              View steps <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </motion.div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Interactive Skill Gap sliders and radar */
                <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Unified Skill Delta Telemetry</h4>
                      <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">Merged target thresholds vs credentials mapped.</p>
                    </div>
                    
                    <button
                      onClick={() => setIsSelfAssessMode(!isSelfAssessMode)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelfAssessMode 
                          ? 'bg-amber-500 text-white border-amber-500' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {isSelfAssessMode ? "Manual Simulation ON" : "Simulate Levels"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Recharts chart */}
                    <div className="md:col-span-6 h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={consolidatedPath.skills}>
                          <PolarGrid stroke="#F1F5F9" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} />
                          <Radar name="Current Mapped" dataKey="current" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} />
                          <Radar name="Consolidated Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.03} strokeWidth={1.5} strokeDasharray="3 3" />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Range controls */}
                    <div className="md:col-span-6 space-y-4">
                      {consolidatedPath.skills.map((s, idx) => (
                        <div key={idx} className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{s.subject}</span>
                            <span className="text-[#6366F1]">{s.current}% / <span className="text-[#10B981]">{s.target}%</span></span>
                          </div>
                          
                          {isSelfAssessMode ? (
                            <input 
                              type="range" 
                              min="10" 
                              max="100" 
                              value={s.current}
                              onChange={(e) => handleSkillSliderChange(idx, e.target.value)}
                              className="w-full h-1.5 bg-[#F3F4F6] rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
                            />
                          ) : (
                            <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden relative">
                              <div className="absolute top-0 bottom-0 w-0.5 bg-[#10B981] z-10" style={{ left: `${s.target}%` }}></div>
                              <div className="h-full bg-indigo-500" style={{ width: `${s.current}%` }}></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Right page details panel */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                GPS Direction Steps
              </h3>

              <AnimatePresence mode="wait">
                {selectedMilestone ? (
                  <motion.div
                    key={selectedMilestone.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-5 text-left"
                  >
                    <div>
                      <span className="text-[9px] font-extrabold text-[#6366F1] uppercase tracking-widest block">
                        Milestone Detail Board
                      </span>
                      <h4 className="text-sm font-bold text-[#111827] mt-0.5">{selectedMilestone.title}</h4>
                      
                      <div className="w-full bg-[#F3F4F6] h-1 rounded-full overflow-hidden mt-3">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" 
                          style={{ width: `${selectedMilestone.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Task checklist */}
                    <div className="space-y-3 border-t border-[#F3F4F6] pt-4">
                      <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Subtask Checklist</h5>
                      
                      {selectedMilestone.subtasks.map((task) => (
                        <div 
                          key={task.id}
                          onClick={() => {
                            if (selectedMilestone.status !== 'locked') {
                              handleToggleSubtask(selectedMilestone.id, task.id);
                            }
                          }}
                          className={`flex gap-3 items-start p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            selectedMilestone.status === 'locked' 
                              ? 'opacity-60 cursor-not-allowed border-slate-100' 
                              : 'hover:bg-[#FAFBFC] border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5 text-[#6366F1]">
                            {task.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <span className={task.completed ? "text-slate-400 line-through font-medium" : "text-slate-700"}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">UNLOCKED COMPETENCY</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="w-4 h-4 text-[#6366F1]" />
                        <span className="text-xs font-bold text-slate-700">
                          {selectedMilestone.tags[0]} credentials verified
                        </span>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="bg-white border border-dashed border-[#E5E9F0] rounded-3xl p-6 text-center text-[#9CA3AF] text-xs font-semibold">
                    Select a timeline stage node to check directions tasks.
                  </div>
                )}
              </AnimatePresence>

              {/* Traffic details */}
              <div className="bg-gradient-to-br from-indigo-50 to-[#EEF2FF] border border-indigo-100 text-[#6366F1] rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    Route Traffic Alerts
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#4B5563] font-semibold">
                  Active hiring index scores for DevOps and System Design are peaking. Accelerating these modules improves resume matching index thresholds significantly.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* DETOUR CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDetourModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-2xl max-w-md w-full text-left space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#7C3AED]">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">AI Route Telemetry Bypass</h3>
                    <p className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider">Telemetric detour options</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetourModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-2xl space-y-1">
                <p className="text-xs text-[#7C3AED] font-bold">Bypass Option Detected</p>
                <p className="text-[11px] text-purple-900 leading-relaxed font-semibold">
                  Scanned repository configurations in <code>/scaling-db</code> contain Redis/Kafka queue configurations. This matches target credentials for stage 1. Accept Reroute to skip?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Standard</span>
                  <div className="font-black text-slate-800 mt-0.5">14 days to go</div>
                  <p className="text-[9px] text-slate-500 mt-1 leading-normal font-semibold">
                    Complete all basic caching tutorial modules step by step.
                  </p>
                </div>

                <div className="p-3 bg-[#EEF2FF] rounded-xl border border-[#C7D2FE]">
                  <span className="text-[9px] font-bold text-[#6366F1] block uppercase">AI Detour</span>
                  <div className="font-black text-indigo-700 mt-0.5">Skip Stage 1 ⚡</div>
                  <p className="text-[9px] text-indigo-600 mt-1 leading-normal font-semibold">
                    Bypass basic modules. Transition immediately onto active scale topics.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-[#F3F4F6]">
                <button
                  onClick={() => setShowDetourModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptDetour}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs font-bold rounded-xl shadow cursor-pointer text-center"
                >
                  Accept Bypass
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
