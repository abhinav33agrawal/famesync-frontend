import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ApprovalBanner from "@/components/layout/ApprovalBanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InstagramAuthCallback from "./pages/InstagramAuthCallback";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WaitingForApproval from "./pages/WaitingForApproval";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// Influencer pages
import InfluencerSetup from "./pages/influencer/Setup";
import InfluencerDashboard from "./pages/influencer/Dashboard";
import InfluencerCampaigns from "./pages/influencer/Campaigns";
import InfluencerCampaignDetail from "./pages/influencer/CampaignDetail";
import InfluencerApplications from "./pages/influencer/Applications";
import InfluencerProfile from "./pages/influencer/Profile";

// Brand pages
import BrandSetup from "./pages/brand/Setup";
import BrandDashboard from "./pages/brand/Dashboard";
import BrandCampaigns from "./pages/brand/Campaigns";
import BrandCampaignDetail from "./pages/brand/CampaignDetail";
import BrandCreateCampaign from "./pages/brand/CreateCampaign";
import BrandProfile from "./pages/brand/Profile";
import BrandDiscover from "./pages/brand/Discover";

// Shared pages
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data won't refetch if navigating back
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

/* Single navigation model: the Navbar carries the role nav, so there is no
   sidebar and no second copy of the route table. The marketing footer is
   kept off the signed-in app surfaces.

   Deliverables has a page and hooks but no route: the API doesn't serve
   /api/deliverables/ (the app is commented out of INSTALLED_APPS and the
   root urlconf), so every call 404s. Re-add the route and the navbar link
   in the same change that enables the backend. */
const APP_PATHS = [
  "/dashboard",
  "/campaigns",
  "/applications",
  "/deliverables",
  "/profile",
  "/subscription",
  "/settings",
  "/create-campaign",
  "/discover",
];

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const isAppSurface = APP_PATHS.some((p) => pathname.includes(p));

  const hideChrome =
    pathname === "/auth" ||
    pathname === "/auth/callback" ||
    pathname.includes("/setup") ||
    pathname === "/waiting-for-approval";

  const showApprovalBanner =
    isAuthenticated && user && user.is_approved === false && pathname !== "/waiting-for-approval" && pathname !== "/auth";

  return (
    <div className="flex min-h-screen flex-col">
      {showApprovalBanner && <ApprovalBanner isSetup={pathname.includes("/setup")} />}
      {!hideChrome && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/auth/callback" element={<InstagramAuthCallback />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/waiting-for-approval" element={<WaitingForApproval />} />
          <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Influencer Routes */}
          <Route
            path="/influencer/setup"
            element={
              <ProtectedRoute allowedRoles={['influencer']}>
                <InfluencerSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['influencer']}>
                <InfluencerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencer/campaigns"
            element={
              <ProtectedRoute allowedRoles={['influencer']}>
                <InfluencerCampaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencer/campaigns/:slug"
            element={
              <ProtectedRoute allowedRoles={['influencer']}>
                <InfluencerCampaignDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencer/applications"
            element={
              <ProtectedRoute allowedRoles={['influencer']}>
                <InfluencerApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencer/profile"
            element={
              <ProtectedRoute allowedRoles={['influencer']}>
                <InfluencerProfile />
              </ProtectedRoute>
            }
          />

          {/* Brand Routes */}
          <Route
            path="/brand/setup"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/dashboard"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/discover"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandDiscover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/campaigns"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandCampaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/campaigns/:slug"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandCampaignDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/create-campaign"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandCreateCampaign />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/profile"
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <BrandProfile />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideChrome && !isAppSurface && <Footer />}
    </div>
  );
};

export default App;
