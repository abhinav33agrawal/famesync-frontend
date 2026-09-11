import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stat, StatusBadge } from '@/components/Stat';
import { BrandLogo } from '@/components/Avatar';
import { Rise } from '@/components/motion';
import { formatINR } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useInfluencerDashboard } from '@/hooks/useProfile';
import { useInfluencerApplications } from '@/hooks/useApplications';
import DashboardSkeleton from '@/components/DashboardSkeleton';

/* Removed from the old dashboard: FloatingOrb, the mesh-grid overlay, the
   gradient StatCard tiles, getStatusIcon()'s colour map, the rotating crown
   and every gradient/glow surface. Metrics are `Stat`, statuses are
   `StatusBadge`, entrances are `Rise`. */

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useInfluencerDashboard(user?.role === 'influencer');
  const { data: applications = [], isLoading: applicationsLoading } = useInfluencerApplications(user?.role === 'influencer');

  if (dashboardLoading || applicationsLoading) {
    return <DashboardSkeleton />;
  }

  const stats = dashboardData?.stats;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').slice(0, 3);

  const recentUpdates = applications
    .slice(0, 4)
    .map(app => ({
      status: app.status,
      message: app.status === 'accepted'
        ? `Application for "${app.campaign.title}" was approved!`
        : app.status === 'rejected'
          ? `Application for "${app.campaign.title}" was not accepted`
          : `Application for "${app.campaign.title}" is under review`,
      time: new Date(app.applied_at).toLocaleDateString(),
    }));

  return (
    <>
      <Helmet>
        <title>Creator Dashboard - FameSync</title>
        <meta name="description" content="Track your applications, manage collaborations, and discover new campaign opportunities from your FameSync dashboard." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container py-10 md:py-14">
        {/* ------------------------------------------------------ page header */}
        <Rise>
          <header className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-3">Creator home</p>
              <h1 className="font-display text-display-2">
                Welcome back, {user?.first_name || user?.username}.
              </h1>
              <p className="mt-3 max-w-[46ch] text-muted-foreground">
                Your applications and opportunities at a glance.
              </p>
            </div>
            <Button className="self-start md:self-auto" onClick={() => navigate('/influencer/campaigns')}>
              Browse campaigns
              <ArrowRight />
            </Button>
          </header>
        </Rise>

        {/* ------------------------------------------------------------ stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            tone="feature"
            label="Credits remaining"
            value={user?.credits ?? 0}
            note="Application credits"
          />
          <Stat
            label="Applications sent"
            value={stats?.total_applications ?? 0}
            note={`${stats?.accepted_applications ?? 0} accepted`}
          />
          <Stat
            label="Accepted campaigns"
            value={stats?.accepted_applications ?? 0}
            note="Active collaborations"
            noteTone={stats?.accepted_applications ? 'success' : 'muted'}
          />
          <Stat
            label="Pending applications"
            value={stats?.pending_applications ?? 0}
            note="Awaiting response"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* -------------------------------------------- active collaborations */}
          <section className="lg:col-span-2">
            <Card className="h-full p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Live work</p>
                  <h2 className="mt-1.5 font-display text-display-3">Active campaigns</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/influencer/campaigns')}>
                  View all
                  <ArrowRight />
                </Button>
              </div>

              {acceptedApplications.length === 0 ? (
                <Card intent="dashed" className="p-8 text-center">
                  <p className="font-display text-display-3">No active campaigns yet</p>
                  <p className="mx-auto mb-6 mt-2 max-w-[34ch] text-sm text-muted-foreground">
                    Apply to a brief and your accepted collaborations will show up here.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/influencer/campaigns')}>
                    Discover campaigns
                  </Button>
                </Card>
              ) : (
                <ul className="grid gap-3">
                  {acceptedApplications.map((application) => (
                    <li key={application.id}>
                      <Card
                        intent="interactive"
                        className="p-4"
                        onClick={() => navigate('/influencer/applications')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <BrandLogo
                              src={application.campaign.brand_profile?.logo}
                              name={application.campaign.brand_profile?.company_name || application.campaign.brand.username}
                              className="size-[42px]"
                            />
                            <div className="min-w-0">
                              <h3 className="truncate font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
                                {application.campaign.title}
                              </h3>
                              <p className="truncate text-xs text-muted-foreground">
                                @{application.campaign.brand.username}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                          <span className="num text-[0.9375rem]">{formatINR(application.campaign.budget)}</span>
                          <span className="text-xs text-muted-foreground">{application.campaign.category}</span>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          {/* ------------------------------------------------------ updates rail */}
          <section className="grid content-start gap-6">
            <Card className="p-5 sm:p-6">
              <p className="eyebrow">Activity</p>
              <h2 className="mb-4 mt-1.5 font-display text-display-3">Recent updates</h2>

              {recentUpdates.length === 0 ? (
                <Card intent="dashed" className="p-6 text-center text-sm text-muted-foreground">
                  No updates yet
                </Card>
              ) : (
                <ul className="grid gap-2.5">
                  {recentUpdates.map((update, index) => (
                    <li key={index} className="rounded-lg bg-muted px-3.5 py-3">
                      <div className="mb-1.5">
                        <StatusBadge status={update.status} />
                      </div>
                      <p className="line-clamp-2 text-sm font-medium">{update.message}</p>
                      <p className="num mt-1 text-xs text-muted-foreground">{update.time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {user?.subscription_plan !== 'pro' && (
              <Card intent="tinted" className="p-6">
                <p className="eyebrow text-secondary-foreground/70">Pro plan</p>
                <h2 className="mb-2 mt-1.5 font-display text-display-3">Get more applications</h2>
                <p className="mb-5 text-sm leading-relaxed text-secondary-foreground/80">
                  Upgrade to Pro for more monthly applications and full campaign details.
                </p>
                <Button variant="form" className="w-full" onClick={() => navigate('/subscription')}>
                  Upgrade now
                </Button>
              </Card>
            )}
          </section>
        </div>

        {/* --------------------------------------------------------- closing CTA */}
        <Rise>
          <Card intent="feature" className="mt-6 flex flex-col gap-6 rounded-2xl p-8 md:flex-row md:items-center md:justify-between md:p-11">
            <div>
              <h2 className="max-w-[26ch] font-display text-[2rem] leading-tight tracking-[-0.03em]">
                Ready to find your next campaign?
              </h2>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-primary-foreground/75">
                Browse briefs from reviewed brands and apply to the ones that fit what you already make.
              </p>
            </div>
            <Button
              variant="accent"
              size="lg"
              className="shrink-0 self-start md:self-auto"
              onClick={() => navigate('/influencer/campaigns')}
            >
              Discover campaigns
              <ArrowRight />
            </Button>
          </Card>
        </Rise>
      </div>
    </>
  );
};

export default InfluencerDashboard;
