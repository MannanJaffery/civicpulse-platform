import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Layers,
  Database,
  BarChart3,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LandingProps {
  onNavigate: (tab: 'landing' | 'submit' | 'dashboard' | 'stats') => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-blue-50/50 via-white to-transparent rounded-3xl border border-blue-100/50 px-6 sm:px-12 text-center">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-400/10 blur-3xl -z-10 rounded-full" />

        {/* Live System Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-900 border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Gen Municipal AI Intake & Triage</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight"
        >
          From Citizen Voice to{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500">
            Field Resolution
          </span>{' '}
          in Milliseconds.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          CivicPulse replaces broken dropdowns with structured AI language models, resilient
          fallbacks, and a real-time Operations Hub for city infrastructure.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={() => onNavigate('submit')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Report an Incident</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Open Operations Hub</span>
          </button>
        </motion.div>

        {/* Quick Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200/60 text-left"
        >
          <div className="p-3 bg-white/70 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Triage Latency
            </span>
            <span className="text-xl font-extrabold text-slate-900">&lt; 1,200 ms</span>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              AI Redundancy
            </span>
            <span className="text-xl font-extrabold text-slate-900">4 Tier Fallback</span>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Redis Rate Limiting
            </span>
            <span className="text-xl font-extrabold text-slate-900">Distributed</span>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Service SLA Target
            </span>
            <span className="text-xl font-extrabold text-emerald-600">76.5% Met</span>
          </div>
        </motion.div>
      </section>

      {/* 3 Pillars Architecture Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Engineered for High-Consequence Public Operations
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Built on a four-layer backend, containerized microservices, and automated AI triage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-7 shadow-subtle border border-slate-100 hover:shadow-premium transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Model AI Classification</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Extracts precise category, priority score, and a strict 140-char summary using Groq
              Llama-3, Gemini Flash, Ollama, or deterministic regex rules.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Prompt Injection Defenses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Deterministic CI Simulator
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-7 shadow-subtle border border-slate-100 hover:shadow-premium transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Operations Hub</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Real-time monitoring console with state machine controls (open → in_progress → resolved
              / rejected) that strictly enforce lifecycle transitions.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Verbatim 409 State Protection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Live Category Progress & Trends
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-7 shadow-subtle border border-slate-100 hover:shadow-premium transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 font-bold">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise Resilience</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Redis 7 doing dual duty: 30s read-through caching with explicit invalidation on writes,
              plus distributed IP token-bucket rate limiting.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                X-Cache HIT / MISS Header Tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                PostgreSQL Alembic Migrations
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-gis flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs uppercase font-bold tracking-widest text-blue-200">
            Ready to deploy or test?
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Experience the automated municipal complaint flow now.
          </h3>
          <p className="text-sm text-blue-100/80">
            Submit a real-world civic complaint and watch our multi-tier AI pipeline classify and
            prioritize it in real time.
          </p>
        </div>
        <button
          onClick={() => onNavigate('submit')}
          className="px-8 py-4 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black text-sm shadow-lg transition-all hover:scale-105 shrink-0"
        >
          Submit Citizen Report
        </button>
      </section>
    </div>
  );
};
