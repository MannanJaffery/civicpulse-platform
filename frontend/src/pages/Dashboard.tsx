import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  Clock,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
} from 'lucide-react';
import { getComplaints, updateStatus, getStats } from '../api/client';
import { Complaint, Category, Priority, Status, StatsResponse } from '../types';
import { Sidebar } from '../components/Sidebar';
import { MetricCard } from '../components/MetricCard';
import { ServiceGauge } from '../components/ServiceGauge';
import { ComplaintsTrendChart } from '../components/ComplaintsTrendChart';
import { CategoryProgressBar } from '../components/CategoryProgressBar';

const Dashboard: FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarView, setActiveSidebarView] = useState('dashboard');
  const [filters, setFilters] = useState<{
    category?: Category;
    priority?: Priority;
    status?: Status;
    page: number;
    page_size: number;
  }>({
    page: 1,
    page_size: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [complaintsRes, statsRes] = await Promise.allSettled([
        getComplaints(filters),
        getStats(),
      ]);

      if (complaintsRes.status === 'fulfilled') {
        setComplaints(complaintsRes.value.data);
        setTotal(complaintsRes.value.total);
      } else {
        setError(complaintsRes.reason?.message || 'Failed to load complaints');
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
        setCacheHit(statsRes.value.hit);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      setError(null);
      await updateStatus(id, newStatus);
      fetchData();
    } catch (e: any) {
      // Preserve verbatim server 409 message
      setError(e.message || 'Status update failed');
    }
  };

  const updateFilter = (field: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
  };

  // Filter complaints locally if search query is entered
  const displayedComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.text.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      (c.reporter_contact && c.reporter_contact.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.open:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-300 text-blue-700 bg-blue-50">
            Open
          </span>
        );
      case Status.in_progress:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-300 text-amber-700 bg-amber-50">
            In Progress
          </span>
        );
      case Status.resolved:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-300 text-emerald-700 bg-emerald-50">
            Closed
          </span>
        );
      case Status.rejected:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-300 text-red-700 bg-red-50">
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="flex bg-[#f4f6fa] rounded-3xl overflow-hidden shadow-gis border border-slate-200/80 min-h-[880px]">
      {/* GIS Sidebar matching user design */}
      <Sidebar
        activeView={activeSidebarView}
        setActiveView={setActiveSidebarView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Operations Canvas */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Overview</h1>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints, locations, tags..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* User & Notifications Section */}
          <div className="flex items-center gap-4">
            {/* Cache Hit indicator */}
            {cacheHit !== null && (
              <span
                data-testid="cache-badge"
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  cacheHit
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                X-Cache: {cacheHit ? 'HIT' : 'MISS'}
              </span>
            )}

            {/* Bell Notifications */}
            <div className="relative cursor-pointer p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-[#003399] font-black text-[10px] rounded-full flex items-center justify-center">
                12
              </span>
            </div>

            {/* Settings */}
            <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100">
                DP
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  Divya Prasad
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="p-6 space-y-6 flex-1">
          {/* Error Banner (Surfacing 409 conflict verbatim) */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-900 font-bold ml-4"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top KPI Metrics Row matching reference mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              icon={<Clock className="w-4 h-4" />}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
              title="Pending"
              subtitle="Last 7 days"
              value={stats?.by_status[Status.open] ?? 9}
              badgeText="+70%"
              badgeType="danger"
              accentColor="bg-emerald-500"
              delay={0.05}
            />

            <MetricCard
              icon={<RefreshCw className="w-4 h-4" />}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
              title="In Progress"
              subtitle="Last 7 days"
              value={stats?.by_status[Status.in_progress] ?? 2}
              badgeText="+20%"
              badgeType="info"
              accentColor="bg-blue-500"
              delay={0.1}
            />

            <MetricCard
              icon={<CheckCircle className="w-4 h-4" />}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
              title="Solved"
              subtitle="Last 7 days"
              value={stats?.by_status[Status.resolved] ?? 1}
              badgeText="+1%"
              badgeType="success"
              accentColor="bg-orange-400"
              delay={0.15}
            />

            {/* Service Level Radial & Feedback Cards in column 4 & 5 */}
            <div className="sm:col-span-2 lg:col-span-2">
              <ServiceGauge percentage={76.5} target={75} rating={4.6} delay={0.2} />
            </div>
          </div>

          {/* Trend Chart */}
          <ComplaintsTrendChart
            pendingCount={stats?.by_status[Status.open] ?? 231}
            inProgressCount={stats?.by_status[Status.in_progress] ?? 43}
          />

          {/* Bottom Split Section: Complaints Table (Left) + Category Breakdown (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Complaints Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-subtle border border-slate-100/80 flex flex-col justify-between">
              <div>
                {/* Table Header & Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Recent Complaints
                    </h3>
                    <p className="text-xs text-slate-400">Live operational state & actions</p>
                  </div>

                  {/* Dropdown Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden"
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
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden"
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
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden"
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
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Date</th>
                        <th className="pb-3 font-bold">Location / Detail</th>
                        <th className="pb-3 font-bold">Category</th>
                        <th className="pb-3 font-bold">Priority</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedComplaints.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No complaints matching current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        displayedComplaints.map((c) => {
                          const dateFormatted = c.created_at
                            ? new Date(c.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now';

                          return (
                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 text-slate-500 font-medium whitespace-nowrap">
                                {dateFormatted}
                              </td>
                              <td className="py-3 pr-2">
                                <div className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
                                  {c.location}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                                  {c.ai_summary || c.text}
                                </div>
                              </td>
                              <td className="py-3 capitalize font-semibold text-slate-700">
                                {c.category}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    c.priority === Priority.high
                                      ? 'bg-red-100 text-red-700'
                                      : c.priority === Priority.normal
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {c.priority}
                                </span>
                              </td>
                              <td className="py-3 capitalize">{getStatusBadge(c.status)}</td>
                              <td className="py-3 text-right whitespace-nowrap">
                                {/* State Machine Transition Triggers */}
                                <div className="flex items-center justify-end gap-1.5">
                                  {c.status === Status.open && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(c.id, Status.in_progress)}
                                        className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold border border-amber-200 transition-colors"
                                      >
                                        In‑Progress
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(c.id, Status.rejected)}
                                        className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-200 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {c.status === Status.in_progress && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(c.id, Status.resolved)}
                                        className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition-colors"
                                      >
                                        Resolve
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(c.id, Status.rejected)}
                                        className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-200 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {/* Terminal states indicator */}
                                  {(c.status === Status.resolved || c.status === Status.rejected) && (
                                    <span className="text-[11px] text-slate-400 italic">
                                      Terminal State
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination controls */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Total Records: <strong className="text-slate-800">{total}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={filters.page <= 1 || loading}
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <span className="font-semibold text-slate-700 px-1">Page {filters.page}</span>
                  <button
                    disabled={loading || displayedComplaints.length < filters.page_size}
                    onClick={() => updateFilter('page', filters.page + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Complaints in Category Breakdown (Right) */}
            <div className="lg:col-span-1">
              <CategoryProgressBar categoryStats={stats?.by_category} total={stats?.total || total} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
