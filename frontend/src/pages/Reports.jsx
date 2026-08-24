import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip as ChartTooltip 
} from 'recharts';
import { 
  Sparkles, 
  Download, 
  ChevronDown,
  Github,
  Code,
  Database
} from 'lucide-react';

export default function Reports() {
  const { userData, skills, telemetry, companies } = useApp();

  const activeSkillsCount = skills ? skills.length : 0;
  const matchesCount = companies ? companies.length : 0;
  const globalScore = userData?.readinessScore || 0;

  const stats = [
    { label: "SKILLS ANALYZED", value: `${activeSkillsCount} Mapped`, change: "Active", desc: "Commits & submissions active" },
    { label: "TOP-TIER MATCHES", value: `${matchesCount} Companies`, change: "Calculated", desc: "Based on active skills" },
    { label: "INTERVIEWS SCHEDULED", value: "Available in Pro", change: "Locked", desc: "Unlock to schedule mock interviews" },
    { label: "PROFILE STRENGTH", value: `${globalScore}% Readiness`, change: "Tracked", desc: "Your global competency score" }
  ];

  // Derive weekly data from globalScore or default
  const weeklyGrowthData = [
    { name: 'Week 1', score: Math.max(0, globalScore - 15) },
    { name: 'Week 2', score: Math.max(0, globalScore - 10) },
    { name: 'Week 3', score: Math.max(0, globalScore - 8) },
    { name: 'Week 4', score: Math.max(0, globalScore - 3) },
    { name: 'Week 5', score: globalScore },
  ];

  const connectedSources = userData?.connectedSources || {};

  const platforms = [
    { name: "GitHub", progress: connectedSources.github?.connected ? 100 : 0, color: "bg-[#6366F1]", desc: "Commits & Reviews" },
    { name: "LeetCode", progress: connectedSources.leetcode?.connected ? 100 : 0, color: "bg-[#10B981]", desc: "DP & Algorithm Prep" },
    { name: "Kaggle", progress: connectedSources.kaggle?.connected ? 100 : 0, color: "bg-[#F59E0B]", desc: "ML Competitions" }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Analytics & Intelligence Reports
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Monitor your credential mapping, application conversions, and market readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-[#E5E9F0] text-[#4B5563] font-bold text-xs rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-all cursor-pointer flex items-center gap-1.5">
            Last 30 Days
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>
          
          <button className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 fill-white/10" />
            Download Full PDF
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((st, idx) => (
          <div key={idx} className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              {st.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#111827]">{st.value}</span>
              <span className="text-[10px] font-bold text-[#10B981] ml-1">{st.change}</span>
            </div>
            <p className="text-[10px] text-[#6B7280] font-semibold">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Middle Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Readiness Growth (Bar chart) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Weekly Readiness growth
            </span>
            <span className="text-xs font-bold text-[#10B981]">
              +4.8% This Month
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} />
                <ChartTooltip 
                  contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                />
                <Bar dataKey="score" fill="#7C3AED" radius={[6, 6, 0, 0]}>
                  {weeklyGrowthData.map((entry, idx) => (
                    <Bar key={idx} fill={idx === weeklyGrowthData.length - 1 ? '#7C3AED' : '#E0E7FF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Activity Contribution */}
        <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Platform Activity Contribution
            </span>
            <span className="text-[10px] text-[#6B7280] font-bold">
              Average 12 commits/day
            </span>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {platforms.map((plat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-[#374151] font-bold">{plat.name}</span>
                  <span className="text-[#9CA3AF] text-[10px] font-bold">{plat.desc}</span>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${plat.color}`} style={{ width: `${plat.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Card: Monthly AI Progress Summary */}
      <div className="bg-[#7C3AED] text-white rounded-[32px] p-8 shadow-md relative overflow-hidden flex items-start gap-4">
        {/* Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 mt-0.5 relative z-10">
          <Sparkles className="w-5 h-5 text-purple-200 fill-purple-100" />
        </div>

        <div className="space-y-2 relative z-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
            Monthly AI-Generated Progress Summary
          </h3>
          <p className="text-xs font-semibold leading-relaxed text-purple-50">
            "Your global engineering readiness score increased by 4.8% this month, primarily driven by your active GitHub commits in high-availability caches. Mapped algorithmic credentials demonstrate strong competence in dynamic programming, ranking your profile high for Stripe Infrastructure matches. Recommendations for next month: complete the DevOps orchestration lectures to bridge the container pipeline gap."
          </p>
        </div>
      </div>

    </div>
  );
}
