import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ChevronDown, 
  Briefcase,
  MapPin,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompanyMatches() {
  const [selectedCompId, setSelectedCompId] = useState('stripe');
  const [searchTerm, setSearchTerm] = useState('');

  const companies = [
    {
      id: 'stripe',
      name: "Stripe",
      logoChar: "S",
      logoBg: "bg-[#635BFF]",
      salary: "$180k - $230k • 0.1% Equity",
      match: 94,
      location: "San Francisco / Remote",
      tags: ["React", "TypeScript", "System Design", "NodeJS"],
      breakdown: [
        {
          factor: "Tech Stack Alignment",
          desc: "Your mapped TypeScript & React skills are in the top 3% of their system engineering needs.",
          status: "strong"
        },
        {
          factor: "Engineering Culture",
          desc: "High correlation with autonomy & open source contribution signals in your profile.",
          status: "strong"
        },
        {
          factor: "Algorithmic Mastery",
          desc: "Their interviews require high-level dynamic programming. Recommended prep: 2 LeetCode challenges.",
          status: "gap"
        }
      ]
    },
    {
      id: 'linear',
      name: "Linear",
      logoChar: "L",
      logoBg: "bg-[#121212]",
      salary: "$190k - $240k • 0.25% Equity",
      match: 89,
      location: "Remote",
      tags: ["React", "TypeScript", "Offline Sync", "NodeJS"],
      breakdown: [
        {
          factor: "Offline Sync Architecture",
          desc: "Your commits in workspace syncing match Linear's custom Client-Side sync pattern.",
          status: "strong"
        },
        {
          factor: "Design Systems",
          desc: "Experience building tailwind-based premium designs fits their product standard perfectly.",
          status: "strong"
        },
        {
          factor: "Database Query Tuning",
          desc: "Moderate database index caching gaps identified for sub-millisecond local reads.",
          status: "gap"
        }
      ]
    },
    {
      id: 'airbnb',
      name: "Airbnb",
      logoChar: "A",
      logoBg: "bg-[#FF5A5F]",
      salary: "$175k - $220k • RSU Package",
      match: 82,
      location: "San Francisco, CA",
      tags: ["React", "Sass", "Server Render", "Docker"],
      breakdown: [
        {
          factor: "UI Render Optimization",
          desc: "Elite knowledge in core web vitals and React virtualization is highly valued here.",
          status: "strong"
        },
        {
          factor: "Cloud Container Pipelines",
          desc: "Significant gap in multi-region Kubernetes deployments. Recommended: complete Cloud Orchestration roadmap.",
          status: "gap"
        }
      ]
    },
    {
      id: 'netflix',
      name: "Netflix",
      logoChar: "N",
      logoBg: "bg-[#E50914]",
      salary: "$300k - $450k • Cash Only",
      match: 75,
      location: "Los Gatos / Remote",
      tags: ["TypeScript", "GraphQL", "Scale Infra", "Docker"],
      breakdown: [
        {
          factor: "GraphQL Schema Stitching",
          desc: "Federated API expertise aligns with their distributed UI gateway architecture.",
          status: "strong"
        },
        {
          factor: "Core Infrastructure Scaling",
          desc: "Gaps in caching cluster setups and container load balancing. P1 Priority gap recommendation.",
          status: "gap"
        }
      ]
    }
  ];

  const activeComp = companies.find(c => c.id === selectedCompId) || companies[0];

  const getMatchBadgeClass = (score) => {
    if (score >= 90) return "bg-[#E8F5E9] text-[#137333]";
    if (score >= 80) return "bg-[#EEF2FF] text-[#6366F1]";
    return "bg-[#FFF9E6] text-[#B78103]";
  };

  const getFactorIndicator = (status) => {
    if (status === 'strong') return "bg-[#10B981]";
    return "bg-[#F59E0B]";
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Smart Compatibility Matcher
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            CareerOS AI matches your credentials with real-time roles.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Search company, tech stack, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] placeholder-[#9CA3AF]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {["Match Score", "Salary Bracket", "Location"].map((lbl, idx) => (
            <button 
              key={idx} 
              className="px-4 py-2.5 bg-white border border-[#E5E9F0] text-[#4B5563] font-bold text-xs rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-all cursor-pointer flex items-center gap-1.5"
            >
              {lbl}
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>
          ))}
        </div>
      </div>

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Company Match Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 h-fit">
          {companies.map((comp) => {
            const isSelected = comp.id === selectedCompId;
            return (
              <motion.div
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer relative flex flex-col justify-between h-[160px] ${
                  isSelected 
                    ? 'border-[#6366F1] ring-2 ring-[#6366F1]/5' 
                    : 'border-[#E5E9F0]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {/* Circle Logo Placeholder */}
                      <div className={`w-9 h-9 rounded-xl ${comp.logoBg} flex items-center justify-center text-white font-extrabold text-sm`}>
                        {comp.logoChar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#111827] leading-tight">{comp.name}</h4>
                        <span className="text-[10px] text-[#9CA3AF] font-bold block mt-0.5">{comp.salary}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getMatchBadgeClass(comp.match)}`}>
                      {comp.match}% Match
                    </span>
                  </div>
                </div>

                {/* Sub-tags */}
                <div className="flex flex-wrap gap-2">
                  {comp.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="text-[9px] px-2 py-0.5 rounded-md border border-[#E5E9F0] bg-[#FAFBFC] font-semibold text-[#6B7280]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Company Gaps Breakdown Card with Slide Transitions */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeComp.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-[#6366F1] rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[460px]"
            >
              {/* Header info */}
              <div>
                <div className="flex justify-between items-start pb-5 border-b border-[#F3F4F6]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${activeComp.logoBg} flex items-center justify-center text-white font-black text-base`}>
                      {activeComp.logoChar}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111827] leading-tight">{activeComp.name}</h3>
                      <span className="text-xs text-[#9CA3AF] font-semibold block mt-0.5">{activeComp.location}</span>
                    </div>
                  </div>

                  {/* Circular indicator */}
                  <div className="w-12 h-12 rounded-full border-2 border-[#6366F1] bg-[#EEF2FF]/50 flex items-center justify-center text-xs font-black text-[#6366F1]">
                    {activeComp.match}%
                  </div>
                </div>

                {/* Match Breakdown Factors */}
                <div className="mt-6 space-y-6 text-left">
                  <span className="block text-[10px] font-bold text-[#6B7280] tracking-wider uppercase">
                    Match Breakdown Factors
                  </span>
                  
                  <div className="space-y-4">
                    {activeComp.breakdown.map((fact, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.2 }}
                        className="flex items-start gap-3"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getFactorIndicator(fact.status)}`}></span>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-[#374151]">{fact.factor}</h5>
                          <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">
                            {fact.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-[#F3F4F6]">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Apply via CareerOS Premium
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-white border border-[#E5E9F0] text-[#374151] hover:bg-[#FAFBFC] font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]/10 animate-spin-slow" />
                  Launch Interview Prep Plan
                </motion.button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
