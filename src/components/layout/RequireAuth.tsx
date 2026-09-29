import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';

interface RequireAuthProps {
  allowedRole?: UserRole;
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRole, children }) => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to user's home portal based on actual role
    const homePath = role === 'candidate' ? '/candidate' : '/recruiter/final-list';
    return <Navigate to={homePath} replace />;
  }

  return <>{children}</>;
};

/**
 * Root role redirector for "/" path
 */
export const RootRedirect: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'candidate') {
    return <Navigate to="/candidate" replace />;
  }

  return <Navigate to="/recruiter/final-list" replace />;
};
