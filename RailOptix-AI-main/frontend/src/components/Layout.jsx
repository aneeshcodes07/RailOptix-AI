import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Train, 
  MapPin, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  BarChart3, 
  Bell, 
  User, 
  Menu, 
  X,
  RefreshCw
} from "lucide-react";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ activeConflicts: 0, averageDelay: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Fetch quick metrics for navbar indicators
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          
          // Generate mock alerts if conflicts exist
          if (data.activeConflicts > 0) {
            setNotifications([
              { id: 1, type: "danger", message: `Detected ${data.activeConflicts} active track conflicts.` },
              { id: 2, type: "warning", message: "Priority rescheduling engine calculating." }
            ]);
          } else {
            setNotifications([]);
          }
        }
      } catch (err) {
        console.error("Error fetching navbar stats:", err);
      }
    };

    fetchQuickStats();
    const interval = setInterval(fetchQuickStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Trains", path: "/trains", icon: <Train size={20} /> },
    { name: "Stations", path: "/stations", icon: <MapPin size={20} /> },
    { name: "Conflicts", path: "/conflicts", icon: <ShieldAlert size={20} />, badge: stats.activeConflicts },
    { name: "Recommendations", path: "/recommendations", icon: <Cpu size={20} /> },
    { name: "Simulation", path: "/simulation", icon: <Activity size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-railBg text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-950/80 border-r border-railBorder backdrop-blur-xl transition-transform duration-300 transform md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-railBorder">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-railCyan/20 border border-railCyan flex items-center justify-center">
              <span className="text-railCyan font-extrabold text-sm tracking-wider">RX</span>
            </div>
            <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-slate-100 to-railCyan bg-clip-text text-transparent">
              RailOptix AI
            </span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-railCyan/10 text-railCyan border-l-2 border-railCyan font-semibold shadow-[inset_0_0_8px_rgba(6,182,212,0.05)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-2xs font-extrabold rounded-full bg-railRose/20 text-railRose border border-railRose/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-railBorder bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-railBorder flex items-center justify-center text-railCyan">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Section Controller</p>
              <p className="text-3xs text-slate-500 truncate">Division: Howrah - Asansol</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-slate-950/40 border-b border-railBorder flex items-center justify-between px-6 z-10">
          {/* Menu Button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
          >
            <Menu size={24} />
          </button>

          {/* System Status Indicators */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-railBorder px-3.5 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-railEmerald animate-pulse"></span>
              <span className="text-xs text-slate-300 font-medium">Auto-Simulation Active</span>
            </div>
            {stats.activeConflicts > 0 ? (
              <div className="flex items-center gap-2 bg-railRose/10 border border-railRose/20 px-3.5 py-1.5 rounded-full animate-pulse">
                <span className="text-2xs text-railRose font-bold uppercase tracking-wider">Warning</span>
                <span className="text-xs text-slate-300">{stats.activeConflicts} Track Bottlenecks</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-railEmerald/15 border border-railEmerald/20 px-3.5 py-1.5 rounded-full">
                <span className="text-2xs text-railEmerald font-bold uppercase tracking-wider">Nominal</span>
                <span className="text-xs text-slate-300">All tracks cleared</span>
              </div>
            )}
          </div>

          {/* User Controls & Notifications */}
          <div className="flex items-center gap-4 relative">
            {/* Notification bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-lg bg-slate-900/60 border border-railBorder hover:border-slate-700 text-slate-400 hover:text-white transition-all relative"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-railRose animate-ping"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 bg-slate-900 border border-railBorder rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-railBorder mb-3">
                  <h4 className="text-xs font-bold text-slate-200">System Alerts</h4>
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[10px] text-railCyan hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No active alerts. System status nominal.</p>
                ) : (
                  <div className="space-y-2.5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-lg border text-xs ${
                          n.type === "danger" 
                            ? "bg-railRose/10 border-railRose/20 text-railRose" 
                            : "bg-railAmber/10 border-railAmber/20 text-railAmber"
                        }`}
                      >
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-9 w-px bg-railBorder"></div>
            
            {/* Time Stamp */}
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Division Time</p>
              <p className="text-xs font-mono font-bold text-railCyan tracking-wider">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-6 cyber-grid relative">
          {children}
        </main>
      </div>
    </div>
  );
}
