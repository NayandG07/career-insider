import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  RefreshCw, 
  Code, 
  Database, 
  Globe, 
  Terminal, 
  Layers,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  FolderGit2,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  ArrowRight,
  Zap,
  Clock,
  ExternalLink,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReadinessGate from '../components/ReadinessGate';

export default function SkillIntelligence({ setActivePage }) {
  const { skills, loadSavedSkillProfile, fetchSkillProfile, readiness } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDimensionModal, setActiveDimensionModal] = useState(null);

  // Load saved profile on mount once
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (loadSavedSkillProfile) {
        await loadSavedSkillProfile().catch(() => {});
      }
      if (isMounted) setHasInitialized(true);
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const handleAnalyze = async () => {
    if (!readiness?.ready) return;
    setLoading(true);
    setError(null);
    try {
      await fetchSkillProfile();
    } catch (e) {
      setError(e.message || 'Failed to run skill analysis. Make sure your developer sources are connected and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Readiness Gate Check
  if (hasInitialized && readiness && !readiness.ready) {
    return (
      <ReadinessGate 
        featureName="Skill Intelligence" 
        readiness={readiness} 
        setActivePage={setActivePage} 
        description="Skill Intelligence needs more evidence to generate an accurate capability profile. Connect LeetCode, Codeforces, and add at least one project to verify your practical and problem-solving skills."
      />
    );
  }

  const categories = skills?.categories || [];
  const skillItems = skills?.skills || [];
  const gapAnalysis = skills?.gapAnalysis || [];
  const sourceContributions = skills?.sourceContributions || {};
  const previousSnapshots = skills?.previousSnapshots || [];
  const counts = sourceContributions?.counts || {
    leetcode: 0,
    codeforces: 0,
    github: 0,
    project: 0,
    total: 0,
  };

  // KPI Calculations
  const strongCount = skillItems.filter(s => s.level === 'Strong' || s.level === 'Advanced Evidence' || s.level === 'Expert').length;
  const developingCount = skillItems.filter(s => s.level === 'Developing' || s.level === 'Intermediate').length;
  const emergingCount = skillItems.filter(s => s.level === 'Emerging' || s.level === 'Insufficient Evidence').length;
  const totalVerifiedCount = counts.total || skillItems.reduce((sum, s) => sum + (s.evidenceCount || 1), 0);

  // Progress Delta Calculation
  const progressDelta = useMemo(() => {
    if (!previousSnapshots || previousSnapshots.length === 0) return null;
    const lastSnapshot = previousSnapshots[previousSnapshots.length - 1];
    const scoreDiff = (skills?.readinessScore || 50) - (lastSnapshot.readinessScore || 50);
    const dateFormatted = lastSnapshot.computedAt ? new Date(lastSnapshot.computedAt).toLocaleDateString() : 'earlier';
    return {
      scoreDiff,
      lastDate: dateFormatted,
      isPositive: scoreDiff >= 0,
    };
  }, [previousSnapshots, skills]);

  // Filtered & Searched Skills
  const filteredSkills = useMemo(() => {
    return skillItems.filter(item => {
      // Category filter
      if (selectedCategoryFilter !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const selCat = selectedCategoryFilter.toLowerCase();
        if (!itemCat.includes(selCat) && !selCat.includes(itemCat)) return false;
      }

      // Source filter
      if (selectedSourceFilter !== 'all') {
        const refs = item.evidenceRefs || [];
        const hasSource = refs.some(r => r.startsWith(`${selectedSourceFilter}:`));
        const summary = (item.evidenceSummary || '').toLowerCase();
        if (!hasSource && !summary.includes(selectedSourceFilter)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchExpl = (item.explanation || '').toLowerCase().includes(q);
        const matchSummary = (item.evidenceSummary || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchName && !matchExpl && !matchSummary && !matchCat) return false;
      }

      return true;
    });
  }, [skillItems, selectedCategoryFilter, selectedSourceFilter, searchQuery]);

  // Visible items based on progressive disclosure
  const displayedSkills = isExpanded ? filteredSkills : filteredSkills.slice(0, 6);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn text-left">
      
      {/* 1. Header & Re-analyze Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Skill Intelligence & Capabilities
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-semibold">
            {skills?.lastComputedAt 
              ? `Overview of your programming languages, problem solving, and technical skills • Last analyzed ${new Date(skills.lastComputedAt).toLocaleDateString()}` 
              : 'Detailed breakdown of your technical skills, problem-solving, and project capabilities.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Skills…' : (skills?.lastComputedAt ? 'Re-analyze Skills' : 'Analyze Skills with AI')}</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. "Your Progress" Historical Delta Banner */}
      {progressDelta && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 border border-[#E5E9F0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E9F0] flex items-center justify-center text-[#7C3AED] shadow-2xs shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111827]">Your Progress Since Last Snapshot</span>
                <span className="text-[10px] text-[#6B7280] font-semibold">({progressDelta.lastDate})</span>
              </div>
              <p className="text-[11px] text-[#4B5563] font-semibold mt-0.5">
                {progressDelta.isPositive ? '+' : ''}{progressDelta.scoreDiff} pts progression across your connected accounts.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E9F0] text-[#111827] text-xs font-bold rounded-xl shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Profile Snapshot Saved</span>
          </div>
        </motion.div>
      )}

      {/* 3. Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Tracked Skills</span>
            <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{skillItems.length || totalVerifiedCount} Skills</div>
          <p className="text-[10px] text-[#9CA3AF] font-bold">From connected platforms</p>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Strong Mastery</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{strongCount} Skills</div>
          <p className="text-[10px] text-[#9CA3AF] font-bold">High proficiency</p>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">Developing</span>
            <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-black text-[#7C3AED]">{developingCount} Skills</div>
          <p className="text-[10px] text-[#9CA3AF] font-bold">Active practice & code</p>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Focus Areas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{emergingCount || gapAnalysis.length || 0} Areas</div>
          <p className="text-[10px] text-[#9CA3AF] font-bold">Growth opportunities</p>
        </div>
      </div>

      {/* 4. Domain Capabilities */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Domain Capabilities & Skill Breakdown
            </h2>
            <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
              Overview across core programming languages, algorithms, systems, and full-stack development.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat, idx) => {
            const dims = cat.dimensions || { breadth: 0, depth: 0, recency: 0, application: 0, corroboration: 0 };
            return (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-[#E5E9F0] bg-[#FAFBFC] hover:bg-white hover:border-[#7C3AED]/30 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#111827]">{cat.name}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                      cat.level === 'Advanced Evidence' || cat.level === 'Strong' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : cat.level === 'Developing' 
                        ? 'bg-purple-50 text-[#7C3AED] border border-purple-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {cat.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6B7280] text-[11px]">Proficiency Score</span>
                    <span className="text-[#111827] font-black">{cat.score} / 100</span>
                  </div>

                  <div className="w-full bg-[#E5E9F0] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 65 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                          : cat.score >= 45 
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1]' 
                          : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                      style={{ width: `${Math.max(6, cat.score)}%` }}
                    />
                  </div>
                </div>

                {/* Dimension Breakdown */}
                <div className="pt-2 border-t border-[#F3F4F6] grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[9px] font-bold text-[#6B7280]">
                  <div className="bg-white border border-[#E5E9F0] px-1.5 py-1 rounded text-center" title="Breadth: Topic coverage">
                    <span className="block text-[8px] text-[#9CA3AF]">BREADTH</span>
                    <span className="text-[#111827]">{dims.breadth}/20</span>
                  </div>
                  <div className="bg-white border border-[#E5E9F0] px-1.5 py-1 rounded text-center" title="Depth: Difficulty benchmarks">
                    <span className="block text-[8px] text-[#9CA3AF]">DEPTH</span>
                    <span className="text-[#111827]">{dims.depth}/30</span>
                  </div>
                  <div className="bg-white border border-[#E5E9F0] px-1.5 py-1 rounded text-center" title="Recency: Active frequency">
                    <span className="block text-[8px] text-[#9CA3AF]">RECENCY</span>
                    <span className="text-[#111827]">{dims.recency}/15</span>
                  </div>
                  <div className="bg-white border border-[#E5E9F0] px-1.5 py-1 rounded text-center" title="Application: Project deliverables">
                    <span className="block text-[8px] text-[#9CA3AF]">PROJECTS</span>
                    <span className="text-[#111827]">{dims.application}/20</span>
                  </div>
                  <div className="bg-white border border-[#E5E9F0] px-1.5 py-1 rounded text-center" title="Corroboration: Multi-platform proof">
                    <span className="block text-[8px] text-[#9CA3AF]">CROSS-SRC</span>
                    <span className="text-[#111827]">{dims.corroboration}/15</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Filter & Search Bar */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, topics, or technologies…"
              className="w-full pl-10 pr-4 py-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all"
            />
          </div>

          {/* Interactive Source Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Sources', count: totalVerifiedCount },
              { id: 'leetcode', label: 'LeetCode', count: counts.leetcode },
              { id: 'codeforces', label: 'Codeforces', count: counts.codeforces },
              { id: 'project', label: 'Projects', count: counts.project },
              ...(counts.github > 0 ? [{ id: 'github', label: 'GitHub', count: counts.github }] : [])
            ].map(src => {
              const isSelected = selectedSourceFilter === src.id;
              return (
                <button
                  key={src.id}
                  onClick={() => setSelectedSourceFilter(src.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#111827] text-white shadow-2xs'
                      : 'bg-[#FAFBFC] border border-[#E5E9F0] text-[#4B5563] hover:bg-white'
                  }`}
                >
                  <span>{src.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                    {src.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F3F4F6]">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'algorithms', label: 'Algorithms & Problem Solving' },
            { id: 'programming languages', label: 'Languages' },
            { id: 'backend', label: 'Backend' },
            { id: 'frontend', label: 'Frontend' },
            { id: 'systems', label: 'Systems & Tools' },
          ].map(cat => {
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-2xs'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Main Full-Width Skills Grid */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <span>Skill Capabilities & Detailed Inventory</span>
            <span className="text-[10px] font-normal text-gray-400">({filteredSkills.length} skills)</span>
          </h3>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="p-12 bg-white border border-[#E5E9F0] rounded-3xl text-center text-xs font-bold text-[#6B7280] space-y-2">
            <Filter className="w-6 h-6 text-gray-400 mx-auto" />
            <p>No skills match your active filter or search query.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('all'); setSelectedSourceFilter('all'); }}
              className="px-3 py-1 bg-purple-50 text-[#7C3AED] rounded-lg text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSkills.map((item, idx) => (
                <motion.div 
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#7C3AED]/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#111827] leading-snug">{item.name}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                          item.level === 'Advanced Evidence' || item.level === 'Strong' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : item.level === 'Developing' 
                            ? 'bg-purple-50 text-[#7C3AED] border border-purple-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.level}
                        </span>
                        {item.confidence && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            item.confidence === 'High' ? 'bg-slate-100 text-slate-700' : 'bg-gray-50 text-gray-500'
                          }`} title={`Confidence: ${item.confidence}`}>
                            {item.confidence}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.evidenceSummary && (
                      <div className="text-[10px] font-bold text-[#7C3AED] bg-purple-50/60 rounded-lg px-2.5 py-1 inline-block">
                        {item.evidenceSummary}
                      </div>
                    )}

                    <p className="text-[11px] text-[#4B5563] font-semibold leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  {item.focusNext && (
                    <div className="border-t border-[#F3F4F6] pt-2.5 text-[10px] text-gray-500 font-semibold flex items-start gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-gray-800">Recommended Next Step:</span> {item.focusNext}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progressive Disclosure Expand / Collapse */}
            {filteredSkills.length > 6 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-3 bg-white hover:bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl text-xs font-bold text-[#111827] hover:text-[#7C3AED] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {isExpanded ? (
                  <>
                    <span>Show Fewer Skills</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>View All {filteredSkills.length} Tracked Skills</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
