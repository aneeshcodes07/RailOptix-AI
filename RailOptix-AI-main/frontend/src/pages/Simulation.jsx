import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  CloudRain, 
  AlertOctagon, 
  Settings, 
  Construction, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';

const SCENARIO_LIST = [
  { name: "Heavy Rain", icon: CloudRain, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", desc: "Monsoon storms restricts section speed limits." },
  { name: "Signal Failure", icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", desc: "Interlocking failure halts automatic signaling." },
  { name: "Track Block", icon: Construction, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", desc: "Maintenance block shuts down prime sections." },
  { name: "Platform Closure", icon: Layers, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", desc: "OHE wire maintenance closes station platforms." },
  { name: "Engine Breakdown", icon: Settings, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", desc: "Freight breakdown blocks single-line tracks." },
  { name: "High Traffic Period", icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", desc: "Festive rush adds 3 extra special express runs." },
  { name: "Emergency Train Movement", icon: AlertOctagon, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", desc: "Medical Relief Train crossing section first." }
];

const Simulation = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const triggerSimulation = async (scenarioName) => {
    setSelectedScenario(scenarioName);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_name: scenarioName })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error("Simulation error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Simulation & What-if Center" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
            <h3 className="font-bold text-slate-200">What-If Operational Disruption Modeler</h3>
            <p className="text-xs text-slate-500 mt-1">Simulate track blocks, breakdowns, or weather patterns to inspect before/after optimization stats.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Scenarios List */}
            <div className="space-y-4 lg:col-span-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Disruption Scenarios</h4>
              <div className="space-y-3">
                {SCENARIO_LIST.map((scen, idx) => {
                  const Icon = scen.icon;
                  const isActive = selectedScenario === scen.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => triggerSimulation(scen.name)}
                      disabled={loading}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                        isActive 
                          ? 'bg-slate-900 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                          : 'bg-slate-950/45 border-slate-900 text-slate-300 hover:bg-slate-900/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${scen.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{scen.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{scen.desc}</p>
                        </div>
                      </div>
                      <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulation Results Display */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="h-96 glass-panel rounded-2xl flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Running optimization schedules...</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  
                  {/* Results Metrics grid */}
                  <GlassCard hoverable={false} className="bg-slate-950/40 border-slate-900 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                        Simulation Result: {result.scenario_name}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold uppercase tracking-wider">
                        Optimization Complete
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Before Delay Card */}
                      <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2 text-center">
                        <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Before AI Optimization</span>
                        <h3 className="text-4xl font-black text-rose-500 glow-text-rose">{result.before_delay}m</h3>
                        <p className="text-[10px] text-slate-500">Average Train Delay Minutes</p>
                      </div>

                      {/* After Delay Card */}
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 text-center">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">AI-Optimized Schedule</span>
                        <h3 className="text-4xl font-black text-emerald-400 glow-text-emerald">{result.after_delay}m</h3>
                        <p className="text-[10px] text-slate-500">Average Train Delay Minutes</p>
                      </div>
                    </div>

                    {/* Delay mitigation visualization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Delay Reduction Metric</span>
                        <span className="text-cyan-400">{Math.round(((result.before_delay - result.after_delay) / result.before_delay) * 100)}% Minutes Saved</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(result.after_delay / result.before_delay) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Scenario details */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Disruption Impact Details
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">{result.details}</p>
                    </div>
                  </GlassCard>

                  {/* Recovery Plan Code-block */}
                  <GlassCard hoverable={false} className="bg-slate-950/40 border-slate-900 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                      <CheckCircle className="w-4.5 h-4.5 text-cyan-400" />
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                        AI Recovery Workplan
                      </h4>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-xs text-cyan-400 space-y-2.5 leading-relaxed">
                      <p className="text-slate-500 font-semibold">// SECTION DISPATCH AUTHORITY RECOVERY PROTOCOLS</p>
                      <p className="text-slate-200 font-semibold">{`>>> INITIALIZING RECOVERY PATTERNS FOR ${result.scenario_name.toUpperCase()}...`}</p>
                      <p className="text-slate-400 font-semibold leading-relaxed border-l-2 border-slate-800 pl-3 py-1">
                        {result.recovery_plan}
                      </p>
                      <p className="text-emerald-400 font-bold">✓ Precedence checks completed. Schedules recalculated.</p>
                      <p className="text-slate-500 font-semibold">// Status: Ready to push update commands to locomotive receivers.</p>
                    </div>
                  </GlassCard>

                </div>
              ) : (
                <div className="h-96 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-slate-200 font-bold uppercase tracking-wider">No active simulation</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Select a disruption scenario from the sidebar list to calculate before/after delay mitigation schedules.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Simulation;
