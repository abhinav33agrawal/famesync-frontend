import { Link } from "react-router-dom";
import { AXIS_INK, SERIES, tooltipStyle } from "@/components/charts";
import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ArrowRight, Megaphone, TrendingUp, UserCheck, Users } from "lucide-react";
import api, { type DashboardStats } from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import { Button, Card, CardHead, ErrorNote, Spinner } from "@/components/ui";

const Stat = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone?: "brand" | "warn";
}) => (
  <Card className="p-4 sm:p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="nums mt-1.5 font-display text-2xl font-extrabold tracking-[-0.02em]">{value}</p>
      </div>
      <div
        className={
          tone === "warn"
            ? "rounded-md bg-warning/10 p-2 text-warning"
            : "rounded-md bg-secondary p-2 text-secondary-foreground"
        }
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </Card>
);

/* The validated chart pair (charts.tsx): influencers violet, brands magenta. */
const SLICE = SERIES;

export const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () =>
      (await api.get<DashboardStats>("/admin-panel/dashboard/stats/")).data,
  });

  if (isLoading) return <Spinner label="Loading dashboard" />;
  if (error) return <ErrorNote error={error} />;
  if (!data) return null;

  const pending = data.approvals?.pending ?? 0;
  const mix = [
    { name: "Influencers", value: data.users.influencers },
    { name: "Brands", value: data.users.brands },
  ];

  return (
    <>
      <PageHead
        title="Dashboard"
        sub="Platform health at a glance."
      />

      {pending > 0 && (
        <Card className="mb-6 border-warning/40 bg-warning/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-semibold">
                  {num(pending)} account{pending === 1 ? "" : "s"} waiting for
                  approval
                </p>
                <p className="text-xs text-muted-foreground">
                  Unapproved users cannot post or apply to campaigns.
                </p>
              </div>
            </div>
            <Link to="/approvals">
              <Button size="sm">
                Review queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Total users" value={num(data.users.total)} icon={Users} />
        <Stat
          label="Pending approval"
          value={num(pending)}
          icon={UserCheck}
          tone={pending > 0 ? "warn" : "brand"}
        />
        <Stat
          label="Active campaigns"
          value={num(data.campaigns.active)}
          icon={Megaphone}
        />
        <Stat label="MRR" value={inr(data.revenue.mrr)} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead title="Audience mix" sub="Share of accounts by role." />
          <div className="h-64 p-4">
            {data.users.total === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No users yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {mix.map((_, i) => (
                      <Cell key={i} fill={SLICE[i % SLICE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => [num(v), n]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    formatter={(v) => (
                      <span style={{ fontSize: 12, color: AXIS_INK }}>
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Totals" sub="Raw counts, straight from the API." />
          <dl className="divide-y divide-border">
            {[
              ["Influencers", num(data.users.influencers)],
              ["Brands", num(data.users.brands)],
              ["Campaigns, all time", num(data.campaigns.total)],
              ["Campaigns, active", num(data.campaigns.active)],
              ["Monthly recurring revenue", inr(data.revenue.mrr)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-5 py-3 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="nums font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        MRR is each active Pro subscription at its plan price (from{" "}
        <code className="rounded bg-muted px-1">subscriptions/constants.py</code>), not billed
        revenue — settled payments live in Razorpay.
      </p>
    </>
  );
};
