import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Target } from 'lucide-react';

interface ServiceGaugeProps {
  percentage: number;
  target: number;
  rating: number;
  delay?: number;
}

export const ServiceGauge: React.FC<ServiceGaugeProps> = ({
  percentage = 76.5,
  target = 75,
  rating = 4.6,
  delay = 0.1,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 h-full"
    >
      {/* Radial Service Level */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              className="text-emerald-500"
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs font-black text-slate-900">{percentage}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Service SLA</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Target {target}%</div>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 mt-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            SLA Met
          </span>
        </div>
      </div>

      <div className="hidden sm:block h-10 w-px bg-slate-100" />

      {/* Citizen Feedback Rating */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Smile className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Feedback</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">{rating}</span>
            <span className="text-[10px] text-slate-400 font-semibold">/ 5.0</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
