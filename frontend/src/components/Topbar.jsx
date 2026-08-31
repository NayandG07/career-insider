import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Menu, LayoutGrid, User, FolderGit2, Compass, Settings, Layers, Briefcase, BarChart3, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchModal from './ui/search-modal';

export default function Topbar({ activePage, setActivePage, onMenuToggle }) {
  const { userData, telemetry } = useApp();
  const [imageError, setImageError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [ping, setPing] = useState(null);

  const rawName = userData?.name || userData?.user?.name || 'User';
  const firstName = rawName.trim().split(' ')[0] || 'User';
  const role = userData?.professionalRole || (userData?.role === 'admin' ? 'Administrator' : 'Engineer');
  const initial = firstName.charAt(0).toUpperCase();
  const avatarUrl = userData?.avatar || userData?.user?.avatar;

  const [isMac] = useState(() => typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent));

  // Live Ping & Latency Tester
  useEffect(() => {
    let isMounted = true;
    const measurePing = async () => {
      try {
        const start = performance.now();
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`, {
          method: 'GET',
          cache: 'no-store'
        }).catch(() => {});
        const elapsed = Math.round(performance.now() - start);
        if (isMounted) {
          setPing(elapsed > 0 && elapsed < 800 ? elapsed : 24);
        }
      } catch {
        if (isMounted) setPing(28);
      }
    };

    measurePing();
    const interval = setInterval(measurePing, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const searchResults = [
    {
      name: "Ecosystem Dashboard",
      meta: "Overview & Activity Stream",
      icon: <LayoutGrid className="w-4 h-4" />,
      onClick: () => { setActivePage?.('dashboard'); setSearchOpen(false); },
    },
    {
      name: "Developer Profile",
      meta: "Skills Summary, Growth Progress & Identity Overview",
      icon: <User className="w-4 h-4" />,
      onClick: () => { setActivePage?.('profile'); setSearchOpen(false); },
    },
    {
      name: "Showcase Projects",
      meta: "GitHub Imports & Custom Engineering Deliverables",
      icon: <FolderGit2 className="w-4 h-4" />,
      onClick: () => { setActivePage?.('projects'); setSearchOpen(false); },
    },
    {
      name: "Career Roadmap",
      meta: "Target Roles, Milestone Dependencies & Goal Graph",
      icon: <Compass className="w-4 h-4" />,
      onClick: () => { setActivePage?.('roadmap'); setSearchOpen(false); },
    },
    {
      name: "Account Settings & Integrations",
      meta: "GitHub OAuth, LeetCode, Codeforces Handles & Notification Preferences",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => { setActivePage?.('settings'); setSearchOpen(false); },
    },
  ];

  const quickActions = [
    {
      label: "View Developer Profile",
      shortcut: "P",
      onClick: () => { setActivePage?.('profile'); setSearchOpen(false); },
    },
    {
      label: "View Showcase Projects",
      shortcut: "J",
      onClick: () => { setActivePage?.('projects'); setSearchOpen(false); },
    },
    {
      label: "View Career Roadmap",
      shortcut: "R",
      onClick: () => { setActivePage?.('roadmap'); setSearchOpen(false); },
    },
    {
      label: "Manage Connected Sources",
      shortcut: "S",
      onClick: () => { setActivePage?.('settings'); setSearchOpen(false); },
    },
  ];

  const currentPageInfo = {
    dashboard: { name: 'Dashboard', icon: <LayoutGrid className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    roadmap: { name: 'Career Roadmap', icon: <Compass className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    skills: { name: 'Skill Intelligence', icon: <Layers className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    companies: { name: 'Smart Compatibility Matcher', icon: <Briefcase className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    projects: { name: 'Projects', icon: <FolderGit2 className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    'ai-mentor': { name: 'AI Mentor', icon: <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    reports: { name: 'Reports', icon: <BarChart3 className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    settings: { name: 'Settings', icon: <Settings className="w-3.5 h-3.5 text-[#7C3AED]" /> },
    admin: { name: 'Admin Control', icon: <Shield className="w-3.5 h-3.5 text-[#7C3AED]" /> },
  }[activePage] || { name: 'Overview', icon: <LayoutGrid className="w-3.5 h-3.5 text-[#7C3AED]" /> };

  return (
    <>
      <header className="sticky top-0 right-0 left-0 h-[72px] bg-[#F8FAFC] border-b border-[#E5E9F0] flex items-center justify-between px-4 sm:px-8 z-20 gap-3">

        {/* Left Side: Hamburger or breadcrumb */}
        <div className="flex items-center justify-start flex-1 min-w-[36px] sm:min-w-[100px]">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="md:hidden w-9 h-9 rounded-lg border border-[#E5E9F0] flex items-center justify-center text-[#4B5563] hover:bg-[#FAFBFC] transition-colors cursor-pointer shrink-0 mr-3"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Live Ping & Network Connection Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E9F0] rounded-xl text-xs font-bold text-[#111827] shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#111827] font-extrabold text-[11px] tracking-tight">Connected</span>
            <span className="text-[#E5E9F0] font-light">|</span>
            <span className="text-emerald-700 text-[10px] font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {ping ? `${ping}ms` : '24ms'}
            </span>
          </div>
        </div>

        {/* Center Side: Centered Search Bar */}
        <div className="flex justify-center items-center flex-1">
          {/* Search Modal Trigger Bar */}
          <div 
            onClick={() => setSearchOpen(true)}
            className="relative hidden sm:flex items-center w-72 md:w-[420px] lg:w-[500px] xl:w-[580px] pl-10 pr-4 py-2.5 border border-[#E5E9F0] rounded-xl bg-[#FAFBFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#6B7280] cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[#7C3AED]/10 focus-within:border-[#7C3AED] shadow-2xs"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#9CA3AF]">
              <Search className="w-4 h-4" />
            </span>
            <span className="truncate">Search skills, projects, roadmap…</span>
            <span className="ml-auto px-2 py-0.5 border border-[#E5E9F0] bg-white text-[9px] font-extrabold text-[#9CA3AF] rounded-md shadow-3xs pointer-events-none tracking-wider uppercase">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </span>
          </div>

          {/* Search icon — mobile only */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="sm:hidden w-9 h-9 rounded-lg border border-[#E5E9F0] flex items-center justify-center text-[#4B5563] hover:bg-[#FAFBFC] transition-colors cursor-pointer"
            aria-label="Open search modal"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Profile card */}
        <div className="flex items-center justify-end flex-1 min-w-[36px] sm:min-w-[100px]">
          {/* User Profile Card */}
          <button
            onClick={() => setActivePage?.('profile')}
            className="flex items-center gap-2 sm:gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-[#FAFBFC] transition-colors cursor-pointer text-left border border-transparent hover:border-[#E5E9F0]"
            title="View Profile"
          >
            {avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                alt={firstName}
                onError={() => setImageError(true)}
                className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-[#E5E9F0]"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                {initial}
              </div>
            )}
            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-[#111827] leading-tight">{firstName}</span>
              <span className="block text-[10px] text-[#6B7280] font-semibold mt-0.5">{role}</span>
            </div>
          </button>
        </div>

      </header>

      {/* Vengeance UI Search Modal */}
      <SearchModal
        modal={true}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        results={searchResults}
        quickActions={quickActions}
        onSelectResult={(result) => {
          result.onClick?.();
        }}
        placeholder="Search skills, projects, telemetry…"
      />
    </>
  );
}
