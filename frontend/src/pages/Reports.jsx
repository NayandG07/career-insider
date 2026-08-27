import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/aiService';
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
  Loader2,
} from 'lucide-react';

export default function Reports() {
  const { userData, skills, companies } = useApp();
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const globalScore = userData?.readinessScore || 0;

  // Real historical readiness data from DB
  const readinessHistory = userData?.readinessHistory || [];

  // Build chart data from real history, fall back to showing just the current score
  const chartData = readinessHistory.length > 0
    ? readinessHistory.slice(-7).map((h, i) => ({
        name: i === readinessHistory.slice(-7).length - 1 ? 'Now' : `Run ${i + 1}`,
        score: h.score || 0,
      }))
    : globalScore > 0
      ? [{ name: 'Current', score: globalScore }]
      : [];

  // Stats derived from real data
  const skillCategoriesCount = skills?.categories?.length || 0;
  const matchesCount = Array.isArray(companies) ? companies.length : 0;

  const lastAnalyzed = userData?.lastAnalyzedAt
    ? new Date(userData.lastAnalyzedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : null;

  const connectedSources = userData?.connectedSources || {};
  const connectedCount = Object.values(connectedSources).filter(v => v && v !== '').length;

  const stats = [
    {
      label: 'SKILL CATEGORIES',
      value: skillCategoriesCount > 0 ? `${skillCategoriesCount} Mapped` : 'Not analyzed',
      change: skillCategoriesCount > 0 ? 'Active' : 'Run Analysis',
      desc: 'From your connected profile data',
    },
    {
      label: 'TOP-TIER MATCHES',
      value: matchesCount > 0 ? `${matchesCount} Companies` : 'Not analyzed',
      change: matchesCount > 0 ? 'Calculated' : 'Run Analysis',
      desc: 'Based on your active skill profile',
    },
    {
      label: 'LAST AI ANALYSIS',
      value: lastAnalyzed || 'Never',
      change: lastAnalyzed ? 'Tracked' : 'Pending',
      desc: 'Skill + roadmap last computed',
    },
    {
      label: 'PROFILE STRENGTH',
      value: `${globalScore}% Readiness`,
      change: globalScore > 0 ? 'Tracked' : 'Pending',
      desc: 'Your global competency score',
    },
  ];

  const platforms = [
    {
      name: 'GitHub',
      progress: connectedSources.github ? 100 : 0,
      color: 'bg-[#6366F1]',
      desc: 'Commits & Reviews',
    },
    {
      name: 'LeetCode',
      progress: connectedSources.leetcode ? 100 : 0,
      color: 'bg-[#10B981]',
      desc: 'Problem Solving',
    },
    {
      name: 'Codeforces',
      progress: connectedSources.codeforces ? 100 : 0,
      color: 'bg-[#F59E0B]',
      desc: 'Competitive Programming',
    },
  ];

  // Fetch AI-generated progress summary on mount (once)
  useEffect(() => {
    if (!userData) return;
    setSummaryLoading(true);
    aiService.getProgressSummary()
      .then(res => setSummary(res?.summary || null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [userData?.lastAnalyzedAt]); // re-fetch when a new analysis runs

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">

      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Analytics &amp; Intelligence Reports
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

        {/* Readiness Progress Chart — real data */}
        <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Readiness Score History
            </span>
            <span className="text-xs font-bold text-[#10B981]">
              {readinessHistory.length > 1
                ? `${readinessHistory[readinessHistory.length - 1].score - readinessHistory[readinessHistory.length - 2].score > 0 ? '+' : ''}${readinessHistory[readinessHistory.length - 1].score - readinessHistory[readinessHistory.length - 2].score}pts Last Run`
                : 'Run analysis to track history'}
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#9CA3AF] text-xs font-semibold">
                No history yet — run Skill Analysis first
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} />
                  <ChartTooltip
                    contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                  />
                  <Bar dataKey="score" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Connection Status */}
        <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Platform Connection Status
            </span>
            <span className="text-[10px] text-[#6B7280] font-bold">
              {connectedCount} of {platforms.length} connected
            </span>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {platforms.map((plat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-[#374151] font-bold">{plat.name}</span>
                  <span className={`text-[10px] font-bold ${plat.progress === 100 ? 'text-emerald-500' : 'text-[#9CA3AF]'}`}>
                    {plat.progress === 100 ? 'Connected' : 'Not connected'}
                  </span>
                </div>

                <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${plat.color} transition-all duration-700`} style={{ width: `${plat.progress}%` }} />
                </div>

                <p className="text-[10px] text-[#9CA3AF] font-semibold">{plat.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Card: AI-Generated Progress Summary */}
      <div className="bg-[#7C3AED] text-white rounded-[32px] p-8 shadow-md relative overflow-hidden flex items-start gap-4">
        {/* Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 mt-0.5 relative z-10">
          {summaryLoading
            ? <Loader2 className="w-5 h-5 text-purple-200 animate-spin" />
            : <Sparkles className="w-5 h-5 text-purple-200 fill-purple-100" />
          }
        </div>

        <div className="space-y-2 relative z-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
            AI-Generated Progress Summary
          </h3>
          {summaryLoading ? (
            <p className="text-xs font-semibold leading-relaxed text-purple-300 animate-pulse">
              Generating your personalised summary…
            </p>
          ) : summary ? (
            <p className="text-xs font-semibold leading-relaxed text-purple-50">
              {summary}
            </p>
          ) : (
            <p className="text-xs font-semibold leading-relaxed text-purple-300">
              Run a Skill Analysis first to generate your personalised progress summary.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
