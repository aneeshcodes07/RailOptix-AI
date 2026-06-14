import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  Lightbulb, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  Cpu,
  Check,
  AlertCircle
} from 'lucide-react';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchRecs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecs(data);
      }
    } catch (e) {
      console.error("Error fetching recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
    // Poll recommendations periodically
    const interval = setInterval(fetchRecs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = async (recId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/recommendations/${recId}/apply`, {
        method: 'POST',
      });
      if (res.ok) {
        setToast({ type: 'success', text: "AI Traffic Recommendation applied successfully! Locomotive schedules updated." });
        fetchRecs();
      } else {
        const errorData = await res.json();
        setToast({ type: 'error', text: errorData.detail || "Failed to apply recommendation." });
      }
    } catch (e) {
      setToast({ type: 'error', text: "Network error. Failed to execute decision." });
    }
    // Auto clear toast after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="AI Recommendation Center" />
        
        {/* Floating Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md animate-bounce ${
            toast.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span className="text-xs font-semibold">{toast.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Header */}
          <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-200">AI Precedence Dispatch Advice</h3>
              <p className="text-xs text-slate-500 mt-1">Calculates optimal crossings and hold-patterns using the priority optimization weights.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
              <Cpu className="w-4 h-4" />
              <span>Engine: Active</span>
            </div>
          </div>

          {/* Rec Cards List */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-slate-500 font-mono text-xs animate-pulse">Computing dispatch vectors...</span>
            </div>
          ) : recs.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-200 uppercase tracking-wider">No Advice Queued</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  There are no active track conflicts at this time. Recommendations will appear here automatically when routing conflicts occur.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recs.map((rec) => (
                <GlassCard key={rec.id} className="flex flex-col justify-between border-slate-900 bg-slate-950/45">
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          REC #{rec.id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Conflict #{rec.conflict_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-extrabold font-mono glow-text-cyan">
                          {rec.confidence_score}% Confidence
                        </span>
                      </div>
                    </div>

                    {/* Recommendation details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Lightbulb className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-400">AI Dispatch Order</p>
                          <p className="text-sm font-semibold text-slate-100 mt-1 leading-relaxed">
                            {rec.recommendation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expected Benefit: {rec.expected_benefit}</span>
                        </div>
                      </div>

                      {rec.explanation && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            AI Decision Reasoning
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {rec.explanation}
                          </p>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-6 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={() => handleApply(rec.id)}
                      className="px-5 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Apply AI Decision
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Recommendations;
