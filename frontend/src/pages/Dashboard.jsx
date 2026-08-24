import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  Tooltip as ChartTooltip
} from 'recharts';
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Github, 
  Code,
  Database,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ setActivePage }) {
  const { userData, skills, telemetry } = useApp();

  const globalScore = userData?.readinessScore || 0;
  
  const connectedCount = userData?.connectedSources 
    ? Object.values(userData.connectedSources).filter(s => s && s.connected).length 
    : 0;

  const stats = [
    { label: "SKILLS ANALYZED", value: `${skills ? skills.length : 0} Mapped`, change: "Active", desc: "Live tracking from connected sources" },
    { label: "TOP-TIER MATCHES", value: "Available in Matches", change: "Dynamic", desc: "Check Company Matches tab" },
    { label: "CONNECTED SOURCES", value: `${connectedCount} Sources`, change: `✓ ${connectedCount} Active`, desc: "Unified Developer Profile feed" },
    { label: "PROFILE STRENGTH", value: globalScore > 80 ? "Elite V2" : (globalScore > 50 ? "Intermediate" : "Beginner"), change: "Verified", desc: "Credentials mapped" },
  ];

  // Map skills to radar data if available
  const radarData = skills && skills.length > 0 
    ? skills.map(sk => ({ subject: sk.category || sk.subject || 'Unknown', A: sk.level || sk.A || 0, fullMark: 100 })).slice(0, 6)
    : [];

  // Fallback for bar data if telemetry doesn't have it
  const barData = [
    { name: 'Mon', score: Math.max(0, globalScore - 10) },
    { name: 'Tue', score: Math.max(0, globalScore - 8) },
    { name: 'Wed', score: Math.max(0, globalScore - 5) },
    { name: 'Thu', score: Math.max(0, globalScore - 2) },
    { name: 'Fri', score: globalScore },
  ];

  // Map telemetry events to credentials if available
  let credentials = [];
  if (telemetry && telemetry.events) {
    credentials = telemetry.events.slice(0, 5).map(event => ({
      source: event.source,
      icon: event.source === 'GitHub' ? Github : (event.source === 'LeetCode' ? Code : Database),
      color: event.source === 'GitHub' ? 'bg-slate-900 text-white' : (event.source === 'LeetCode' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'),
      title: event.description || "Activity detected",
      time: new Date(event.timestamp).toLocaleDateString(),
      points: "+10 Pts"
    }));
  }
  
  if (credentials.length === 0) {
    credentials = [
      {
        source: 'System',
        icon: Database,
        color: 'bg-indigo-500 text-white',
        title: "No recent activity found. Connect sources or sync.",
        time: "Now",
        points: "+0 Pts"
      }
    ];
  }

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            CareerOS AI engine is actively mapping your developer credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-white border border-[#E5E9F0] text-[#111827] font-semibold text-xs rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#4B5563]" />
            Export profile
          </motion.button>
          
          <motion.button 
            onClick={() => setActivePage('ai-mentor')}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white/10" />
            Ask AI Mentor
          </motion.button>
        </div>
      </div>

      {/* Top Main Cards: Global Readiness and Recommended Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global Readiness Score */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm"
        >
          {/* Progress Ring with Motion */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="54" stroke="#F3F4F6" strokeWidth="10" fill="transparent" />
              <motion.circle 
                cx="64" cy="64" r="54" 
                stroke="#6366F1" strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={339.2}
                initial={{ strokeDashoffset: 339.2 }}
                animate={{ strokeDashoffset: 339.2 - (339.2 * globalScore) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-black text-[#111827]">{globalScore}%</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
                Global Readiness Score
              </span>
              <h3 className="text-xl font-bold text-[#111827] mt-0.5">Highly Competitive</h3>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed mt-1">
                You rank in the top 6% of general software engineers with similar experience. Your profile is ready for Tier-1 algorithmic and system design matching.
              </p>
            </div>

            {/* Connected Sources Status Check List */}
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#F3F4F6]">
              {[
                { name: 'GitHub', status: '✓' },
                { name: 'LeetCode', status: '✓' },
                { name: 'Codeforces', status: '✓' },
                { name: 'Kaggle', status: '✓' },
                { name: 'Resume', status: '✓' },
                { name: 'Projects', status: '✓' },
                { name: 'Portfolio', status: '● Healthy' }
              ].map((s, idx) => (
                <span 
                  key={idx} 
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    s.status === '✓' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                  }`}
                >
                  {s.name} {s.status}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommended Next Steps */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block mb-4">
            Recommended Next Steps
          </span>
          <div className="space-y-4">
            {/* Step 1 */}
            <motion.div 
              whileHover={{ x: 2 }}
              className="flex items-center justify-between gap-3 p-3 hover:bg-[#FAFBFC] rounded-xl transition-all border border-[#F3F4F6]"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                <span className="text-xs font-bold text-[#374151]">Complete the system design mock exam</span>
              </div>
              <span className="text-[9px] font-bold bg-[#EEF2FF] text-[#6366F1] px-2 py-0.5 rounded-full shrink-0">
                +5% Readiness
              </span>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              whileHover={{ x: 2 }}
              className="flex items-center justify-between gap-3 p-3 hover:bg-[#FAFBFC] rounded-xl transition-all border border-[#F3F4F6]"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-[#6366F1]" />
                </div>
                <span className="text-xs font-bold text-[#374151]">Apply matched role at Stripe (92% compatibility)</span>
              </div>
              <button 
                onClick={() => setActivePage('companies')}
                className="text-[10px] font-bold text-[#6366F1] hover:underline shrink-0 cursor-pointer"
              >
                Apply now
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((st, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-2"
          >
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              {st.label}
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-[#111827]">{st.value}</span>
              <span className="text-[10px] font-bold text-[#10B981]">{st.change}</span>
            </div>
            <p className="text-[10px] text-[#6B7280] font-semibold">
              {st.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fullstack Competency Dimension (Radar) */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block mb-4">
            Fullstack Competency Dimension
          </span>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#F1F5F9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 600 }} />
                <Radar name="My Competency" dataKey="A" stroke="#7C3AED" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Readiness Growth (Bar Chart) */}
        <motion.div 
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Weekly Readiness Growth
            </span>
            <span className="text-xs font-bold text-[#10B981]">
              +4.8% This Month
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} />
                <ChartTooltip 
                  contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                />
                <Bar dataKey="score" fill="#7C3AED" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, idx) => (
                    <Bar key={idx} fill={idx === barData.length - 1 ? '#7C3AED' : '#C7D2FE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Bottom Card: Recent Active Credentials Mapped */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          Recent Active Credentials Mapped
        </h3>

        <div className="divide-y divide-[#F3F4F6]">
          {credentials.map((cred, idx) => {
            const Icon = cred.icon;
            return (
              <motion.div 
                key={idx} 
                whileHover={{ x: 2 }}
                className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl ${cred.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">{cred.source}</h4>
                    <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">{cred.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-[10px] text-[#9CA3AF] font-semibold">{cred.time}</span>
                  <span className="text-[10px] font-bold bg-[#E6F4EA] text-[#137333] px-2.5 py-1 rounded-full shrink-0">
                    {cred.points}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
