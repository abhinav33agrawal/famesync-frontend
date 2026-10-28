import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  ScrollText,
  Users,
  X,
} from "lucide-react";
import api, { type DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { Button } from "./ui";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck, badge: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/financial", label: "Financial", icon: CreditCard },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/audit", label: "Audit log", icon: ScrollText },
];

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  /* Drives the Approvals badge. Cheap enough to poll, and a stale count on an
     approval queue is actively misleading. */
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () =>
      (await api.get<DashboardStats>("/admin-panel/dashboard/stats/")).data,
    refetchInterval: 60_000,
  });
  const pending = stats?.approvals?.pending ?? 0;

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* backdrop for the mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          /* ink, like the main site's hero and onboarding panel */
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-ink text-ink-foreground",
          "transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black tracking-[-0.04em]">
              FameSync
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-foreground">
              Admin
            </span>
          </div>
          <button
            className="inline-flex size-10 items-center justify-center rounded-md hover:bg-ink-foreground/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        </div>

        <p className="px-6 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Manage
        </p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ink-foreground/10 font-semibold text-ink-foreground before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-primary"
                    : "text-ink-muted hover:bg-ink-foreground/5 hover:text-ink-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && pending > 0 && (
                <span className="nums rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-border p-3">
          <div className="flex items-center gap-3 px-2 pb-3 pt-1">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {(user?.username ?? "A").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.username ?? "Signed in"}
              </p>
              {user?.email && (
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-ink-muted hover:bg-ink-foreground/10 hover:text-ink-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-ink px-4 text-ink-foreground lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-md hover:bg-ink-foreground/10"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-black tracking-[-0.04em]">FameSync</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-foreground">
            Admin
          </span>
          {pending > 0 && (
            <NavLink
              to="/approvals"
              className="nums ml-auto rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground"
            >
              {pending} pending
            </NavLink>
          )}
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const PageHead = ({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">{title}</h1>
      {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
    </div>
    {action}
  </div>
);
