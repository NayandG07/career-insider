import React, { useState } from 'react';
import { 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const [toggles, setToggles] = useState({
    github: true,
    leetcode: true,
    kaggle: false,
    codeforces: false,
    resume: true,
    projects: true,
    portfolio: true,
    report: true,
    matches: true,
    reminders: false
  });

  const handleToggle = (key) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const platforms = [
    {
      key: 'github',
      name: "GitHub Code Repositories",
      desc: "Syncs commit history, pull request logs, and codebase topologies."
    },
    {
      key: 'leetcode',
      name: "LeetCode Algorithm Activity",
      desc: "Syncs solved challenge rankings and runtime efficiency metrics."
    },
    {
      key: 'kaggle',
      name: "Kaggle Models",
      desc: "Syncs ML modeling submissions and dataset analyses."
    },
    {
      key: 'codeforces',
      name: "Codeforces Contest Submissions",
      desc: "Syncs live competitive coding statistics."
    },
    {
      key: 'resume',
      name: "Resume PDF Document Sync",
      desc: "Uploads, extracts, and indexes skills, achievements, and professional timelines."
    },
    {
      key: 'projects',
      name: "Unified Projects Deduplication",
      desc: "Aggregates and merges repository, portfolio, and manually-entered projects."
    },
    {
      key: 'portfolio',
      name: "Portfolio Health Checker",
      desc: "Tracks HTTP status codes, SSL validation alerts, and site response times."
    }
  ];

  const alerts = [
    { key: 'report', name: "Weekly Performance Report Digest" },
    { key: 'matches', name: "Immediate High-Tier Company Matches" },
    { key: 'reminders', name: "Mentorship Session Daily Reminders" }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* Title Row */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
          Settings
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Manage your developer credentials, AI mapping options, and account status.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Toggles for credentials and notifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Connected Credentials Platforms */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
                Connected Credentials Platforms
              </h3>
              <p className="text-xs text-[#6B7280] font-semibold mt-1">
                Enable open sync pathways to build your real-time Readiness Index.
              </p>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {platforms.map((plat) => {
                const isActive = toggles[plat.key];
                return (
                  <div key={plat.key} className="py-4 flex items-center justify-between gap-6 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#374151]">{plat.name}</h4>
                      <p className="text-[11px] text-[#6B7280] font-semibold">{plat.desc}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-[10px] font-bold ${isActive ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`}>
                        {isActive ? 'ACTIVE' : 'DISCONNECTED'}
                      </span>
                      
                      {/* Connection Action Button */}
                      <button 
                        onClick={() => handleToggle(plat.key)}
                        className={`px-3 py-1.5 border rounded-lg text-[10px] font-black tracking-tight cursor-pointer transition-all ${
                          isActive 
                            ? 'border-[#E5E9F0] text-[#6B7280] hover:bg-[#FAFBFC]' 
                            : 'bg-[#7C3AED] border-[#7C3AED] text-white hover:bg-[#6D28D9]'
                        }`}
                      >
                        {isActive ? 'Disconnect' : 'Connect Account'}
                      </button>

                      {/* Toggle Switch */}
                      <button 
                        onClick={() => handleToggle(plat.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                          isActive ? 'bg-[#10B981]' : 'bg-[#E5E9F0]'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Notification Alerts */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
                AI Notification Alerts
              </h3>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {alerts.map((al) => {
                const isActive = toggles[al.key];
                return (
                  <div key={al.key} className="py-4 flex items-center justify-between gap-6 first:pt-0 last:pb-0">
                    <span className="text-xs font-bold text-[#374151]">{al.name}</span>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => handleToggle(al.key)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                        isActive ? 'bg-[#6366F1]' : 'bg-[#E5E9F0]'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                        isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Billing & Appearance Theme */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Subscription Plan */}
          <div className="bg-[#7C3AED] text-white rounded-3xl p-6 shadow-md relative overflow-hidden h-[210px] flex flex-col justify-between">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-200 fill-purple-100" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-purple-200">
                  Active Subscription Plan
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight mt-1.5">CareerOS Pro Plan</h3>
              <p className="text-xs font-semibold text-purple-200">
                Next billing cycle: March 24, 2026
              </p>
            </div>

            <div className="relative z-10">
              <button className="w-full py-2.5 bg-white text-[#7C3AED] hover:bg-purple-50 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Appearance Theme */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Appearance Theme
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button className="py-2.5 bg-[#EEF2FF] border border-[#6366F1] text-[#6366F1] rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:bg-indigo-50/50 transition-colors">
                Light System
              </button>
              <button className="py-2.5 border border-[#E5E9F0] bg-white text-[#4B5563] rounded-xl text-xs font-bold cursor-not-allowed">
                Dark System
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
