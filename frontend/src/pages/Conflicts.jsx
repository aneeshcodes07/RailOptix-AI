import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShieldAlert,
  ListFilter,
  Cpu,
  TrendingUp
} from 'lucide-react';

const Conflicts = () => {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'resolved'

  const fetchConflicts = async () => {
    try {
      const endpoint = activeTab === 'active' 
        ? 'http://localhost:8000/api/conflicts'
        : 'http://localhost:8000/api/conflicts/resolved';
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setConflicts(data);
      }
    } catch (e) {
      console.error("Error fetching conflicts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
    // Poll conflicts frequently to match 1.5s simulator interval
    const interval = setInterval(fetchConflicts, 1500);
    return () => clearInterval(interval);
  }, [activeTab]);

  const getSeverityStyles = (sev) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse';
      case 'high':
        return 'bg-rose-400/10 text-rose-400 border border-rose-400/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'low':
      default:
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--:--';
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return '--:--:--';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Conflict Detection Center" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Page Header Info and Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/20 p-4 rounded-xl border border-slate-900">
            <div>
              <h3 className="font-bold text-slate-200">Section Alert & Resolution History</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'active' 
                  ? 'Tracks sections with active bottlenecks or overlapping path requests.' 
                  : 'Displays resolved conflicts and their simulated scheduling benefit.'}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => { setActiveTab('active'); setLoading(true); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'active' 
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active Alerts
              </button>
              <button
                onClick={() => { setActiveTab('resolved'); setLoading(true); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'resolved' 
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved History
              </button>
            </div>
          </div>

          {/* Conflict List */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-slate-500 font-mono text-xs animate-pulse">
                {activeTab === 'active' ? 'Scanning track sections...' : 'Loading resolution logs...'}
              </span>
            </div>
          ) : conflicts.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-200 uppercase tracking-wider">
                  {activeTab === 'active' ? 'All Tracks Clear' : 'No Resolved Conflicts'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {activeTab === 'active' 
                    ? 'The automated signaling sensors report no active overlapping block occupancies or precedence conflict risks.' 
                    : 'No conflicts have been resolved through the optimization engine yet in this session.'}
                </p>
              </div>
              {activeTab === 'active' && (
                <Link to="/dashboard" className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-900/60 transition-colors">
                  Back to Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {conflicts.map((conflict) => (
                <GlassCard key={conflict.id} hoverable={true} className="flex flex-col justify-between bg-slate-950/45 border-slate-900">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          conflict.is_active 
                            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          {conflict.is_active ? 'ALERT' : 'RESOLVED'} #{conflict.id}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(conflict.created_at)}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        conflict.is_active 
                          ? getSeverityStyles(conflict.severity) 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {conflict.is_active ? `${conflict.severity} Severity` : 'Resolved'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-400">Track Section</p>
                          <p className="font-mono text-slate-200 mt-0.5">{conflict.track_section}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-slate-300">
                        <ShieldAlert className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-400">Trains Involved</p>
                          <p className="font-medium text-slate-200 mt-0.5">
                            <span className="text-rose-400 font-bold">{conflict.train1}</span>
                            <span className="text-slate-500 px-2 font-mono">vs</span>
                            <span className="text-cyan-400 font-bold">{conflict.train2}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation / Applied Resolution */}
                    {conflict.recommendation && (
                      <div className={`p-3 border rounded-lg text-xs leading-relaxed ${
                        conflict.is_active
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-emerald-950/20 border-emerald-500/10'
                      }`}>
                        <p className={`font-bold flex items-center gap-1 ${
                          conflict.is_active ? 'text-cyan-400' : 'text-emerald-400'
                        }`}>
                          {conflict.is_active ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {conflict.is_active ? 'Auto Recommendation:' : 'Applied Resolution:'}
                        </p>
                        <p className="text-slate-300 mt-1">{conflict.recommendation}</p>
                      </div>
                    )}

                    {/* Expected Benefit (Impact) */}
                    {!conflict.is_active && conflict.expected_benefit && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Simulated Benefit: {conflict.expected_benefit}</span>
                        </div>
                      </div>
                    )}

                    {/* Decision Reasoning */}
                    {!conflict.is_active && conflict.explanation && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          AI Decision Reasoning
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {conflict.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  {conflict.is_active && (
                    <div className="pt-4 mt-6 border-t border-slate-900 flex justify-end">
                      <Link
                        to="/recommendations"
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all"
                      >
                        Resolve with AI Precedence
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Conflicts;
