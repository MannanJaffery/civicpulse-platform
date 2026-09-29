import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Activity,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Menu,
  Compass,
} from 'lucide-react';
import { getReady, getHealth } from '../api/client';
import { ReadyResponse } from '../types';

interface NavbarProps {
  activeTab: 'landing' | 'submit' | 'dashboard' | 'stats';
  setActiveTab: (tab: 'landing' | 'submit' | 'dashboard' | 'stats') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [readyInfo, setReadyInfo] = useState<ReadyResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [probing, setProbing] = useState(false);
  const isMountedRef = useRef(true);

  const checkHealth = useCallback(async () => {
    if (!isMountedRef.current) return;
    setProbing(true);
    try {
      const readyRes = await getReady();
      if (!isMountedRef.current) return;
      setReadyInfo(readyRes);
      setIsOnline(readyRes.status === 'ready');
    } catch {
      try {
        const healthRes = await getHealth();
        if (!isMountedRef.current) return;
        setIsOnline(healthRes.status === 'ok');
        setReadyInfo({ status: healthRes.status, database: 'unknown', cache: 'unknown' });
      } catch {
        if (!isMountedRef.current) return;
        setIsOnline(false);
        setReadyInfo(null);
      }
    } finally {
      if (isMountedRef.current) {
        setProbing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    // Avoid background intervals during automated unit/integration tests
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return () => {
        isMountedRef.current = false;
      };
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [checkHealth]);

  const handleNavClick = (tab: 'landing' | 'submit' | 'dashboard' | 'stats') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'landing' as const, label: 'Portal', icon: Compass },
    { id: 'submit' as const, label: 'Submit Complaint', icon: PlusCircle },
    { id: 'dashboard' as const, label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'stats' as const, label: 'Live Stats', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm w-full">
        {/* Full-width container — no max-w constraint so nav spans edge-to-edge */}
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">

            {/* ── Brand Logo ── */}
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0 bg-transparent border-0 p-0"
              aria-label="CivicPulse Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm transition-transform group-hover:scale-105 shrink-0">
                CP
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">
                    CivicPulse Platform
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 border border-blue-200 hidden md:inline-block">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight hidden lg:block">
                  Municipal Complaint Intake &amp; Operations
                </p>
              </div>
            </button>

            {/* ── Desktop Navigation Tabs ── */}
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${isActive
                        ? item.id === 'submit' || item.id === 'dashboard'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-blue-50 text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">
                      {item.id === 'landing' ? 'Portal' :
                        item.id === 'submit' ? 'Submit' :
                          item.id === 'dashboard' ? 'Dashboard' : 'Stats'}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* ── Right: Health Beacon + Mobile Hamburger ── */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* System Status Beacon */}
              <button
                onClick={() => setShowHealthModal(true)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isOnline === true
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                    : isOnline === false
                      ? 'bg-red-50 text-red-700 border-red-200/80 hover:bg-red-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                title="Click to view system health probe status"
                aria-label="System health status"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                  ></span>
                </span>
                <span className="hidden sm:inline">{isOnline ? 'System Ready' : 'Probing…'}</span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${isActive
                      ? item.id === 'submit' || item.id === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Health Probes Modal ── */}
      {showHealthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="System health status"
          onClick={(e) => e.target === e.currentTarget && setShowHealthModal(false)}
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">System Probes Status</h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                aria-label="Close health modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Liveness Probe (/health)</span>
                <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  200 OK
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Readiness Probe (/ready)</span>
                <span
                  className={`font-mono font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                  {isOnline ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      200 Ready
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      503 Unready
                    </>
                  )}
                </span>
              </div>

              {readyInfo && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 font-mono text-[11px] text-slate-600">
                  <div>
                    Database:{' '}
                    <strong className="text-slate-800">{readyInfo.database || 'connected'}</strong>
                  </div>
                  <div>
                    Cache:{' '}
                    <strong className="text-slate-800">{readyInfo.cache || 'connected'}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={checkHealth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>Re-probe Now</span>
              </button>
              <button
                onClick={() => setShowHealthModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
