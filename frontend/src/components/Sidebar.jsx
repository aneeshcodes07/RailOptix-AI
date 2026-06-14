import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Train as TrainIcon, 
  MapPin, 
  AlertTriangle, 
  Lightbulb, 
  Activity, 
  BarChart3,
  Home
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trains', path: '/trains', icon: TrainIcon },
    { name: 'Stations', path: '/stations', icon: MapPin },
    { name: 'Conflicts', path: '/conflicts', icon: AlertTriangle, badge: 'conflictCount' },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Simulation', path: '/simulation', icon: Activity },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 border-r border-slate-800 backdrop-blur-xl flex flex-col h-full shrink-0">
      {/* Brand logo area */}
      <div className="p-6 border-b border-slate-900 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <span className="font-extrabold text-slate-900 text-sm">RO</span>
        </div>
        <div>
          <h1 className="font-bold text-slate-100 tracking-wide text-md">RailOptix AI</h1>
          <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest glow-text-cyan">Control Center</span>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-4 h-4" />
          <span>Landing Page</span>
        </NavLink>
        
        <div className="h-px bg-slate-900 my-4" />

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/20 text-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.05)]'
                    : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 hover:border-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Status Area */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400">System Link: Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
