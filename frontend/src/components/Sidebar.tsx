import React from 'react';
import {
  LayoutDashboard,
  Radio,
  FileText,
  PieChart,
  ClipboardList,
  Headphones,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed = false,
  setCollapsed,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Radio },
    { id: 'complaints', label: 'Complaints', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'abs_reports', label: 'ABS Reports', icon: FileText },
    { id: 'recordings', label: 'Call Recordings', icon: Headphones },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative bg-[#003399] text-white flex flex-col justify-between py-6 transition-all duration-300 z-20 ${
        collapsed ? 'w-20 px-2' : 'w-64 px-4'
      }`}
    >
      <div>
        {/* GIS Crest & Title */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-[#003399] font-black text-xs shadow-inner">
              <Shield className="w-5 h-5 text-[#003399]" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-extrabold tracking-wider text-white">GIS</h2>
              <p className="text-[10px] text-blue-200 tracking-wider uppercase font-semibold">
                Operations Center
              </p>
            </div>
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
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#003399] shadow-lg shadow-black/10 font-bold'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#003399]' : 'text-blue-200'}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout & Collapse */}
      <div className="pt-6 border-t border-blue-400/20 space-y-2">
        <button
          onClick={() => setActiveView('logout')}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-100/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 text-blue-300 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-blue-200 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </aside>
  );
};
