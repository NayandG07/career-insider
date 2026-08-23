import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Github, 
  Database, 
  FileText, 
  FolderGit2, 
  Code,
  LineChart,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillsEvidence() {
  const [selectedSkillId, setSelectedSkillId] = useState('python');

  const skillsData = [
    {
      id: 'python',
      name: "Python",
      overallScore: 88,
      category: "Backend & Data Science",
      evidences: [
        { source: "GitHub", detail: "8 repositories utilizing Python for scripting, tooling, and backend API designs.", icon: Github, color: "bg-slate-900 text-white" },
        { source: "Kaggle", detail: "3 ML/data science notebooks published demonstrating NumPy & Pandas profiling.", icon: Database, color: "bg-sky-500 text-white" },
        { source: "Resume", detail: "Explicitly listed as core competency under 'Technologies & Frameworks'.", icon: FileText, color: "bg-rose-500 text-white" },
        { source: "Projects", detail: "4 inventory items normalized with primary Python classification.", icon: FolderGit2, color: "bg-emerald-600 text-white" }
      ]
    },
    {
      id: 'system_design',
      name: "System Design",
      overallScore: 84,
      category: "Architectural & Scale",
      evidences: [
        { source: "Resume", detail: "Mentioned across professional timeline at Stripe (scaled payment telemetry flows).", icon: FileText, color: "bg-rose-500 text-white" },
        { source: "GitHub", detail: "1 architecture-focused codebase ('scaling-distributed-db') utilizing local caches.", icon: Github, color: "bg-slate-900 text-white" },
        { source: "Projects", detail: "Limited evidence extracted from portfolio; marked as core architecture skill gap verification target.", icon: FolderGit2, color: "bg-[#FAFBFC] text-[#4B5563]" }
      ]
    },
    {
      id: 'typescript',
      name: "TypeScript & React",
      overallScore: 95,
      category: "Frontend Specialty",
      evidences: [
        { source: "GitHub", detail: "12 repositories utilizing React with typed components and custom rendering hooks.", icon: Github, color: "bg-slate-900 text-white" },
        { source: "Resume", detail: "6+ years history as Senior Frontend Dev explicitly validated.", icon: FileText, color: "bg-rose-500 text-white" },
        { source: "Projects", detail: "3 primary frontend projects (including Stripe & Linear sync pipelines).", icon: FolderGit2, color: "bg-emerald-600 text-white" },
        { source: "LeetCode", detail: "24 UI/JS/Algorithms problems solved, including medium & hard categories.", icon: Code, color: "bg-amber-500 text-white" }
      ]
    },
    {
      id: 'competitive_programming',
      name: "Competitive Coding",
      overallScore: 78,
      category: "Algorithms & Logic",
      evidences: [
        { source: "Codeforces", detail: "Official API sync captured: Rating 1650 (Expert), max rating 1720.", icon: LineChart, color: "bg-blue-600 text-white" },
        { source: "LeetCode", detail: "142 problems solved (difficulty ratio: 20% Hard, 50% Medium, 30% Easy).", icon: Code, color: "bg-amber-500 text-white" },
        { source: "Resume", detail: "Competitive coding awards listed under achievements.", icon: FileText, color: "bg-rose-500 text-white" }
      ]
    }
  ];

  const activeSkill = skillsData.find(s => s.id === selectedSkillId) || skillsData[0];

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Skills & Evidence Engine</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Unified skills list showing exactly which source credentials and normalization logs verify your capability.
        </p>
      </div>

      {/* Split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Skills Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            Normalized Technical Skills
          </h3>

          <div className="space-y-3">
            {skillsData.map((sk) => {
              const isSelected = sk.id === selectedSkillId;
              return (
                <motion.div
                  key={sk.id}
                  onClick={() => setSelectedSkillId(sk.id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-4 ${
                    isSelected ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/5' : 'border-[#E5E9F0]'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#111827]">{sk.name}</h4>
                    <span className="text-[10px] text-[#9CA3AF] font-bold block">{sk.category}</span>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-[#7C3AED]">{sk.overallScore}%</span>
                      <span className="text-[9px] text-[#9CA3AF] font-bold block">Integrity</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#7C3AED] translate-x-1' : 'text-[#9CA3AF]'}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Evidence Logs */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSkill.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-6 min-h-[420px] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[#F3F4F6]">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">{activeSkill.name}</h3>
                    <span className="text-xs text-[#9CA3AF] font-semibold">{activeSkill.category}</span>
                  </div>
                  <div className="px-3.5 py-1 bg-purple-50 text-[#7C3AED] rounded-full text-[10px] font-bold">
                    Score Weight: {activeSkill.overallScore}%
                  </div>
                </div>

                {/* Evidence timeline */}
                <div className="mt-6 space-y-5">
                  <span className="block text-[10px] font-bold text-[#6B7280] tracking-wider uppercase">
                    Extracted Verification Evidence
                  </span>

                  <div className="relative pl-6 space-y-5 before:absolute before:top-2 before:left-1 before:bottom-2 before:w-0.5 before:bg-[#E5E9F0]">
                    {activeSkill.evidences.map((ev, idx) => {
                      const Icon = ev.icon;
                      return (
                        <div key={idx} className="relative">
                          {/* Dot */}
                          <div className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-[#7C3AED] border-2 border-white ring-2 ring-purple-100 shrink-0"></div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#374151] uppercase tracking-wide">
                                {ev.source}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">
                              {ev.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI suggestion overlay */}
              <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3 mt-6">
                <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#6B7280] font-semibold leading-relaxed">
                  The evidence engine dynamically maps this profile skill based on Git commits, Kaggle notebook activity, and extracted CV metrics. Connect more platforms to expand evidence.
                </p>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
