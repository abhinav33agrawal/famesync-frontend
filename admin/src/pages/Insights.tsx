import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import api, { type Insights as InsightsData, type Metric } from "@/lib/api";
import { cn } from "@/lib/cn";
import { num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import { Badge, Card, CardHead, Empty, ErrorNote, Spinner, Table, Td, Th } from "@/components/ui";
import {
  CURSOR_FILL,
  ChartCard,
  GRID,
  LABEL_INK,
  Legend,
  SERIES,
  axisTick,
  bucketLabel,
  tooltipStyle,
  type Granularity,
} from "@/components/charts";

/* ------------------------------------------------------------ range */

/** UTC, because the backend buckets in UTC. A local-time "today" would put
 *  late-evening IST activity in the wrong bucket. */
const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

const PRESETS = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "12m", label: "12 months", days: 365 },
] as const;

type PresetKey = (typeof PRESETS)[number]["key"] | "custom";

const prettyDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

/* ------------------------------------------------------------ KPI */

const Delta = ({ metric, points }: { metric: Metric; points?: boolean }) => {
  if (metric.change === null) {
    return <span className="text-xs text-muted-foreground">No prior-period data</span>;
  }
  const up = metric.change > 0;
  const flat = metric.change === 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  // Every figure here is a growth measure, so up genuinely means good. The
  // arrow and the words carry direction too, so colour is never alone.
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        flat ? "text-muted-foreground" : up ? "text-success" : "text-destructive"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(metric.change)}
      {points ? " pts" : "%"}
    </span>
  );
};

const Kpi = ({
  label,
  metric,
  format = (v) => num(v),
  points,
}: {
  label: string;
  metric: Metric;
  format?: (v: number) => string;
  points?: boolean;
}) => (
  <Card className="p-4 sm:p-5">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    {/* Proportional figures: tabular-nums spaces a standalone number loosely. */}
    <p className="nums mt-1.5 font-display text-2xl font-extrabold tracking-[-0.02em]">{metric.value === null ? "—" : format(metric.value)}</p>
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <Delta metric={metric} points={points} />
      {metric.previous !== null && (
        <span className="text-xs text-muted-foreground">vs {format(metric.previous)}</span>
      )}
    </div>
  </Card>
);

/* ------------------------------------------------------------ charts */

const CHART_H = 240;

const TimeLines = ({
  data,
  granularity,
  series,
}: {
  data: Record<string, string | number>[];
  granularity: Granularity;
  series: { key: string; label: string; color: string }[];
}) => (
  <div style={{ height: CHART_H }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="bucket"
          tickFormatter={(k) => bucketLabel(k, granularity)}
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(k) => bucketLabel(String(k), granularity, true)}
          formatter={(v: number, name: string) => [num(v), name]}
        />
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            // 2px surface ring keeps the marker legible where lines cross.
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const TimeBars = ({
  data,
  granularity,
  dataKey,
  label,
}: {
  data: Record<string, string | number>[];
  granularity: Granularity;
  dataKey: string;
  label: string;
}) => (
  <div style={{ height: CHART_H }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }} barCategoryGap="18%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="bucket"
          tickFormatter={(k) => bucketLabel(k, granularity)}
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          cursor={{ fill: CURSOR_FILL }}
          contentStyle={tooltipStyle}
          labelFormatter={(k) => bucketLabel(String(k), granularity, true)}
          formatter={(v: number) => [num(v), label]}
        />
        <Bar dataKey={dataKey} fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/** Nominal categories, one series: one colour for every bar. A darker-where-
 *  bigger ramp would only restate the bar length. Direct labels at the bar
 *  end mean the value never depends on hovering. */
const Breakdown = ({ rows, label }: { rows: { name: string; count: number }[]; label: string }) => (
  <div style={{ height: Math.max(120, rows.length * 34 + 16) }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }} barCategoryGap="22%">
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip
          cursor={{ fill: CURSOR_FILL }}
          contentStyle={tooltipStyle}
          formatter={(v: number) => [num(v), label]}
        />
        <Bar dataKey="count" fill={SERIES[0]} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
          <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: LABEL_INK }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "Unset");

/* ------------------------------------------------------------ page */

export const InsightsPage = () => {
  const [preset, setPreset] = useState<PresetKey>("30d");
  const [from, setFrom] = useState(isoDaysAgo(29));
  const [to, setTo] = useState(isoDaysAgo(0));

  const choosePreset = (key: PresetKey) => {
    setPreset(key);
    const p = PRESETS.find((x) => x.key === key);
    if (p) {
      setFrom(isoDaysAgo(p.days - 1));
      setTo(isoDaysAgo(0));
    }
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["insights", from, to],
    queryFn: async () =>
      (await api.get<InsightsData>("/admin-panel/insights/", { params: { from, to } })).data,
    // Hold the last render while a new range loads -- a skeleton flash on
    // every preset click reads as the page breaking.
    placeholderData: (prev) => prev,
  });

  const rows = useMemo(() => {
    if (!data) return [];
    return data.buckets.map((bucket, i) => ({
      bucket,
      influencers: data.series.influencer_signups[i],
      brands: data.series.brand_signups[i],
      campaigns: data.series.campaigns[i],
      applications: data.series.applications[i],
      accepted: data.series.accepted[i],
    }));
  }, [data]);

  const g = (data?.range.granularity ?? "day") as Granularity;
  const t = data?.totals;
  const tableRows = (keys: (keyof (typeof rows)[number])[]) =>
    rows.map((r) => [bucketLabel(r.bucket, g, true), ...keys.map((k) => num(r[k] as number))]);

  return (
    <>
      <PageHead
        title="Insights"
        sub="Platform activity for any period, compared with the period just before it."
      />

      {/* One filter row, scoping every figure and chart below it. */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-md bg-muted p-1" role="group" aria-label="Date range">
            {[...PRESETS.map((p) => ({ key: p.key as PresetKey, label: p.label })), { key: "custom" as PresetKey, label: "Custom" }].map(
              (p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => choosePreset(p.key)}
                  aria-pressed={preset === p.key}
                  className={cn(
                    "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                    preset === p.key
                      ? "bg-card text-foreground shadow-e1"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              )
            )}
          </div>

          {preset === "custom" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => e.target.value && setFrom(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                aria-label="From"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={to}
                min={from}
                max={isoDaysAgo(0)}
                onChange={(e) => e.target.value && setTo(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                aria-label="To"
              />
            </div>
          )}

          {data && (
            <p className="ml-auto text-xs text-muted-foreground">
              {prettyDate(data.range.from)} – {prettyDate(data.range.to)} · compared with{" "}
              {prettyDate(data.range.previous_from)} – {prettyDate(data.range.previous_to)}
            </p>
          )}
        </div>
      </Card>

      {isLoading && !data ? (
        <Spinner label="Loading insights" />
      ) : error && !data ? (
        <ErrorNote error={error} />
      ) : !data || !t ? null : (
        <div className={cn("space-y-6 transition-opacity", isFetching && "opacity-60")}>
          {/* the funnel in order: signups -> campaigns -> unlocks -> applications -> accepted */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <Kpi label="New signups" metric={t.signups} />
            <Kpi label="Campaigns created" metric={t.campaigns} />
            <Kpi label="Briefs unlocked" metric={t.unlocks} />
            <Kpi label="Applications submitted" metric={t.applications} />
            <Kpi label="Accepted" metric={t.accepted} />
            <Kpi label="Acceptance rate" metric={t.acceptance_rate} format={(v) => `${v}%`} points />
            <Kpi label="Pro checkouts" metric={t.pro_checkouts} />
            <Kpi label="Credits used" metric={t.credits_used} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Signups"
              sub={`${num(t.influencers.value ?? 0)} creators, ${num(t.brands.value ?? 0)} brands`}
              legend={
                <Legend
                  items={[
                    { label: "Creators", color: SERIES[0] },
                    { label: "Brands", color: SERIES[1] },
                  ]}
                />
              }
              columns={[{ label: "Period" }, { label: "Creators", align: "right" }, { label: "Brands", align: "right" }]}
              rows={tableRows(["influencers", "brands"])}
            >
              <TimeLines
                data={rows}
                granularity={g}
                series={[
                  { key: "influencers", label: "Creators", color: SERIES[0] },
                  { key: "brands", label: "Brands", color: SERIES[1] },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Applications"
              sub={`${num(t.applications.value ?? 0)} submitted, ${num(t.accepted.value ?? 0)} accepted`}
              legend={
                <Legend
                  items={[
                    { label: "Submitted", color: SERIES[0] },
                    { label: "Accepted", color: SERIES[1] },
                  ]}
                />
              }
              columns={[{ label: "Period" }, { label: "Submitted", align: "right" }, { label: "Accepted", align: "right" }]}
              rows={tableRows(["applications", "accepted"])}
            >
              <TimeLines
                data={rows}
                granularity={g}
                series={[
                  { key: "applications", label: "Submitted", color: SERIES[0] },
                  { key: "accepted", label: "Accepted", color: SERIES[1] },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Campaigns created"
              sub={`${num(t.campaigns.value ?? 0)} in this period`}
              columns={[{ label: "Period" }, { label: "Campaigns", align: "right" }]}
              rows={tableRows(["campaigns"])}
            >
              <TimeBars data={rows} granularity={g} dataKey="campaigns" label="Campaigns" />
            </ChartCard>

            <ChartCard
              title="Applications by status"
              sub="Of applications submitted in this period"
              columns={[{ label: "Status" }, { label: "Applications", align: "right" }]}
              rows={data.applications_by_status.map((r) => [titleCase(r.status), num(r.count)])}
            >
              {data.applications_by_status.length ? (
                <Breakdown
                  label="Applications"
                  rows={data.applications_by_status.map((r) => ({ name: titleCase(r.status), count: r.count }))}
                />
              ) : (
                <Empty title="No applications in this period" />
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Campaigns by category"
              sub="Top categories among campaigns created in this period"
              columns={[{ label: "Category" }, { label: "Campaigns", align: "right" }]}
              rows={data.campaigns_by_category.map((r) => [titleCase(r.category), num(r.count)])}
            >
              {data.campaigns_by_category.length ? (
                <Breakdown
                  label="Campaigns"
                  rows={data.campaigns_by_category.map((r) => ({ name: titleCase(r.category), count: r.count }))}
                />
              ) : (
                <Empty title="No campaigns in this period" />
              )}
            </ChartCard>

            <Card>
              <CardHead title="Most-applied campaigns" sub="By applications received in this period" />
              {data.top_campaigns.length === 0 ? (
                <Empty title="No applications in this period" />
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Campaign</Th>
                      <Th>Brand</Th>
                      <Th className="text-right">Applications</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_campaigns.map((c) => (
                      <tr key={c.id}>
                        <Td>
                          <p className="font-medium">{c.title}</p>
                          <Badge tone={c.status === "active" ? "success" : "neutral"}>{c.status}</Badge>
                        </Td>
                        <Td className="text-muted-foreground">{c.brand}</Td>
                        <Td className="nums text-right">{num(c.applications)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </div>

          <Card>
            <CardHead title="Right now" sub="Current totals, not tied to the range above." />
            <div className="grid gap-px bg-border sm:grid-cols-3 xl:grid-cols-5">
              {[
                ["Total users", data.snapshot.users, "/users"],
                ["Approved", data.snapshot.approved, "/users"],
                ["Awaiting approval", data.snapshot.pending_approval, "/approvals"],
                ["Active campaigns", data.snapshot.active_campaigns, "/campaigns"],
                ["Pro subscribers", data.snapshot.pro_subscribers, "/financial"],
              ].map(([label, value, to]) => (
                <Link key={label as string} to={to as string} className="bg-card p-5 transition-colors hover:bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-1.5 text-xl font-bold">{num(value as number)}</p>
                </Link>
              ))}
            </div>
          </Card>

          <p className="text-xs text-muted-foreground">
            Dates are in UTC. “Pro checkouts” counts verified Razorpay checkouts; renewals and
            cancellations are not included. Acceptance-rate change is in percentage points.
          </p>
        </div>
      )}
    </>
  );
};
