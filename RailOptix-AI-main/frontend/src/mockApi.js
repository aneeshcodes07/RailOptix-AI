// Frontend-only Real-time Mock API Simulator
// Intercepts window.fetch for localhost:8000 and falls back to in-memory state if backend is down.

const STATION_LIST = ["Station A", "Station B", "Station C", "Station D", "Station E"];

let trains = [
  { id: 1, train_name: "Vande Bharat (22436)", train_type: "Vande Bharat", priority: 5, current_station: "Station A", target_station: "Station B", segment_progress: 0.1, delay_minutes: 0, speed: 130, status: "ON_TIME", direction: "OUTBOUND", dwell_ticks: 0 },
  { id: 2, train_name: "Rajdhani Express (12301)", train_type: "Rajdhani", priority: 4, current_station: "Station E", target_station: "Station D", segment_progress: 0.2, delay_minutes: 2, speed: 120, status: "DELAYED", direction: "INBOUND", dwell_ticks: 0 },
  { id: 3, train_name: "Garib Rath (12909)", train_type: "Express", priority: 3, current_station: "Station B", target_station: "Station C", segment_progress: 0.5, delay_minutes: 5, speed: 100, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: 0 },
  { id: 4, train_name: "Duronto Express (12260)", train_type: "Rajdhani", priority: 4, current_station: "Station D", target_station: "Station C", segment_progress: 0.6, delay_minutes: 0, speed: 120, status: "ON_TIME", direction: "INBOUND", dwell_ticks: 0 },
  { id: 5, train_name: "Shatabdi Express (12002)", train_type: "Vande Bharat", priority: 5, current_station: "Station C", target_station: "Station D", segment_progress: 0.3, delay_minutes: 0, speed: 130, status: "ON_TIME", direction: "OUTBOUND", dwell_ticks: 0 },
  { id: 6, train_name: "Express 11005", train_type: "Express", priority: 3, current_station: "Station B", target_station: "Station A", segment_progress: 0.05, delay_minutes: 15, speed: 100, status: "DELAYED", direction: "INBOUND", dwell_ticks: 0 },
  { id: 7, train_name: "Passenger 51182", train_type: "Passenger", priority: 2, current_station: "Station D", target_station: "Station E", segment_progress: 0.7, delay_minutes: 8, speed: 60, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: 0 },
  { id: 8, train_name: "Local Passenger 51201", train_type: "Passenger", priority: 2, current_station: "Station C", target_station: "Station B", segment_progress: 0.1, delay_minutes: 0, speed: 60, status: "ON_TIME", direction: "INBOUND", dwell_ticks: 0 },
  { id: 9, train_name: "Coal Freight 9001", train_type: "Freight", priority: 1, current_station: "Station A", target_station: "Station B", segment_progress: 0.05, delay_minutes: 25, speed: 50, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: 0 },
  { id: 10, train_name: "Container Freight 9002", train_type: "Freight", priority: 1, current_station: "Station E", target_station: "Station D", segment_progress: 0.1, delay_minutes: 12, speed: 55, status: "DELAYED", direction: "INBOUND", dwell_ticks: 0 }
];

let stations = [
  { id: 1, station_name: "Station A", platform_count: 4, capacity: 6, current_occupancy: 2, utilization: 50.0 },
  { id: 2, station_name: "Station B", platform_count: 2, capacity: 3, current_occupancy: 1, utilization: 50.0 },
  { id: 3, station_name: "Station C", platform_count: 3, capacity: 4, current_occupancy: 2, utilization: 66.7 },
  { id: 4, station_name: "Station D", platform_count: 2, capacity: 3, current_occupancy: 1, utilization: 50.0 },
  { id: 5, station_name: "Station E", platform_count: 4, capacity: 6, current_occupancy: 2, utilization: 50.0 }
];

let conflicts = [
  { id: 1, train1: "Express 11005", train2: "Garib Rath (12909)", track_section: "Station B - Station C", severity: "High", recommendation: "Hold Express 11005 at Station B loop and allow Garib Rath to proceed on outbound track.", expected_benefit: "12 Minutes Saved", explanation: "Garib Rath has higher priority class and lower current delay.", is_active: true }
];

let recommendations = [
  { id: 1, conflict_id: 1, recommendation: "Hold Express 11005 at Station B loop and allow Garib Rath to proceed on outbound track.", expected_benefit: "12 Minutes Saved", confidence_score: 91.5, explanation: "Garib Rath has higher priority class and lower current delay." }
];

let simulations = [
  { id: 1, scenario_name: "Heavy Rain", before_delay: 45, after_delay: 20, timestamp: new Date().toISOString() },
  { id: 2, scenario_name: "Signal Failure", before_delay: 62, after_delay: 25, timestamp: new Date().toISOString() },
  { id: 3, scenario_name: "Track Block", before_delay: 80, after_delay: 35, timestamp: new Date().toISOString() }
];

function getNormalSpeed(type) {
  const speeds = {
    "Vande Bharat": 130,
    "Rajdhani": 120,
    "Express": 100,
    "Passenger": 60,
    "Freight": 50
  };
  return speeds[type] || 80;
}

function simulateStep() {
  // Reset occupancies
  stations.forEach(s => { s.current_occupancy = 0; });

  trains.forEach(train => {
    // Dwell ticks countdown
    if (train.dwell_ticks > 0) {
      train.dwell_ticks -= 1;
      train.segment_progress = 0.0;
      train.speed = 0;
    } else if (train.status === "STOPPED") {
      train.speed = 0;
      if (Math.random() < 0.05) {
        train.delay_minutes += 1;
      }
    } else {
      if (train.speed === 0) {
        train.speed = getNormalSpeed(train.train_type);
      }
      // Increment progress along the segment
      train.segment_progress += train.speed * 0.0003;
      
      // Micro-delay simulation
      if (Math.random() < 0.01) {
        train.delay_minutes += 1;
        train.status = "DELAYED";
      }
    }

    // End of track segment transition
    if (train.segment_progress >= 1.0) {
      train.segment_progress = 0.0;
      train.current_station = train.target_station;
      
      const currentIdx = STATION_LIST.indexOf(train.current_station);
      if (train.direction === "OUTBOUND") {
        if (train.current_station === "Station E") {
          train.direction = "INBOUND";
          train.target_station = "Station D";
        } else {
          train.target_station = STATION_LIST[currentIdx + 1];
        }
      } else {
        if (train.current_station === "Station A") {
          train.direction = "OUTBOUND";
          train.target_station = "Station B";
        } else {
          train.target_station = STATION_LIST[currentIdx - 1];
        }
      }
      train.dwell_ticks = Math.floor(Math.random() * 4) + 3; // 3 to 6 ticks dwell
      train.speed = 0;
    }

    // Accumulate platform occupancy
    if (train.segment_progress === 0.0) {
      const station = stations.find(s => s.station_name === train.current_station);
      if (station) {
        station.current_occupancy += 1;
      }
    }
  });

  // Recompute station platform utilizations
  stations.forEach(s => {
    s.utilization = Math.min(100.0, Math.round((s.current_occupancy / s.platform_count) * 1000) / 10);
  });

  // Clean resolved conflicts
  const activeConflicts = conflicts.filter(c => c.is_active);
  if (activeConflicts.length > 15) {
    conflicts = conflicts.filter(c => c.is_active);
  }

  // Random Conflict Generator
  if (conflicts.filter(c => c.is_active).length === 0 && Math.random() < 0.15) {
    const activeTrains = trains.filter(t => t.segment_progress > 0.1 && t.segment_progress < 0.9);
    if (activeTrains.length >= 2) {
      const t1 = activeTrains[0];
      // Find another train sharing target/current path or just general track
      const t2 = activeTrains.find(t => t.id !== t1.id && t.target_station === t1.target_station);
      if (t2) {
        const track_section = `${t1.current_station} - ${t1.target_station}`;
        const newConflict = {
          id: conflicts.length + 1,
          train1: t1.train_name,
          train2: t2.train_name,
          track_section: track_section,
          severity: Math.random() > 0.4 ? "High" : "Critical",
          recommendation: `Hold ${t1.train_name} at ${t1.current_station} and allow ${t2.train_name} to proceed.`,
          is_active: true,
          created_at: new Date().toISOString()
        };
        conflicts.push(newConflict);
        recommendations.push({
          id: recommendations.length + 1,
          conflict_id: newConflict.id,
          recommendation: newConflict.recommendation,
          expected_benefit: `${Math.floor(Math.random() * 15) + 8} Minutes Saved`,
          confidence_score: Math.round((82 + Math.random() * 16) * 10) / 10,
          explanation: "Automated precedence check determined priority class superiority."
        });
      }
    }
  }
}

function handleMockRequest(url, options) {
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  const method = options?.method || 'GET';

  // 1. GET /api/dashboard
  if (path.endsWith('/api/dashboard') && method === 'GET') {
    simulateStep();
    const activeConflicts = conflicts.filter(c => c.is_active);
    const avgDelay = trains.reduce((acc, t) => acc + t.delay_minutes, 0) / trains.length;
    const onTimeCount = trains.filter(t => t.status === "ON_TIME").length;
    const totalUtil = stations.reduce((acc, s) => acc + s.utilization, 0) / stations.length;

    const data = {
      totalTrains: trains.length,
      activeTrains: trains.filter(t => t.speed > 0).length,
      activeConflicts: activeConflicts.length,
      averageDelay: Math.round(avgDelay * 10) / 10,
      throughput: Math.max(35, Math.min(99, Math.round(98.0 - (avgDelay * 0.4) - (activeConflicts.length * 4.0)))),
      platformUtilization: Math.round(totalUtil * 10) / 10,
      onTimePercentage: Math.round((onTimeCount / trains.length) * 1000) / 10
    };
    return mockResponse(data);
  }

  // 2. GET /api/trains
  if (path.endsWith('/api/trains') && method === 'GET') {
    return mockResponse(trains);
  }

  // 3. POST /api/trains (Create Train)
  if (path.endsWith('/api/trains') && method === 'POST') {
    const body = JSON.parse(options.body);
    const newTrain = {
      id: trains.length + 1,
      train_name: body.train_name,
      train_type: body.train_type || "Express",
      priority: parseInt(body.priority) || 3,
      current_station: body.current_station || "Station A",
      target_station: body.target_station || "Station B",
      segment_progress: 0.0,
      delay_minutes: parseInt(body.delay_minutes) || 0,
      speed: parseInt(body.speed) || getNormalSpeed(body.train_type),
      status: body.status || "ON_TIME",
      direction: body.direction || "OUTBOUND",
      dwell_ticks: 0
    };
    trains.push(newTrain);
    return mockResponse(newTrain, 210);
  }

  // 4. PUT /api/trains/{id} (Update Train)
  if (path.includes('/api/trains/') && method === 'PUT') {
    const match = path.match(/\/api\/trains\/(\d+)/);
    if (match) {
      const trainId = parseInt(match[1]);
      const body = JSON.parse(options.body);
      const trainIndex = trains.findIndex(t => t.id === trainId);
      if (trainIndex !== -1) {
        trains[trainIndex] = { ...trains[trainIndex], ...body };
        return mockResponse(trains[trainIndex]);
      }
    }
    return mockResponse({ error: "Train not found" }, 404);
  }

  // 5. DELETE /api/trains/{id} (Delete Train)
  if (path.includes('/api/trains/') && method === 'DELETE') {
    const match = path.match(/\/api\/trains\/(\d+)/);
    if (match) {
      const trainId = parseInt(match[1]);
      trains = trains.filter(t => t.id !== trainId);
      return mockResponse({ message: `Train ${trainId} successfully deleted` });
    }
    return mockResponse({ error: "Train not found" }, 404);
  }

  // 6. GET /api/stations
  if (path.endsWith('/api/stations') && method === 'GET') {
    return mockResponse(stations);
  }

  // 7. POST /api/stations (Create Station)
  if (path.endsWith('/api/stations') && method === 'POST') {
    const body = JSON.parse(options.body);
    const newStation = {
      id: stations.length + 1,
      station_name: body.station_name,
      platform_count: parseInt(body.platform_count) || 2,
      capacity: parseInt(body.capacity) || 4,
      current_occupancy: 0,
      utilization: 0.0
    };
    stations.push(newStation);
    return mockResponse(newStation, 210);
  }

  // 8. GET /api/conflicts
  if (path.endsWith('/api/conflicts') && method === 'GET') {
    return mockResponse(conflicts.filter(c => c.is_active));
  }

  // 9. GET /api/conflicts/resolved
  if (path.endsWith('/api/conflicts/resolved') && method === 'GET') {
    return mockResponse(conflicts.filter(c => !c.is_active));
  }

  // 10. GET /api/recommendations
  if (path.endsWith('/api/recommendations') && method === 'GET') {
    const activeConflictIds = conflicts.filter(c => c.is_active).map(c => c.id);
    return mockResponse(recommendations.filter(r => activeConflictIds.includes(r.conflict_id)));
  }

  // 11. POST /api/recommendations/{id}/apply
  if (path.includes('/api/recommendations/') && path.endsWith('/apply') && method === 'POST') {
    const match = path.match(/\/api\/recommendations\/(\d+)\/apply/);
    if (match) {
      const recId = parseInt(match[1]);
      const rec = recommendations.find(r => r.id === recId);
      if (rec) {
        const conflict = conflicts.find(c => c.id === rec.conflict_id);
        if (conflict) {
          conflict.is_active = false;
          conflict.recommendation = `Applied: ${rec.recommendation}`;
          
          // Winner proceeds, loser stopped
          const t1 = trains.find(t => t.train_name === conflict.train1);
          const t2 = trains.find(t => t.train_name === conflict.train2);
          if (t1 && t2) {
            t1.status = "ON_TIME";
            t1.speed = getNormalSpeed(t1.train_type);
            t2.status = "STOPPED";
            t2.speed = 0;
            t2.delay_minutes += 5;
          }
          return mockResponse({ message: "Recommendation successfully applied. Traffic updated." });
        }
      }
    }
    return mockResponse({ error: "Recommendation not found" }, 404);
  }

  // 12. POST /api/simulate
  if (path.endsWith('/api/simulate') && method === 'POST') {
    const body = JSON.parse(options.body);
    const scenarioName = body.scenario_name || "General Delay";
    
    const before_delay = Math.floor(Math.random() * 30) + 40;
    const after_delay = Math.floor(Math.random() * 15) + 15;
    
    // Recovery workplans mapping
    const plans = {
      "Heavy Rain": {
        details: "Monsoon storms restricts section speed limits. Water level at 80mm; speed restricted to 50 km/h.",
        plan: "1. Enforce wet-weather caution speed limits across affected sectors.\n2. Park Freight trains at Station siding yards to prevent mainline gridlock.\n3. Grant absolute track precedence to Vande Bharat & Rajdhani Express trains."
      },
      "Signal Failure": {
        details: "Interlocking failure halts automatic signaling at Junction D. Section occupancy tracked via paper tokens.",
        plan: "1. Establish Single Line Token Working protocol.\n2. Deploy hand-signaling staff at Junction D.\n3. Terminate local passenger loops early."
      },
      "Track Block": {
        details: "Maintenance block shuts down prime sections on outbound line. Single line operation in place.",
        plan: "1. Activate single-line bi-directional signaling.\n2. Establish alternating traffic slots.\n3. Hold Freight trains at Station B loop."
      }
    };
    
    const scPlan = plans[scenarioName] || {
      details: `Simulated operational impact of ${scenarioName} on mainline traffic corridors.`,
      plan: "1. Activate emergency routing.\n2. Apply speed cautions.\n3. Run accumulated traffic in order of precedence."
    };

    const newSim = {
      id: simulations.length + 1,
      scenario_name: scenarioName,
      before_delay,
      after_delay,
      timestamp: new Date().toISOString()
    };
    simulations.push(newSim);

    return mockResponse({
      scenario_name: scenarioName,
      before_delay,
      after_delay,
      details: scPlan.details,
      recovery_plan: scPlan.plan,
      timestamp: newSim.timestamp
    });
  }

  // 13. GET /api/simulations (simulations history)
  if (path.endsWith('/api/simulations') && method === 'GET') {
    return mockResponse(simulations);
  }

  return mockResponse([]);
}

function mockResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Monkey-patch window.fetch
const originalFetch = window.fetch;
window.fetch = async function (url, options) {
  const urlStr = typeof url === 'string' ? url : url.url;
  
  if (urlStr && (urlStr.startsWith('http://localhost:8000/api') || urlStr.includes('/api/'))) {
    try {
      const response = await originalFetch(url, options);
      // If server responds with 5xx or general error, trigger fallback
      if (response.ok || response.status < 500) {
        return response;
      }
    } catch (e) {
      // Backend down - trigger fallback mock API
    }
    return handleMockRequest(urlStr, options);
  }
  
  return originalFetch(url, options);
};

console.log("🚀 RailOptix Dynamic Mock API Interceptor Loaded successfully.");
