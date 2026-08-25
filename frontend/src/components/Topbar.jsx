import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Topbar({ activePage, setActivePage }) {
  const { userData } = useApp();
  const userName = userData?.name || 'User';
  const role = userData?.role === 'admin' ? 'Administrator' : 'Engineer';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 right-0 left-0 h-[72px] bg-white border-b border-[#E5E9F0] flex items-center justify-between px-8 z-20">
      
      {/* Search Input with Command-K indicator */}
      <div className="relative w-80 max-w-xs md:max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#9CA3AF]">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text" 
          placeholder="Search skills, matches, roadmaps..." 
          className="w-full pl-10 pr-12 py-2 border border-[#E5E9F0] rounded-xl bg-[#FAFBFC] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF]"
        />
        <span className="absolute right-3 top-2.5 px-1.5 py-0.5 border border-[#E5E9F0] bg-white text-[9px] font-bold text-[#9CA3AF] rounded-md pointer-events-none">
          ⌘K
        </span>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-full border border-[#E5E9F0] flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#FAFBFC] transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#7C3AED] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Card */}
        <button 
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-[#FAFBFC] transition-colors cursor-pointer text-left"
        >
          {userData?.avatar ? (
            <img 
              src={userData.avatar} 
              alt={userName} 
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
          )}
          <div>
            <span className="block text-xs font-bold text-[#111827] leading-tight">{userName}</span>
            <span className="block text-[10px] text-[#6B7280] font-semibold mt-0.5">{role}</span>
          </div>
        </button>
      </div>

    </header>
  );
}
