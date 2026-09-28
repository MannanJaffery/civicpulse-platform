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
      className="bg-white rounded-2xl p-5 shadow-subtle border border-slate-100/80 flex items-center justify-around gap-4"
    >
      {/* Radial Service Level */}
      <div className="flex items-center gap-3">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              className="text-emerald-500"
              strokeWidth="7"
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
            <span className="text-base font-extrabold text-slate-800">{percentage}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service Level</span>
          </div>
          <div className="text-xs font-medium text-slate-400">Target {target}%</div>
          <div className="mt-1">
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              SLA Met
            </span>
          </div>
        </div>
      </div>

      <div className="h-12 w-px bg-slate-200" />

      {/* Citizen Feedback Rating */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Smile className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Feedback Rating</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">{rating}</span>
            <span className="text-xs text-slate-400 font-medium">of 5</span>
          </div>
          <span className="text-[10px] text-slate-400">All time verified</span>
        </div>
      </div>
    </motion.div>
  );
};
