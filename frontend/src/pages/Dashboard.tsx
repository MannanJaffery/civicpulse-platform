import { FC, useEffect, useState } from 'react';
import { getComplaints, updateStatus } from '../api/client';
import { Complaint, Category, Priority, Status } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ category?: Category; priority?: Priority; status?: Status; page?: number; page_size?: number }>({
    page: 1,
    page_size: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total } = await getComplaints(filters);
      setComplaints(data);
      setTotal(total);
    } catch (e: any) {
      setError(e.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await updateStatus(id, newStatus);
      // Refresh after successful update
      fetchData();
    } catch (e: any) {
      // Preserve verbatim server message (including 409)
      setError(e.message || 'Status update failed');
    }
  };

  const updateFilter = (field: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Operations Dashboard</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border rounded p-1"
          value={filters.category ?? ''}
          onChange={(e) => updateFilter('category', e.target.value || undefined)}
        >
          <option value="">All Categories</option>
          {Object.values(Category).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-1"
          value={filters.priority ?? ''}
          onChange={(e) => updateFilter('priority', e.target.value || undefined)}
        >
          <option value="">All Priorities</option>
          {Object.values(Priority).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="border rounded p-1"
          value={filters.status ?? ''}
          onChange={(e) => updateFilter('status', e.target.value || undefined)}
        >
          <option value="">All Statuses</option>
          {Object.values(Status).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center space-x-2 mb-4">
          <LoadingSpinner />
          <span>Loading complaints…</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-2 mb-4 rounded border border-red-300">
          {error}
        </div>
      )}

      <table className="min-w-full bg-slate-800 text-slate-100 border border-slate-700 rounded">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Priority</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id} className="border-t border-slate-700">
              <td className="p-2 text-xs break-all">{c.id}</td>
              <td className="p-2">{c.category}</td>
              <td className="p-2">{c.priority}</td>
              <td className="p-2 capitalize">{c.status}</td>
              <td className="p-2 space-x-2">
                {/* Allowed transitions based on mock rules */}
                {c.status === Status.open && (
                  <>
                    <button
                      onClick={() => handleStatusChange(c.id, Status.in_progress)}
                      className="bg-yellow-600 text-xs px-2 py-1 rounded hover:bg-yellow-500"
                    >
                      In‑Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, Status.rejected)}
                      className="bg-red-600 text-xs px-2 py-1 rounded hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </>
                )}
                {c.status === Status.in_progress && (
                  <>
                    <button
                      onClick={() => handleStatusChange(c.id, Status.resolved)}
                      className="bg-green-600 text-xs px-2 py-1 rounded hover:bg-green-500"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, Status.rejected)}
                      className="bg-red-600 text-xs px-2 py-1 rounded hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </>
                )}
                {/* No actions for terminal states */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
        <span>Total complaints (mock total): {total}</span>
        <div className="space-x-2">
          <button
            disabled={filters.page === 1 || loading}
            onClick={() => updateFilter('page', Math.max(1, (filters.page ?? 1) - 1))}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={loading}
            onClick={() => updateFilter('page', (filters.page ?? 1) + 1)}
            className="px-2 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
