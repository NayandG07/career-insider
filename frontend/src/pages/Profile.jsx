import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Github, 
  Code, 
  Award, 
  Terminal, 
  FolderGit2, 
  Globe, 
  FileText, 
  ArrowUpRight, 
  ShieldCheck, 
  Check, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Linkedin,
  Twitter,
  Briefcase,
  Layers,
  Zap,
  Edit3,
  Building,
  Clock,
  Plus,
  Mail,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { codeforcesService } from '../services/codeforcesService';
import { leetcodeService } from '../services/leetcodeService';
import { githubService } from '../services/githubService';
import { projectService } from '../services/projectService';
import EditProfileModal from '../components/EditProfileModal';

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
  const { userData, skills, telemetry, refreshUser } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Real DB-stored education list
  const displayEducationList = useMemo(() => {
    if (Array.isArray(userData?.educationList) && userData.educationList.length > 0) {
      return userData.educationList.filter(e => e.institution?.trim() || e.degree?.trim());
    }
    if (userData?.education?.institution || userData?.education?.degree) {
      return [userData.education];
    }
    return [];
  }, [userData]);
  
  // High-level source summaries
  const [cfSummary, setCfSummary] = useState(null);
  const [lcSummary, setLcSummary] = useState(null);
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

    const ghUser = userData?.connectedSources?.github || userData?.auth?.github?.username;
    if (ghUser) {
      if (telemetry?.sources?.github?.data) {
        setGhSummary(telemetry.sources.github.data);
      } else {
        githubService.getProfile()
          .then(res => { if (res?.data) setGhSummary(res.data); })
          .catch(() => {});
      }
    }
  }, [userData, telemetry]);

  const ghHandle = userData?.connectedSources?.github || userData?.auth?.github?.username || '';
  const lcHandle = userData?.connectedSources?.leetcode || '';
  const cfHandle = userData?.connectedSources?.codeforces || '';

  const sourcesList = [
    {
      key: 'github',
      name: 'GitHub',
      icon: Github,
      connected: !!ghHandle,
      handle: ghHandle ? `@${ghHandle}` : 'Not connected',
      stat: ghSummary?.publicRepos ? `${ghSummary.publicRepos} Repositories` : (ghHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.github?.fetchedAt || userData?.lastSyncedAt,
      url: ghHandle ? `https://github.com/${ghHandle}` : null,
    },
    {
      key: 'leetcode',
      name: 'LeetCode',
      icon: Code,
      connected: !!lcHandle,
      handle: lcHandle ? `@${lcHandle}` : 'Not connected',
      stat: lcSummary?.totalSolved ? `${lcSummary.totalSolved} Problems Solved` : (lcHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.leetcode?.fetchedAt || userData?.lastSyncedAt,
      url: lcHandle ? `https://leetcode.com/${lcHandle}` : null,
    },
    {
      key: 'codeforces',
      name: 'Codeforces',
      icon: Award,
      connected: !!cfHandle,
      handle: cfHandle ? `@${cfHandle}` : 'Not connected',
      stat: cfSummary?.rating ? `${cfSummary.rating} Rating (${cfSummary.rank || 'Ranked'})` : (cfHandle ? 'Connected' : 'Not connected'),
      lastSynced: telemetry?.sources?.codeforces?.fetchedAt || userData?.lastSyncedAt,
      url: cfHandle ? `https://codeforces.com/profile/${cfHandle}` : null,
    },
    {
      key: 'resume',
      name: 'Resume & Skills',
      icon: FileText,
      connected: !!(skills && skills.length > 0),
      handle: skills?.length ? `${skills.length} Parsed Skills` : 'Not uploaded',
      stat: skills?.length ? `${skills.length} Verified Skills` : 'Not uploaded',
      lastSynced: userData?.updatedAt,
      url: null,
    },
    {
      key: 'projects',
      name: 'Showcase Projects',
      icon: FolderGit2,
      connected: projects.length > 0,
      handle: `${projects.length} Projects`,
      stat: `${projects.length} Showcase Projects`,
      lastSynced: projects[0]?.updatedAt || userData?.updatedAt,
      url: null,
    },
  ];

  const activeSourcesCount = sourcesList.filter(s => s.connected).length;
  const totalSourcesCount = sourcesList.length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* 1. Profile Header — Identity, Status & Fast Actions */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          
          {/* User Avatar & Identity Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left flex-1 min-w-0">
            <div className="relative shrink-0">
              {userData?.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData?.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#EEF2FF] shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white font-black text-3xl shadow-xs">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Active">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight truncate">
                  {userData?.name || 'Developer Profile'}
                </h1>
                
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {userData?.role === 'admin' ? 'ADMINISTRATOR' : 'VERIFIED DEVELOPER'}
                </span>

                {userData?.professionalRole && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#F1F5F9] text-gray-700 rounded-md border border-[#E2E8F0]">
                    {userData.professionalRole}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-[#4B5563] font-medium max-w-2xl leading-relaxed">
                {userData?.bio || 'Full-Stack Developer • Competitive Programmer • Systems & Architecture Enthusiast'}
              </p>

              {/* Career Direction Tags & Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {userData?.careerDirections?.length > 0 ? (
                  userData.careerDirections.map((dir, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-[#7C3AED] rounded-md border border-purple-100">
                      {dir}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-[#7C3AED] rounded-md border border-purple-100">
                    Full-Stack Software Engineering
                  </span>
                )}

                {userData?.experience && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200">
                    {userData.experience} experience
                  </span>
                )}

                {/* Social Links if declared */}
                {userData?.socialLinks?.github && (
                  <a 
                    href={userData.socialLinks.github.startsWith('http') ? userData.socialLinks.github : `https://${userData.socialLinks.github}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 bg-[#FAFBFC] hover:bg-white text-gray-600 hover:text-[#111827] border border-[#E5E9F0] rounded-md transition-all shadow-2xs"
                    title="GitHub Profile"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                )}
                {userData?.socialLinks?.linkedin && (
                  <a 
                    href={userData.socialLinks.linkedin.startsWith('http') ? userData.socialLinks.linkedin : `https://${userData.socialLinks.linkedin}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 bg-[#FAFBFC] hover:bg-white text-blue-600 hover:text-blue-700 border border-[#E5E9F0] rounded-md transition-all shadow-2xs"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
                {userData?.socialLinks?.twitter && (
                  <a 
                    href={userData.socialLinks.twitter.startsWith('http') ? userData.socialLinks.twitter : `https://${userData.socialLinks.twitter}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 bg-[#FAFBFC] hover:bg-white text-sky-500 hover:text-sky-600 border border-[#E5E9F0] rounded-md transition-all shadow-2xs"
                    title="Twitter Profile"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Profile Actions & Identity Card */}
          <div className="bg-[#FAFBFD] rounded-2xl p-4 sm:p-5 border border-[#E5E9F0] w-full lg:w-64 shrink-0 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                Profile Status
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md inline-flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Active
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-medium">Last Synced</div>
              <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{formatRelativeTime(userData?.lastSyncedAt || userData?.updatedAt)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Key Developer Metrics — Distinct Multi-Platform Engineering Footprint */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Showcase Projects */}
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left transition-all hover:border-[#7C3AED]/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Showcase Projects</span>
            <FolderGit2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-xl font-black text-[#111827] mt-1 block">{projects.length}</span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">
            {projects.filter(p => p.isImported).length} GitHub • {projects.filter(p => !p.isImported).length} Custom
          </span>
        </div>

        {/* Metric 2: Codebase & Repositories */}
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left transition-all hover:border-[#7C3AED]/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">GitHub Repos</span>
            <Github className="w-3.5 h-3.5 text-gray-800" />
          </div>
          <span className="text-xl font-black text-[#111827] mt-1 block">
            {ghSummary?.publicRepos !== undefined ? ghSummary.publicRepos : (ghHandle ? 'Connected' : '0')}
          </span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5 truncate">
            {ghHandle ? `@${ghHandle}` : 'No account linked'}
          </span>
        </div>

        {/* Metric 3: Algorithmic Problem Solving */}
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left transition-all hover:border-[#7C3AED]/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">LeetCode Solved</span>
            <Code className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-xl font-black text-[#111827] mt-1 block">
            {lcSummary?.totalSolved !== undefined ? lcSummary.totalSolved : (lcHandle ? 'Connected' : '0')}
          </span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5 truncate">
            {lcHandle ? `@${lcHandle}` : 'No handle connected'}
          </span>
        </div>

        {/* Metric 4: Competitive Codeforces Tier */}
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs text-left transition-all hover:border-[#7C3AED]/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Codeforces Rating</span>
            <Award className="w-3.5 h-3.5 text-[#7C3AED]" />
          </div>
          <span className="text-xl font-black text-[#7C3AED] mt-1 block">
            {cfSummary?.rating || (cfHandle ? 'Connected' : 'Unrated')}
          </span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5 capitalize truncate">
            {cfSummary?.rank || (cfHandle ? `@${cfHandle}` : 'No handle connected')}
          </span>
        </div>
      </div>

      {/* 3. Developer Footprint & Ecosystem Connectivity */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-sm font-bold text-[#111827]">Ecosystem Footprint & Integrations</h2>
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">
            {activeSourcesCount} Active • {totalSourcesCount - activeSourcesCount} Disconnected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sourcesList.map((source) => {
            const Icon = source.icon;
            return (
              <div 
                key={source.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  source.connected 
                    ? 'bg-[#FAFBFC] border-[#E5E9F0] hover:border-[#7C3AED]/30 hover:bg-white shadow-2xs' 
                    : 'bg-gray-50/50 border-dashed border-gray-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      source.connected ? 'bg-white border border-[#E5E9F0] text-[#7C3AED] shadow-2xs' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-xs font-bold text-[#111827] truncate">{source.name}</h3>
                        {source.url && (
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-gray-400 hover:text-[#7C3AED]"
                            title="Open external profile"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500 block truncate max-w-[130px]">
                        {source.handle}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                    source.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {source.connected ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : null}
                    {source.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F3F4F6] text-[10px] font-semibold">
                  <span className="text-gray-700 font-bold truncate max-w-[160px]">{source.stat}</span>
                  <span className="text-gray-400 shrink-0">{formatRelativeTime(source.lastSynced)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Projects Snapshot & Educational Qualifications (Connected Vertical Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Projects Snapshot */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-4">
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFBFC] hover:bg-white border border-[#E5E9F0] hover:border-[#7C3AED]/30 transition-all shadow-2xs"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-[#111827] truncate">{p.title}</h3>
                        {p.isImported && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-purple-50 text-[#7C3AED] rounded border border-purple-100 shrink-0">
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
              <div className="p-8 text-center bg-[#FAFBFC] rounded-2xl border border-dashed border-[#E5E9F0] space-y-2">
                <FolderGit2 className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-semibold">
                  No showcase projects added yet.
                </p>
                {setActivePage && (
                  <button
                    type="button"
                    onClick={() => setActivePage('projects')}
                    className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Add Project</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {projects.length > 4 && setActivePage && (
            <div className="pt-2 text-center border-t border-[#F3F4F6]">
              <button 
                onClick={() => setActivePage('projects')}
                className="text-xs font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>+{projects.length - 4} more projects in catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Educational Qualifications (Connected Vertical Timeline) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="text-sm font-bold text-[#111827]">Educational Qualifications</h2>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-xs font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Edit</span>
              </button>
            </div>

            {displayEducationList.length > 0 ? (
              <div className="relative pl-9 sm:pl-10 space-y-5 pt-1">
                {/* Continuous vertical timeline connector line */}
                <div 
                  className="absolute left-[15px] sm:left-[17px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#7C3AED] via-purple-300 to-purple-100 rounded-full" 
                  aria-hidden="true"
                />

                {displayEducationList.map((edu, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative group flex items-center">
                      {/* Timeline Node Icon Indicator - perfectly centered vertically with card */}
                      <div className={`absolute -left-9 sm:-left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                        isLatest 
                          ? 'bg-[#7C3AED] border-purple-200 text-white shadow-xs scale-105' 
                          : 'bg-white border-[#7C3AED]/40 text-[#7C3AED] group-hover:border-[#7C3AED] shadow-2xs'
                      }`}>
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>

                      {/* Timeline Node Content Card */}
                      <div className="w-full bg-[#FAFBFD] group-hover:bg-white rounded-2xl p-4 border border-[#E5E9F0] group-hover:border-[#7C3AED]/30 transition-all shadow-2xs space-y-2.5">
                        
                        {/* Degree Title and Year Pill */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-[#111827] leading-snug">
                                {edu.degree || 'Degree / Qualification'}
                              </h3>
                              {isLatest && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 shrink-0">
                                  Current / Primary
                                </span>
                              )}
                            </div>
                            {edu.course && (
                              <p className="text-[11px] font-semibold text-[#7C3AED]">
                                {edu.course}
                              </p>
                            )}
                          </div>

                          {edu.year && (
                            <span className="text-[10px] font-mono font-bold text-gray-600 bg-white px-2.5 py-0.5 rounded-md border border-[#E2E8F0] shadow-2xs shrink-0 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-gray-400" />
                              {edu.year}
                            </span>
                          )}
                        </div>

                        {/* Institution and Location */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F3F4F6] text-xs">
                          <div className="flex items-center gap-1.5 text-gray-700 font-semibold min-w-0">
                            <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[220px]">
                              {edu.institution || 'University / Institution'}
                            </span>
                          </div>

                          {edu.location && (
                            <div className="flex items-center gap-1 text-[11px] text-[#6B7280] font-medium shrink-0">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{edu.location}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#FAFBFC] rounded-2xl border border-dashed border-[#E5E9F0] space-y-2">
                <GraduationCap className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-semibold">
                  No educational qualifications added yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Add Qualification</span>
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 text-center border-t border-[#F3F4F6]">
            <button 
              type="button"
              onClick={() => setShowEditModal(true)}
              className="text-xs font-bold text-gray-500 hover:text-[#7C3AED] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage academic details</span>
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
        onProfileUpdated={refreshUser}
      />

    </div>
  );
}

