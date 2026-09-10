import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('influencer' | 'brand')[];
  requireProfile?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireProfile = true }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait until auth status is loaded
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // 1. Check if profile is required but not completed
  // This takes priority so users can complete setup even if unapproved
  const isSetupPage = location.pathname.includes('/setup');
  if (requireProfile && user && user.has_profile === false && !isSetupPage) {
    return <Navigate to={`/${user.role}/setup`} replace />;
  }

  // 2. Check for admin approval
  // Only redirect to waiting page IF profile is already completed
  const isWaitingPage = location.pathname.includes('/waiting-for-approval');
  const isUserBrand = user?.role === 'brand';

  if (user && user.is_approved === false && !isWaitingPage && !isSetupPage && !isUserBrand) {
    return <Navigate to="/waiting-for-approval" replace />;
  }

  if (isWaitingPage && isUserBrand) {
    return <Navigate to="/brand/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
