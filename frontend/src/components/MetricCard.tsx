import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value: string | number;
  badgeText?: string;
  badgeType?: 'danger' | 'success' | 'info' | 'warning';
  accentColor?: string;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  title,
  subtitle = 'Last 7 days',
  value,
  badgeText,
  badgeType = 'info',
  accentColor = 'bg-blue-600',
  delay = 0,
}) => {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'danger':
        return 'bg-red-500 text-white font-semibold';
      case 'success':
        return 'bg-emerald-500 text-white font-semibold';
      case 'warning':
        return 'bg-amber-500 text-white font-semibold';
      case 'info':
      default:
        return 'bg-blue-500 text-white font-semibold';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="relative bg-white rounded-2xl p-5 shadow-subtle border border-slate-100/80 flex flex-col justify-between overflow-hidden hover:shadow-premium transition-all duration-200"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-tight">{title}</h4>
            {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          {badgeText && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getBadgeClass()}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Color Accent Line */}
      <div className={`h-1 w-full rounded-full mt-4 ${accentColor} opacity-90`} />
    </motion.div>
  );
};
