import React from 'react';
import { AlertTriangle } from 'lucide-react';

const STATION_COORDS = {
  "Station A": { x: 100, y: 200, platforms: 4 },
  "Station B": { x: 300, y: 120, platforms: 2 },
  "Station C": { x: 500, y: 280, platforms: 3 },
  "Station D": { x: 700, y: 120, platforms: 2 },
  "Station E": { x: 900, y: 200, platforms: 4 }
};

const LiveNetworkMap = ({ trains = [], conflicts = [] }) => {
  
  // Calculate exact train coordinates on the track
  const getTrainCoords = (train) => {
    const start = STATION_COORDS[train.current_station];
    const end = train.target_station ? STATION_COORDS[train.target_station] : null;

    if (!end || train.segment_progress === 0.0) {
      // Halted at current station. Render at station.
      // Distribute trains across platforms
      const haltedTrains = trains.filter(
        t => t.current_station === train.current_station && t.segment_progress === 0.0
      );
      const index = haltedTrains.findIndex(t => t.id === train.id);
      const platformOffset = (index !== -1 ? index : 0) * 12 - ((start.platforms - 1) * 6);
      return {
        x: start.x,
        y: start.y + platformOffset,
        isHalted: true
      };
    }

    // Interpolate progress along track line
    const progress = train.segment_progress;
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;

    // Offset outbound/inbound tracks slightly so trains don't overlap
    const trackOffset = train.direction === 'OUTBOUND' ? -7 : 7;

    return {
      x,
      y: y + trackOffset,
      isHalted: false
    };
  };

  const getTrainColorClass = (priority, status) => {
    if (status === "STOPPED") return "#f43f5e"; // Red
    switch (priority) {
      case 5: return "#06b6d4"; // Cyan
      case 4: return "#ec4899"; // Pink
      case 3: return "#f59e0b"; // Amber
      case 2: return "#10b981"; // Emerald
      case 1:
      default:
        return "#64748b"; // Slate
    }
  };

  // Helper to identify if a segment between two stations has an active conflict
  const isSegmentInConflict = (stat1, stat2) => {
    return conflicts.some(c => {
      const parts = c.track_section.split(' - ');
      return (parts.includes(stat1) && parts.includes(stat2));
    });
  };

  return (
    <div className="w-full relative bg-slate-950/60 rounded-2xl border border-slate-900 overflow-hidden shadow-2xl p-4">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 rounded-lg p-3 z-10 flex gap-4 text-xs font-semibold backdrop-blur-md">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#06b6d4] inline-block" /><span>Vande Bharat</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ec4899] inline-block" /><span>Rajdhani</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block" /><span>Express</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10b981] inline-block" /><span>Passenger</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#64748b] inline-block" /><span>Freight</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50 inline-block animate-pulse" /><span>Conflict</span></div>
      </div>

      <svg viewBox="0 0 1000 400" className="w-full h-auto">
        {/* Draw Track Segments */}
        {Object.entries(STATION_COORDS).map(([name, coords], idx, arr) => {
          if (idx === arr.length - 1) return null;
          const nextStation = arr[idx + 1];
          const hasConflict = isSegmentInConflict(name, nextStation[0]);

          return (
            <g key={`track-${name}-${nextStation[0]}`}>
              {/* Glow background if segment in conflict */}
              {hasConflict && (
                <line
                  x1={coords.x}
                  y1={coords.y}
                  x2={nextStation[1].x}
                  y2={nextStation[1].y}
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="opacity-25 animate-pulse"
                />
              )}
              {/* Main Track Line */}
              <line
                x1={coords.x}
                y1={coords.y}
                x2={nextStation[1].x}
                y2={nextStation[1].y}
                stroke={hasConflict ? "#f43f5e" : "#334155"}
                strokeWidth={hasConflict ? "3" : "2"}
                strokeDasharray={hasConflict ? "5,5" : "none"}
                className={hasConflict ? "animate-blink" : ""}
              />
              {/* Conflict indicator icon */}
              {hasConflict && (
                <g transform={`translate(${(coords.x + nextStation[1].x) / 2}, ${(coords.y + nextStation[1].y) / 2 - 20})`}>
                  <circle r="12" fill="#ef4444" className="animate-ping opacity-40" />
                  <circle r="10" fill="#ef4444" />
                  <path d="M-4 4 L0 -4 L4 4 Z" fill="#000" transform="scale(0.8)" />
                </g>
              )}
            </g>
          );
        })}

        {/* Draw Stations and Platform Slots */}
        {Object.entries(STATION_COORDS).map(([name, coords]) => (
          <g key={`station-${name}`} className="cursor-pointer">
            {/* Draw Platform lines */}
            {Array.from({ length: coords.platforms }).map((_, pIdx) => {
              const yOffset = pIdx * 12 - ((coords.platforms - 1) * 6);
              return (
                <line
                  key={`platform-${name}-${pIdx}`}
                  x1={coords.x - 30}
                  y1={coords.y + yOffset}
                  x2={coords.x + 30}
                  y2={coords.y + yOffset}
                  stroke="#475569"
                  strokeWidth="2.5"
                  opacity="0.65"
                />
              );
            })}

            {/* Station Hub Outer Ring */}
            <circle
              cx={coords.x}
              cy={coords.y}
              r="24"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#06b6d4"
              strokeWidth="2"
              className="shadow-lg"
            />
            {/* Station Hub Inner Circle */}
            <circle
              cx={coords.x}
              cy={coords.y}
              r="6"
              fill="#06b6d4"
              className="animate-pulse"
            />

            {/* Station Label */}
            <text
              x={coords.x}
              y={coords.y - 32}
              textAnchor="middle"
              className="fill-slate-100 font-bold text-xs uppercase tracking-wider"
            >
              {name}
            </text>
            <text
              x={coords.x}
              y={coords.y + 36}
              textAnchor="middle"
              className="fill-slate-500 font-bold text-[9px]"
            >
              Platforms: {coords.platforms}
            </text>
          </g>
        ))}

        {/* Draw Dynamic Train Indicators */}
        {trains.map((train) => {
          const coords = getTrainCoords(train);
          const color = getTrainColorClass(train.priority, train.status);
          const isConflictInvolved = conflicts.some(c => c.train1 === train.train_name || c.train2 === train.train_name);

          return (
            <g
              key={`train-node-${train.id}`}
              className="transition-all duration-1000 ease-in-out cursor-pointer"
            >
              {/* Glow Pulse ring */}
              {(train.status === "STOPPED" || isConflictInvolved) ? (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="12"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="animate-ping opacity-60"
                />
              ) : train.speed > 110 ? (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="10"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  className="animate-pulse opacity-70"
                />
              ) : null}

              {/* Train Node Dot */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="7"
                fill={color}
                stroke="#020617"
                strokeWidth="1.5"
                className="shadow-md"
              />

              {/* Direction Arrow */}
              <path
                d={train.direction === 'OUTBOUND' ? "M3 -3 L7 0 L3 3" : "M-3 -3 L-7 0 L-3 3"}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                transform={`translate(${coords.x}, ${coords.y})`}
              />

              {/* Train Short ID Text tag */}
              <text
                x={coords.x}
                y={train.direction === 'OUTBOUND' ? coords.y - 12 : coords.y + 16}
                textAnchor="middle"
                className="fill-slate-300 font-mono text-[9px] font-semibold bg-slate-950 px-1 rounded shadow"
              >
                {train.train_name.split(' (')[0]} {train.delay_minutes > 0 ? `+${train.delay_minutes}m` : ''}
              </text>

              {/* Tooltip Hover target */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="15"
                fill="transparent"
              >
                <title>
                  {`${train.train_name}\nType: ${train.train_type}\nSpeed: ${train.speed} km/h\nDelay: ${train.delay_minutes} min\nStatus: ${train.status}\nSection: ${train.current_station} ➔ ${train.target_station || 'Terminal'}`}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default LiveNetworkMap;
