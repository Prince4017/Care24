import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page"><p className="checking">Loading&hellip;</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
