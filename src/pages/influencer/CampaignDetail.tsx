import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Users,
} from 'lucide-react';
import { formatDateDMY } from '@/lib/utils';
import { Rise } from '@/components/motion';
import { Stat, StatusBadge } from '@/components/Stat';
import { BrandLogo } from '@/components/Avatar';
import { formatINR, formatCompact, daysLeftLabel, deliverableChips, campaignDueDate } from '@/lib/format';
import { useInfluencerCampaign, useApplyToCampaign } from '@/hooks/useCampaigns';
import { useInfluencerApplications } from '@/hooks/useApplications';
import { useSubscription } from '@/hooks/useSubscription';
import { LockedFeature, LockedText, PremiumBadgeIndicator } from '@/components/LockedFeature';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { CreditWarning, InsufficientCreditsBlock, canApplyWithCredits } from '@/components/CreditWarning';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import CampaignDetailSkeleton from '@/components/CampaignDetailSkeleton';

/* Removed from the old page: the local FloatingOrb (looping animation),
   the mesh/gradient page backgrounds, the pulsing status dot, the local
   getStatusBadge() colour map and the ~120-line inline deliverable
   normaliser (now `deliverableChips` from @/lib/format). */

/** Quiet label/value row used by the sidebar overview list. */
const OverviewRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-baseline justify-between gap-4 py-3">
    <dt className="eyebrow">{label}</dt>
    <dd className="text-right text-[0.9375rem] font-semibold">{children}</dd>
  </div>
);

/** Small muted tile used by the requirements grid. */
const RequirementTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-muted p-4">
    <p className="eyebrow">{label}</p>
    <p className="mt-1.5 text-[0.9375rem] font-semibold">{value}</p>
  </div>
);

const InfluencerCampaignDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const { data: campaignData, isLoading: campaignLoading } = useInfluencerCampaign(slug || '');
  const { data: subscription } = useSubscription();
  const { data: applications } = useInfluencerApplications();
  const { mutate: applyToCampaign, isPending: isApplying } = useApplyToCampaign();

  const campaign = campaignData;
  const isPremium = subscription?.plan !== 'free';
  const hasApplied = campaign?.has_applied || false;

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  // Helper function to get brand name - memoized for performance
  const brandName = useMemo((): string => {
    if (!campaign) return 'Brand';
    // Priority: company_name > first_name + last_name > username > 'Brand'
    if (campaign.brand_profile?.company_name) {
      return campaign.brand_profile.company_name;
    }
    if (campaign.brand?.first_name && campaign.brand?.last_name) {
      return `${campaign.brand.first_name} ${campaign.brand.last_name}`;
    }
    if (campaign.brand?.first_name) {
      return campaign.brand.first_name;
    }
    if (campaign.brand?.username) {
      return campaign.brand.username;
    }
    return 'Brand';
  }, [campaign]);

  useEffect(() => {
    if (applications && campaign) {
      const app = applications.find(a => a.campaign.id === campaign.id);
      setApplicationStatus(app?.status || null);
    }
  }, [applications, campaign]);

  const hasAcceptedApplication = applicationStatus === 'accepted';
  const canViewFullDetails = isPremium || hasAcceptedApplication;

  const handleApply = () => {
    if (!applicationMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please write a message to the brand",
        variant: "destructive"
      });
      return;
    }

    if (!campaign) return;

    applyToCampaign(
      { campaign: campaign.id, message: applicationMessage },
      {
        onSuccess: () => {
          setShowApplyDialog(false);
          setApplicationMessage('');
          toast({
            title: "Application submitted!",
            description: "Your application has been sent to the brand"
          });
        },
        onError: (error: any) => {
          if (error.response?.data?.limit_reached) {
            setUpgradeMessage(error.response.data.error);
            if (!canViewFullDetails) setShowUpgradePrompt(true);
          } else {
            toast({
              title: "Error",
              description: error.response?.data?.error || "Failed to submit application",
              variant: "destructive"
            });
          }
          setShowApplyDialog(false);
        }
      }
    );
  };

  if (campaignLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="container py-20">
        <Card intent="dashed" className="mx-auto max-w-md p-10 text-center">
          <span className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-xl bg-muted text-destructive">
            <FileText className="size-7" />
          </span>
          <h1 className="mb-2 font-display text-display-3">Campaign not found</h1>
          <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
            This brief may have been closed or the link is out of date.
          </p>
          <Button variant="form" onClick={() => navigate('/influencer/campaigns')}>
            <ArrowLeft />
            Back to campaigns
          </Button>
        </Card>
      </div>
    );
  }

  const budgetLabel = campaign.budget_type === 'barter' ? 'Item worth' : 'Budget';
  const chips = deliverableChips(campaign.deliverables_required);
  const targetCities: string = Array.isArray(campaign.target_cities)
    ? campaign.target_cities.join(', ')
    : `${campaign.target_cities ?? ''}`;

  return (
    <div className="container py-10 sm:py-12">
      {/* ------------------------------------------------------ page header */}
      <Rise>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/influencer/campaigns')}
          className="-ml-3 mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft />
          Back to campaigns
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 items-start gap-4">
            <BrandLogo
              src={campaign.brand_profile?.logo}
              name={brandName}
              className="size-14 text-xl"
            />
            <div className="min-w-0">
              <span className="eyebrow">{daysLeftLabel(campaignDueDate(campaign))}</span>
              <h1 className="mt-2 font-display text-display-2">{campaign.title}</h1>
              <p className="mt-4 max-w-[58ch] leading-relaxed text-muted-foreground">
                {campaign.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={campaign.status} />
            {campaign.category && (
              <Badge variant="neutral" className="capitalize">
                {campaign.category}
              </Badge>
            )}
            {hasApplied && <StatusBadge status={applicationStatus || 'pending'} />}
          </div>
        </div>
      </Rise>

      {/* ------------------------------------------------------------- body */}
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {/* ------------------------------------------- left: the brief */}
        <div className="space-y-5 lg:col-span-2">
          <Rise>
            <Card>
              <CardHeader className="pb-4">
                <span className="eyebrow">The brief</span>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-[1.125rem] text-primary" />
                  Campaign details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Deliverables */}
                <div>
                  <h4 className="eyebrow mb-3">Deliverables required</h4>
                  <ul className="flex flex-wrap gap-1.5">
                    {chips.length > 0 ? (
                      chips.map((chip) => (
                        <li key={chip} className="rounded-sm bg-muted px-2.5 py-1 text-sm font-medium">
                          {chip}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">Shared after acceptance</li>
                    )}
                  </ul>
                </div>

                {/* Location for On-field campaigns */}
                {campaign.campaign_type === 'onfield' && campaign.location && (
                  <div>
                    <h4 className="eyebrow mb-2 flex items-center gap-2">
                      <MapPin className="size-3.5" />
                      Event location
                    </h4>
                    <p className="text-[0.9375rem] font-semibold">{campaign.location}</p>
                    {campaign.event_date && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Event date: <span className="num">{formatDateDMY(campaign.event_date)}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Hashtags - Premium */}
                {campaign.hashtags && (
                  <div>
                    <h4 className="eyebrow mb-2 flex items-center gap-2">
                      <Hash className="size-3.5" />
                      Campaign hashtags
                      {!canViewFullDetails && <PremiumBadgeIndicator />}
                    </h4>
                    <LockedFeature
                      isLocked={!canViewFullDetails}
                      message="Upgrade to Premium to view hashtags"
                    >
                      <p className="text-[0.9375rem] leading-relaxed">{campaign.hashtags}</p>
                    </LockedFeature>
                  </div>
                )}

                {/* Key Messages - Premium */}
                {campaign.key_messages && (
                  <div>
                    <h4 className="eyebrow mb-2 flex items-center gap-2">
                      <MessageSquare className="size-3.5" />
                      Key messages
                      {!canViewFullDetails && <PremiumBadgeIndicator />}
                    </h4>
                    <LockedFeature
                      isLocked={!canViewFullDetails}
                      message="Upgrade to Premium to view key messages"
                    >
                      <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">
                        {campaign.key_messages}
                      </p>
                    </LockedFeature>
                  </div>
                )}

                {/* Creative Brief - Premium */}
                {campaign.creative_brief_url && (
                  <div>
                    <h4 className="eyebrow mb-2 flex items-center gap-2">
                      <FileText className="size-3.5" />
                      Creative brief
                      {!canViewFullDetails && <PremiumBadgeIndicator />}
                    </h4>
                    <LockedFeature
                      isLocked={!canViewFullDetails}
                      message="Upgrade to Premium to access creative brief"
                    >
                      <Button variant="outline" size="sm" asChild>
                        <a href={campaign.creative_brief_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink />
                          View creative brief
                        </a>
                      </Button>
                    </LockedFeature>
                  </div>
                )}
              </CardContent>
            </Card>
          </Rise>

          {/* Requirements */}
          {(campaign.target_cities || campaign.target_gender || campaign.min_followers || campaign.target_niche) && (
            <Rise delay={0.06}>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-[1.125rem] text-primary" />
                    Creator requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RequirementTile
                      label="Target cities"
                      value={targetCities.length > 0 ? targetCities : 'All'}
                    />
                    {campaign.target_gender && (
                      <div className="rounded-lg bg-muted p-4">
                        <p className="eyebrow">Gender</p>
                        <p className="mt-1.5 text-[0.9375rem] font-semibold capitalize">
                          {campaign.target_gender}
                        </p>
                      </div>
                    )}
                    {(campaign.min_followers || campaign.max_followers) && (
                      <div className="rounded-lg bg-muted p-4">
                        <p className="eyebrow">Follower range</p>
                        <p className="num mt-1.5 text-[0.9375rem]">
                          {formatCompact(campaign.min_followers ?? 0)} –{' '}
                          {campaign.max_followers ? formatCompact(campaign.max_followers) : 'Any'}
                        </p>
                      </div>
                    )}
                    {campaign.target_niche && (
                      <RequirementTile label="Preferred niche" value={campaign.target_niche} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Rise>
          )}

          {/* Apply / applied state — the one citrus CTA on this screen */}
          {!hasApplied ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block w-full">
                    <Button
                      onClick={() => setShowApplyDialog(true)}
                      variant="accent"
                      size="lg"
                      className="w-full"
                      disabled={!user?.is_approved}
                    >
                      Apply now
                      <ArrowRight />
                    </Button>
                  </span>
                </TooltipTrigger>
                {!user?.is_approved && (
                  <TooltipContent>
                    <p>Your account is pending approval. You cannot apply to campaigns yet.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Card intent="tinted">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
                    {hasAcceptedApplication ? 'Application accepted' : 'Application submitted'}
                  </p>
                  <p className="mt-1 text-sm text-secondary-foreground/70">
                    {hasAcceptedApplication
                      ? 'The brand has accepted you for this campaign.'
                      : 'The brand is reviewing your application.'}
                  </p>
                </div>
                {hasAcceptedApplication && campaign.contact_email ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${campaign.contact_email}`}>
                      <Mail />
                      Contact brand
                    </a>
                  </Button>
                ) : (
                  <StatusBadge status={applicationStatus || 'pending'} />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ------------------------------------------ right: the numbers */}
        <div className="space-y-5">
          <Rise>
            {campaign.budget && canViewFullDetails ? (
              <Stat label={budgetLabel} value={formatINR(campaign.budget)} />
            ) : campaign.budget_type ? (
              <Stat
                label={budgetLabel}
                value={
                  campaign.budget_type.charAt(0).toUpperCase() +
                  campaign.budget_type.slice(1).toLowerCase()
                }
              />
            ) : (
              <Card className="p-6">
                <span className="eyebrow">{budgetLabel}</span>
                <div className="num mt-5 text-[2.375rem] leading-none">
                  <LockedText
                    text="₹50,000"
                    isLocked={!canViewFullDetails}
                    message="Upgrade to view budget"
                  />
                </div>
              </Card>
            )}
          </Rise>

          <Rise delay={0.06}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Campaign overview</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                  <OverviewRow label="Post by">
                    <span className="num">{formatDateDMY(campaignDueDate(campaign)) || 'Flexible'}</span>
                  </OverviewRow>
                  <OverviewRow label="Objective">
                    <span className="capitalize">{campaign.objective || 'Awareness'}</span>
                  </OverviewRow>
                  <OverviewRow label="Type">
                    <span className="capitalize">{campaign.campaign_type || 'Online'}</span>
                  </OverviewRow>
                </dl>
              </CardContent>
            </Card>
          </Rise>

          {/* Brand Info Card */}
          <Rise delay={0.12}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-[1.125rem] text-primary" />
                  Brand info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Brand Name */}
                <div>
                  <p className="eyebrow mb-1">Brand name</p>
                  {campaign.brand?.username && canViewFullDetails ? (
                    <p className="text-[0.9375rem] font-semibold">{campaign.brand.username}</p>
                  ) : (
                    <LockedText
                      text="Brand Name"
                      isLocked={!canViewFullDetails}
                      message="Upgrade to view brand name"
                    />
                  )}
                </div>

                {campaign.brand_profile && canViewFullDetails && (
                  <>
                    <div>
                      <p className="eyebrow mb-1">Company</p>
                      <p className="text-[0.9375rem] font-semibold">
                        {campaign.brand_profile.company_name}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow mb-1">Industry</p>
                      <p className="text-[0.9375rem] font-semibold">
                        {campaign.brand_profile.industry}
                      </p>
                    </div>
                    {campaign.brand_profile.website && (
                      <div>
                        <p className="eyebrow mb-1">Website</p>
                        <a
                          href={campaign.brand_profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 break-all text-sm font-medium text-primary hover:underline"
                        >
                          {campaign.brand_profile.website}
                          <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                      </div>
                    )}
                  </>
                )}

                {/* Contact Info - Premium */}
                {(campaign.contact_email || campaign.contact_phone) && canViewFullDetails && (
                  <div className="border-t border-border pt-4">
                    <p className="eyebrow mb-2">Contact</p>
                    {campaign.contact_email && (
                      <div className="mb-1.5 flex items-center gap-2 break-all text-sm">
                        <Mail className="size-4 shrink-0 text-muted-foreground" />
                        <span>{campaign.contact_email}</span>
                      </div>
                    )}
                    {campaign.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        <span>{campaign.contact_phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {!canViewFullDetails && (
                  <div className="border-t border-border pt-4">
                    <div className="rounded-lg bg-muted p-4 text-center">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Upgrade to Pro to view full brand details.
                      </p>
                      <Button
                        variant="form"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setShowUpgradePrompt(true)}
                      >
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Rise>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="rounded-xl border-border bg-card shadow-e3 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-display-3 tracking-[-0.025em]">
              <Send className="size-[1.125rem] text-primary" />
              Apply to campaign
            </DialogTitle>
            <DialogDescription>
              Write a message to the brand explaining why you're a great fit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Tell the brand about your experience, audience, and why you want to work on this campaign..."
                rows={5}
              />
            </div>

            {/* Credit Warning - Inline, no modal */}
            {canApplyWithCredits(user?.credits || 0) ? (
              <>
                <CreditWarning credits={user?.credits || 0} />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="form"
                    onClick={handleApply}
                    disabled={isApplying || !applicationMessage.trim()}
                    className="flex-1"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send />
                        {user?.credits === 1 ? 'Apply (last credit)' : 'Submit application'}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <InsufficientCreditsBlock />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt */}
      {!canViewFullDetails && (
        <UpgradePrompt
          open={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          title="Upgrade to Pro"
          description={upgradeMessage || "Get full access to campaign details, brand information, and apply to more campaigns"}
          limitType="applications"
        />
      )}
    </div>
  );
};

export default InfluencerCampaignDetail;
