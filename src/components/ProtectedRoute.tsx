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

  /* 2. Approval is deliberately NOT a gate on reaching the app.
   *
   * The backend's rule is that approval gates the transaction, not access:
   * it blocks publishing a campaign and applying to one (campaigns/views.py),
   * and nothing else. This file used to lock unapproved *influencers* out of
   * every page while letting unapproved *brands* straight through -- the
   * exact inverse of the backend, which auto-approved influencers and held
   * brands. Three signup paths, three different answers.
   *
   * Now there is one rule everywhere: nobody is auto-approved, everybody can
   * use the app, and the two actions that matter stay blocked until an admin
   * approves. ApprovalBanner (rendered in App.tsx whenever is_approved is
   * false) is what tells them, on every page, for both roles. */

  return <>{children}</>;
};

export default ProtectedRoute;
