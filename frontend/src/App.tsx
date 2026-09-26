import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'submit' | 'dashboard' | 'stats'>('submit');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
            CP
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">CivicPulse Platform</h1>
        </div>
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'submit' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Submit Complaint
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'dashboard' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Operations Dashboard
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'stats' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Stats
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-8 backdrop-blur text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to CivicPulse</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Municipal complaint intake, automated AI-driven triage, and resilient operations platform.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-900/50 text-teal-300 border border-teal-700">
              React 18 + Vite
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-900/50 text-cyan-300 border border-cyan-700">
              Tailwind CSS v3
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-700">
              FastAPI Ready
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        CivicPulse — CS4032 Software Construction and Design
      </footer>
    </div>
  );
}
