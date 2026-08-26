import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Github, 
  Code, 
  Database,
  Award,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  Layers,
  FolderGit2,
  Activity,
  Globe,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { codeforcesService } from '../services/codeforcesService';
import { leetcodeService } from '../services/leetcodeService';
import { kaggleService } from '../services/kaggleService';
import { githubService } from '../services/githubService';
import { projectService } from '../services/projectService';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Never synced';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Never synced';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

export default function Profile({ setActivePage }) {
  const { userData, skills, telemetry } = useApp();
  
  // High-level source summaries
  const [cfSummary, setCfSummary] = useState(null);
  const [lcSummary, setLcSummary] = useState(null);
  const [kgSummary, setKgSummary] = useState(null);
  const [ghSummary, setGhSummary] = useState(null);
  const [projects, setProjects] = useState([]);

  // Load high-level source summaries once
  useEffect(() => {
    projectService.getAll()
      .then(res => { if (Array.isArray(res)) setProjects(res); })
      .catch(() => {});

    if (userData?.connectedSources?.codeforces) {
      codeforcesService.getProfile()
        .then(res => { if (res?.connected && res.data) setCfSummary(res.data); })
        .catch(() => {});
    }

    if (userData?.connectedSources?.leetcode) {
      leetcodeService.getProfile()
        .then(res => { if (res?.connected && res.data) setLcSummary(res.data); })
        .catch(() => {});
    }

    const kgUser = userData?.connectedSources?.kaggle?.username || (typeof userData?.connectedSources?.kaggle === 'string' ? userData.connectedSources.kaggle : '');
    if (kgUser) {
      kaggleService.getProfile()
        .then(res => { if (res?.connected && res.data) setKgSummary(res.data); })
        .catch(() => {});
    }

    const ghUser = userData?.connectedSources?.github || userData?.auth?.github?.username;
    if (ghUser) {
      if (telemetry?.sources?.github?.data) {
        setGhSummary(telemetry.sources.github.data);
      }
      githubService.getProfile?.()
        .then(res => { if (res?.data) setGhSummary(res.data); })
        .catch(() => {});
    }
  }, [userData, telemetry]);

  // Dynamic Sources State
  const ghHandle = userData?.connectedSources?.github || userData?.auth?.github?.username || '';
  const lcHandle = userData?.connectedSources?.leetcode || '';
  const cfHandle = userData?.connectedSources?.codeforces || '';
  const kgHandle = typeof userData?.connectedSources?.kaggle === 'object'
    ? userData?.connectedSources?.kaggle?.username
    : (userData?.connectedSources?.kaggle || '');

  const sourcesList = [
    {
      key: 'github',
      name: 'GitHub',
      icon: Github,
      connected: !!ghHandle,
      handle: ghHandle ? `@${ghHandle}` : 'Not connected',
      stat: ghSummary?.publicRepos ? `${ghSummary.publicRepos} Repositories` : (ghHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.github?.fetchedAt || userData?.lastSyncedAt,
    },
    {
      key: 'leetcode',
      name: 'LeetCode',
      icon: Code,
      connected: !!lcHandle,
      handle: lcHandle ? `@${lcHandle}` : 'Not connected',
      stat: lcSummary?.totalSolved ? `${lcSummary.totalSolved} Problems Solved` : (lcHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.leetcode?.fetchedAt || userData?.lastSyncedAt,
    },
    {
      key: 'codeforces',
      name: 'Codeforces',
      icon: Award,
      connected: !!cfHandle,
      handle: cfHandle ? `@${cfHandle}` : 'Not connected',
      stat: cfSummary?.rating ? `${cfSummary.rating} Rating (${cfSummary.rank || 'Ranked'})` : (cfHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.codeforces?.fetchedAt || userData?.lastSyncedAt,
    },
    {
      key: 'kaggle',
      name: 'Kaggle',
      icon: Terminal,
      connected: !!kgHandle,
      handle: kgHandle ? `@${kgHandle}` : 'Not connected',
      stat: kgSummary?.datasets?.count || kgSummary?.notebooks?.count ? `${(kgSummary.datasets?.count || 0) + (kgSummary.notebooks?.count || 0)} Artifacts` : (kgHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.kaggle?.fetchedAt || userData?.lastSyncedAt,
    },
    {
      key: 'resume',
      name: 'Resume',
      icon: FileText,
      connected: !!(skills && skills.length > 0),
      handle: skills?.length ? `${skills.length} Parsed Skills` : 'Not uploaded',
      stat: skills?.length ? `${skills.length} Verified Skills` : 'Not uploaded',
      lastSynced: userData?.updatedAt,
    },
    {
      key: 'projects',
      name: 'Projects',
      icon: FolderGit2,
      connected: projects.length > 0,
      handle: `${projects.length} Projects`,
      stat: `${projects.length} Showcase Projects`,
      lastSynced: projects[0]?.updatedAt || userData?.updatedAt,
    },
  ];

  const activeSourcesCount = sourcesList.filter(s => s.connected).length;
  const totalSourcesCount = sourcesList.length;

  const experiences = [
    {
      role: "Full-Stack Developer",
      company: "CareerOS Project Team",
      period: "2024 - Present",
      desc: "Architected the unified developer profile platform aggregating external telemetry across GitHub, Codeforces, LeetCode, and Kaggle."
    },
    {
      role: "Software Engineering Intern",
      company: "Technology Systems Inc.",
      period: "2023 - 2024",
      desc: "Built scalable REST API services, client dashboards, and responsive frontends."
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* 1. Profile Header — Professional Identity & Connectivity Badge */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* User Info Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              {userData?.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData?.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#EEF2FF] shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white font-black text-3xl shadow-sm">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
                  {userData?.name || 'Developer Profile'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#E8F5E9] text-[#137333] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#C8E6C9]">
                  <ShieldCheck className="w-3 h-3" />
                  {userData?.role === 'admin' ? 'ADMINISTRATOR' : 'VERIFIED DEVELOPER'}
                </span>
              </div>
              
              <p className="text-xs text-[#4B5563] font-semibold max-w-xl">
                {userData?.bio || 'Full-Stack Developer • Competitive Programmer • Data & Systems Enthusiast'}
              </p>
              
              {/* Compact Source Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {sourcesList.map((source) => (
                  <span 
                    key={source.key} 
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border transition-all ${
                      source.connected 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'text-[#9CA3AF] bg-[#FAFBFC] border-[#E5E9F0]'
                    }`}
                  >
                    {source.connected ? `✓ ${source.name}` : `○ ${source.name}`}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Health / Connectivity Metric Box */}
          <div className="bg-[#FAFBFC] rounded-2xl p-4 sm:p-5 border border-[#E5E9F0] w-full md:w-64 shrink-0 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                Identity Health
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#7C3AED]">
                  {activeSourcesCount}/{totalSourcesCount}
                </span>
                <span className="text-xs font-bold text-[#111827]">Sources Active</span>
              </div>
            </div>
            <p className="text-[10px] text-[#6B7280] font-semibold leading-relaxed pt-2">
              Cross-platform data verified across competitive and repository footprints.
            </p>
          </div>

        </div>
      </div>

      {/* 2. High-Level Key Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Showcase Projects</span>
          <span className="text-xl font-black text-[#111827] mt-1 block">{projects.length}</span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">
            {projects.filter(p => p.isImported).length} GitHub • {projects.filter(p => !p.isImported).length} Custom
          </span>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Connected Sources</span>
          <span className="text-xl font-black text-[#7C3AED] mt-1 block">{activeSourcesCount} / {totalSourcesCount}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            {totalSourcesCount - activeSourcesCount === 0 ? 'Fully connected' : `${totalSourcesCount - activeSourcesCount} optional`}
          </span>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Verified Skills</span>
          <span className="text-xl font-black text-[#111827] mt-1 block">{skills?.length || 14}</span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">Indexed from resume & sources</span>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Codeforces Status</span>
          <span className="text-xl font-black text-[#7C3AED] mt-1 block">
            {cfSummary?.rating || (cfHandle ? 'Connected' : 'Unrated')}
          </span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5 capitalize">
            {cfSummary?.rank || 'Competitive handle'}
          </span>
        </div>
      </div>

      {/* 3. Developer Footprint — Ecosystem Connectivity Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-sm font-bold text-[#111827]">Developer Footprint & Ecosystem Connectivity</h2>
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">
            {activeSourcesCount} Active • {totalSourcesCount - activeSourcesCount} Disconnected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourcesList.map((source) => {
            const Icon = source.icon;
            return (
              <div 
                key={source.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  source.connected 
                    ? 'bg-[#FAFBFC] border-[#E5E9F0]' 
                    : 'bg-gray-50/60 border-dashed border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      source.connected ? 'bg-white border border-[#E5E9F0] text-[#7C3AED] shadow-xs' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#111827]">{source.name}</h3>
                      <span className="text-[11px] font-semibold text-gray-500 block truncate max-w-[140px]">
                        {source.handle}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    source.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {source.connected ? <Check className="w-2.5 h-2.5" /> : null}
                    {source.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F3F4F6] text-[10px] font-semibold">
                  <span className="text-gray-700 font-bold">{source.stat}</span>
                  <span className="text-gray-400">{formatRelativeTime(source.lastSynced)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Projects Snapshot & Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Projects Snapshot */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-sm font-bold text-[#111827]">Showcase Projects Snapshot</h2>
            </div>
            {setActivePage && (
              <button 
                onClick={() => setActivePage('projects')}
                className="text-xs font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View all ({projects.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {projects.length > 0 ? (
            <div className="space-y-2.5">
              {projects.slice(0, 4).map((p) => (
                <div 
                  key={p._id || p.id} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFBFC] border border-[#E5E9F0]"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#111827] truncate">{p.title}</h3>
                      {p.isImported && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-purple-50 text-[#7C3AED] rounded border border-purple-100">
                          GitHub
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-semibold truncate mt-0.5">
                      {p.description || 'Showcase development project.'}
                    </p>
                  </div>

                  {p.technologies?.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {p.technologies.slice(0, 2).map((tech, idx) => (
                        <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-[#E5E9F0] rounded text-gray-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 font-semibold bg-[#FAFBFC] rounded-2xl border border-dashed border-[#E5E9F0]">
              No showcase projects imported yet.
            </div>
          )}
        </div>

        {/* Right Column: Experience Timeline */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-sm font-bold text-[#111827]">Professional Experience</h2>
            </div>
          </div>

          <div className="relative pl-5 space-y-5 before:absolute before:top-2 before:left-1 before:bottom-2 before:w-0.5 before:bg-[#E5E9F0]">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#7C3AED] border-2 border-white ring-2 ring-[#EEF2FF] shrink-0" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-[#111827]">{exp.role}</h3>
                  <span className="text-[10px] text-[#6B7280] font-semibold block">
                    {exp.company} • {exp.period}
                  </span>
                  <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed pt-0.5">
                    {exp.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
