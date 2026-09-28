import { FC, useEffect, useState } from 'react';
import { getStats } from '../api/client';
import { StatsResponse, Category, Priority, Status } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Stats: FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, hit } = await getStats();
      setStats(data);
      setCacheHit(hit);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Aggregate Statistics</h1>
        {cacheHit !== null && (
          <span
            data-testid="cache-badge"
            className={`text-xs font-semibold px-2 py-1 rounded ${
              cacheHit
                ? 'bg-green-800 text-green-200 border border-green-600'
                : 'bg-yellow-800 text-yellow-200 border border-yellow-600'
            }`}
          >
            X-Cache: {cacheHit ? 'HIT' : 'MISS'}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center space-x-2 mb-4">
          <LoadingSpinner />
          <span>Loading stats…</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-2 mb-4 rounded border border-red-300">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Total Complaints</h2>
            <p className="text-3xl font-bold text-teal-400">{stats.total}</p>
          </div>

          {/* By Category */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">By Category</h2>
            <ul className="space-y-1 text-sm">
              {Object.values(Category).map((cat) => (
                <li key={cat} className="flex justify-between">
                  <span className="capitalize">{cat}</span>
                  <span className="font-mono">{stats.by_category[cat]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* By Priority */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">By Priority</h2>
            <ul className="space-y-1 text-sm">
              {Object.values(Priority).map((p) => (
                <li key={p} className="flex justify-between">
                  <span className="capitalize">{p}</span>
                  <span className="font-mono">{stats.by_priority[p]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* By Status */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:col-span-3">
            <h2 className="text-lg font-semibold mb-2">By Status</h2>
            <div className="flex flex-wrap gap-4">
              {Object.values(Status).map((s) => (
                <div key={s} className="text-center">
                  <p className="text-2xl font-bold">{stats.by_status[s]}</p>
                  <p className="text-xs capitalize text-slate-400">{s.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
