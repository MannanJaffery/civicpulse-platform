import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Cpu,
  Clock,
  MapPin,
  AlertTriangle,
  Zap,
  Droplets,
  Trash2,
  Footprints,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { Complaint, Category, Priority } from '../types';

interface TriageResultCardProps {
  result: Complaint;
  onReset?: () => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({ result, onReset }) => {
  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.water:
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case Category.electricity:
        return <Zap className="w-4 h-4 text-amber-500" />;
      case Category.sanitation:
        return <Trash2 className="w-4 h-4 text-cyan-500" />;
      case Category.roads:
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      case Category.streetlights:
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
      case Category.other:
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case Priority.high:
        return 'bg-red-500/10 text-red-700 border-red-200 ring-1 ring-red-500/20';
      case Priority.normal:
        return 'bg-amber-500/10 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      case Priority.low:
      default:
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    }
  };

  const isFallback = result.triaged_by?.includes('fallback');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-premium border border-slate-100 relative overflow-hidden"
    >
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Triage Result</h2>
            <p className="text-xs text-slate-500">
              Complaint registered with reference{' '}
              <span className="font-mono font-bold text-slate-700">{result.id.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* Provider Chip */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isFallback
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{result.triaged_by}</span>
          </span>
          {result.triage_latency_ms > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{result.triage_latency_ms}ms</span>
            </span>
          )}
        </div>
      </div>

      {/* Core Structured Triage Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {/* Category Box */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0">
            {getCategoryIcon(result.category)}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Assigned Category
            </span>
            <span className="text-base font-extrabold text-slate-900 capitalize">
              {result.category}
            </span>
          </div>
        </div>

        {/* Priority Box */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Calculated Priority
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${getPriorityStyle(
                result.priority
              )}`}
            >
              {result.priority}
            </span>
          </div>
        </div>
      </div>

      {/* AI Summary Block */}
      {result.ai_summary && (
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/80 mb-6">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-900">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>AI Executive Summary</span>
          </div>
          <p className="text-sm font-medium text-slate-800 italic leading-relaxed">
            "{result.ai_summary}"
          </p>
        </div>
      )}

      {/* Location Details */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 pb-6 border-b border-slate-100">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-700">Location:</span>
        <span className="font-medium text-slate-600 truncate">{result.location}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            Submit Another Complaint
          </button>
        )}
      </div>
    </motion.div>
  );
};
