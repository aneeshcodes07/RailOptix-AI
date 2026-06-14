import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { MapPin, Navigation, Grid, BarChart3, AlertCircle } from 'lucide-react';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stations');
      if (res.ok) {
        const data = await res.json();
        setStations(data);
      }
    } catch (e) {
      console.error("Error fetching stations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    // Poll station updates
    const interval = setInterval(fetchStations, 5000);
    return () => clearInterval(interval);
  }, []);

  const getUtilColorClass = (util) => {
    if (util >= 80) return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
    if (util >= 50) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
    return "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]";
  };

  const getUtilTextColor = (util) => {
    if (util >= 80) return "text-rose-400 glow-text-rose";
    if (util >= 50) return "text-amber-400 glow-text-amber";
    return "text-cyan-400 glow-text-cyan";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Station Operations Center" />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
            <h3 className="font-bold text-slate-200">Section Station Hubs</h3>
            <p className="text-xs text-slate-500 mt-1">Monitors active platform occupation and total train routing capacity across the division.</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-slate-500 font-mono text-xs animate-pulse">Scanning stations...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map((station) => (
                <GlassCard key={station.id} hoverable={true} className="border-slate-900 bg-slate-950/45 space-y-5">
                  
                  {/* Station Title */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{station.station_name}</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Station Code: {station.station_name.slice(-1)}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-mono font-black ${getUtilTextColor(station.utilization)}`}>
                      {station.utilization}% Utilized
                    </span>
                  </div>

                  {/* Station Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1">
                      <Grid className="w-3.5 h-3.5 text-slate-500 mx-auto" />
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Platforms</p>
                      <p className="text-sm font-black text-slate-200">{station.platform_count}</p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1">
                      <Navigation className="w-3.5 h-3.5 text-slate-500 mx-auto" />
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Occupancy</p>
                      <p className="text-sm font-black text-slate-200">{station.current_occupancy}</p>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1">
                      <BarChart3 className="w-3.5 h-3.5 text-slate-500 mx-auto" />
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Capacity</p>
                      <p className="text-sm font-black text-slate-200">{station.capacity}</p>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Platform Congestion Level</span>
                      <span>{station.current_occupancy} / {station.platform_count} Slots</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getUtilColorClass(station.utilization)}`}
                        style={{ width: `${station.utilization}%` }}
                      />
                    </div>
                  </div>

                  {/* Congestion warning */}
                  {station.utilization >= 80 && (
                    <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-lg flex items-center gap-2 text-[10px] text-rose-400 font-semibold uppercase tracking-wider animate-pulse">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Warning: Critical platform bottle-neck! Hold approaching runs.</span>
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

export default Stations;
