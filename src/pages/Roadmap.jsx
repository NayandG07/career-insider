import React from 'react';
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Roadmap() {
  const readiness = 68;

  const milestones = [
    {
      status: 'completed',
      title: "Current Level: Senior Frontend Engineer",
      desc: "Robust engineering practices, responsive layouts, modular state management architectures.",
      tags: ["React", "TypeScript", "Performance"],
      progress: ""
    },
    {
      status: 'in-progress',
      title: "Milestone 1: Distributed Architectures",
      desc: "Acquire core backend knowledge: global system caches, data replication, sharding mechanisms.",
      tags: ["Redis", "Kafka", "Data Sharding"],
      progress: "+15% Goal Progress"
    },
    {
      status: 'locked',
      title: "Milestone 2: Kubernetes Orchestration & DevOps",
      desc: "Manage containers at scale, configure persistent storage, multi-cloud networking & failovers.",
      tags: ["Docker", "Kubernetes", "AWS Infra"],
      progress: "+10% Goal Progress"
    }
  ];

  const skillDeltas = [
    { name: "Frontend Architecture", current: 95, target: 95 },
    { name: "System Design", current: 40, target: 85 },
    { name: "Cloud Orchestration", current: 20, target: 80 },
    { name: "Database Tuning", current: 55, target: 75 }
  ];

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Career Roadmap GPS
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
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white/10" />
            Ask AI Mentor
          </motion.button>
        </div>
      </div>

      {/* Top Banner Card: Destination Goal */}
      <motion.div 
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
              Destination Goal
            </span>
            <h3 className="text-xl font-bold text-[#111827] mt-1">Staff Infrastructure Architect</h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#6366F1]">{readiness}%</span>
            <span className="text-xs text-[#9CA3AF] font-bold ml-1">Completed</span>
          </div>
        </div>

        {/* Progress Bar with Motion */}
        <div className="w-full bg-[#F3F4F6] h-2.5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" 
            initial={{ width: 0 }}
            animate={{ width: `${readiness}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          ></motion.div>
        </div>

        <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-[#FAFBFC]">
          <span className="text-[#9CA3AF]">Estimated timeframe: based on current coding velocity</span>
          <button className="text-[#6366F1] hover:underline cursor-pointer">2 Milestones Achieved</button>
        </div>
      </motion.div>

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Development Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            Visual Development Timeline
          </h3>

          <div className="relative pl-8 space-y-6 before:absolute before:top-4 before:left-3.5 before:bottom-4 before:w-0.5 before:bg-[#E5E9F0]">
            {milestones.map((ms, idx) => (
              <div key={idx} className="relative">
                {/* Timeline node icon */}
                <div className="absolute -left-[32px] top-1">
                  {ms.status === 'completed' ? (
                    <div className="w-7 h-7 rounded-full bg-[#E8F5E9] border-2 border-white flex items-center justify-center text-[#10B981] shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    </div>
                  ) : ms.status === 'in-progress' ? (
                    <div className="w-7 h-7 rounded-full bg-[#EEF2FF] border-2 border-[#6366F1] flex items-center justify-center shadow-sm">
                      <span className="w-2.5 h-2.5 bg-[#6366F1] rounded-full animate-ping absolute inline-flex"></span>
                      <span className="w-2.5 h-2.5 bg-[#6366F1] rounded-full relative inline-flex"></span>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-[#E5E9F0] flex items-center justify-center text-[#9CA3AF] shadow-sm">
                      <div className="w-2.5 h-2.5 bg-[#CBD5E1] rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Card Container with Motion */}
                <motion.div 
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${
                    ms.status === 'in-progress' 
                      ? 'border-[#6366F1] ring-2 ring-[#6366F1]/5' 
                      : ms.status === 'locked' 
                        ? 'border-[#E5E9F0] opacity-65' 
                        : 'border-[#E5E9F0]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className={`text-sm font-bold ${ms.status === 'locked' ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}>
                      {ms.title}
                    </h4>
                    {ms.progress && (
                      <span className="text-[10px] font-bold bg-[#EEF2FF] text-[#6366F1] px-2 py-0.5 rounded-full shrink-0">
                        {ms.progress}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-xs font-semibold leading-relaxed mb-4 ${ms.status === 'locked' ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                    {ms.desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {ms.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold ${
                          ms.status === 'locked' 
                            ? 'bg-[#FAFBFC] border-[#E5E9F0] text-[#9CA3AF]' 
                            : 'bg-[#FAFBFC] border-[#E5E9F0] text-[#4B5563]'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Skill Delta & Recommendation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill Delta Comparison */}
          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5"
          >
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
              Skill Delta Comparison
            </h3>

            <div className="space-y-4">
              {skillDeltas.map((sd, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#4B5563]">
                    <span>{sd.name}</span>
                    <span className="text-[#111827] font-bold">
                      {sd.current}% / {sd.target}%
                    </span>
                  </div>
                  
                  {/* Custom Delta Progress Bar with Motion */}
                  <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-slate-300 z-10" 
                      style={{ left: `${sd.target}%` }}
                    ></div>
                    <motion.div 
                      className="h-full bg-[#6366F1]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${sd.current}%` }}
                      transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Roadmap Adjustment */}
          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-[#7C3AED] text-white rounded-3xl p-6 shadow-md shadow-purple-100 flex flex-col justify-between relative overflow-hidden h-[240px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-200 fill-purple-100 animate-spin-slow" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-purple-200">
                  AI Roadmap Adjustment
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-purple-50">
                "Your latest GitHub commit reveals deep async queuing experience. Shall I auto-complete Milestone 1?"
              </p>
            </div>

            <div className="relative z-10 mt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-white text-[#7C3AED] hover:bg-purple-50 font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors w-full"
              >
                Review Changes
              </motion.button>
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
