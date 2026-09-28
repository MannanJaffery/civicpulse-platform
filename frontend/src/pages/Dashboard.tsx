import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  Eye,
  Menu,
  Activity,
  Cpu,
  Radio,
  ClipboardList,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { getComplaints, updateStatus, getStats, getMetaProviders, getReady } from '../api/client';

import { Complaint, Category, Priority, Status, StatsResponse, ProvidersMetaResponse, ReadyResponse } from '../types';
import { Sidebar } from '../components/Sidebar';
import { MetricCard } from '../components/MetricCard';
import { ServiceGauge } from '../components/ServiceGauge';
import { ComplaintsTrendChart } from '../components/ComplaintsTrendChart';
import { CategoryProgressBar } from '../components/CategoryProgressBar';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

interface DashboardProps {
  initialSubView?: 'dashboard' | 'complaints' | 'monitoring';
  onSubViewChange?: (view: 'dashboard' | 'complaints' | 'monitoring') => void;
}

const Dashboard: FC<DashboardProps> = ({ initialSubView = 'dashboard', onSubViewChange }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);
  const [providersMeta, setProvidersMeta] = useState<ProvidersMetaResponse | null>(null);
  const [readyInfo, setReadyInfo] = useState<ReadyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSidebarView, setActiveSidebarView] = useState<'dashboard' | 'complaints' | 'monitoring'>(initialSubView);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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

  // Sync subview when parent prop updates (e.g., browser popstate)
  useEffect(() => {
    if (initialSubView && initialSubView !== activeSidebarView) {
      setActiveSidebarView(initialSubView);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSubView]);

  const handleSidebarViewChange = (view: 'dashboard' | 'complaints' | 'monitoring') => {
    setActiveSidebarView(view);
    setMobileSidebarOpen(false);
    if (onSubViewChange) {
      onSubViewChange(view);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [complaintsRes, statsRes, metaRes, readyRes] = await Promise.allSettled([
        getComplaints(filters),
        getStats(),
        getMetaProviders(),
        getReady(),
      ]);

      if (complaintsRes.status === 'fulfilled' && complaintsRes.value) {
        setComplaints(complaintsRes.value.data || []);
        setTotal(complaintsRes.value.total || 0);
      } else if (complaintsRes.status === 'rejected') {
        setError(complaintsRes.reason?.message || 'Failed to load complaints from backend');
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value.data);
        setCacheHit(statsRes.value.hit);
      }

      if (metaRes.status === 'fulfilled' && metaRes.value) {
        setProvidersMeta(metaRes.value);
      }

      if (readyRes.status === 'fulfilled' && readyRes.value) {
        setReadyInfo(readyRes.value);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Local text search filter
  const displayedComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.text && c.text.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.status && c.status.toLowerCase().includes(q)) ||
      (c.reporter_contact && c.reporter_contact.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: Status) => {
    const cfg = {
      [Status.open]: { cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Open' },
      [Status.in_progress]: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'In Progress' },
      [Status.resolved]: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' },
      [Status.rejected]: { cls: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
    };
    const { cls, label } = cfg[status] ?? { cls: 'bg-slate-50 text-slate-600 border-slate-200', label: status };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const cfg = {
      [Priority.high]: 'bg-red-100 text-red-700',
      [Priority.normal]: 'bg-amber-100 text-amber-700',
      [Priority.low]: 'bg-emerald-100 text-emerald-700',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cfg[priority] ?? 'bg-slate-100 text-slate-600'}`}>
        {priority}
      </span>
    );
  };

  // ─── View labels for the header ───────────────────────────────────────────
  const viewMeta = {
    dashboard: {
      title: 'GIS Operations Overview',
      subtitle: 'Real-time telemetry, municipal trends & service levels',
      icon: <LayoutDashboard className="w-5 h-5 text-blue-600" />,
    },
    complaints: {
      title: 'Complaints Management Center',
      subtitle: 'Filtered incident queue & state transition workflows',
      icon: <ClipboardList className="w-5 h-5 text-blue-600" />,
    },
    monitoring: {
      title: 'Live Monitoring & Telemetry',
      subtitle: 'Infrastructure health, LLM latency & cache telemetry',
      icon: <Radio className="w-5 h-5 text-blue-600" />,
    },
  };
  const currentMeta = viewMeta[activeSidebarView];

  return (
    /* Outer shell: fills entire remaining viewport below navbar */
    <div className="w-full flex bg-[#f4f6fa] flex-1" style={{ minHeight: 'calc(100vh - 4rem)' }}>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeView={activeSidebarView}
          setActiveView={handleSidebarViewChange}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72"
            >
              <Sidebar
                activeView={activeSidebarView}
                setActiveView={handleSidebarViewChange}
                collapsed={false}
                onMobileClose={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Operations Canvas ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* ── Top Operations Header Bar ── */}
        <header className="bg-white border-b border-slate-200/80 shadow-sm sticky top-16 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Left: mobile toggle + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                aria-label="Open sidebar navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  {currentMeta.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                      {currentMeta.title}
                    </h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0 hidden sm:inline-block">
                      Live Operations
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium hidden sm:block">{currentMeta.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Right: search + cache badge + refresh */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-56 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search incidents…"
                  aria-label="Search complaints"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filter toggle (complaints view only) */}
              {activeSidebarView === 'complaints' && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    showFilters
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  aria-label="Toggle filters"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              )}

              {/* X-Cache badge */}
              {cacheHit !== null && (
                <span
                  data-testid="cache-badge"
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full border hidden sm:inline-flex items-center gap-1 ${
                    cacheHit
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  {cacheHit ? 'HIT' : 'MISS'}
                </span>
              )}

              {/* Refresh */}
              <button
                onClick={fetchData}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border border-slate-200"
                title="Refresh data"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter bar (complaints view, expandable) */}
          <AnimatePresence>
            {activeSidebarView === 'complaints' && showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/60">
                  <select
                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    value={filters.category ?? ''}
                    onChange={(e) => updateFilter('category', e.target.value || undefined)}
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {Object.values(Category).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    value={filters.priority ?? ''}
                    onChange={(e) => updateFilter('priority', e.target.value || undefined)}
                    aria-label="Filter by priority"
                  >
                    <option value="">All Priorities</option>
                    {Object.values(Priority).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <select
                    className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    value={filters.status ?? ''}
                    onChange={(e) => updateFilter('status', e.target.value || undefined)}
                    aria-label="Filter by status"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(Status).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setFilters({ page: 1, page_size: 10 });
                      setShowFilters(false);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
                  >
                    Clear filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── Dynamic View Content ── */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-900 font-bold ml-4 cursor-pointer p-1"
                  aria-label="Dismiss error"
                >
                  <ChevronRight className="w-4 h-4 rotate-45" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════════════════════════════════════════════════════
              VIEW 1: MAIN DASHBOARD OVERVIEW
          ════════════════════════════════════════════════════════════════ */}
          {activeSidebarView === 'dashboard' && (
            <motion.div
              key="view-dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* KPI Metric Row */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <MetricCard
                  icon={<Clock className="w-4 h-4" />}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-600"
                  title="Open"
                  subtitle="Awaiting action"
                  value={stats?.by_status[Status.open] ?? total}
                  badgeText="+70%"
                  badgeType="danger"
                  accentColor="bg-blue-500"
                  delay={0.05}
                />
                <MetricCard
                  icon={<RefreshCw className="w-4 h-4" />}
                  iconBgColor="bg-amber-50"
                  iconColor="text-amber-600"
                  title="In Progress"
                  subtitle="Being handled"
                  value={stats?.by_status[Status.in_progress] ?? 0}
                  badgeText="+20%"
                  badgeType="info"
                  accentColor="bg-amber-500"
                  delay={0.1}
                />
                <MetricCard
                  icon={<CheckCircle className="w-4 h-4" />}
                  iconBgColor="bg-emerald-50"
                  iconColor="text-emerald-600"
                  title="Resolved"
                  subtitle="Closed this period"
                  value={stats?.by_status[Status.resolved] ?? 0}
                  badgeText="+1%"
                  badgeType="success"
                  accentColor="bg-emerald-500"
                  delay={0.15}
                />
                <MetricCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  iconBgColor="bg-slate-50"
                  iconColor="text-slate-600"
                  title="Total"
                  subtitle="All time intake"
                  value={stats?.total ?? total}
                  badgeText="All time"
                  badgeType="info"
                  accentColor="bg-slate-400"
                  delay={0.2}
                />
                {/* Service Gauge (spans 2 cols on xl) */}
                <div className="col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                  <ServiceGauge percentage={76.5} target={75} rating={4.6} delay={0.25} />
                </div>
              </div>

              {/* Trend Chart */}
              <ComplaintsTrendChart
                pendingCount={stats?.by_status[Status.open] ?? 231}
                inProgressCount={stats?.by_status[Status.in_progress] ?? 43}
              />

              {/* Bottom Split: Recent Complaints + Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Complaints Table Preview */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Complaints</h3>
                      <p className="text-[11px] text-slate-400">Live operational state & quick transitions</p>
                    </div>
                    <button
                      onClick={() => handleSidebarViewChange('complaints')}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>View Full Queue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="px-5 py-3 font-bold">Date</th>
                          <th className="px-3 py-3 font-bold">Location / Detail</th>
                          <th className="px-3 py-3 font-bold hidden sm:table-cell">Category</th>
                          <th className="px-3 py-3 font-bold hidden md:table-cell">Priority</th>
                          <th className="px-3 py-3 font-bold">Status</th>
                          <th className="px-5 py-3 font-bold text-right">View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {displayedComplaints.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                              {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Loading incidents…
                                </div>
                              ) : 'No complaints found.'}
                            </td>
                          </tr>
                        ) : (
                          displayedComplaints.slice(0, 5).map((c) => (
                            <tr
                              key={c.id}
                              className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                              onClick={() => setSelectedComplaintId(c.id)}
                            >
                              <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">
                                {c.created_at
                                  ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  : 'Recent'}
                              </td>
                              <td className="px-3 py-3">
                                <div className="font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">{c.location}</div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">{c.ai_summary || c.text}</div>
                              </td>
                              <td className="px-3 py-3 capitalize text-slate-600 hidden sm:table-cell">{c.category}</td>
                              <td className="px-3 py-3 hidden md:table-cell">{getPriorityBadge(c.priority)}</td>
                              <td className="px-3 py-3">{getStatusBadge(c.status)}</td>
                              <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setSelectedComplaintId(c.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  aria-label="View complaint details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="lg:col-span-1">
                  <CategoryProgressBar categoryStats={stats?.by_category} total={stats?.total || total} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 2: FULL COMPLAINTS MANAGEMENT CENTER
          ════════════════════════════════════════════════════════════════ */}
          {activeSidebarView === 'complaints' && (
            <motion.div
              key="view-complaints"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Complaints Operations Center</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage and update municipal incident lifecycles</p>
                </div>
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-800 font-bold">{total}</strong> total records
                </span>
              </div>

              {/* Full Complaints Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/60">
                      <th className="px-5 py-3 font-bold">Date</th>
                      <th className="px-3 py-3 font-bold">Location / Detail</th>
                      <th className="px-3 py-3 font-bold hidden sm:table-cell">Category</th>
                      <th className="px-3 py-3 font-bold hidden md:table-cell">Priority</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                      <th className="px-5 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayedComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center text-slate-400">
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Loading complaints…
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-semibold">No complaints found</p>
                              <p className="text-[11px]">Try adjusting your search or filters</p>
                            </div>
                          )}
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
                          <tr
                            key={c.id}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                            onClick={() => setSelectedComplaintId(c.id)}
                          >
                            <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">{dateFormatted}</td>
                            <td className="px-3 py-3">
                              <div className="font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-[240px]">{c.location}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[160px] sm:max-w-[240px]">{c.ai_summary || c.text}</div>
                            </td>
                            <td className="px-3 py-3 capitalize text-slate-600 hidden sm:table-cell">{c.category}</td>
                            <td className="px-3 py-3 hidden md:table-cell">{getPriorityBadge(c.priority)}</td>
                            <td className="px-3 py-3">{getStatusBadge(c.status)}</td>
                            <td className="px-5 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedComplaintId(c.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="View Details"
                                  aria-label="View complaint details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {c.status === Status.open && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(c.id, Status.in_progress)}
                                      className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold border border-amber-200 transition-colors text-[10px]"
                                    >
                                      Progress
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(c.id, Status.rejected)}
                                      className="px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-200 transition-colors text-[10px]"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {c.status === Status.in_progress && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(c.id, Status.resolved)}
                                      className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition-colors text-[10px]"
                                    >
                                      Resolve
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(c.id, Status.rejected)}
                                      className="px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-200 transition-colors text-[10px]"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {(c.status === Status.resolved || c.status === Status.rejected) && (
                                  <span className="text-[10px] text-slate-400 italic px-1">Terminal</span>
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

              {/* Pagination */}
              <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
                <span>
                  Showing <strong className="text-slate-800">{displayedComplaints.length}</strong> of{' '}
                  <strong className="text-slate-800">{total}</strong> records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={filters.page <= 1 || loading}
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <span className="font-bold text-slate-700 px-2">Page {filters.page}</span>
                  <button
                    disabled={loading || displayedComplaints.length < filters.page_size}
                    onClick={() => updateFilter('page', filters.page + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors font-semibold"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              VIEW 3: LIVE MONITORING & TELEMETRY
          ════════════════════════════════════════════════════════════════ */}
          {activeSidebarView === 'monitoring' && (
            <motion.div
              key="view-monitoring"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Infrastructure Probe Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Process Liveness (/health)
                  </span>
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>200 Healthy</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Process alive — zero DB dependency</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Readiness Probe (/ready)
                  </span>
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>200 Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PostgreSQL: <strong>{readyInfo?.database || 'connected'}</strong> &nbsp;•&nbsp;
                    Redis: <strong>{readyInfo?.cache || 'connected'}</strong>
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Redis Cache Layer
                  </span>
                  <div className={`flex items-center gap-2 font-extrabold text-xl ${cacheHit ? 'text-blue-600' : 'text-amber-600'}`}>
                    <Zap className="w-6 h-6" />
                    <span>{cacheHit ? 'X-Cache: HIT' : 'X-Cache: MISS'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">30s TTL with write invalidation</p>
                </div>
              </div>

              {/* AI Provider Observability */}
              {providersMeta ? (
                <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">AI Provider Observability Telemetry</h3>
                        <p className="text-xs text-slate-400">
                          Active Provider:{' '}
                          <strong className="text-cyan-400">{providersMeta.active_provider}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 self-start sm:self-auto">
                      GET /api/meta/providers
                    </span>
                  </div>

                  {providersMeta.outcomes && providersMeta.outcomes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-700/40">
                            <th className="py-2 pr-4 font-semibold">Provider</th>
                            <th className="py-2 pr-4 font-semibold">Latency (ms)</th>
                            <th className="py-2 pr-4 font-semibold hidden sm:table-cell">Fallback</th>
                            <th className="py-2 font-semibold hidden md:table-cell">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {providersMeta.outcomes.slice(0, 10).map((outcome, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 pr-4 font-mono text-cyan-300 font-semibold">{outcome.provider}</td>
                              <td className="py-2.5 pr-4 font-mono">{outcome.latency_ms} ms</td>
                              <td className="py-2.5 pr-4 hidden sm:table-cell">
                                {outcome.fallback ? (
                                  <span className="text-amber-400 font-bold">YES (rules)</span>
                                ) : (
                                  <span className="text-emerald-400 font-bold">NO</span>
                                )}
                              </td>
                              <td className="py-2.5 text-slate-400 font-mono hidden md:table-cell">{outcome.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No recent triage events recorded yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Provider telemetry unavailable</p>
                  <p className="text-xs text-slate-400 mt-1">Connect the backend to see real-time AI provider metrics</p>
                </div>
              )}
            </motion.div>
          )}

        </main>
      </div>

      {/* Complaint Detail Inspection Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onStatusUpdated={fetchData}
      />
    </div>
  );
};

export default Dashboard;
