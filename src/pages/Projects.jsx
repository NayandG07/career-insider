import React, { useState } from 'react';
import { 
  FolderGit2, 
  Github, 
  FileText, 
  Globe, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');

  const projectsInventory = [
    {
      id: 1,
      name: "Scaling Distributed DB Cache",
      desc: "Architected write-through sharding query cache filters for Postgres cluster engines. Resolved index retrieval bottlenecks during peak concurrent connections.",
      techs: ["Go", "Redis", "Postgres", "Docker"],
      repo: "https://github.com/arivera/scaling-distributed-db",
      demo: "https://cache-demo.arivera.dev",
      sources: ["github", "resume"], // Merged!
      skills: ["System Design", "Database Tuning"],
      evidence: "Verified via Git commit history & resume project telemetry.",
      activity: "Active (2 commits last week)"
    },
    {
      id: 2,
      name: "Workspace syncing client (Linear sync clone)",
      desc: "Designed client-side state engines for syncing databases locally and handling conflicts smoothly when offline database reconnections happen.",
      techs: ["TypeScript", "React", "IndexedDB", "WebSockets"],
      repo: "https://github.com/arivera/sync-client",
      demo: "https://sync-demo.arivera.dev",
      sources: ["github", "resume", "portfolio"], // Merged!
      skills: ["Frontend Architecture", "TypeScript & React"],
      evidence: "Tri-source verified: GitHub repository, Resume biography, and Portfolio live link validation.",
      activity: "Merged & Deduplicated (Synced 2h ago)"
    },
    {
      id: 3,
      name: "Interactive telemetry UI dashboard",
      desc: "Built high-frequency telemetry charting dashboards rendering 10k messages/second with canvas systems and performance virtualizations.",
      techs: ["React", "HTML5 Canvas", "D3.js", "Tailwind CSS"],
      repo: "https://github.com/arivera/telemetry-ui",
      demo: "",
      sources: ["github", "portfolio"], // Merged!
      skills: ["Frontend Architecture", "TypeScript & React"],
      evidence: "Verified via GitHub repository tags and portfolio portfolio layout checks.",
      activity: "Static Snapshot (Synced 1d ago)"
    },
    {
      id: 4,
      name: "Customer payment integrations flow",
      desc: "Scaled frontend payment widget flows for dynamic currency conversions and multi-method checkout sessions.",
      techs: ["JavaScript", "Stripe API", "CSS Modules"],
      repo: "",
      demo: "",
      sources: ["resume"], // Resume only
      skills: ["Frontend Architecture"],
      evidence: "Extracted from CV profile under Stripe Experience History.",
      activity: "Extracted from Document (Parsed 2w ago)"
    }
  ];

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Normalized Projects Inventory</h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Deduplicated inventory compiling project references from GitHub, Resumes, and Portfolios into unified representations.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Custom Project
        </motion.button>
      </div>

      {/* Consolidation Alert */}
      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-3xl p-5 flex items-start gap-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold">Multi-source Project Deduplication Engine Active</h4>
          <p className="text-[11px] leading-relaxed text-emerald-700/90 font-semibold">
            The ProjectAdapter scanning pipeline checks repository names, descriptions, and experience histories. Multiple representations of the same project are merged under unified records.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Filter projects by technology or detected skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectsInventory.map((proj) => (
          <motion.div 
            key={proj.id}
            whileHover={{ y: -3 }}
            className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] leading-tight">{proj.name}</h4>
                    <span className="text-[10px] text-[#9CA3AF] font-bold block mt-0.5">{proj.activity}</span>
                  </div>
                </div>

                {/* Sources list icons */}
                <div className="flex items-center gap-1.5 bg-[#F9FAFB] border border-[#E5E9F0] px-2 py-1 rounded-lg">
                  {proj.sources.includes("github") && <Github className="w-3.5 h-3.5 text-[#111827]" title="Linked to GitHub repo" />}
                  {proj.sources.includes("resume") && <FileText className="w-3.5 h-3.5 text-rose-500" title="Extracted from Resume PDF" />}
                  {proj.sources.includes("portfolio") && <Globe className="w-3.5 h-3.5 text-violet-600" title="Listed on Portfolio website" />}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                {proj.desc}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5">
                {proj.techs.map((tc, idx) => (
                  <span key={idx} className="text-[9px] px-2 py-0.5 rounded-md border border-[#E5E9F0] bg-[#FAFBFC] font-semibold text-[#6B7280]">
                    {tc}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions and Evidence */}
            <div className="border-t border-[#F3F4F6] pt-4 mt-6 space-y-3">
              <div className="bg-[#FAFBFC] rounded-xl p-3 text-[10px] text-[#9CA3AF] font-semibold flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5 fill-[#7C3AED]/10 animate-pulse" />
                <span>
                  <strong className="text-[#4B5563]">Detected Evidence:</strong> {proj.evidence}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                {proj.repo && (
                  <a href={proj.repo} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#6B7280] hover:text-[#111827] flex items-center gap-1 cursor-pointer">
                    Repository
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {proj.demo && (
                  <a href={proj.demo} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#6366F1] hover:underline flex items-center gap-1 cursor-pointer">
                    Live Demo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

          </motion.div>
        ))}
      </div>

    </div>
  );
}
