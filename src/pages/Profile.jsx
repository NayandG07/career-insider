import React from 'react';
import { 
  Sparkles, 
  Github, 
  Code, 
  Database,
  Star,
  Compass,
  Briefcase
} from 'lucide-react';

export default function Profile() {
  const skillsShowcase = [
    { name: "TypeScript & React", level: "Expert", score: 95 },
    { name: "System Design", level: "Advanced", score: 84 },
    { name: "Docker & Containerization", level: "Intermediate", score: 55 },
    { name: "Database Scalability", level: "Advanced", score: 70 }
  ];

  const experiences = [
    {
      role: "Senior Frontend Engineer",
      company: "Linear",
      period: "2022 - Present",
      desc: "Architected workspace syncing pipelines, offline database caching, and high-performance list virtualizations."
    },
    {
      role: "Software Engineer II",
      company: "Stripe",
      period: "2020 - 2022",
      desc: "Scaled frontend payment flows, internal analytics engines, and dynamic telemetry UI dashboards."
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* Profile Header Banner */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* User details */}
        <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
          <div className="relative">
            {/* Avatar Circle Container */}
            <div className="w-24 h-24 rounded-full border-4 border-[#EEF2FF] p-1 shadow-sm shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80" 
                alt="Alex Rivera" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">Alex Rivera</h2>
              <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#137333] px-2.5 py-0.5 rounded uppercase tracking-wider">
                VERIFIED ELITE
              </span>
            </div>
            
            <p className="text-xs text-[#4B5563] font-semibold">
              Senior Frontend Dev • San Francisco, CA
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              {["github", "leetcode", "codeforces", "kaggle", "resume", "projects", "portfolio"].map((source) => (
                <span 
                  key={source} 
                  className="text-[10px] font-bold text-[#6B7280] bg-[#FAFBFC] border border-[#E5E9F0] px-2.5 py-0.5 rounded-lg uppercase tracking-wider"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Global Readiness Box */}
        <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-[#E5E9F0] w-full md:w-80 relative flex gap-4 shadow-sm shrink-0">
          <Star className="w-5 h-5 text-amber-400 absolute top-5 right-5 fill-amber-300" />
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
              Global Readiness
            </span>
            <span className="text-4xl font-black text-[#6366F1] tracking-tight leading-none block">
              84%
            </span>
            <p className="text-[10px] text-[#6B7280] font-semibold leading-relaxed pt-1.5">
              Top 6% of general software engineers globally. Ready for Tier-1 algorithmic matching.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Bios + Skills / Experiences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Bio & Skills */}
        <div className="lg:col-span-6 space-y-6">
          {/* Professional Bio */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
              Professional Bio
            </h3>
            <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Frontend Specialist with 6+ years mapping performant state topologies, design systems, and responsive user experiences. Transitioning towards Staff Infrastructure & Distributed Systems Architectures.
            </p>
          </div>

          {/* Skills Showcase */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
              Skills Showcase
            </h3>

            <div className="space-y-4">
              {skillsShowcase.map((sk, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#4B5563]">
                    <span>{sk.name}</span>
                    <span className="text-[#6366F1] font-bold">
                      {sk.level} • {sk.score}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6366F1]" style={{ width: `${sk.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Experience History */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-6 min-h-[380px]">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
              Experience History
            </h3>

            {/* Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:top-2.5 before:left-1 before:bottom-2.5 before:w-0.5 before:bg-[#E5E9F0]">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[24px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#6366F1] border-2 border-white ring-2 ring-[#EEF2FF] shrink-0"></div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#111827]">{exp.role}</h4>
                    <span className="text-[11px] text-[#6B7280] font-semibold block">
                      {exp.company} • {exp.period}
                    </span>
                    <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed pt-1">
                      {exp.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
