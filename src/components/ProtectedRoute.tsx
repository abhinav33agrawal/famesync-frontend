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

  /* 2. Approval gate -- influencers only, deliberately.
   *
   * Nobody is auto-approved on any signup path (see
   * instagram/views.py _create_or_attach_user). What differs by role is how
   * much of the app an unapproved account can reach:
   *
   *   influencer  held on /waiting-for-approval until an admin approves
   *   brand       uses the app freely; the backend refuses to *publish* a
   *               campaign until approved (campaigns/views.py), and
   *               ApprovalBanner says so on every page
   *
   * The asymmetry is a product choice: creator supply is reviewed before it
   * is visible at all, while brands are allowed in to explore before they
   * spend. Setup is exempt so either role can finish its profile first. */
  const isWaitingPage = location.pathname.includes('/waiting-for-approval');
  const isUserBrand = user?.role === 'brand';

  if (user && user.is_approved === false && !isWaitingPage && !isSetupPage && !isUserBrand) {
    return <Navigate to="/waiting-for-approval" replace />;
  }

  // Brands never belong on the waiting page -- send them to work instead.
  if (isWaitingPage && isUserBrand) {
    return <Navigate to="/brand/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
