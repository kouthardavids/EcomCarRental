import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../api/authContext.jsx';
import { getCurrentUser } from '../api/authToken.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    // If we have a user in localStorage but no auth state, try to refresh
    const storedUser = getCurrentUser();
    if (!isAuthenticated && storedUser && !loading) {
      checkAuthStatus();
    }
  }, [isAuthenticated, loading, checkAuthStatus]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login with current location
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          returnPath: location.pathname,
          returnState: location.state 
        }} 
        replace 
      />
    );
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;