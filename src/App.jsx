import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import SkillIntelligence from './pages/SkillIntelligence';
import CompanyMatches from './pages/CompanyMatches';
import AIMentor from './pages/AIMentor';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

function MainAppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'roadmap':
        return <Roadmap />;
      case 'skills':
        return <SkillIntelligence />;
      case 'companies':
        return <CompanyMatches />;
      case 'ai-mentor':
        return <AIMentor />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] font-sans text-[#111827]">
      {/* Navigation Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      {/* Main Container */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ paddingLeft: sidebarCollapsed ? '80px' : '260px' }}
      >
        {/* Sticky Glass Navbar */}
        <Topbar activePage={activePage} setActivePage={setActivePage} />

        {/* Dynamic Content Body with Smooth Page Transitions */}
        <main className="flex-1 px-8 py-8 w-full max-w-[1280px] mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
