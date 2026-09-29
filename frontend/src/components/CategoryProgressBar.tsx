import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { Category } from '../types';

interface CategoryItem {
  label: string;
  category?: Category;
  percentage: number;
  count?: number;
  color: string;
}

interface CategoryProgressBarProps {
  categoryStats?: Record<Category, number>;
  total?: number;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({
  categoryStats,
  total = 100,
}) => {
  // If stats provided, compute percentage, else provide realistic defaults matching the mockup
  const defaultItems: CategoryItem[] = [
    { label: 'Amenities Petitions', percentage: 82, color: 'bg-blue-600' },
    { label: 'Borewell & Watersupply', percentage: 32, color: 'bg-orange-500' },
    { label: 'Bus Stand Maintenance', percentage: 32, color: 'bg-emerald-500' },
    { label: 'Canal Cleaning', percentage: 32, color: 'bg-cyan-500' },
  ];

  const items: CategoryItem[] = categoryStats && total > 0
    ? [
        {
          label: 'Water & Supply',
          category: Category.water,
          count: categoryStats[Category.water] || 0,
          percentage: Math.min(100, Math.round(((categoryStats[Category.water] || 0) / total) * 100)),
          color: 'bg-blue-600',
        },
        {
          label: 'Electricity & Power',
          category: Category.electricity,
          count: categoryStats[Category.electricity] || 0,
          percentage: Math.min(100, Math.round(((categoryStats[Category.electricity] || 0) / total) * 100)),
          color: 'bg-amber-500',
        },
        {
          label: 'Sanitation & Waste',
          category: Category.sanitation,
          count: categoryStats[Category.sanitation] || 0,
          percentage: Math.min(100, Math.round(((categoryStats[Category.sanitation] || 0) / total) * 100)),
          color: 'bg-cyan-500',
        },
        {
          label: 'Roads & Infrastructure',
          category: Category.roads,
          count: categoryStats[Category.roads] || 0,
          percentage: Math.min(100, Math.round(((categoryStats[Category.roads] || 0) / total) * 100)),
          color: 'bg-emerald-500',
        },
        {
          label: 'Streetlights',
          category: Category.streetlights,
          count: categoryStats[Category.streetlights] || 0,
          percentage: Math.min(100, Math.round(((categoryStats[Category.streetlights] || 0) / total) * 100)),
          color: 'bg-purple-500',
        },
        {
          label: 'Other Issues',
          category: Category.other,
          count: categoryStats[Category.other] || 0,
          percentage: Math.min(100, Math.round(((categoryStats[Category.other] || 0) / total) * 100)),
          color: 'bg-slate-500',
        },
      ]
    : defaultItems;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-subtle border border-slate-100/80 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
          Complaints in Category
        </h3>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">{item.label}</span>
              <span className="text-[11px] font-semibold text-slate-500">{item.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
