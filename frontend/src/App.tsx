import { useState } from 'react';
import Submit from './pages/Submit';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';

export default function App() {
  const [activeTab, setActiveTab] = useState<'submit' | 'dashboard' | 'stats'>('submit');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">CP</div>
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
        {activeTab === 'submit' && <Submit />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'stats' && <Stats />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        CivicPulse — CS4032 Software Construction and Design
      </footer>
    </div>
  );
}
