import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import { Card, CardHead, ErrorNote, Spinner } from "@/components/ui";

interface Analytics {
  engagement: { dau: number; mau: number; engagement_rate: number };
  campaign_success: { rate: number; total_90d: number };
  matching: { avg_applications_per_campaign: number };
}

const pct = (n: number) => `${n.toFixed(1)}%`;

export const AnalyticsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () =>
      (await api.get<Analytics>("/admin-panel/analytics/")).data,
  });

  if (isLoading) return <Spinner label="Loading analytics" />;
  if (error) return <ErrorNote error={error} />;
  if (!data) return null;

  return (
    <>
      <PageHead
        title="Analytics"
        sub="Engagement and matching efficiency over the last 90 days."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Daily active users", num(data.engagement.dau)],
          ["Monthly active users", num(data.engagement.mau)],
          ["Engagement rate", pct(data.engagement.engagement_rate)],
          ["Campaign completion rate", pct(data.campaign_success.rate)],
          ["Campaigns, last 90 days", num(data.campaign_success.total_90d)],
          [
            "Applications per campaign",
            String(data.matching.avg_applications_per_campaign),
          ],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="nums mt-1.5 text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHead title="How these are measured" />
        <dl className="divide-y divide-border text-sm">
          {[
            [
              "Active users",
              "Counted from last_login — DAU is the past 24 hours, MAU the past 30 days. A user who stays signed in without logging in again is not counted.",
            ],
            [
              "Engagement rate",
              "DAU divided by MAU. It reads as 0% until people have logged in within both windows.",
            ],
            [
              "Completion rate",
              "Campaigns with status 'completed' as a share of campaigns created in the last 90 days.",
            ],
          ].map(([k, v]) => (
            <div key={k} className="px-5 py-3">
              <dt className="font-medium">{k}</dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </>
  );
};
