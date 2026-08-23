import React from 'react';
import { 
  LayoutGrid, 
  Compass, 
  Layers, 
  Briefcase, 
  FolderGit2, 
  BookOpen, 
  Sparkles, 
  BarChart3, 
  Settings as SettingsIcon,
  Github,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid },
    { id: 'roadmap', name: 'Career Roadmap', icon: Compass },
    { id: 'skills', name: 'Skill Intelligence', icon: Layers },
    { id: 'companies', name: 'Company Matches', icon: Briefcase },
    { id: 'projects', name: 'Projects', icon: FolderGit2 },
    { id: 'learning', name: 'Learning Hub', icon: BookOpen },
    { id: 'ai-mentor', name: 'AI Mentor', icon: Sparkles },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 h-screen bg-white border-r border-[#E5E9F0] flex flex-col justify-between z-30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      {/* Top Logo */}
      <div>
        <div className="h-[72px] flex items-center justify-between px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-200 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold text-base text-[#111827] tracking-tight">
                  CareerOS
                </span>
                <span className="text-[8px] font-bold bg-[#EEF2FF] text-[#6366F1] px-1 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  AI NATIVE
                </span>
              </div>
            )}
          </div>
          
          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-slate-50 border border-slate-100 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 relative cursor-pointer group ${
                  isActive 
                    ? 'bg-[#F3F4F6]/50 text-[#7C3AED]' 
                    : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#7C3AED]' : 'text-[#9CA3AF] group-hover:text-[#4B5563]'
                  }`} />
                  {!collapsed && <span>{item.name}</span>}
                </div>

                {/* Right side active vertical indicator bar - spring layoutId animation */}
                {isActive && (
                  <motion.span 
                    layoutId="active-indicator"
                    className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#7C3AED] rounded-l-md"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Status Panel */}
      <div className="p-5 border-t border-[#F3F4F6] bg-[#FAFBFC]/50 space-y-4">
        <div className="flex items-center justify-between">
          {!collapsed && <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Sync Status</span>}
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] mx-auto sm:mx-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            {!collapsed && "LIVE"}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : 'flex-row'}`}>
          {/* Active GitHub Connector */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-8 h-8 rounded-full bg-white border border-[#E5E9F0] shadow-sm flex items-center justify-center text-[#111827] cursor-pointer" 
            title="GitHub connected"
          >
            <Github className="w-4 h-4" />
          </motion.div>
          {/* Greyed/Disabled Connectors */}
          {['LC', 'CF', 'KC'].map((txt, idx) => (
            <div 
              key={idx} 
              className="w-8 h-8 rounded-full bg-[#F3F4F6] border border-[#E5E9F0] flex items-center justify-center text-[9px] font-bold text-[#9CA3AF] cursor-not-allowed"
              title={`${txt} not active`}
            >
              {txt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
