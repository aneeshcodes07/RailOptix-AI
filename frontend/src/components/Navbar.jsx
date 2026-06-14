import React, { useState, useEffect } from 'react';
import { Bell, Shield, Clock, Wifi } from 'lucide-react';

const Navbar = ({ title = "Operations Dashboard" }) => {
  const [time, setTime] = useState(new Date());
  const [conflictCount, setConflictCount] = useState(0);

  useEffect(() => {
    // Tick the clock every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/conflicts');
        if (res.ok) {
          const data = await res.json();
          setConflictCount(data.length);
        }
      } catch (e) {
        // API offline
      }
    };

    fetchConflicts();
    const interval = setInterval(fetchConflicts, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatClock = (d) => {
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' });
  };

  return (
    <header className="h-16 bg-slate-950/40 border-b border-slate-900 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">{title}</h2>
      </div>

      {/* Control panel widgets */}
      <div className="flex items-center gap-6">
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Database: Connected</span>
        </div>

        {/* Master Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-cyan-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-mono font-bold tracking-widest">{formatClock(time)}</span>
          <span className="text-[10px] text-slate-500 font-medium ml-1">{formatDate(time)}</span>
        </div>

        {/* Alerts / Notifications */}
        <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-slate-900/60 transition-colors">
          <Bell className={`w-5 h-5 ${conflictCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
          {conflictCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-slate-950 text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950">
              {conflictCount}
            </span>
          )}
        </div>

        {/* User profile */}
        <div className="h-px w-6 bg-slate-800 rotate-90" />
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">Controller 07</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sec-A Chief</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
