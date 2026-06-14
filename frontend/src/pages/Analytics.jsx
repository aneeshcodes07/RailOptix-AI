import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const Analytics = () => {
  // 1. Train Type vs Delay (mock averages)
  const delayData = [
    { type: 'Vande Bharat', delay: 1.2, color: '#06b6d4' },
    { type: 'Rajdhani', delay: 3.5, color: '#ec4899' },
    { type: 'Express', delay: 8.8, color: '#f59e0b' },
    { type: 'Passenger', delay: 15.4, color: '#10b981' },
    { type: 'Freight', delay: 28.1, color: '#64748b' }
  ];

  // 2. Platform utilization per station (mock percentages)
  const platformData = [
    { station: 'Station A', utilization: 45 },
    { station: 'Station B', utilization: 80 },
    { station: 'Station C', utilization: 65 },
    { station: 'Station D', utilization: 70 },
    { station: 'Station E', utilization: 35 }
  ];

  // 3. Throughput Before AI vs After AI (capacity scores across hours)
  const throughputData = [
    { hour: '08:00', Before: 55, After: 88 },
    { hour: '10:00', Before: 48, After: 85 },
    { hour: '12:00', Before: 52, After: 89 },
    { hour: '14:00', Before: 44, After: 82 },
    { hour: '16:00', Before: 60, After: 94 },
    { hour: '18:00', Before: 50, After: 91 },
    { hour: '20:00', Before: 47, After: 86 }
  ];

  // 4. Daily conflicts trends over a week
  const conflictTrendData = [
    { day: 'Mon', Conflicts: 12 },
    { day: 'Tue', Conflicts: 15 },
    { day: 'Wed', Conflicts: 8 },
    { day: 'Thu', Conflicts: 14 },
    { day: 'Fri', Conflicts: 18 },
    { day: 'Sat', Conflicts: 9 },
    { day: 'Sun', Conflicts: 6 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-lg text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color || item.fill }} className="font-semibold">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Operational Analytics" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Summary KPIs bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard hoverable={false} className="p-4 bg-slate-950/40 border-slate-900 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Efficiency Score</p>
                <h3 className="text-xl font-black text-slate-200 mt-1">94.8 / 100</h3>
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 bg-slate-950/40 border-slate-900 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Delays Resolved</p>
                <h3 className="text-xl font-black text-slate-200 mt-1">1,482 min Saved</h3>
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 bg-slate-950/40 border-slate-900 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Punctuality Deviation</p>
                <h3 className="text-xl font-black text-slate-200 mt-1">-3.4% Delta</h3>
              </div>
            </GlassCard>
          </div>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Delay Analysis Bar Chart */}
            <GlassCard hoverable={false} className="bg-slate-950/30 border-slate-900 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Train Type vs Average Delay</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={delayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="type" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="m" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="delay" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                      {delayData.map((entry, index) => (
                        <Bar key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Platform Utilization */}
            <GlassCard hoverable={false} className="bg-slate-950/30 border-slate-900 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Station-wise Platform Utilization</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="station" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="utilization" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Throughput comparison Before vs After */}
            <GlassCard hoverable={false} className="bg-slate-950/30 border-slate-900 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Throughput: Before vs After AI</h4>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-600 rounded-sm inline-block" />Before AI</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm inline-block" />After AI</span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#475569" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="After" stroke="#06b6d4" strokeWidth="2.5" fillOpacity={1} fill="url(#colorAfter)" />
                    <Area type="monotone" dataKey="Before" stroke="#475569" strokeWidth="1.5" fillOpacity={1} fill="url(#colorBefore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Conflicts Trends */}
            <GlassCard hoverable={false} className="bg-slate-950/30 border-slate-900 space-y-4 lg:col-span-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Section Conflict Trends</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conflictTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Conflicts" stroke="#f43f5e" strokeWidth="3" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
