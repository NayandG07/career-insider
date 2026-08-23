import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './pages/Overview';
import Profile from './pages/Profile';
import SkillsEvidence from './pages/SkillsEvidence';
import Sources from './pages/Sources';
import Projects from './pages/Projects';
import PortfolioHealth from './pages/PortfolioHealth';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

function MainAppContent() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview setActivePage={setActivePage} />;
      case 'profile':
        return <Profile />;
      case 'skills':
        return <SkillsEvidence />;
      case 'sources':
        return <Sources />;
      case 'projects':
        return <Projects />;
      case 'portfolio-health':
        return <PortfolioHealth />;
      case 'recommendations':
        return <Recommendations />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview setActivePage={setActivePage} />;
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
        style={{ paddingLeft: sidebarCollapsed ? '80px' : '280px' }}
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
