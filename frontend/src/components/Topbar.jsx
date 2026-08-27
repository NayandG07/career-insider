import React, { useState } from 'react';
import { Search, Bell, Sparkles, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchModal from './ui/search-modal';

export default function Topbar({ activePage, setActivePage, onMenuToggle }) {
  const { userData, telemetry } = useApp();
  const [imageError, setImageError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const rawName = userData?.name || userData?.user?.name || 'User';
  const firstName = rawName.trim().split(' ')[0] || 'User';
  const role = userData?.role === 'admin' ? 'Administrator' : 'Engineer';
  const initial = firstName.charAt(0).toUpperCase();
  const avatarUrl = userData?.avatar || userData?.user?.avatar;

  const searchResults = [
    {
      name: "Dashboard & Ecosystem Overview",
      meta: "Live Telemetry & Activity Stream",
      onClick: () => { setActivePage?.('dashboard'); setSearchOpen(false); },
    },
    {
      name: "Developer Profile",
      meta: "Verified Footprint & Identity",
      onClick: () => { setActivePage?.('profile'); setSearchOpen(false); },
    },
    {
      name: "Showcase Projects",
      meta: "Custom & GitHub Repositories",
      onClick: () => { setActivePage?.('projects'); setSearchOpen(false); },
    },
    {
      name: "Connected Sources & Settings",
      meta: "GitHub, LeetCode, Codeforces",
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
      label: "Showcase Projects",
      shortcut: "J",
      onClick: () => { setActivePage?.('projects'); setSearchOpen(false); },
    },
    {
      label: "Manage Connected Sources",
      shortcut: "S",
      onClick: () => { setActivePage?.('settings'); setSearchOpen(false); },
    },
  ];

  return (
    <>
      <header className="sticky top-0 right-0 left-0 h-[72px] bg-white border-b border-[#E5E9F0] flex items-center justify-between px-4 sm:px-8 z-20 gap-3">

        {/* Hamburger — mobile only */}
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 rounded-lg border border-[#E5E9F0] flex items-center justify-center text-[#4B5563] hover:bg-[#FAFBFC] transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Search Modal Trigger Bar */}
        <div 
          onClick={() => setSearchOpen(true)}
          className="relative hidden sm:flex items-center w-64 md:w-80 xl:w-96 pl-10 pr-4 py-2 border border-[#E5E9F0] rounded-xl bg-[#FAFBFC] hover:bg-[#F3F4F6] text-xs font-semibold text-[#9CA3AF] cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[#7C3AED]/10 focus-within:border-[#7C3AED]"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#9CA3AF]">
            <Search className="w-4 h-4" />
          </span>
          <span className="truncate">Search skills, projects, telemetry…</span>
          <span className="ml-auto px-1.5 py-0.5 border border-[#E5E9F0] bg-white text-[9px] font-bold text-[#9CA3AF] rounded-md shadow-xs pointer-events-none">
            ⌘K
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notification Bell */}
          <button className="relative w-9 h-9 rounded-full border border-[#E5E9F0] flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#FAFBFC] transition-colors cursor-pointer shrink-0">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#7C3AED] rounded-full ring-2 ring-white" />
          </button>

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
