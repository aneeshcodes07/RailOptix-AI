import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Compass, 
  Clock, 
  Database, 
  ShieldAlert, 
  Zap 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LandingPage = () => {
  const problems = [
    { title: "Manual Scheduling", desc: "Controllers rely on personal experience to resolve conflicts in high-density sections." },
    { title: "Delay Propagation", desc: "A minor delay in one freight train cascades across premium passenger corridors." },
    { title: "Platform Bottlenecks", desc: "Suboptimal station platform scheduling leads to incoming trains waiting at outer signals." },
    { title: "Junction Conflicts", desc: "Overlapping tracks at major hubs create cross-traffic delays and capacity limits." }
  ];

  const features = [
    { title: "AI Conflict Detection", desc: "Predicts spacing and head-on track conflicts minutes before they occur.", icon: ShieldAlert },
    { title: "Dynamic Scheduling", desc: "Recalculates train precedence, slotting, and bypass paths on the fly.", icon: Zap },
    { title: "Train Priority Optimization", desc: "Resolves precedence using Indian Railways priority scores (e.g. Vande Bharat vs Freight).", icon: Cpu },
    { title: "What-If Simulation Engine", desc: "Model weather disruptions, engine failures, or maintenance blocks in real-time.", icon: Activity },
    { title: "Platform Allocation", desc: "Optimizes station platform occupancy dynamically to improve punctuality.", icon: Database },
    { title: "Analytics & KPI Trends", desc: "Gain visibility into average delays, throughput scores, and platform utilization metrics.", icon: Compass }
  ];

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-slate-900">
      
      {/* Top Model Prototype Announcement Bar */}
      <div className="w-full bg-cyan-950/45 border-b border-cyan-500/20 backdrop-blur-md relative z-20 py-3.5 px-4 text-center text-xs font-semibold text-cyan-400">
        <span className="font-extrabold uppercase tracking-widest text-[10px] bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded mr-2">Note</span> 
        This is the model prototype of our project which consists only frontend here for more details refer <a href="https://github.com/aneeshcodes07/RailOptix-AI" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-cyan-300 transition-colors">GitHub repository</a>.
      </div>
      
      {/* Premium Sci-Fi Background Gradient & Ambient Nodes */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-20 relative z-10 space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-8 max-w-3xl mx-auto py-10">


          <h1 className="text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400">
            RailOptix AI
          </h1>
          
          <h2 className="text-2xl font-bold text-slate-300 tracking-wide">
            Intelligent Railway Traffic Optimization & Decision Support
          </h2>
          
          <p className="text-slate-400 text-lg leading-relaxed">
            Reducing Delays. Maximizing Throughput. Empowering Indian Railways section controllers with real-time AI-optimized precedence decisions.
          </p>



          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-900 font-bold hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center gap-2"
            >
              Launch Control Center
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/simulation"
              className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold hover:bg-slate-900/60 transition-all duration-200"
            >
              Run Scenario Simulation
            </Link>
          </div>
        </section>

        {/* PROBLEM STATEMENT SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Challenges</h3>
            <h2 className="text-3xl font-bold text-slate-100">The Railway Congestion Problem</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              High density traffic corridors suffer from cascading delay propagation, where a single local stoppage impacts prime trains.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((prob, i) => (
              <GlassCard key={i} hoverable={false} className="border-l-2 border-l-rose-500 bg-slate-950/45">
                <AlertTriangle className="w-8 h-8 text-rose-500 mb-4" />
                <h4 className="font-bold text-slate-200 text-md mb-2">{prob.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{prob.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* SOLUTION FEATURES SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Solutions</h3>
            <h2 className="text-3xl font-bold text-slate-100">AI-Powered Operations</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Providing controllers with instantaneous decision-support dashboards containing automated conflict resolution advice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <GlassCard key={i} className="hover:border-cyan-500/20">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-5 border border-cyan-500/20 text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-200 text-md mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* ARCHITECTURE SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">System Design</h3>
            <h2 className="text-3xl font-bold text-slate-100">Operations Architecture Flow</h2>
          </div>

          <GlassCard hoverable={false} className="py-10 bg-slate-950/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto text-center font-bold text-xs uppercase tracking-wider">
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-slate-300">Railway Data (MySQL)</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-cyan-400">Optimization Score Engine</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-rose-400">Conflict Detection</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-amber-400">AI Rec Engine</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 md:rotate-0" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-slate-300">Controller Dashboard</span>
              </div>

            </div>
          </GlassCard>
        </section>

        {/* IMPACT SECTION */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Impact</h3>
            <h2 className="text-3xl font-bold text-slate-100">Key Performance Indicators</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-900 text-center space-y-2">
              <h4 className="text-3xl font-black text-rose-400 glow-text-rose">-35%</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Average Delay</p>
            </div>
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-900 text-center space-y-2">
              <h4 className="text-3xl font-black text-cyan-400 glow-text-cyan">+18%</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Traffic Throughput</p>
            </div>
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-900 text-center space-y-2">
              <h4 className="text-3xl font-black text-emerald-400 glow-text-emerald">+25%</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Platform Occupancy</p>
            </div>
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-900 text-center space-y-2">
              <h4 className="text-3xl font-black text-amber-400 glow-text-amber">96.5%</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Punctuality (OTP)</p>
            </div>
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-900 text-center space-y-2">
              <h4 className="text-3xl font-black text-cyan-400 glow-text-cyan">&lt;3s</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Decision Speed</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950/40 py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 RailOptix AI. Intelligent Railway Traffic Optimization.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
