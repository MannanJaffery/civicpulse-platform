import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, TrendingUp } from 'lucide-react';

interface ComplaintsTrendChartProps {
  pendingCount?: number;
  inProgressCount?: number;
}

const mockTrendData = [
  { date: 'Feb 01', pending: 180, inProgress: 140 },
  { date: 'Feb 02', pending: 240, inProgress: 200 },
  { date: 'Feb 03', pending: 220, inProgress: 190 },
  { date: 'Feb 04', pending: 280, inProgress: 210 },
  { date: 'Feb 05', pending: 380, inProgress: 340 },
  { date: 'Feb 06', pending: 350, inProgress: 320 },
  { date: 'Feb 07', pending: 390, inProgress: 350 },
  { date: 'Feb 08', pending: 340, inProgress: 290 },
  { date: 'Feb 09', pending: 330, inProgress: 270 },
  { date: 'Feb 10', pending: 231, inProgress: 180 },
  { date: 'Feb 11', pending: 310, inProgress: 270 },
  { date: 'Feb 12', pending: 390, inProgress: 340 },
  { date: 'Feb 13', pending: 460, inProgress: 410 },
];

export const ComplaintsTrendChart: React.FC<ComplaintsTrendChartProps> = ({
  pendingCount = 231,
  inProgressCount = 43,
}) => {
  const timeRange = 'Feb 01 - Feb 14';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-subtle border border-slate-100/80">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Total Complaints</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </h3>
          <p className="text-xs text-slate-400">Incoming municipal reports vs in-progress field resolution</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend Badges */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d70f8]"></span>
              <span>Pending</span>
              <span className="font-extrabold text-blue-900 ml-1">{pendingCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-lg border border-cyan-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff]"></span>
              <span>In Progress</span>
              <span className="font-extrabold text-cyan-900 ml-1">{inProgressCount}</span>
            </div>
          </div>

          {/* Date Picker Button */}
          <div className="relative">
            <button className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d70f8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1d70f8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 500]}
              ticks={[0, 100, 200, 300, 400, 500]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '0.75rem',
                border: 'none',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="pending"
              stroke="#1d70f8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPending)"
              dot={{ r: 3, fill: '#1d70f8', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#1d70f8', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="inProgress"
              stroke="#00d2ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInProgress)"
              dot={{ r: 2.5, fill: '#00d2ff', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#00d2ff', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
