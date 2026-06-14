import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  X,
  Activity,
  RotateCcw
} from "lucide-react";

export default function TrainManagement() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTrainId, setEditTrainId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [trainName, setTrainName] = useState("");
  const [trainType, setTrainType] = useState("Express");
  const [priority, setPriority] = useState(3);
  const [currentStation, setCurrentStation] = useState("Station A");
  const [targetStation, setTargetStation] = useState("Station B");
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [status, setStatus] = useState("ON_TIME");
  const [direction, setDirection] = useState("OUTBOUND");

  const fetchTrains = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/trains");
      if (res.ok) {
        const data = await res.json();
        setTrains(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching trains:", err);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const resetForm = () => {
    setTrainName("");
    setTrainType("Express");
    setPriority(3);
    setCurrentStation("Station A");
    setTargetStation("Station B");
    setDelayMinutes(0);
    setSpeed(100);
    setStatus("ON_TIME");
    setDirection("OUTBOUND");
    setEditTrainId(null);
  };

  const handleOpenEdit = (train) => {
    setEditTrainId(train.id);
    setTrainName(train.train_name);
    setTrainType(train.train_type);
    setPriority(train.priority);
    setCurrentStation(train.current_station);
    setTargetStation(train.target_station || "");
    setDelayMinutes(train.delay_minutes);
    setSpeed(train.speed);
    setStatus(train.status);
    setDirection(train.direction);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      train_name: trainName,
      train_type: trainType,
      priority: parseInt(priority),
      current_station: currentStation,
      target_station: targetStation || null,
      delay_minutes: parseInt(delayMinutes),
      speed: parseInt(speed),
      status,
      direction
    };

    try {
      let res;
      if (editTrainId) {
        // Update Train
        res = await fetch(`http://localhost:8000/api/trains/${editTrainId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Train
        res = await fetch("http://localhost:8000/api/trains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setSuccessMsg(editTrainId ? "Train telemetry updated successfully." : "New train registered on division network.");
        resetForm();
        setShowForm(false);
        fetchTrains();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const errData = await res.json();
        alert(`Failed to save: ${errData.detail || "Validation error"}`);
      }
    } catch (err) {
      console.error("Error saving train:", err);
      alert("Error contacting database backend.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to decommission and remove this train from the active section?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/trains/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSuccessMsg("Train successfully removed from network tracking.");
        fetchTrains();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert("Failed to delete train.");
      }
    } catch (err) {
      console.error("Error deleting train:", err);
    }
  };

  const getPriorityBadge = (priority) => {
    const labels = { 5: "P-5 VB", 4: "P-4 Raj", 3: "P-3 Exp", 2: "P-2 Pas", 1: "P-1 Frt" };
    const colors = {
      5: "bg-railRose/10 text-railRose border-railRose/30",
      4: "bg-railAmber/10 text-railAmber border-railAmber/30",
      3: "bg-railCyan/10 text-railCyan border-railCyan/30",
      2: "bg-railEmerald/10 text-railEmerald border-railEmerald/30",
      1: "bg-slate-800 text-slate-400 border-slate-700"
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${colors[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="text-railCyan animate-spin mb-4" size={36} />
        <p className="text-xs text-slate-400">Querying trains registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Train Configuration Panel</h2>
          <p className="text-slate-400 text-xs mt-1">
            Register new trains, adjust active timetable delays, or decommission locomotives from operations.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={fetchTrains}
            className="p-2.5 bg-slate-900 border border-railBorder hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-railCyan text-slate-950 font-bold rounded-lg text-xs hover:bg-railCyan/90 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <Plus size={16} /> Register Train
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-railEmerald/15 border border-railEmerald/35 text-railEmerald text-xs font-semibold rounded-lg flex items-center gap-2.5 animate-pulse">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Main List */}
      <div className="glass-panel rounded-2xl border border-railBorder overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-railBorder bg-slate-950/20 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="p-4">Train ID</th>
                <th className="p-4">Train Details</th>
                <th className="p-4">Priority Class</th>
                <th className="p-4">Section Location</th>
                <th className="p-4 text-right">Timetable Delay</th>
                <th className="p-4 text-right">GPS Speed</th>
                <th className="p-4 text-right">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-railBorder/40">
              {trains.map((train) => (
                <tr key={train.id} className="hover:bg-slate-900/20 transition-all">
                  <td className="p-4 font-mono font-bold text-slate-400">#{train.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{train.train_name}</div>
                    <div className="text-[10px] text-slate-500">{train.train_type}</div>
                  </td>
                  <td className="p-4">{getPriorityBadge(train.priority)}</td>
                  <td className="p-4 text-slate-300">
                    {train.segment_progress > 0 ? (
                      <span>Moving: {train.current_station} → {train.target_station} ({Math.round(train.segment_progress * 100)}%)</span>
                    ) : (
                      <span>Halted at {train.current_station}</span>
                    )}
                  </td>
                  <td className={`p-4 text-right font-mono font-semibold ${train.delay_minutes > 0 ? "text-railAmber" : "text-railEmerald"}`}>
                    {train.delay_minutes} min
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">{train.speed} km/h</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      train.status === "ON_TIME" ? "bg-railEmerald/10 text-railEmerald border-railEmerald/20" :
                      train.status === "DELAYED" ? "bg-railAmber/10 text-railAmber border-railAmber/20" :
                      "bg-railRose/10 text-railRose border-railRose/20 animate-pulse"
                    }`}>
                      {train.status}
                    </span>
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(train)}
                      className="p-1.5 bg-slate-900 border border-railBorder hover:border-slate-700 text-slate-400 hover:text-railCyan rounded transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(train.id)}
                      className="p-1.5 bg-slate-900 border border-railBorder hover:border-railRose/30 text-slate-400 hover:text-railRose rounded transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-railBorder rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-railBorder bg-slate-950/40">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                {editTrainId ? "Edit Train Telemetry" : "Register New Train"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-3xs text-slate-500 uppercase font-semibold">Train Name / Number</label>
                <input 
                  type="text" 
                  value={trainName}
                  onChange={(e) => setTrainName(e.target.value)}
                  placeholder="e.g. Vande Bharat (22436)"
                  className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Train Category</label>
                  <select 
                    value={trainType}
                    onChange={(e) => setTrainType(e.target.value)}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  >
                    <option value="Vande Bharat">Vande Bharat</option>
                    <option value="Rajdhani">Rajdhani</option>
                    <option value="Express">Express</option>
                    <option value="Passenger">Passenger</option>
                    <option value="Freight">Freight</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Priority Class (1-5)</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  >
                    <option value="5">Level 5 (VB Premium)</option>
                    <option value="4">Level 4 (Rajdhani)</option>
                    <option value="3">Level 3 (Express)</option>
                    <option value="2">Level 2 (Passenger)</option>
                    <option value="1">Level 1 (Freight Cargo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Current Block Location</label>
                  <select 
                    value={currentStation}
                    onChange={(e) => setCurrentStation(e.target.value)}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  >
                    <option value="Station A">Station A</option>
                    <option value="Station B">Station B</option>
                    <option value="Station C">Station C</option>
                    <option value="Station D">Station D</option>
                    <option value="Station E">Station E</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Target Block Location</label>
                  <select 
                    value={targetStation}
                    onChange={(e) => setTargetStation(e.target.value)}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  >
                    <option value="">None (Station Halt)</option>
                    <option value="Station A">Station A</option>
                    <option value="Station B">Station B</option>
                    <option value="Station C">Station C</option>
                    <option value="Station D">Station D</option>
                    <option value="Station E">Station E</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Timetable Delay (min)</label>
                  <input 
                    type="number"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                    min="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Speed (km/h)</label>
                  <input 
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                    min="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-slate-500 uppercase font-semibold">Direction</label>
                  <select 
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                  >
                    <option value="OUTBOUND">Outbound (A→E)</option>
                    <option value="INBOUND">Inbound (E→A)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-slate-500 uppercase font-semibold">Status Sign</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-railBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-railCyan"
                >
                  <option value="ON_TIME">ON TIME</option>
                  <option value="DELAYED">DELAYED</option>
                  <option value="STOPPED">STOPPED / HELD</option>
                </select>
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
                  {editTrainId ? "Update Registry" : "Execute Injection"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
