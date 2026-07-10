import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}
