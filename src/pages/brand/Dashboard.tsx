import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stat, StatusBadge } from '@/components/Stat';
import { Avatar } from '@/components/Avatar';
import { CampaignCard } from '@/components/CampaignCard';
import { Rise } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';
import { useBrandDashboard } from '@/hooks/useProfile';
import { useBrandCampaigns } from '@/hooks/useCampaigns';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { formatCompact } from '@/lib/format';
import { formatDateDMY } from '@/lib/utils';

/* Removed from the old dashboard: FloatingOrb x3, the fixed mesh-grid svg,
   the local StatCard (gradient tiles + rotating icon chips), the local
   status icon/badge colour maps, the looping Crown animation and the
   primary→secondary→accent gradient CTA. */

const BrandDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useBrandDashboard(user?.role === 'brand');
  const { data: campaigns = [], isLoading: campaignsLoading } = useBrandCampaigns(user?.role === 'brand');

  if (dashboardLoading || campaignsLoading) {
    return <DashboardSkeleton />;
  }

  const stats = dashboardData?.stats;
  const recentCampaigns = campaigns.slice(0, 3);

  /* From the dashboard endpoint: the campaign list never includes
     applications, so reading them off it always showed "No applications yet". */
  const allApplications = (dashboardData?.recent_applications ?? []).slice(0, 4);

  const liveRate = stats?.total_campaigns
    ? `${((stats.active_campaigns / stats.total_campaigns) * 100).toFixed(1)}%`
    : '0%';

  return (
    <>
      <Helmet>
        <title>Brand Dashboard - FameSync</title>
        <meta name="description" content="Manage your campaigns, view applications, and connect with creators from your FameSync brand dashboard." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container space-y-10 py-10 md:py-14">
        {/* ---------------------------------------------------- page header */}
        <Rise>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3">Brand workspace</p>
              <h1 className="font-display text-display-2">
                Welcome back, {user?.first_name || user?.username}.
              </h1>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">
                Your campaigns and applications at a glance.
              </p>
            </div>
            <Button className="shrink-0" onClick={() => navigate('/brand/create-campaign')}>
              <Plus />
              Create campaign
            </Button>
          </div>
        </Rise>

        {/* ----------------------------------------------------------- stats */}
        <Rise>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat
              label="Active campaigns"
              value={stats?.active_campaigns || 0}
              note={`${stats?.total_campaigns || 0} total`}
            />
            <Stat
              label="Applications"
              value={formatCompact(stats?.total_applications || 0)}
              note={`${stats?.pending_applications || 0} pending`}
            />
            <Stat
              label="Credits left"
              value={user?.credits || 0}
              note="Renews monthly"
              tone="feature"
            />
            <Stat label="Live rate" value={liveRate} note="Share of campaigns live" />
          </div>
        </Rise>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* ------------------------------------------- recent campaigns */}
          <section className="min-w-0 lg:col-span-2">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Latest briefs</p>
                <h2 className="font-display text-display-3">Recent campaigns</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/brand/campaigns')}>
                View all
                <ArrowRight />
              </Button>
            </div>

            {recentCampaigns.length === 0 ? (
              <Card intent="dashed" className="p-10 text-center">
                <h3 className="font-display text-display-3">No campaigns yet</h3>
                <p className="mx-auto mb-6 mt-2 max-w-[34ch] leading-relaxed text-muted-foreground">
                  Post your first brief and start collecting applications from verified creators.
                </p>
                <Button variant="form" onClick={() => navigate('/brand/create-campaign')}>
                  Create your first campaign
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {recentCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    state="owned"
                    onView={() => navigate(`/brand/campaigns/${campaign.slug}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ---------------------------------------- recent applications */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <span className="eyebrow">Inbox</span>
                <CardTitle>Recent applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allApplications.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No applications yet</p>
                ) : (
                  allApplications.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => navigate(`/brand/campaigns/${app.campaign.slug}`)}
                      className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      <Avatar name={`${app.influencer.first_name} ${app.influencer.last_name}`} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {app.influencer.first_name} {app.influencer.last_name}
                          </span>
                          <StatusBadge status={app.status} />
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {app.campaign.title}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="truncate">@{app.influencer.username}</span>
                          <span className="num shrink-0">{formatDateDMY(app.applied_at)}</span>
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {user?.subscription_plan !== 'pro' && (
              <Card intent="tinted" className="p-6">
                <span className="eyebrow text-secondary-foreground/70">Pro</span>
                <h3 className="mb-2 mt-3.5 font-display text-display-3">Boost your reach</h3>
                <p className="mb-6 leading-relaxed text-secondary-foreground/80">
                  Upgrade to Pro for premium creators, private briefs and more monthly credits.
                </p>
                <Button variant="form" className="w-full" onClick={() => navigate('/subscription')}>
                  Upgrade now
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ closing CTA */}
        <Rise>
          <Card intent="feature" className="rounded-2xl p-8 md:p-11">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="max-w-[26ch] font-display text-[2rem] leading-tight tracking-[-0.03em]">
                  Ready to launch your next campaign?
                </h2>
                <p className="mt-3 max-w-[48ch] leading-relaxed text-ink-muted">
                  Post a brief in minutes and review verified applicants side by side.
                </p>
              </div>
              <Button
                size="lg"
                variant="inverse"
                className="shrink-0 self-start md:self-auto"
                onClick={() => navigate('/brand/create-campaign')}
              >
                <Plus />
                Create campaign
              </Button>
            </div>
          </Card>
        </Rise>
      </div>
    </>
  );
};

export default BrandDashboard;
