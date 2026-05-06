import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, token }) {
  // Use token prop passed from App (reactive) instead of reading localStorage directly
  const isAuth = token || localStorage.getItem('token');
  return isAuth ? children : <Navigate to="/login" replace />;
}