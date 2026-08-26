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
  ChevronLeft,
  ChevronRight,
  Shield,
  Terminal,
  X,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

// Restored strictly from TEMP navigation items
const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid },
  { id: 'roadmap', name: 'Career Roadmap', icon: Compass },
  { id: 'skills', name: 'Skill Intelligence', icon: Layers },
  { id: 'companies', name: 'Company Matches', icon: Briefcase },
  { id: 'projects', name: 'Projects', icon: FolderGit2 },
  { id: 'ai-mentor', name: 'AI Mentor', icon: Sparkles },
  { id: 'reports', name: 'Reports', icon: BarChart3 },
  { id: 'settings', name: 'Settings', icon: SettingsIcon },
  { id: 'admin', name: 'Admin', icon: Shield },
];

// ─── Nav Items (shared between drawer and sidebar) ────────────────────────────

function NavItems({ items, activePage, setActivePage, collapsed, onSelect }) {
  const handleItemClick = (item) => {
    setActivePage(item.id);
    onSelect?.();
  };

  return (
    <nav className="px-3 py-4 space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item)}
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

            {isActive && (
              <motion.span
                layoutId="active-indicator"
                className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#7C3AED] rounded-l-md"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function DesktopSidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const { logout } = useApp();

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-[#E5E9F0] flex flex-col z-30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      {/* Top Header */}
      <div className={`h-[72px] flex items-center border-b border-[#E5E9F0] shrink-0 ${
        collapsed ? 'justify-center px-0' : 'justify-between px-5'
      }`}>
        {collapsed ? (
          /* Collapsed: ONLY the uncollapse/expand button, centered */
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg hover:bg-slate-50 border border-slate-200 text-[#4B5563] hover:text-[#111827] cursor-pointer transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          /* Expanded: logo icon + text + collapse button */
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-200 shrink-0 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-white" />
              </motion.div>
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <span className="font-bold text-base text-[#111827] tracking-tight">CareerOS</span>
                <span className="text-[8px] font-bold bg-[#EEF2FF] text-[#6366F1] px-1 py-0.5 rounded uppercase tracking-wider animate-pulse shrink-0">
                  AI NATIVE
                </span>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-md hover:bg-slate-50 border border-slate-100 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <NavItems
          items={menuItems}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
        />
      </div>

      {/* Bottom Logout/Sign out */}
      <div className="p-3 border-t border-[#F3F4F6] shrink-0">
        <motion.button
          onClick={logout}
          whileHover={{ x: collapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#EF4444] hover:bg-red-50 hover:text-red-600 transition-all duration-150 relative cursor-pointer group ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 text-[#EF4444] group-hover:text-red-600" />
          {!collapsed && <span>Log Out</span>}
        </motion.button>
      </div>

    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

export function MobileDrawer({ open, onClose, activePage, setActivePage }) {
  const { logout } = useApp();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed top-0 left-0 h-full w-[260px] bg-white border-r border-[#E5E9F0] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-[72px] flex items-center justify-between px-5 border-b border-[#E5E9F0] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-200">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-[#111827] tracking-tight">CareerOS</span>
                  <span className="text-[8px] font-bold bg-[#EEF2FF] text-[#6366F1] px-1 py-0.5 rounded uppercase tracking-wider animate-pulse">
                    AI NATIVE
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[#E5E9F0] text-[#9CA3AF] hover:text-[#111827] hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto">
              <NavItems
                items={menuItems}
                activePage={activePage}
                setActivePage={setActivePage}
                collapsed={false}
                onSelect={onClose}
              />
            </div>

            {/* Bottom Logout/Sign out */}
            <div className="p-3 border-t border-[#E5E9F0] shrink-0">
              <motion.button
                onClick={() => { logout(); onClose(); }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#EF4444] hover:bg-red-50 hover:text-red-600 transition-all duration-150 relative cursor-pointer group"
              >
                <LogOut className="w-5 h-5 shrink-0 text-[#EF4444] group-hover:text-red-600" />
                <span>Log Out</span>
              </motion.button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Default export (backwards-compatible) ───────────────────────────────────

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  return (
    <DesktopSidebar
      activePage={activePage}
      setActivePage={setActivePage}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />
  );
}

