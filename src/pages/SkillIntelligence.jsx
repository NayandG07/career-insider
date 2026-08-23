import React from 'react';
import { 
  Sparkles, 
  Download, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Code,
  Database,
  Globe
} from 'lucide-react';

export default function SkillIntelligence() {
  const topCategories = [
    { name: "Frontend", score: 92, tags: ["React", "TypeScript", "Tailwind CSS", "NextJS"], color: "text-[#6366F1]" },
    { name: "Backend", score: 68, tags: ["NodeJS", "PostgreSQL", "System API", "GraphQL"], color: "text-[#7C3AED]" },
    { name: "DevOps & Infra", score: 45, tags: ["Docker", "GitHub Actions", "AWS Basic", "Nginx"], color: "text-[#06B6D4]" }
  ];

  const masteryGrid = [
    {
      title: "Data Structures",
      icon: Code,
      color: "bg-slate-900 text-white",
      level: "Expert",
      score: "85%",
      footer: "Updated 2 hrs ago",
      trend: "up"
    },
    {
      title: "System Scalability",
      icon: Layers,
      color: "bg-indigo-600 text-white",
      level: "Intermediate",
      score: "64%",
      footer: "Updated 1 day ago",
      trend: "up"
    },
    {
      title: "Predictive Modeling",
      icon: Database,
      color: "bg-sky-500 text-white",
      level: "Advanced",
      score: "78%",
      footer: "Updated 3 days ago",
      trend: "stable"
    },
    {
      title: "Cloud Systems",
      icon: Globe,
      color: "bg-emerald-600 text-white",
      level: "Beginner",
      score: "35%",
      footer: "Updated 1 week ago",
      trend: "up"
    }
  ];

  const gapAnalysis = [
    { name: "System Cache Scaling", delta: "High Delta (35%)", deltaColor: "text-red-500", priority: "P1 PRIORITY", priorityBg: "bg-red-50 text-red-600" },
    { name: "Terraform HCL", delta: "Moderate Delta (20%)", deltaColor: "text-amber-600", priority: "P2 PRIORITY", priorityBg: "bg-amber-50 text-amber-600" },
    { name: "Kubernetes Secrets", delta: "Low Delta (10%)", deltaColor: "text-amber-500", priority: "P3 PRIORITY", priorityBg: "bg-amber-50 text-amber-500" }
  ];

  const trendingSkills = [
    { name: "Rust WebAssembly", demand: "+120% YoY demand" },
    { name: "GraphQL Federation", demand: "+85% YoY demand" },
    { name: "eBPF Analytics", demand: "+65% YoY demand" }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Skill Intelligence Profile
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            CareerOS AI engine is actively mapping your developer credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-[#E5E9F0] text-[#111827] font-semibold text-xs rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-all cursor-pointer flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[#4B5563]" />
            Export profile
          </button>
          
          <button className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-white/10" />
            Ask AI Mentor
          </button>
        </div>
      </div>

      {/* Top 3 Columns: Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topCategories.map((cat, idx) => (
          <div key={idx} className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#111827]">{cat.name}</span>
              <span className={`text-sm font-black ${cat.color}`}>{cat.score}%</span>
            </div>
            
            {/* Custom Progress Bar */}
            <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#6366F1]" style={{ width: `${cat.score}%` }}></div>
            </div>

            {/* Sub-tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cat.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className="text-[9px] px-2 py-0.5 rounded-md border border-[#E5E9F0] bg-[#FAFBFC] font-semibold text-[#6B7280]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Layout Split: Left Mastery, Right Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Area: Algorithmic & Platform Mastery Details */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            Algorithmic & Platform Mastery Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {masteryGrid.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm flex flex-col justify-between h-[150px]">
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#111827] leading-tight">{m.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <span className="text-[11px] text-[#9CA3AF] font-bold uppercase">{m.level}</span>
                    <span className="text-2xl font-black text-[#111827] flex items-center gap-1 leading-none">
                      {m.score}
                      {m.trend === 'up' ? (
                        <ArrowUpRight className="w-5 h-5 text-[#10B981] shrink-0" />
                      ) : (
                        <span className="text-[#9CA3AF] text-sm font-bold shrink-0 ml-1">—</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-[#F3F4F6] pt-3 text-[10px] text-[#9CA3AF] font-semibold">
                    {m.footer}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Priority Gap Analysis & Trending Skills */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Priority Skill Gap Analysis */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
              Priority Skill Gap Analysis
            </h3>

            <div className="space-y-4">
              {gapAnalysis.map((gap, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#374151]">{gap.name}</h4>
                    <span className={`text-[10px] font-bold ${gap.deltaColor}`}>{gap.delta}</span>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${gap.priorityBg}`}>
                    {gap.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Skills for Staff Roles */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
              Trending Skills for Staff Roles
            </h3>

            <div className="space-y-4">
              {trendingSkills.map((tr, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[#4B5563]">
                  <span>{tr.name}</span>
                  <span className="text-[#10B981] font-bold text-[10px]">
                    {tr.demand}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
