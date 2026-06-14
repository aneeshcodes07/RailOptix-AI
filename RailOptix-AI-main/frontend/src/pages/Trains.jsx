import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import TrainPriorityBadge from '../components/TrainPriorityBadge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Train as TrainIcon,
  Search,
  Navigation,
  Clock,
  AlertCircle
} from 'lucide-react';

const STATIONS = ["Station A", "Station B", "Station C", "Station D", "Station E"];
const TYPES = ["Vande Bharat", "Rajdhani", "Express", "Passenger", "Freight"];
const PRIORITY_MAP = {
  "Vande Bharat": 5,
  "Rajdhani": 4,
  "Express": 3,
  "Passenger": 2,
  "Freight": 1
};

const Trains = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Express');
  const [currentStation, setCurrentStation] = useState('Station A');
  const [targetStation, setTargetStation] = useState('Station B');
  const [speed, setSpeed] = useState(100);
  const [delay, setDelay] = useState(0);
  const [status, setStatus] = useState('ON_TIME');
  const [direction, setDirection] = useState('OUTBOUND');
  
  const [toast, setToast] = useState(null);

  const fetchTrains = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/trains');
      if (res.ok) {
        const data = await res.json();
        setTrains(data);
      }
    } catch (e) {
      console.error("Error fetching trains:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const openAddModal = () => {
    setEditingTrain(null);
    setName('');
    setType('Express');
    setCurrentStation('Station A');
    setTargetStation('Station B');
    setSpeed(100);
    setDelay(0);
    setStatus('ON_TIME');
    setDirection('OUTBOUND');
    setIsModalOpen(true);
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    setName(train.train_name);
    setType(train.train_type);
    setCurrentStation(train.current_station);
    setTargetStation(train.target_station || '');
    setSpeed(train.speed);
    setDelay(train.delay_minutes);
    setStatus(train.status);
    setDirection(train.direction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to decommission this locomotive?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/trains/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('success', "Locomotive decommissioned successfully from section.");
        fetchTrains();
      } else {
        showToast('error', "Failed to remove train.");
      }
    } catch (e) {
      showToast('error', "Connection failure.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const priority = PRIORITY_MAP[type] || 3;
    const payload = {
      train_name: name,
      train_type: type,
      priority,
      current_station: currentStation,
      target_station: targetStation || null,
      segment_progress: editingTrain ? editingTrain.segment_progress : 0.0,
      delay_minutes: parseInt(delay) || 0,
      speed: parseInt(speed) || 0,
      status,
      direction
    };

    try {
      let res;
      if (editingTrain) {
        res = await fetch(`http://localhost:8000/api/trains/${editingTrain.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:8000/api/trains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast('success', editingTrain ? "Train details updated." : "New train dispatched to segment.");
        setIsModalOpen(false);
        fetchTrains();
      } else {
        const errorData = await res.json();
        showToast('error', errorData.detail || "Database write rejected.");
      }
    } catch (e) {
      showToast('error', "Database connection error.");
    }
  };

  const filteredTrains = trains.filter(t => 
    t.train_name.toLowerCase().includes(search.toLowerCase()) ||
    t.train_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Train Fleet Control" />

        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md animate-bounce ${
            toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span className="text-xs font-semibold">{toast.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Actions panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/20 p-4 rounded-xl border border-slate-900">
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search train fleet by name or class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/40 rounded-xl text-xs text-slate-200 outline-none transition-colors"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-xs flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Dispatch New Train
            </button>
          </div>

          {/* Trains Table */}
          <GlassCard hoverable={false} className="bg-slate-950/30 border-slate-900 p-0 overflow-hidden">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <span className="text-slate-500 font-mono text-xs animate-pulse">Syncing train telemetry...</span>
              </div>
            ) : filteredTrains.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <TrainIcon className="w-8 h-8 text-slate-700" />
                <p className="text-xs font-bold uppercase tracking-wider">No active fleets matching filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider bg-slate-950/50">
                      <th className="py-3.5 px-4">Train ID</th>
                      <th className="py-3.5 px-4">Train Name</th>
                      <th className="py-3.5 px-4">Priority / Type</th>
                      <th className="py-3.5 px-4">Section Location</th>
                      <th className="py-3.5 px-4">Direction</th>
                      <th className="py-3.5 px-4 text-right">Telemetry Speed</th>
                      <th className="py-3.5 px-4 text-right">Accumulated Delay</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-medium text-slate-300">
                    {filteredTrains.map((train) => (
                      <tr key={train.id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-4 font-mono text-slate-500 font-bold">#{train.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-200">{train.train_name}</td>
                        <td className="py-3 px-4">
                          <TrainPriorityBadge priority={train.priority} type={train.train_type} />
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {train.current_station} ➔ {train.target_station || 'Terminal'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            <Navigation className={`w-2.5 h-2.5 text-cyan-400 ${train.direction === 'INBOUND' ? 'rotate-180' : ''}`} />
                            {train.direction}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-cyan-400 font-bold">{train.speed} km/h</td>
                        <td className="py-3 px-4 text-right font-mono text-rose-400 font-bold">
                          {train.delay_minutes > 0 ? `+${train.delay_minutes} min` : '0 min'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            train.status === 'ON_TIME' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            train.status === 'STOPPED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {train.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(train)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(train.id)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

        </div>
      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <GlassCard hoverable={false} className="w-full max-w-lg bg-[#0b132b]/95 border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-slate-900 mb-6">
              <TrainIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">
                {editingTrain ? 'Edit Fleet Telemetry' : 'Dispatch New Locomotive'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Train Name / Number</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gatiman Exp (12050)"
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Train Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Starting Station</label>
                  <select
                    value={currentStation}
                    onChange={(e) => setCurrentStation(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  >
                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Destination Station</label>
                  <select
                    value={targetStation}
                    onChange={(e) => setTargetStation(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  >
                    <option value="">None (Halted / Terminal)</option>
                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Speed (km/h)</label>
                  <input
                    type="number"
                    min="0"
                    max="160"
                    required
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Delay (min)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs"
                  >
                    <option value="OUTBOUND">Outbound (A ➔ E)</option>
                    <option value="INBOUND">Inbound (E ➔ A)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-900 focus:border-cyan-500/30 rounded-lg text-slate-200 outline-none text-xs animate-none"
                >
                  <option value="ON_TIME">On Time (Normal Running)</option>
                  <option value="DELAYED">Delayed (Restricted running)</option>
                  <option value="STOPPED">Stopped (Held at Signals)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {editingTrain ? 'Save Telemetry' : 'Dispatch Train'}
                </button>
              </div>

            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Trains;
