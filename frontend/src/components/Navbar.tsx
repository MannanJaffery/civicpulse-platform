import React, { useEffect, useState } from 'react';
import {
  Activity,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
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
  const [probing, setProbing] = useState(false);

  const checkHealth = async () => {
    setProbing(true);
    try {
      const readyRes = await getReady();
      setReadyInfo(readyRes);
      setIsOnline(readyRes.status === 'ready');
    } catch {
      try {
        const healthRes = await getHealth();
        setIsOnline(healthRes.status === 'ok');
        setReadyInfo({ status: healthRes.status, database: 'unknown', cache: 'unknown' });
      } catch {
        setIsOnline(false);
        setReadyInfo(null);
      }
    } finally {
      setProbing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center shadow-gis shadow-blue-500/20 text-white font-black text-lg transition-transform group-hover:scale-105">
                CP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">CivicPulse</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Municipal Intake & AI Triage Platform</p>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('landing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'landing'
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Portal</span>
              </button>

              <button
                onClick={() => setActiveTab('submit')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'submit'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>GIS Operations</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'stats'
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Analytics</span>
              </button>
            </nav>

            {/* System Status Beacon (Clickable to inspect probes) */}
            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-200">
              <button
                onClick={() => setShowHealthModal(true)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isOnline === true
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                    : isOnline === false
                    ? 'bg-red-50 text-red-700 border-red-200/80 hover:bg-red-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Click to view system health probe status"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isOnline ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOnline ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  ></span>
                </span>
                <span>{isOnline ? 'System Ready' : 'Probing Stack'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Health Probes Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">System Probes Status</h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
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
                  className={`font-mono font-bold flex items-center gap-1 ${
                    isOnline ? 'text-emerald-600' : 'text-red-600'
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
                  <div>Database: <strong className="text-slate-800">{readyInfo.database || 'connected'}</strong></div>
                  <div>Cache: <strong className="text-slate-800">{readyInfo.cache || 'connected'}</strong></div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={checkHealth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>Re-probe Now</span>
              </button>
              <button
                onClick={() => setShowHealthModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
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
