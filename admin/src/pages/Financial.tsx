import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api, { asCount, asList, type Paginated, type SubscriptionRow } from "@/lib/api";
import { date, inr, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import {
  Badge,
  Card,
  CardHead,
  Empty,
  ErrorNote,
  Pager,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui";

interface FinancialMetrics {
  mrr: number;
  lifetime_revenue: number | null;
  plan_distribution: { pro: number; free: number };
  credits: { total_issued: number; total_consumed: number };
}

const Tile = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <Card className="p-5">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    {/* Proportional figures: tabular-nums spaces a standalone number loosely. */}
    <p className="mt-1.5 text-2xl font-bold">{value}</p>
    {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
  </Card>
);

/** Days until renewal, from the subscription's renewal_date. */
const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

export const Financial = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");

  const metrics = useQuery({
    queryKey: ["financial"],
    queryFn: async () => (await api.get<FinancialMetrics>("/admin-panel/financial/metrics/")).data,
  });

  const pro = useQuery({
    queryKey: ["pro-subscribers", page],
    queryFn: async () =>
      (
        await api.get<Paginated<SubscriptionRow>>("/admin-panel/subscriptions/", {
          params: { plan: "pro", status: "active", page },
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  if (metrics.isLoading) return <Spinner label="Loading financials" />;
  if (metrics.error) return <ErrorNote error={metrics.error} />;
  const m = metrics.data;
  if (!m) return null;

  const subscribed = m.plan_distribution.pro + m.plan_distribution.free;
  const share = subscribed ? Math.round((m.plan_distribution.pro / subscribed) * 1000) / 10 : 0;

  // The role filter narrows the rows already on this page; the list endpoint
  // pages by subscription, so this is a view filter rather than a query.
  const allRows = asList(pro.data);
  const rows = role ? allRows.filter((r) => r.role === role) : allRows;
  const total = asCount(pro.data);

  return (
    <>
      <PageHead title="Financial" sub="Who is paying, and what it adds up to." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Monthly recurring revenue" value={inr(m.mrr)} note="Active Pro subscriptions at their plan price" />
        <Tile label="Pro subscribers" value={num(m.plan_distribution.pro)} note={`${num(m.plan_distribution.free)} on the free plan`} />
        <Tile label="Pro share" value={`${share}%`} note="Of accounts with a subscription record" />
        <Tile
          label="Credits"
          value={num(m.credits.total_consumed)}
          note={`used, of ${num(m.credits.total_issued)} issued`}
        />
      </div>

      <Card className="mt-6">
        <CardHead
          title="Pro subscribers"
          sub={total ? `${num(total)} active · soonest renewal first` : "Accounts on an active Pro plan"}
          action={
            <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
              <option value="">All roles</option>
              <option value="influencer">Creators</option>
              <option value="brand">Brands</option>
            </Select>
          }
        />
        {pro.isLoading ? (
          <Spinner label="Loading subscribers" />
        ) : pro.error ? (
          <ErrorNote error={pro.error} />
        ) : rows.length === 0 ? (
          <Empty
            title={role ? "No Pro subscribers with that role on this page" : "No Pro subscribers yet"}
            sub={role ? undefined : "Accounts appear here once a Razorpay checkout completes."}
          />
        ) : (
          <>
            <div className={pro.isFetching ? "opacity-60 transition-opacity" : ""}>
              <Table>
                <thead>
                  <tr>
                    <Th>Subscriber</Th>
                    <Th>Role</Th>
                    <Th className="text-right">Price</Th>
                    <Th className="text-right">Credits / mo</Th>
                    <Th>Subscribed</Th>
                    <Th>Renews</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const due = daysUntil(r.renewal_date);
                    return (
                      <tr
                        key={r.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => navigate(`/users/${r.user_id}`)}
                      >
                        <Td>
                          <p className="font-medium">
                            {r.full_name || r.username}
                            {!r.user_is_active && (
                              <span className="ml-2">
                                <Badge tone="danger">suspended</Badge>
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                        </Td>
                        <Td>
                          <Badge tone={r.role === "brand" ? "brand" : "neutral"}>{r.role}</Badge>
                        </Td>
                        <Td className="nums text-right">{inr(r.monthly_price)}</Td>
                        <Td className="nums text-right">{num(r.credit_limit)}</Td>
                        <Td className="nums whitespace-nowrap text-muted-foreground">{date(r.start_date)}</Td>
                        <Td className="nums">
                          {date(r.renewal_date)}
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {due < 0 ? "overdue" : due === 0 ? "today" : `in ${due}d`}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <Pager page={page} count={total} onPage={setPage} />
          </>
        )}
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        MRR is each active Pro subscription at its real plan price, from{" "}
        <code className="rounded bg-muted px-1">subscriptions/constants.py</code>. Lifetime revenue
        is not shown because settled payments live in Razorpay and are never recorded here —
        reconcile there. “Subscribed” is when the subscription record was first created, which is
        usually the original signup rather than the date they upgraded.
      </p>
    </>
  );
};
