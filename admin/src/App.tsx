import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { InsightsPage } from "@/pages/Insights";
import { Approvals } from "@/pages/Approvals";
import { AuditLogs } from "@/pages/AuditLogs";
import { Campaigns } from "@/pages/Campaigns";
import { Dashboard } from "@/pages/Dashboard";
import { Financial } from "@/pages/Financial";
import { Login } from "@/pages/Login";
import { Notifications } from "@/pages/Notifications";
import { Users } from "@/pages/Users";
import { UserDetail } from "@/pages/UserDetail";

const RequireStaff = () => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking access" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
};

export const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<RequireStaff />}>
      <Route index element={<Dashboard />} />
      <Route path="approvals" element={<Approvals />} />
      <Route path="users" element={<Users />} />
      <Route path="users/:id" element={<UserDetail />} />
      <Route path="campaigns" element={<Campaigns />} />
      <Route path="financial" element={<Financial />} />
      <Route path="insights" element={<InsightsPage />} />
      {/* Renamed from Analytics; keep old bookmarks working. */}
      <Route path="analytics" element={<Navigate to="/insights" replace />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="audit" element={<AuditLogs />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
