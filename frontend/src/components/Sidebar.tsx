import React from 'react';
import {
  LayoutDashboard,
  Radio,
  ClipboardList,
  Shield,
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
  // Only real, fully functional views (removed non-working mock items)
  const menuItems: Array<{ id: 'dashboard' | 'complaints' | 'monitoring'; label: string; icon: any; countBadge?: string }> = [
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
      className={`relative bg-[#003399] text-white flex flex-col justify-between py-6 transition-all duration-300 z-20 shrink-0 h-full min-h-[calc(100vh-4rem)] ${
        collapsed ? 'w-20 px-2' : 'w-64 px-4'
      }`}
    >
      <div>
        {/* GIS Crest & Header */}
        <div className="flex items-center justify-between px-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-[#003399] font-black text-xs shadow-inner">
                <Shield className="w-5 h-5 text-[#003399]" />
              </div>
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-xl font-extrabold tracking-wider text-white">GIS</h2>
                <p className="text-[10px] text-blue-200 tracking-wider uppercase font-semibold">
                  Operations Hub
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile drawer */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#003399] shadow-lg shadow-black/10 font-bold'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#003399]' : 'text-blue-200'}`} />
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
      <div className="hidden lg:block pt-6 border-t border-blue-400/20">
        {setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-200 transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>
    </aside>
  );
};
