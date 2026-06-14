// Frontend-only Real-time Mock API Simulator
// Intercepts window.fetch for localhost:8000 and falls back to in-memory state if backend is down.
// Ensures all generated and simulated statistics are strictly random and non-zero.

const STATION_LIST = ["Station A", "Station B", "Station C", "Station D", "Station E"];

// Helper to generate a random non-zero number
const getRandomNonZero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloatNonZero = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

let trains = [
  { id: 1, train_name: "Vande Bharat (22436)", train_type: "Vande Bharat", priority: 5, current_station: "Station A", target_station: "Station B", segment_progress: 0.15, delay_minutes: getRandomNonZero(2, 8), speed: 130, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: getRandomNonZero(2, 5) },
  { id: 2, train_name: "Rajdhani Express (12301)", train_type: "Rajdhani", priority: 4, current_station: "Station E", target_station: "Station D", segment_progress: 0.25, delay_minutes: getRandomNonZero(3, 10), speed: 120, status: "DELAYED", direction: "INBOUND", dwell_ticks: getRandomNonZero(1, 4) },
  { id: 3, train_name: "Garib Rath (12909)", train_type: "Express", priority: 3, current_station: "Station B", target_station: "Station C", segment_progress: 0.55, delay_minutes: getRandomNonZero(5, 12), speed: 100, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: getRandomNonZero(2, 6) },
  { id: 4, train_name: "Duronto Express (12260)", train_type: "Rajdhani", priority: 4, current_station: "Station D", target_station: "Station C", segment_progress: 0.65, delay_minutes: getRandomNonZero(2, 9), speed: 120, status: "DELAYED", direction: "INBOUND", dwell_ticks: getRandomNonZero(1, 5) },
  { id: 5, train_name: "Shatabdi Express (12002)", train_type: "Vande Bharat", priority: 5, current_station: "Station C", target_station: "Station D", segment_progress: 0.35, delay_minutes: getRandomNonZero(1, 7), speed: 130, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: getRandomNonZero(3, 5) },
  { id: 6, train_name: "Express 11005", train_type: "Express", priority: 3, current_station: "Station B", target_station: "Station A", segment_progress: 0.12, delay_minutes: getRandomNonZero(10, 20), speed: 95, status: "DELAYED", direction: "INBOUND", dwell_ticks: getRandomNonZero(2, 4) },
  { id: 7, train_name: "Passenger 51182", train_type: "Passenger", priority: 2, current_station: "Station D", target_station: "Station E", segment_progress: 0.75, delay_minutes: getRandomNonZero(6, 15), speed: 60, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: getRandomNonZero(1, 6) },
  { id: 8, train_name: "Local Passenger 51201", train_type: "Passenger", priority: 2, current_station: "Station C", target_station: "Station B", segment_progress: 0.18, delay_minutes: getRandomNonZero(2, 8), speed: 60, status: "DELAYED", direction: "INBOUND", dwell_ticks: getRandomNonZero(2, 5) },
  { id: 9, train_name: "Coal Freight 9001", train_type: "Freight", priority: 1, current_station: "Station A", target_station: "Station B", segment_progress: 0.08, delay_minutes: getRandomNonZero(15, 30), speed: 50, status: "DELAYED", direction: "OUTBOUND", dwell_ticks: getRandomNonZero(3, 7) },
  { id: 10, train_name: "Container Freight 9002", train_type: "Freight", priority: 1, current_station: "Station E", target_station: "Station D", segment_progress: 0.15, delay_minutes: getRandomNonZero(12, 28), speed: 55, status: "DELAYED", direction: "INBOUND", dwell_ticks: getRandomNonZero(2, 6) }
];

let stations = [
  { id: 1, station_name: "Station A", platform_count: 4, capacity: 6, current_occupancy: getRandomNonZero(1, 3), utilization: getRandomFloatNonZero(25.0, 75.0) },
  { id: 2, station_name: "Station B", platform_count: 2, capacity: 3, current_occupancy: getRandomNonZero(1, 2), utilization: getRandomFloatNonZero(33.0, 66.0) },
  { id: 3, station_name: "Station C", platform_count: 3, capacity: 4, current_occupancy: getRandomNonZero(1, 2), utilization: getRandomFloatNonZero(33.0, 66.0) },
  { id: 4, station_name: "Station D", platform_count: 2, capacity: 3, current_occupancy: getRandomNonZero(1, 2), utilization: getRandomFloatNonZero(33.0, 66.0) },
  { id: 5, station_name: "Station E", platform_count: 4, capacity: 6, current_occupancy: getRandomNonZero(1, 3), utilization: getRandomFloatNonZero(25.0, 75.0) }
];

let conflicts = [
  { id: 1, train1: "Express 11005", train2: "Garib Rath (12909)", track_section: "Station B - Station C", severity: "High", recommendation: "Hold Express 11005 at Station B loop and allow Garib Rath to proceed on outbound track.", expected_benefit: `${getRandomNonZero(10, 18)} Minutes Saved`, explanation: "Garib Rath has higher priority class and lower current delay.", is_active: true }
];

let recommendations = [
  { id: 1, conflict_id: 1, recommendation: "Hold Express 11005 at Station B loop and allow Garib Rath to proceed on outbound track.", expected_benefit: `${getRandomNonZero(10, 18)} Minutes Saved`, confidence_score: getRandomFloatNonZero(85.0, 95.0), explanation: "Garib Rath has higher priority class and lower current delay." }
];

let simulations = [
  { id: 1, scenario_name: "Heavy Rain", before_delay: getRandomNonZero(40, 50), after_delay: getRandomNonZero(15, 25), timestamp: new Date().toISOString() },
  { id: 2, scenario_name: "Signal Failure", before_delay: getRandomNonZero(55, 65), after_delay: getRandomNonZero(20, 30), timestamp: new Date().toISOString() },
  { id: 3, scenario_name: "Track Block", before_delay: getRandomNonZero(70, 85), after_delay: getRandomNonZero(30, 40), timestamp: new Date().toISOString() }
];

function simulateStep() {
  // Reset occupancies to at least 1 (non-zero)
  stations.forEach(s => { s.current_occupancy = getRandomNonZero(1, 2); });

  trains.forEach(train => {
    // Dwell ticks countdown
    if (train.dwell_ticks > 0) {
      train.dwell_ticks -= 1;
      train.segment_progress = getRandomFloatNonZero(0.02, 0.08); // non-zero
      train.speed = getRandomNonZero(15, 25); // non-zero crawl speed during dwell
    } else if (train.status === "STOPPED") {
      // Crawling or caution speed instead of absolute 0
      train.speed = getRandomNonZero(12, 18);
      if (Math.random() < 0.05) {
        train.delay_minutes += 1;
      }
    } else {
      if (train.speed <= 25) {
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
      train.segment_progress = getRandomFloatNonZero(0.01, 0.05); // reset to non-zero
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
      train.dwell_ticks = getRandomNonZero(3, 6);
      train.speed = getRandomNonZero(15, 22);
    }

    // Accumulate platform occupancy
    if (train.segment_progress <= 0.08) {
      const station = stations.find(s => s.station_name === train.current_station);
      if (station) {
        station.current_occupancy += 1;
      }
    }
  });

  // Recompute station platform utilizations (ensure non-zero)
  stations.forEach(s => {
    s.utilization = Math.max(12.5, Math.min(100.0, Math.round((s.current_occupancy / s.platform_count) * 1000) / 10));
  });

  // Keep active conflicts clean
  const activeConflicts = conflicts.filter(c => c.is_active);
  if (activeConflicts.length > 15) {
    conflicts = conflicts.filter(c => c.is_active);
  }

  // Ensure there is always at least 1 active conflict so conflict list is never empty/zero
  if (conflicts.filter(c => c.is_active).length === 0) {
    const activeTrains = trains.filter(t => t.segment_progress > 0.05);
    if (activeTrains.length >= 2) {
      const t1 = activeTrains[0];
      const t2 = activeTrains[1];
      const track_section = `${t1.current_station} - ${t1.target_station}`;
      const newConflict = {
        id: conflicts.length + 1,
        train1: t1.train_name,
        train2: t2.train_name,
        track_section: track_section,
        severity: Math.random() > 0.5 ? "High" : "Critical",
        recommendation: `Hold ${t1.train_name} at ${t1.current_station} and allow ${t2.train_name} to proceed.`,
        is_active: true,
        created_at: new Date().toISOString()
      };
      conflicts.push(newConflict);
      recommendations.push({
        id: recommendations.length + 1,
        conflict_id: newConflict.id,
        recommendation: newConflict.recommendation,
        expected_benefit: `${getRandomNonZero(8, 16)} Minutes Saved`,
        confidence_score: getRandomFloatNonZero(83.0, 96.0),
        explanation: "Automated local precedence checks triggered."
      });
    }
  }
}

function handleMockRequest(url, options) {
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const method = options?.method || 'GET';

  // 1. GET /api/dashboard
  if (path.endsWith('/api/dashboard') && method === 'GET') {
    simulateStep();
    const activeConflictsList = conflicts.filter(c => c.is_active);
    const avgDelay = trains.reduce((acc, t) => acc + t.delay_minutes, 0) / trains.length;
    const onTimeCount = trains.filter(t => t.status === "ON_TIME").length;
    const totalUtil = stations.reduce((acc, s) => acc + s.utilization, 0) / stations.length;

    const data = {
      totalTrains: trains.length,
      activeTrains: Math.max(3, trains.filter(t => t.speed > 25).length), // non-zero active trains
      activeConflicts: Math.max(1, activeConflictsList.length), // non-zero active conflicts
      averageDelay: Math.max(1.5, Math.round(avgDelay * 10) / 10), // non-zero delay
      throughput: Math.max(35, Math.min(99, Math.round(98.0 - (avgDelay * 0.4) - (activeConflictsList.length * 4.0)))),
      platformUtilization: Math.max(15.0, Math.round(totalUtil * 10) / 10), // non-zero platform util
      onTimePercentage: Math.max(45.0, Math.round((onTimeCount / trains.length) * 1000) / 10) // non-zero OTP
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
      segment_progress: 0.12,
      delay_minutes: parseInt(body.delay_minutes) || getRandomNonZero(2, 6),
      speed: parseInt(body.speed) || getNormalSpeed(body.train_type),
      status: body.status || "DELAYED",
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
      current_occupancy: getRandomNonZero(1, 2),
      utilization: getRandomFloatNonZero(15.0, 50.0)
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
            t1.status = "DELAYED";
            t1.speed = getNormalSpeed(t1.train_type);
            t2.status = "STOPPED";
            t2.speed = getRandomNonZero(10, 15); // slow crawl instead of 0
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
    
    const before_delay = getRandomNonZero(40, 50);
    const after_delay = getRandomNonZero(15, 25);
    
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
  let urlStr = '';
  if (typeof url === 'string') {
    urlStr = url;
  } else if (url && typeof url === 'object' && url.url) {
    urlStr = url.url;
  } else if (url && typeof url.toString === 'function') {
    urlStr = url.toString();
  }
  
  if (urlStr && (urlStr.startsWith('http://localhost:8000/api') || urlStr.includes('/api/'))) {
    // If running on a live domain (like Vercel), directly serve mock data for localhost requests
    // to bypass Mixed Content (HTTPS -> HTTP) and CORS blocks instantly.
    if (window.location.hostname !== 'localhost' && urlStr.includes('localhost:8000')) {
      return handleMockRequest(urlStr, options);
    }

    try {
      const response = await originalFetch(url, options);
      // Status 0 represents a blocked/failed request in many browser implementations.
      // We only return the response if it succeeded (status in 200-499 range).
      if (response.status >= 200 && response.status < 500) {
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
