import React, { useEffect, useState } from "react";
import { 
  Plus, 
  MapPin, 
  Layers, 
  Activity, 
  CheckCircle, 
  X,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";

export default function StationManagement() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [stationName, setStationName] = useState("");
  const [platformCount, setPlatformCount] = useState(2);
  const [capacity, setCapacity] = useState(4);

  const fetchStations = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/stations");
      if (res.ok) {
        const data = await res.json();
        setStations(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stations:", err);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleCreateStation = async (e) => {
    e.preventDefault();
    const payload = {
      station_name: stationName,
      platform_count: parseInt(platformCount),
      capacity: parseInt(capacity),
      current_occupancy: 0,
      utilization: 0.0
    };

    try {
      const res = await fetch("http://localhost:8000/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(`Station ${stationName} registered on division grid.`);
        setStationName("");
        setPlatformCount(2);
        setCapacity(4);
        setShowForm(false);
        fetchStations();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const errData = await res.json();
        alert(`Failed to save: ${errData.detail || "Validation error"}`);
      }
    } catch (err) {
      console.error("Error creating station:", err);
      alert("Error contacting database backend.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="text-railCyan animate-spin mb-4" size={36} />
        <p className="text-xs text-slate-400">Loading stations registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Station & Platform Management</h2>
          <p className="text-slate-400 text-xs mt-1">
            Monitor platform occupancy, line capacity, and register new station intersections.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={fetchStations}
            className="p-2.5 bg-slate-900 border border-railBorder hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-railCyan text-slate-950 font-bold rounded-lg text-xs hover:bg-railCyan/90 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <Plus size={16} /> Register Station
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-railEmerald/15 border border-railEmerald/35 text-railEmerald text-xs font-semibold rounded-lg flex items-center gap-2.5 animate-pulse">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station) => (
          <div 
            key={station.id}
            className="glass-panel p-5 rounded-2xl border border-railBorder hover:border-slate-800 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-railBorder/40 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-railBorder/60 flex items-center justify-center text-railCyan">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{station.station_name}</h3>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Station Node</span>
                  </div>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-3xs font-extrabold border ${
                  station.utilization >= 75 ? "bg-railRose/10 text-railRose border-railRose/20 animate-pulse" :
                  station.utilization >= 50 ? "bg-railAmber/10 text-railAmber border-railAmber/20" :
                  "bg-railEmerald/10 text-railEmerald border-railEmerald/20"
                }`}>
                  {station.utilization}% Utilized
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="p-3 bg-slate-900/60 border border-railBorder rounded-lg">
                  <span className="text-3xs text-slate-500 block uppercase font-semibold">Platform count</span>
                  <strong className="text-base text-slate-200 font-mono">{station.platform_count}</strong>
                </div>
                <div className="p-3 bg-slate-900/60 border border-railBorder rounded-lg">
                  <span className="text-3xs text-slate-500 block uppercase font-semibold">Max Capacity</span>
                  <strong className="text-base text-slate-200 font-mono">{station.capacity} trains</strong>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Current Occupancy</span>
                  <span className="font-semibold text-slate-200">{station.current_occupancy} trains</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">Available Platforms</span>
                  <span className="font-semibold text-railEmerald">
                    {Math.max(0, station.platform_count - station.current_occupancy)} free
                  </span>
                </div>
              </div>
            </div>

            {/* Platform indicator visualization dots */}
            <div className="mt-6 pt-4 border-t border-railBorder/40">
              <span className="text-3xs text-slate-500 uppercase font-semibold block mb-2">Platform Slot Grid</span>
              <div className="flex gap-2">
                {Array.from({ length: station.platform_count }).map((_, idx) => {
                  const isOccupied = idx < station.current_occupancy;
                  return (
                    <div 
                      key={idx} 
                      className={`flex-1 h-3 rounded border transition-all ${
                        isOccupied 
                          ? "bg-railRose/25 border-railRose/40 shadow-[0_0_8px_rgba(244,63,94,0.2)] animate-pulse" 
                          : "bg-slate-900 border-railBorder/60"
                      }`}
                      title={isOccupied ? `Platform ${idx+1} Occupied` : `Platform ${idx+1} Empty`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Station Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900 border border-railBorder rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-railBorder bg-slate-950/40">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Register Station Node</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-500 uppercase font-semibold">Station Name</label>
                <input 
                  type="text" 
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="e.g. Station F"
                  className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Platform Count</label>
                  <input 
                    type="number"
                    value={platformCount}
                    onChange={(e) => setPlatformCount(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Max Capacity</label>
                  <input 
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                    min="1"
                    max="15"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-railBorder bg-slate-950/20 -mx-5 -mb-5 p-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-railCyan text-slate-950 font-bold rounded-lg text-xs hover:bg-railCyan/90"
                >
                  Confirm Station
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
