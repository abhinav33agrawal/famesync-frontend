import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import { Card, CardHead, ErrorNote, Spinner } from "@/components/ui";

interface FinancialMetrics {
  mrr: number;
  lifetime_revenue: number;
  plan_distribution: { pro: number; free: number };
  credits: { total_issued: number; total_consumed: number };
}

export const Financial = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["financial"],
    queryFn: async () =>
      (await api.get<FinancialMetrics>("/admin-panel/financial/metrics/")).data,
  });

  if (isLoading) return <Spinner label="Loading financials" />;
  if (error) return <ErrorNote error={error} />;
  if (!data) return null;

  const plans = [
    { name: "Free", value: data.plan_distribution.free },
    { name: "Pro", value: data.plan_distribution.pro },
  ];

  return (
    <>
      <PageHead title="Financial" sub="Subscriptions and credit flow." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Monthly recurring revenue", inr(data.mrr)],
          ["Lifetime revenue", inr(data.lifetime_revenue)],
          ["Credits issued", num(data.credits.total_issued)],
          ["Credits consumed", num(data.credits.total_consumed)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="nums mt-1.5 text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHead
          title="Active subscriptions by plan"
          sub="Counts of subscriptions currently in an active state."
        />
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plans} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38 22% 89%)" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(30 7% 40%)" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(30 7% 40%)" }}
              />
              <Tooltip
                cursor={{ fill: "hsl(40 25% 93%)" }}
                formatter={(v: number) => [num(v), "Subscriptions"]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid hsl(38 22% 89%)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="hsl(288 42% 20%)" radius={[6, 6, 0, 0]} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Revenue figures are computed in{" "}
        <code className="rounded bg-muted px-1">admin_api/views.py</code> as a
        flat &#8377;2,500 per active subscription. They are a placeholder, not
        settled Razorpay revenue — treat them as a subscription count, not an
        accounting figure.
      </p>
    </>
  );
};
