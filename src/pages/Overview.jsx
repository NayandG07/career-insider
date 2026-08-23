import React from 'react';
import { 
  LayoutGrid, 
  Sparkles, 
  Github, 
  Code, 
  Database, 
  FileText, 
  FolderGit2, 
  Activity, 
  LineChart, 
  ArrowUpRight,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Overview({ setActivePage }) {
  const sources = [
    { name: "GitHub", status: "connected", detail: "✓ 8 Repositories normalized", icon: Github, color: "bg-slate-900 text-white" },
    { name: "LeetCode", status: "connected", detail: "✓ 142 Solved Problems mapped", icon: Code, color: "bg-amber-500 text-white" },
    { name: "Codeforces", status: "connected", detail: "✓ Rating: 1650 (Expert)", icon: LineChart, color: "bg-blue-600 text-white" },
    { name: "Kaggle", status: "connected", detail: "✓ 3 Notebooks & ML models", icon: Database, color: "bg-sky-500 text-white" },
    { name: "Resume", status: "connected", detail: "✓ PDF text structured", icon: FileText, color: "bg-rose-500 text-white" },
    { name: "Projects", status: "connected", detail: "✓ 12 Inventory items merged", icon: FolderGit2, color: "bg-emerald-600 text-white" },
    { name: "Portfolio", status: "healthy", detail: "● Healthy (HTTP 200, 164ms, SSL valid)", icon: Activity, color: "bg-violet-600 text-white" }
  ];

  const recentNormalizations = [
    { source: "GitHub", event: "Extracted evidence for TypeScript & Redis from 'scaling-distributed-db'", time: "2m ago" },
    { source: "Codeforces", event: "Captured contest submission rating change (+42 pts)", time: "1h ago" },
    { source: "Resume", event: "Deduplicated 'Linear payment logs' project matching GitHub repo", time: "4h ago" },
    { source: "Portfolio", event: "Uptime check returned HTTP 200 OK with 164ms response latency", time: "12m ago" }
  ];

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Overview</h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Unified developer identity and real-time evidence normalization summary.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActivePage('sources')}
          className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Manage Integrations
        </motion.button>
      </div>

      {/* Main Grid: Left Connected status, Right Live log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 7 Sources Status List */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            Connected Developer Sources
          </h3>

          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F3F4F6]">
              <span className="text-xs font-bold text-[#4B5563]">Source Node</span>
              <span className="text-xs font-bold text-[#4B5563]">Normalization Status</span>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {sources.map((src, idx) => {
                const Icon = src.icon;
                return (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 2 }}
                    className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${src.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#111827]">{src.name}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        src.status === 'healthy' ? 'bg-[#E8F5E9] text-[#137333]' : 'bg-[#EEF2FF] text-[#6366F1]'
                      }`}>
                        {src.detail}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Normalization Feed & Diagnostics */}
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            Normalization Evidence Engine Log
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm text-slate-100 flex flex-col justify-between h-[395px] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-1">
              {recentNormalizations.map((norm, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
                        {norm.source}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">{norm.time}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-200 leading-relaxed">
                      {norm.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4 relative z-10 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>ACTIVE ADAPTER POOLS: 7/7</span>
              <span className="text-purple-400 hover:underline cursor-pointer flex items-center gap-1">
                Open telemetry view
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Overview Cards Bottom: Profile Completeness */}
      <motion.div 
        whileHover={{ y: -3 }}
        className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4.5">
          <div className="w-12 h-12 bg-purple-50 text-[#7C3AED] rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 fill-purple-100/50" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#111827]">Unified Developer Profile Integrity: 95%</h4>
            <p className="text-xs text-[#6B7280] font-semibold mt-1">
              Your credentials represent strong algorithmic ability, ML competition exposure, and verified front-end history.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setActivePage('profile')}
          className="px-4 py-2 border border-[#E5E9F0] hover:bg-[#FAFBFC] text-xs font-bold text-[#374151] rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
        >
          View Profile
        </button>
      </motion.div>

    </div>
  );
}
