import { FC, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Zap,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { getStats } from '../api/client';
import { StatsResponse, Category, Priority, Status, ProvidersMetaResponse } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_COLORS: Record<string, string> = {
  [Category.water]: '#1d70f8',
  [Category.electricity]: '#f59e0b',
  [Category.sanitation]: '#06b6d4',
  [Category.roads]: '#10b981',
  [Category.streetlights]: '#8b5cf6',
  [Category.other]: '#64748b',
};

const PRIORITY_COLORS: Record<string, string> = {
  [Priority.high]: '#ef4444',
  [Priority.normal]: '#f59e0b',
  [Priority.low]: '#10b981',
};

const Stats: FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);
  const [providersMeta, setProvidersMeta] = useState<ProvidersMetaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, hit } = await getStats();
      setStats(data);
      setCacheHit(hit);

      // Dynamically fetch provider metadata safely without breaking partial mocks
      try {
        const clientMod: any = await import('../api/client');
        if (typeof clientMod?.getMetaProviders === 'function') {
          const meta = await clientMod.getMetaProviders();
          setProvidersMeta(meta);
        }
      } catch {
        // Optional meta telemetry
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const categoryChartData = stats
    ? Object.entries(stats.by_category).map(([cat, count]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count,
        key: cat,
      }))
    : [];

  const priorityChartData = stats
    ? Object.entries(stats.by_priority).map(([prio, count]) => ({
        name: prio.toUpperCase(),
        count,
        key: prio,
      }))
    : [];

  const outcomesList = providersMeta?.outcomes || (providersMeta as any)?.recent_outcomes || [];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operational Telemetry</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Aggregate Statistics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics, category distribution, and Redis read-through caching metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cache Badge with strict testId */}
          {cacheHit !== null && (
            <span
              data-testid="cache-badge"
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full border shadow-xs ${
                cacheHit
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>X-Cache: {cacheHit ? 'HIT' : 'MISS'}</span>
            </span>
          )}

          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && !stats && (
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner />
          <span className="ml-3 font-semibold text-slate-600">Loading live telemetry...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-2xl text-xs sm:text-sm font-semibold">
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-subtle border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Complaints
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{stats.total}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  All Time
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-subtle border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active / Open
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-amber-600">
                  {stats.by_status[Status.open]}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Pending Intake
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-subtle border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                In Resolution
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-blue-600">
                  {stats.by_status[Status.in_progress]}
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  Field Dispatched
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-subtle border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Resolved & Closed
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-600">
                  {stats.by_status[Status.resolved]}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Successful
                </span>
              </div>
            </div>
          </div>

          {/* Graphical Analytics (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-subtle border border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-4">
                Complaints by Municipal Category
              </h3>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-25} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.key] || '#1d70f8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Distribution Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-subtle border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-4">
                  Complaints by Priority Urgency
                </h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={PRIORITY_COLORS[entry.key] || '#1d70f8'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '0.75rem',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* AI Providers Observability Section */}
          {providersMeta && (
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Provider Observability</h3>
                    <p className="text-xs text-slate-400">
                      Active: <strong className="text-cyan-400">{providersMeta.active_provider}</strong>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-cyan-300">
                  Live Provider Telemetry
                </span>
              </div>

              {outcomesList.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700/60 pb-2">
                        <th className="py-2">Provider</th>
                        <th className="py-2">Latency (ms)</th>
                        <th className="py-2">Fallback Triggered</th>
                        <th className="py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {outcomesList.slice(0, 10).map((outcome: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 font-mono text-cyan-300">{outcome.provider}</td>
                          <td className="py-2 font-mono">{outcome.latency_ms} ms</td>
                          <td className="py-2">
                            {outcome.fallback ? (
                              <span className="text-amber-400 font-bold">YES (rules)</span>
                            ) : (
                              <span className="text-emerald-400 font-bold">NO</span>
                            )}
                          </td>
                          <td className="py-2 text-slate-400 font-mono">
                            {outcome.timestamp || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Stats;
