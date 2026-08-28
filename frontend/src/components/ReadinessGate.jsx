import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Code, 
  Terminal, 
  FolderGit2, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Compass,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ReadinessGate({ 
  featureName = 'Career Roadmap',
  description = 'CareerOS connects directly to your developer profiles to generate a personalized analysis and roadmap.',
  readiness = {},
  setActivePage,
}) {
  const { leetcode = false, codeforces = false, hasProject = false } = readiness;

  const requirements = [
    {
      id: 'leetcode',
      title: 'LeetCode Account',
      description: 'Connect LeetCode to benchmark algorithmic problem solving and tag proficiencies.',
      met: leetcode,
      icon: Code,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200/60',
      actionLabel: 'Connect in Settings',
      page: 'settings',
    },
    {
      id: 'codeforces',
      title: 'Codeforces Handle',
      description: 'Connect Codeforces to index competitive ratings, contests, and problem metrics.',
      met: codeforces,
      icon: Terminal,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200/60',
      actionLabel: 'Connect in Settings',
      page: 'settings',
    },
    {
      id: 'project',
      title: 'At Least 1 Showcase Project',
      description: 'Add or import at least one full-stack or software project with declared tech stack.',
      met: hasProject,
      icon: FolderGit2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      actionLabel: 'Add Project',
      page: 'projects',
    },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const progressPercent = Math.round((metCount / requirements.length) * 100);

  const DynamicDecorationIcon = featureName === 'Skill Intelligence' ? Layers : Compass;

  return (
    <div className="w-full space-y-6 animate-fadeIn text-left py-4">
      {/* Hero Header Card */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        
        {/* Large Decorative Page Icon (Right side background decoration) */}
        <div className="absolute right-6 top-6 sm:right-8 sm:top-8 text-[#7C3AED]/[0.07] pointer-events-none hidden sm:block">
          <DynamicDecorationIcon className="w-20 h-20 stroke-[1.25]" />
        </div>
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/60 text-[#7C3AED] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Setup & Verification</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Connect Your Accounts to Unlock {featureName}
          </h2>

          <p className="text-sm text-[#4B5563] font-medium leading-relaxed">
            {description}
          </p>

          {/* Progress Indicator */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#374151]">
              <span>Setup Progress</span>
              <span className="text-[#7C3AED]">{metCount} of {requirements.length} Steps Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-[#F3F4F6] h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {requirements.map((req, idx) => {
          const Icon = req.icon;
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between h-[230px] ${
                req.met 
                  ? 'bg-white border-emerald-200/70 shadow-xs' 
                  : 'bg-white border-[#E5E9F0] shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${req.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {req.met ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-bold">
                      <Circle className="w-3.5 h-3.5" />
                      Required
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#111827]">{req.title}</h3>
                  <p className="text-xs text-[#6B7280] font-medium leading-relaxed mt-1 line-clamp-2">
                    {req.description}
                  </p>
                </div>
              </div>

              {!req.met && setActivePage && (
                <button
                  type="button"
                  onClick={() => setActivePage(req.page)}
                  className="mt-4 w-full py-2.5 px-3 bg-[#FAFBFC] hover:bg-white border border-[#E5E9F0] hover:border-[#7C3AED] text-[#111827] hover:text-[#7C3AED] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group"
                >
                  <span>{req.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Complete Profile Action Bar */}
      {metCount < requirements.length && setActivePage && (
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white">Ready to activate {featureName}?</h4>
            <p className="text-xs text-slate-300 font-medium">
              Link your developer profiles and showcase your projects in settings to unlock verified AI analysis.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setActivePage('settings')}
              className="w-full sm:w-auto px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
