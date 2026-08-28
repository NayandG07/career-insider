import React, { useState, useEffect } from 'react';
import { DesktopSidebar, MobileDrawer } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import SkillIntelligence from './pages/SkillIntelligence';
import CompanyMatches from './pages/CompanyMatches';
import Projects from './pages/Projects';
import AIMentor from './pages/AIMentor';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

// Additional / Fallback pages
import Sources from './pages/Sources';
import Career from './pages/Career';
import Recommendations from './pages/Recommendations';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminCompanies from './pages/AdminCompanies';
import AdminSkills from './pages/AdminSkills';
import AdminActivity from './pages/AdminActivity';
import AdminSettings from './pages/AdminSettings';

import { motion, AnimatePresence } from 'motion/react';
import { ShieldOff } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';

/** Shown when a non-admin user tries to access an admin-only route */
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <ShieldOff className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-[#111827]">Access Denied</h2>
      <p className="text-sm text-[#6B7280] font-semibold max-w-xs">
        This page is restricted to admin users only. Contact your administrator if you believe this is a mistake.
      </p>
    </div>
  );
}

// ─── Hash ↔ authView mapping ───────────────────────────────────────────────────
// Maps URL hash fragments to authView state values so the public route survives
// a page refresh. Uses hash routing to avoid needing server-side config.
const HASH_TO_VIEW = {
  '#/signin': 'login',
  '#/signup': 'signup',
};

const VIEW_TO_HASH = {
  landing: '/',
  login: '#/signin',
  signup: '#/signup',
};

function getInitialAuthView() {
  const hash = window.location.hash;
  return HASH_TO_VIEW[hash] ?? 'landing';
}

function getInitialActivePage(isAdmin) {
  const hashRaw = (window.location.hash || '').replace('#', '');
  const basePage = hashRaw.split('/')[0] || '';
  const search = window.location.search || '';
  
  if (search.includes('github')) {
    return 'settings';
  }

  const VALID_PAGES = [
    'dashboard',
    'roadmap',
    'skills',
    'companies',
    'projects',
    'ai-mentor',
    'reports',
    'settings',
    'admin'
  ];

  if (VALID_PAGES.includes(basePage)) {
    if (basePage === 'admin' && !isAdmin) {
      return 'dashboard';
    }
    return basePage;
  }

  if (isAdmin) {
    return 'admin';
  }
  return 'dashboard';
}

// ─── Authenticated Main App ────────────────────────────────────────────────────

function MainAppContent() {
  const { isAdmin } = useApp();
  const [activePage, setActivePage] = useState(() => getInitialActivePage(isAdmin));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (activePage) {
      const currentHash = window.location.hash || '';
      if (!currentHash.startsWith(`#${activePage}`)) {
        window.location.hash = `#${activePage}`;
      }
    }
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      // Restored TEMP Nav Views
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'roadmap':
        return <Roadmap setActivePage={setActivePage} />;
      case 'skills':
        return <SkillIntelligence setActivePage={setActivePage} />;
      case 'companies':
        return <CompanyMatches />;
      case 'projects':
        return <Projects setActivePage={setActivePage} />;
      case 'ai-mentor':
        return <AIMentor />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return isAdmin ? <Admin /> : <AccessDenied />;

      // Fallback / Legacy User & Admin Views
      case 'sources':
        return <Sources />;
      case 'career':
        return <Career />;
      case 'recommendations':
        return <Recommendations />;
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboard /> : <AccessDenied />;
      case 'admin-users':
        return isAdmin ? <AdminUsers /> : <AccessDenied />;
      case 'admin-integrations':
        return isAdmin ? <AdminIntegrations /> : <AccessDenied />;
      case 'admin-companies':
        return isAdmin ? <AdminCompanies /> : <AccessDenied />;
      case 'admin-skills':
        return isAdmin ? <AdminSkills /> : <AccessDenied />;
      case 'admin-activity':
        return isAdmin ? <AdminActivity /> : <AccessDenied />;
      case 'admin-settings':
        return isAdmin ? <AdminSettings /> : <AccessDenied />;

      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] font-sans text-[#111827]">

      {/* Desktop Sidebar — hidden on mobile via CSS */}
      <div className="hidden md:block">
        <DesktopSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Drawer — rendered in DOM but only visible when open */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-[260px] ${
          sidebarCollapsed ? 'md:!pl-[72px]' : ''
        }`}
      >
        {/* Sticky Glass Navbar */}
        <Topbar
          activePage={activePage}
          setActivePage={setActivePage}
          onMenuToggle={() => setMobileDrawerOpen(true)}
        />

        {/* Dynamic Content Body with Smooth Page Transitions */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 w-full max-w-[1280px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────

function AppRouter() {
  const { isAuthenticated, isLoading } = useApp();

  // authView is initialized from the URL hash so page refresh preserves the
  // current public route (landing / sign-in / sign-up).
  const [authView, setAuthView] = useState(getInitialAuthView);

  // Keep the URL hash in sync whenever authView changes.
  const handleSetAuthView = (view) => {
    setAuthView(view);
    const hash = VIEW_TO_HASH[view] ?? '/';
    // Use replaceState so we don't pollute the browser history with auth tab switches.
    window.history.replaceState(null, '', hash === '/' ? window.location.pathname : hash);
  };

  // Sync authView if the user manually changes the hash in the address bar.
  useEffect(() => {
    const onHashChange = () => {
      const view = HASH_TO_VIEW[window.location.hash];
      if (view) setAuthView(view);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FC]">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <MainAppContent />;
  }

  // Unauthenticated routing — public routes stay on the current route
  if (authView === 'login' || authView === 'signup') {
    return <Login view={authView} setAuthView={handleSetAuthView} />;
  }

  return <Landing setAuthView={handleSetAuthView} />;
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        {/* ToastContainer is outside AppProvider so toasts render above everything */}
        <ToastContainer />
        <AppRouter />
      </AppProvider>
    </ToastProvider>
  );
}
