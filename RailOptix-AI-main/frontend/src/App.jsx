import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Trains from "./pages/Trains";
import Stations from "./pages/Stations";
import Conflicts from "./pages/Conflicts";
import Recommendations from "./pages/Recommendations";
import Simulation from "./pages/Simulation";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Operations Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trains" element={<Trains />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/conflicts" element={<Conflicts />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
