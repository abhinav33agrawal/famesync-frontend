import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Mail, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Stat, StatusBadge } from '@/components/Stat';
import { Avatar } from '@/components/Avatar';
import { Rise, listItemMotion } from '@/components/motion';
import { formatINR } from '@/lib/format';
import { formatDateDMY } from '@/lib/utils';
import { useInfluencerApplications } from '@/hooks/useApplications';
import { ProfileViewModal } from '@/components/ProfileViewModal';
import { CreatorDeliverables } from '@/components/DeliverablesPanel';
import MatchCelebrationModal from '@/components/MatchCelebrationModal';
import type { Application } from '@/lib/api/types';

/* Removed from the old screen: FloatingOrb, the mesh-grid overlay, the four
   gradient StatCard tiles, getStatusBadge()/getStatusText()'s colour map and
   every gradient/backdrop-blur surface. */

const CELEBRATED_MATCHES_KEY = 'celebrated_matches';

const getCelebratedMatches = (): string[] => {
  try {
    const stored = localStorage.getItem(CELEBRATED_MATCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addCelebratedMatch = (applicationId: string) => {
  const current = getCelebratedMatches();
  if (!current.includes(applicationId)) {
    localStorage.setItem(CELEBRATED_MATCHES_KEY, JSON.stringify([...current, applicationId]));
  }
};

const ApplicationsSkeleton = () => (
  <div className="container py-10 md:py-14">
    <div className="mb-10 md:mb-12">
      <Skeleton className="mb-4 h-3 w-28" />
      <Skeleton className="h-11 w-64 max-w-full" />
      <Skeleton className="mt-4 h-5 w-80 max-w-full" />
    </div>

    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[8.5rem] rounded-xl" />
      ))}
    </div>

    <Skeleton className="mb-6 h-12 rounded-lg" />

    <div className="grid gap-4">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  </div>
);

/** Kickoff actions shown once a brand accepts the application. */
const NextStepsActionArea = ({ application }: { application: Application }) => {
  /* The contact the brand set on this campaign first; their account email
     only as a fallback (it used to win, so creators wrote to the login inbox). */
  const brandEmail = application.campaign.contact_email || application.campaign.brand_profile?.user?.email || application.campaign.brand?.email || '';
  const campaignTitle = application.campaign.title;
  const creativeBriefUrl = (application.campaign as any).creative_brief_url;

  const mailtoLink = `mailto:${brandEmail}?subject=Campaign: ${encodeURIComponent(campaignTitle)} - Collaboration Kickoff`;

  return (
    <div className="mt-4 rounded-lg border border-success/25 bg-success/[0.06] p-4">
      <p className="eyebrow mb-3 text-success">Next steps</p>
      <div className="flex flex-wrap gap-2">
        <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
          <Button variant="form" size="sm">
            <Mail />
            Send introduction email
          </Button>
        </a>
        {creativeBriefUrl && (
          <a href={creativeBriefUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <FileText />
              Download creative brief
            </Button>
          </a>
        )}
      </div>
      {brandEmail && (
        <p className="mt-2.5 text-xs text-muted-foreground">Contact: {brandEmail}</p>
      )}
    </div>
  );
};

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({ isOpen: false, application: null });

  const { data: applications = [], isLoading } = useInfluencerApplications();

  // Check for uncelebrated matches on load
  useEffect(() => {
    if (applications.length > 0) {
      const celebratedIds = getCelebratedMatches();
      const uncelebratedMatch = applications.find(
        (app) => app.status === 'accepted' && !celebratedIds.includes(app.id)
      );

      if (uncelebratedMatch) {
        setCelebrationModal({ isOpen: true, application: uncelebratedMatch });
      }
    }
  }, [applications]);

  const handleCloseCelebration = () => {
    if (celebrationModal.application) {
      addCelebratedMatch(celebrationModal.application.id);
    }
    setCelebrationModal({ isOpen: false, application: null });
  };

  const filteredApplications = applications.filter(app =>
    app.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.campaign.brand.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (isLoading) {
    return <ApplicationsSkeleton />;
  }

  return (
    <div className="container py-10 md:py-14">
      {/* -------------------------------------------------------- page header */}
      <Rise>
        <header className="mb-10 md:mb-12">
          <p className="eyebrow mb-3">Your pipeline</p>
          <h1 className="font-display text-display-2">Applications.</h1>
          <p className="mt-3 max-w-[52ch] text-muted-foreground">
            Track your campaign applications and connect with brands once matched.
          </p>
        </header>
      </Rise>

      {/* -------------------------------------------------------------- stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Total applications" value={stats.total} note="All time" />
        <Stat label="In review" value={stats.pending} note="Awaiting a brand" noteTone={stats.pending ? 'warning' : 'muted'} />
        <Stat label="Accepted" value={stats.accepted} note="Matched brands" noteTone={stats.accepted ? 'success' : 'muted'} />
        <Stat label="Declined" value={stats.rejected} note="Not this time" />
      </div>

      {/* ------------------------------------------------------------- search */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by campaign or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11"
          aria-label="Search applications"
        />
      </div>

      {/* --------------------------------------------------------------- list */}
      {filteredApplications.length > 0 && (
        <ul className="grid grid-cols-1 gap-4">
          <AnimatePresence initial={false}>
            {filteredApplications.map((app) => (
              <motion.li key={app.id} {...listItemMotion}>
                <Card className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <Avatar name={app.campaign.brand.username} size={46} />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-display text-[1.1875rem] font-semibold tracking-[-0.02em]">
                          {app.campaign.title}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          @{app.campaign.brand.username}
                        </p>

                        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:max-w-md">
                          <div className="min-w-0 bg-card p-3">
                            <dt className="eyebrow text-[10.5px]">Budget</dt>
                            <dd className="num mt-0.5 text-[1.0625rem]">{formatINR(app.campaign.budget)}</dd>
                          </div>
                          <div className="min-w-0 bg-card p-3">
                            <dt className="eyebrow text-[10.5px]">Applied</dt>
                            <dd className="num mt-0.5 text-[1.0625rem]">
                              {formatDateDMY(app.applied_at) || '—'}
                            </dd>
                          </div>
                        </dl>

                        {app.status === 'accepted' && (
                          <>
                            <NextStepsActionArea application={app} />
                            <div className="mt-4">
                              <CreatorDeliverables application={app} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                      <StatusBadge status={app.status} />

                      <div className="flex flex-wrap gap-2">
                        {/* the detail route and API look campaigns up by slug */}
                        <Link to={`/influencer/campaigns/${app.campaign.slug}`}>
                          <Button variant="outline" size="sm">
                            View campaign
                          </Button>
                        </Link>
                        {app.status === 'accepted' && app.campaign.brand_profile && (
                          <Button
                            variant="form"
                            size="sm"
                            onClick={() => setSelectedBrand(app.campaign.brand_profile!)}
                          >
                            View brand
                            <ArrowRight />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* -------------------------------------------------------- empty state */}
      {filteredApplications.length === 0 && (
        <Card intent="dashed" className="p-10 text-center sm:p-14">
          <p className="eyebrow mb-3">Nothing here yet</p>
          <h2 className="font-display text-display-3">No applications found</h2>
          <p className="mx-auto mb-7 mt-2.5 max-w-[38ch] leading-relaxed text-muted-foreground">
            {searchTerm
              ? 'Try a different search term.'
              : 'Start applying to campaigns and they will show up here.'}
          </p>
          {!searchTerm && (
            <Link to="/influencer/campaigns">
              <Button variant="accent" size="lg">
                Browse campaigns
                <ArrowRight />
              </Button>
            </Link>
          )}
        </Card>
      )}

      <ProfileViewModal
        isOpen={!!selectedBrand}
        onClose={() => setSelectedBrand(null)}
        profileType="brand"
        brandProfile={selectedBrand}
        matched /* "View brand" only appears on accepted applications */
      />

      {/* Match Celebration Modal */}
      {celebrationModal.application && (
        <MatchCelebrationModal
          isOpen={celebrationModal.isOpen}
          onClose={handleCloseCelebration}
          brandName={celebrationModal.application.campaign.brand_profile?.company_name || celebrationModal.application.campaign.brand.username}
          brandEmail={celebrationModal.application.campaign.contact_email || celebrationModal.application.campaign.brand_profile?.user?.email || celebrationModal.application.campaign.brand?.email || ''}
          campaignTitle={celebrationModal.application.campaign.title}
        />
      )}
    </div>
  );
};

export default Applications;
