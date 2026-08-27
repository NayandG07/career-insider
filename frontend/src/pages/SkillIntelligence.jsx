import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Download, 
  ArrowUpRight,
  RefreshCw,
  Code,
  Database,
  Globe,
  Cpu,
  Layers
} from 'lucide-react';

const CATEGORY_ICONS = [Cpu, Code, Database, Globe, Layers];
const CATEGORY_COLORS = [
  "bg-violet-900 text-white",
  "bg-slate-900 text-white",
  "bg-blue-900 text-white",
  "bg-emerald-900 text-white",
  "bg-rose-900 text-white",
];
const SCORE_COLORS = ["text-[#6366F1]", "text-[#7C3AED]", "text-[#06B6D4]", "text-[#10B981]", "text-[#F59E0B]"];

export default function SkillIntelligence() {
  const { skills, fetchSkillProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch on first mount if no skills yet
  useEffect(() => {
    if (!skills) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchSkillProfile();
    } catch (e) {
      setError('Failed to run skill analysis. Make sure your profile is set up and try again.');
    } finally {
      setLoading(false);
    }
  };

  // skills is the SkillProfile doc from DB
  // categories: [{name, score, tags}]
  // masteryItems: [{title, level, score, trend}]
  // gapAnalysis: [{name, delta, priority}]
  // trendingSkills: [{name, demand}]

  const topCategories = skills?.categories?.length > 0
    ? skills.categories.slice(0, 3).map((cat, i) => ({
        name: cat.name,
        score: cat.score,
        tags: cat.tags?.length > 0 ? cat.tags : ['No tags'],
        color: SCORE_COLORS[i % SCORE_COLORS.length],
      }))
    : [
        { name: 'Algorithms & DSA', score: 0, tags: ['Run analysis to populate'], color: SCORE_COLORS[0] },
        { name: 'Backend Engineering', score: 0, tags: ['Run analysis to populate'], color: SCORE_COLORS[1] },
        { name: 'Frontend Development', score: 0, tags: ['Run analysis to populate'], color: SCORE_COLORS[2] },
      ];

  const masteryGrid = skills?.masteryItems?.length > 0
    ? skills.masteryItems.slice(0, 4).map((m, i) => ({
        title: m.title,
        icon: CATEGORY_ICONS[i % CATEGORY_ICONS.length],
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        level: m.level || 'Beginner',
        score: `${m.score}%`,
        footer: `Last analyzed`,
        trend: m.trend || 'stable',
      }))
    : [{
        title: 'No data yet',
        icon: Code,
        color: 'bg-slate-900 text-white',
        level: 'Unknown',
        score: '0%',
        footer: 'Run an analysis to populate',
        trend: 'stable',
      }];

  const gapAnalysis = skills?.gapAnalysis?.length > 0
    ? skills.gapAnalysis.map((g, i) => ({
        name: g.name,
        delta: g.delta,
        deltaColor: i === 0 ? 'text-red-500' : i === 1 ? 'text-amber-600' : 'text-amber-500',
        priority: g.priority,
        priorityBg: i === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600',
      }))
    : [
        { name: 'No gaps identified yet', delta: 'Run analysis', deltaColor: 'text-gray-400', priority: 'PENDING', priorityBg: 'bg-gray-50 text-gray-500' },
      ];

  const trendingSkills = skills?.trendingSkills?.length > 0
    ? skills.trendingSkills
    : [
        { name: 'Rust / WebAssembly', demand: '+120% YoY demand' },
        { name: 'GraphQL Federation', demand: '+85% YoY demand' },
        { name: 'eBPF Analytics', demand: '+65% YoY demand' },
      ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Skill Intelligence Profile
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            {skills ? `Last computed: ${skills.lastComputedAt ? new Date(skills.lastComputedAt).toLocaleDateString() : 'Recently'}` : 'CareerOS AI engine will map your developer credentials.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-[#E5E9F0] text-[#111827] font-semibold text-xs rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-all cursor-pointer flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[#4B5563]" />
            Export profile
          </button>
          
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 fill-white/10" />
            )}
            {loading ? 'Analyzing…' : skills ? 'Re-analyze Skills' : 'Analyze My Skills'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-[#7C3AED]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-bold">AI is analyzing your developer profile…</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Top 3 Columns: Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#111827]">{cat.name}</span>
                  <span className={`text-sm font-black ${cat.color}`}>{cat.score}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6366F1] transition-all duration-700" style={{ width: `${cat.score}%` }}></div>
                </div>

                {/* Sub-tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="text-[9px] px-2 py-0.5 rounded-md border border-[#E5E9F0] bg-[#FAFBFC] font-semibold text-[#6B7280]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Layout Split: Left Mastery, Right Gap Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Area: Mastery Details */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Algorithmic & Platform Mastery Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {masteryGrid.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div key={idx} className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm flex flex-col justify-between h-[150px]">
                      
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="text-xs font-bold text-[#111827] leading-tight">{m.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-2.5">
                        <span className="text-[11px] text-[#9CA3AF] font-bold uppercase">{m.level}</span>
                        <span className="text-2xl font-black text-[#111827] flex items-center gap-1 leading-none">
                          {m.score}
                          {m.trend === 'up' ? (
                            <ArrowUpRight className="w-5 h-5 text-[#10B981] shrink-0" />
                          ) : (
                            <span className="text-[#9CA3AF] text-sm font-bold shrink-0 ml-1">—</span>
                          )}
                        </span>
                      </div>

                      <div className="border-t border-[#F3F4F6] pt-3 text-[10px] text-[#9CA3AF] font-semibold">
                        {m.footer}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Area: Priority Gap Analysis & Trending Skills */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Priority Skill Gap Analysis */}
              <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
                  Priority Skill Gap Analysis
                </h3>

                <div className="space-y-4">
                  {gapAnalysis.map((gap, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-[#374151]">{gap.name}</h4>
                        <span className={`text-[10px] font-bold ${gap.deltaColor}`}>{gap.delta}</span>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${gap.priorityBg}`}>
                        {gap.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Skills */}
              <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
                  Trending Skills for Staff Roles
                </h3>

                <div className="space-y-4">
                  {trendingSkills.map((tr, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[#4B5563]">
                      <span>{tr.name}</span>
                      <span className="text-[#10B981] font-bold text-[10px]">
                        {tr.demand}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
