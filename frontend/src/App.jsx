import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import PlannerPage from './pages/PlannerPage';
import CustomPlannerPage from './pages/CustomPlannerPage';
import GraphPage from './pages/GraphPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import PriorityDashboard from './pages/PriorityDashboard';

function App() {
  // Read token once on mount via useState initializer
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    setToken(newToken); // re-renders App → Navigate kicks in
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("major");
    setToken(null); // re-renders App → Navigate to /login
  };

  return (
    <Router>
      {token && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/catalog" : "/login"} replace />} />
        <Route path="/login" element={token ? <Navigate to="/catalog" replace /> : <LoginPage onLogin={handleLogin} />} />

        <Route path="/catalog"        element={<ProtectedRoute token={token}><CatalogPage /></ProtectedRoute>} />
        <Route path="/planner"        element={<ProtectedRoute token={token}><PlannerPage /></ProtectedRoute>} />
        <Route path="/planner/custom" element={<ProtectedRoute token={token}><CustomPlannerPage /></ProtectedRoute>} />
        <Route path="/graph"          element={<ProtectedRoute token={token}><GraphPage /></ProtectedRoute>} />
        <Route path="/dashboard"      element={<ProtectedRoute token={token}><DashboardPage /></ProtectedRoute>} />
        <Route path="/priority-dashboard" element={<PriorityDashboard />} />

        <Route path="*" element={<Navigate to={token ? "/catalog" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;