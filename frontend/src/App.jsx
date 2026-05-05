import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CatalogPage from './pages/CatalogPage';
import PlannerPage from './pages/PlannerPage';
import GraphPage from './pages/GraphPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/catalog" : "/login"} />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="/graph" element={<ProtectedRoute><GraphPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to={token ? "/catalog" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;