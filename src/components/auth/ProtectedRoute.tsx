import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowUnonboarded?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowUnonboarded = false }) => {
  const { isAuthenticated, isLoading, user, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [isLoading, isAuthenticated, openAuthModal]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        color: '#94a3b8',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '2px solid rgba(139, 92, 246, 0.2)',
          borderTopColor: '#38bdf8',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#cbd5e1',
        }}>
          Synchronizing Celestial State...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user hasn't completed onboarding and is not already on onboarding page
  if (user && !user.onboarded && !allowUnonboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
