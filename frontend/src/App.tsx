import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import Submit from './pages/Submit';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import { Landing } from './pages/Landing';

export type MainTab = 'landing' | 'submit' | 'dashboard' | 'stats';
export type DashboardSubView = 'dashboard' | 'complaints' | 'monitoring';

/** Derive the initial tab from the current browser URL (runs once before React paint) */
function getTabFromPath(): { tab: MainTab; subView: DashboardSubView } {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);

  const queryTab = params.get('tab') as MainTab | null;
  const queryView = params.get('view') as DashboardSubView | null;

  if (queryTab && ['landing', 'submit', 'dashboard', 'stats'].includes(queryTab)) {
    const sv: DashboardSubView =
      queryView && ['dashboard', 'complaints', 'monitoring'].includes(queryView)
        ? (queryView as DashboardSubView)
        : 'dashboard';
    return { tab: queryTab, subView: sv };
  }

  if (path.includes('/dashboard/complaints') || hash.includes('/complaints')) {
    return { tab: 'dashboard', subView: 'complaints' };
  }
  if (path.includes('/dashboard/monitoring') || hash.includes('/monitoring')) {
    return { tab: 'dashboard', subView: 'monitoring' };
  }
  if (path.includes('/dashboard') || hash.includes('/dashboard')) {
    return { tab: 'dashboard', subView: 'dashboard' };
  }
  if (path.includes('/submit') || path.includes('/report') || hash.includes('/submit')) {
    return { tab: 'submit', subView: 'dashboard' };
  }
  if (path.includes('/stats') || path.includes('/telemetry') || hash.includes('/stats')) {
    return { tab: 'stats', subView: 'dashboard' };
  }
  if (path === '/portal' || path === '/landing' || path.startsWith('/portal') || path.startsWith('/landing') || hash.includes('/landing')) {
    return { tab: 'landing', subView: 'dashboard' };
  }
  // Default: show Submit page (preserves App.test.tsx: 'renders Submit view by default')
  return { tab: 'submit', subView: 'dashboard' };
}

export default function App() {
  const initial = getTabFromPath();
  const [activeTab, setActiveTab] = useState<MainTab>(initial.tab);
  const [dashboardSubView, setDashboardSubView] = useState<DashboardSubView>(initial.subView);

  // Keep state in sync when user navigates with browser back/forward
  useEffect(() => {
    const onPop = () => {
      const { tab, subView } = getTabFromPath();
      setActiveTab(tab);
      setDashboardSubView(subView);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    let newPath = `/${tab}`;
    if (tab === 'landing') newPath = '/';
    if (tab === 'dashboard' && dashboardSubView !== 'dashboard') {
      newPath = `/dashboard/${dashboardSubView}`;
    }
    try {
      window.history.pushState({ tab, subView: dashboardSubView }, '', newPath);
    } catch {
      // Fallback for isolated test runners (jsdom)
    }
  };

  const handleDashboardSubViewChange = (view: DashboardSubView) => {
    setDashboardSubView(view);
    const newPath = view === 'dashboard' ? '/dashboard' : `/dashboard/${view}`;
    try {
      window.history.pushState({ tab: 'dashboard', subView: view }, '', newPath);
    } catch {
      // Fallback for isolated test runners (jsdom)
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content — flex-1 so Dashboard can fill remaining viewport height */}
      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1"
            >
              <Landing onNavigate={handleTabChange} />
            </motion.div>
          )}

          {activeTab === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1"
            >
              <Submit />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              /* Full-bleed — no max-width, no horizontal padding — the sidebar + canvas own the layout */
              className="w-full flex-1 flex flex-col"
              style={{ minHeight: 'calc(100vh - 4rem)' }}
            >
              <Dashboard
                initialSubView={dashboardSubView}
                onSubViewChange={handleDashboardSubViewChange}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1"
            >
              <Stats />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer — only shows outside dashboard */}
      {activeTab !== 'dashboard' && (
        <footer className="border-t border-slate-200/80 bg-white py-5 mt-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">Civic Operations</span>
              <span>— CS4032 Software Construction &amp; Design</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>FastAPI + Pydantic v2</span>
              <span>•</span>
              <span>React 18 + Vite + Tailwind</span>
              <span>•</span>
              <span>Multi-Tier AI Triage</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
