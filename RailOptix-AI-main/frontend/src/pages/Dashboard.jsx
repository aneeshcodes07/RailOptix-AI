import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import LiveNetworkMap from '../components/LiveNetworkMap';
import TrainPriorityBadge from '../components/TrainPriorityBadge';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Gauge, 
  Grid,
  CheckCircle,
  ArrowRight,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalTrains: 0,
    activeTrains: 0,
    activeConflicts: 0,
    averageDelay: 0.0,
    throughput: 0,
    platformUtilization: 0.0,
    onTimePercentage: 0.0
  });
  const [trains, setTrains] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  const fetchData = async () => {
    try {
      // 1. Fetch dashboard KPIs (this also triggers the simulation step in the backend)
      const kpiRes = await fetch('http://localhost:8000/api/dashboard');
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData);
      }

      // 2. Fetch all trains
      const trainRes = await fetch('http://localhost:8000/api/trains');
      if (trainRes.ok) {
        const trainData = await trainRes.json();
        setTrains(trainData);
      }

      // 3. Fetch active conflicts
      const conflictRes = await fetch('http://localhost:8000/api/conflicts');
      if (conflictRes.ok) {
        const conflictData = await conflictRes.json();
        setConflicts(conflictData);
      }
    } catch (e) {
      console.error("Dashboard connection error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll endpoints every 3 seconds to animate trains smoothly
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColorClass = (status) => {
    switch (status) {
      case "STOPPED": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "DELAYED": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "ON_TIME":
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev.toLowerCase()) {
      case "critical": return "text-rose-500 glow-text-rose";
      case "high": return "text-rose-400";
      case "medium": return "text-amber-400";
      default: return "text-cyan-400";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Operations Command Dashboard" />
        
        {/* Main scrollable grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* KPI GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            
            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Trains</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-200">{kpis.totalTrains}</span>
                <Grid className="w-4 h-4 text-slate-600" />
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Trains</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-cyan-400 glow-text-cyan">{kpis.activeTrains}</span>
                <Activity className="w-4 h-4 text-cyan-600" />
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Conflicts</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-black ${kpis.activeConflicts > 0 ? 'text-rose-400 glow-text-rose animate-pulse' : 'text-slate-400'}`}>
                  {kpis.activeConflicts}
                </span>
                <AlertTriangle className={`w-4 h-4 ${kpis.activeConflicts > 0 ? 'text-rose-500' : 'text-slate-600'}`} />
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Delay</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-black ${kpis.averageDelay > 10 ? 'text-amber-400 glow-text-amber' : 'text-emerald-400 glow-text-emerald'}`}>
                  {kpis.averageDelay}m
                </span>
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Throughput</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-cyan-400 glow-text-cyan">{kpis.throughput}%</span>
                <TrendingUp className="w-4 h-4 text-cyan-600" />
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Platform Util</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-200">{kpis.platformUtilization}%</span>
                <Gauge className="w-4 h-4 text-slate-600" />
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-4 flex flex-col justify-between border-slate-900 bg-slate-950/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">On-Time (OTP)</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-400 glow-text-emerald">{kpis.onTimePercentage}%</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </GlassCard>

          </div>

          {/* DYNAMIC NETWORK MAP */}
          <LiveNetworkMap trains={trains} conflicts={conflicts} />

          {/* LOWER SECTION: PANEL GRID */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* TRAIN MONITORING PANEL */}
            <GlassCard hoverable={false} className="lg:col-span-2 flex flex-col overflow-hidden bg-slate-950/30">
              <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Active Train Monitoring</h3>
                </div>
                <Link to="/trains" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                  Manage Trains
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto mt-4 max-h-[300px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Train</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Progress</th>
                      <th className="py-2.5 px-3 text-right">Speed</th>
                      <th className="py-2.5 px-3 text-right">Delay</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-medium">
                    {trains.map((train) => (
                      <tr key={train.id} className="hover:bg-slate-900/20 text-slate-300">
                        <td className="py-3 px-3 font-semibold text-slate-200">{train.train_name}</td>
                        <td className="py-3 px-3">
                          <TrainPriorityBadge priority={train.priority} type={train.train_type} />
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {train.current_station} ➔ {train.target_station || 'Terminal'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="w-24 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div 
                              className="bg-cyan-500 h-full rounded-full" 
                              style={{ width: `${train.segment_progress * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-cyan-400 font-bold">{train.speed} km/h</td>
                        <td className="py-3 px-3 text-right font-mono text-rose-400 font-bold">
                          {train.delay_minutes > 0 ? `+${train.delay_minutes} min` : '0 min'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColorClass(train.status)}`}>
                            {train.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* CONFLICTS / ALERTS CENTER QUICK VIEW */}
            <GlassCard hoverable={false} className="flex flex-col bg-slate-950/30">
              <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Live Section Conflicts</h3>
                </div>
                <Link to="/conflicts" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
                  Alert Center
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-4 max-h-[300px]">
                {conflicts.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <CheckCircle className="w-8 h-8 text-slate-700" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Clear Section Status</p>
                    <p className="text-[10px] text-slate-600">No active track or spacing conflicts detected.</p>
                  </div>
                ) : (
                  conflicts.map((conflict) => (
                    <div 
                      key={conflict.id} 
                      className="p-4 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl space-y-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-rose-400 font-extrabold uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          ID: #{conflict.id}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${getSeverityColor(conflict.severity)}`}>
                          {conflict.severity}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-slate-400 font-semibold">
                          Section: <span className="text-slate-200 font-mono">{conflict.track_section}</span>
                        </p>
                        <p className="text-slate-400 font-semibold leading-relaxed">
                          Conflict: <span className="text-rose-400 font-medium">{conflict.train1}</span> &amp; <span className="text-cyan-400 font-medium">{conflict.train2}</span>
                        </p>
                      </div>

                      {conflict.recommendation && (
                        <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg text-[11px] text-slate-300 flex items-start gap-2">
                          <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <span className="text-cyan-400 font-bold">AI Recommendation:</span> {conflict.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
