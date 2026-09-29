import React from 'react';
import {
  LayoutDashboard,
  Radio,
  ClipboardList,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'complaints' | 'monitoring';
  setActiveView: (view: 'dashboard' | 'complaints' | 'monitoring') => void;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed = false,
  setCollapsed,
  onMobileClose,
}) => {
  const menuItems: Array<{ id: 'dashboard' | 'complaints' | 'monitoring'; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints', icon: ClipboardList },
    { id: 'monitoring', label: 'Live Monitoring', icon: Radio },
  ];

  const handleItemClick = (id: 'dashboard' | 'complaints' | 'monitoring') => {
    setActiveView(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`relative bg-slate-900 text-slate-200 border-r border-slate-800/80 flex flex-col justify-between py-6 transition-all duration-300 z-20 shrink-0 h-full min-h-[calc(100vh-4rem)] shadow-xl ${
        collapsed ? 'w-20 px-2.5' : 'w-64 px-4'
      }`}
    >
      <div>
        {/* CivicPulse Operations Header */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold tracking-tight text-white leading-tight">CivicPulse</h2>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                  Operations Hub
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile drawer */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 text-left">
                    <span>{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <div className="hidden lg:block pt-4 border-t border-slate-800">
        {setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold gap-2"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
