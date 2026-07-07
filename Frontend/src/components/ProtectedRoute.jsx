// src/components/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, isAdmin, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-indigo-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    const redirectPath = requireAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin) {
    // Redirect non-admin users to home page or user dashboard
    return <Navigate to="/" replace />;
  }

  return children;
}