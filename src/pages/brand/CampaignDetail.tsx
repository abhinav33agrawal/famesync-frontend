import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/config';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  User,
  FileText,
  MessageSquare,
  Mail,
  PlayCircle,
  MoreVertical,
  Rocket,
  Pencil,
  Trash2,
  Send,
  Loader2,
  Clock,
  X
} from 'lucide-react';
import { useBrandCampaign, useUpdateApplicationStatus, useUpdateCampaignStatus, useDeleteCampaign } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { ProfileViewModal } from '@/components/ProfileViewModal';
import { BrandDeliverables } from '@/components/DeliverablesPanel';
import { CampaignStatusDialog } from '@/components/CampaignStatusDialog';
import { DeclineReasonDialog } from '@/components/DeclineReasonDialog';
import { InfluencerQuickStats } from '@/components/InfluencerQuickStats';
import { Stat, StatusBadge } from '@/components/Stat';
import { Avatar } from '@/components/Avatar';
import { Rise } from '@/components/motion';
import { formatINR, formatCompact, deliverableChips, daysLeftLabel, campaignDueDate, isGoingLive } from '@/lib/format';
import { formatLabel, formatDateDMY } from '@/lib/utils';
import type { InfluencerProfile, Application } from '@/lib/api/types';
import CampaignDetailSkeleton from '@/components/CampaignDetailSkeleton';

/* Removed from the old CampaignDetail.tsx: FloatingOrb, the gradient StatCard
   tiles, the local renderDeliverables()/DELIVERABLE_LABELS map, the
   getStatusBadgeClasses() colour map, the pulsing status dot and every
   green/blue/orange raw palette colour. */

/** Shown while a published campaign is inside its edit window. Ticks every
 *  second and refetches the campaign when the window closes, so the Edit
 *  actions disappear exactly when the server stops accepting edits. */
const GoingLiveBanner = ({ liveAt, onEdit, onLive }: { liveAt: string; onEdit: () => void; onLive: () => void }) => {
  const target = new Date(liveAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  const onLiveRef = useRef(onLive);
  onLiveRef.current = onLive;

  useEffect(() => {
    if (now >= target) {
      onLiveRef.current();
      return;
    }
    const id = window.setTimeout(() => setNow(Date.now()), 1000);
    return () => window.clearTimeout(id);
  }, [now, target]);

  const left = Math.max(0, Math.ceil((target - now) / 1000));
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <Card intent="tinted" className="mb-8 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
            <Clock className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
              Goes live in <span className="num">{mm}:{ss}</span>
            </p>
            <p className="mt-1 text-sm text-secondary-foreground/80">
              Creators can't see this campaign yet. You can edit it until it goes live — after that it's locked.
            </p>
          </div>
        </div>
        <Button variant="form" onClick={onEdit}>
          <Pencil />
          Edit campaign
        </Button>
      </div>
    </Card>
  );
};

// Manage Collaboration Action Area for Accepted Applications
const ManageCollaborationArea = ({
  application,
  campaignTitle,
  onViewProfile,
  inProgressIds,
  onToggleInProgress
}: {
  application: Application;
  campaignTitle: string;
  onViewProfile: () => void;
  inProgressIds: Set<string>;
  onToggleInProgress: (id: string) => void;
}) => {
  const influencerEmail = application.influencer_profile?.user?.email || application.influencer?.email || '';
  const influencerName = application.influencer_profile?.user?.first_name || application.influencer?.username || 'there';
  const isInProgress = inProgressIds.has(application.id);
  const { toast } = useToast();

  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = useState(false);
  const [onboardingMessage, setOnboardingMessage] = useState(
    `Hi ${influencerName},\n\nCongratulations! Your application for "${campaignTitle}" has been accepted.\n\nWe're excited to collaborate with you. Here are the next steps:\n\n1. Review the campaign requirements carefully\n2. Prepare your content according to the brief\n3. Submit your draft for approval\n4. Post the content on the agreed date\n\nIf you have any questions, feel free to reach out to us.\n\nBest regards,\nThe Team`
  );
  const [isSending, setIsSending] = useState(false);

  /* This used to sleep for a second and report "Onboarding info has been
     sent" while sending nothing at all -- the brand believed it had briefed a
     creator who had heard nothing, and neither side found out until the
     collaboration stalled. The endpoint writes an in-app notification (the
     source of truth) and emails the same text on top, so a mail outage
     degrades to "delivered in FameSync" rather than to a lie. */
  const handleSendOnboarding = async () => {
    setIsSending(true);
    try {
      const { data } = await api.post(
        `/campaigns/applications/${application.id}/onboarding/`,
        { message: onboardingMessage },
      );

      toast({
        title: data.emailed ? 'Onboarding sent' : 'Delivered in FameSync',
        description: data.message,
      });

      setIsOnboardingDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Could not send',
        description:
          error?.response?.data?.error ||
          'Failed to send the onboarding message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">Manage collaboration</span>
        {isInProgress && (
          <Badge>
            <PlayCircle className="size-3" />
            In progress
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {influencerEmail && (
          <Button variant="form" size="sm" onClick={() => setIsOnboardingDialogOpen(true)}>
            <Mail />
            Send onboarding info
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleInProgress(application.id)}
        >
          <PlayCircle />
          {isInProgress ? 'Mark not started' : 'Mark in progress'}
        </Button>
        <Button variant="outline" size="sm" onClick={onViewProfile}>
          <User />
          View profile
        </Button>
      </div>

      {influencerEmail && (
        <p className="mt-2.5 truncate text-xs text-muted-foreground">Contact: {influencerEmail}</p>
      )}

      <BrandDeliverables application={application} campaignId={String(application.campaign?.id ?? '')} />

      {/* Onboarding Message Dialog */}
      <Dialog open={isOnboardingDialogOpen} onOpenChange={setIsOnboardingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send onboarding info</DialogTitle>
            <DialogDescription>
              Customise your welcome message for {influencerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="onboarding-message">Message</Label>
            <Textarea
              id="onboarding-message"
              value={onboardingMessage}
              onChange={(e) => setOnboardingMessage(e.target.value)}
              className="min-h-[16rem] resize-none"
              placeholder="Enter your onboarding message..."
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to{' '}
              <span className="font-semibold text-foreground">{influencerEmail}</span>
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOnboardingDialogOpen(false)} disabled={isSending}>
              <X />
              Cancel
            </Button>
            <Button
              variant="form"
              onClick={handleSendOnboarding}
              disabled={isSending || !onboardingMessage.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send />
                  Send message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CampaignDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerProfile | null>(null);
  const [selectedMatched, setSelectedMatched] = useState(false);
  const [inProgressIds, setInProgressIds] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    action: 'publish' | 'complete' | 'cancel' | 'delete';
  } | null>(null);

  // Decline dialog state
  const [declineDialogState, setDeclineDialogState] = useState<{
    open: boolean;
    application: Application | null;
  }>({ open: false, application: null });

  const { data: campaign, isLoading: campaignLoading } = useBrandCampaign(slug || '');
  const queryClient = useQueryClient();
  const { mutate: updateApplicationStatus, isPending: isUpdating } = useUpdateApplicationStatus();
  const { mutate: updateCampaignStatus, isPending: isUpdatingStatus } = useUpdateCampaignStatus();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();

  const handleApprove = (applicationId: string) => {
    updateApplicationStatus({ id: applicationId, status: 'accepted' });
  };

  const handleRejectClick = (application: Application) => {
    setDeclineDialogState({ open: true, application });
  };

  const handleDeclineConfirm = (reason?: string) => {
    if (!declineDialogState.application) return;
    updateApplicationStatus({
      id: declineDialogState.application.id,
      status: 'rejected',
      declineReason: reason,
    });
    setDeclineDialogState({ open: false, application: null });
  };

  const handleToggleInProgress = (applicationId: string) => {
    setInProgressIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const handleViewProfile = (application: Application) => {
    if (!application.influencer_profile) return;

    // Merge user data from application.influencer into influencer_profile
    const profileWithUser: InfluencerProfile = {
      ...application.influencer_profile,
      user: application.influencer,
    };

    setSelectedInfluencer(profileWithUser);
    setSelectedMatched(application.status === 'accepted');
  };

  const handleConfirmAction = () => {
    if (!dialogState || !campaign) return;

    if (dialogState.action === 'delete') {
      deleteCampaign(campaign.slug, {
        onSuccess: () => {
          setDialogState(null);
          navigate('/brand/campaigns');
        },
      });
    } else {
      const statusMap = { publish: 'active', complete: 'completed', cancel: 'cancelled' } as const;
      updateCampaignStatus(
        { slug: campaign.slug, status: statusMap[dialogState.action] },
        { onSuccess: () => setDialogState(null) }
      );
    }
  };

  if (campaignLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="max-w-md p-8 text-center">
          <span className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-6" />
          </span>
          <h1 className="mb-2 font-display text-display-3">Campaign not found</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            This campaign may have been deleted or the link is wrong.
          </p>
          <Button variant="form" onClick={() => navigate('/brand/campaigns')}>
            <ArrowLeft />
            Back to campaigns
          </Button>
        </Card>
      </div>
    );
  }

  const applications = campaign.applications || [];
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const chips = deliverableChips(campaign.deliverables_required as unknown);
  const dueDate = campaignDueDate(campaign);
  const goingLive = isGoingLive(campaign);
  const editPath = `/brand/campaigns/${campaign.slug}/edit`;
  const refetchCampaign = () =>
    queryClient.invalidateQueries({ queryKey: ['campaign', 'brand', campaign.slug] });

  return (
    <div className="container py-8 sm:py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/brand/campaigns')}
        className="mb-6 -ml-2"
      >
        <ArrowLeft />
        Back to campaigns
      </Button>

      {/* ------------------------------------------------------ page header */}
      <Rise>
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-2.5">{daysLeftLabel(dueDate)}</p>
              <h1 className="font-display text-[2rem] leading-tight sm:text-display-2">
                {campaign.title}
              </h1>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={goingLive ? 'going_live' : campaign.status} />
                {campaign.category && <Badge variant="neutral">{formatLabel(campaign.category)}</Badge>}
                {dueDate && (
                  <Badge variant="outline">Post by {formatDateDMY(dueDate)}</Badge>
                )}
              </div>
            </div>

            {/* Campaign Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Campaign actions">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {campaign.status === 'draft' && (
                  <>
                    <DropdownMenuItem onClick={() => setDialogState({ open: true, action: 'publish' })}>
                      <Rocket className="mr-2 size-4" />
                      Publish campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(editPath)}>
                      <Pencil className="mr-2 size-4" />
                      Edit draft
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDialogState({ open: true, action: 'delete' })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete draft
                    </DropdownMenuItem>
                  </>
                )}
                {campaign.status === 'active' && (
                  <>
                    {campaign.is_editable && (
                      <DropdownMenuItem onClick={() => navigate(editPath)}>
                        <Pencil className="mr-2 size-4" />
                        Edit campaign
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setDialogState({ open: true, action: 'complete' })}>
                      <CheckCircle className="mr-2 size-4" />
                      Mark as completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDialogState({ open: true, action: 'cancel' })}
                      className="text-destructive focus:text-destructive"
                    >
                      <XCircle className="mr-2 size-4" />
                      Cancel campaign
                    </DropdownMenuItem>
                  </>
                )}
                {(campaign.status === 'completed' || campaign.status === 'cancelled') && (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    No actions available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {campaign.description && (
            <p className="mt-5 max-w-[68ch] leading-relaxed text-muted-foreground">
              {campaign.description}
            </p>
          )}
        </header>
      </Rise>

      {goingLive && campaign.is_editable && campaign.live_at && (
        <GoingLiveBanner liveAt={campaign.live_at} onEdit={() => navigate(editPath)} onLive={refetchCampaign} />
      )}

      {/* ------------------------------------------------------------ stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Rise>
          <Stat
            label={campaign.budget_type === 'barter' ? 'Item worth' : 'Budget'}
            value={formatINR(campaign.budget)}
            tone="feature"
          />
        </Rise>
        <Rise delay={0.06}>
          <Stat label="Applications" value={formatCompact(campaign.applications_count || 0)} />
        </Rise>
        <Rise delay={0.12}>
          <Stat
            label="Accepted"
            value={acceptedCount}
            note={pendingCount > 0 ? `${pendingCount} awaiting review` : undefined}
            noteTone={pendingCount > 0 ? 'warning' : 'muted'}
          />
        </Rise>
      </div>

      {/* ------------------------------------------------------------- tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1 sm:inline-flex sm:w-auto">
          <TabsTrigger
            value="overview"
            className="min-h-[44px] rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
          >
            <FileText className="mr-2 size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="min-h-[44px] rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
          >
            <Users className="mr-2 size-4" />
            Applications
            {pendingCount > 0 && <span className="num ml-2 text-xs">{pendingCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <span className="eyebrow">Scope</span>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                {chips.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <li key={chip} className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium">
                        {chip}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No deliverables specified.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <span className="eyebrow">Brief</span>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {campaign.requirements || 'No requirements added.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-4">
            {applications.map((application) => (
              <Rise key={application.id}>
                <Card>
                  <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3.5">
                        <Avatar
                          name={`${application.influencer.first_name || ''} ${application.influencer.last_name || ''}`.trim() || application.influencer.username}
                          size={52}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
                                {application.influencer.first_name} {application.influencer.last_name}
                              </h3>
                              <p className="truncate text-xs text-muted-foreground">
                                @{application.influencer.username}
                              </p>
                            </div>
                            <StatusBadge status={application.status} />
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Applied {formatDateDMY(application.applied_at)}
                          </p>
                        </div>
                      </div>

                      {/* Message */}
                      {application.message && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-border p-3.5">
                          <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {application.message}
                          </p>
                        </div>
                      )}

                      {/* Quick Stats for Pending Applications */}
                      {application.status === 'pending' && application.influencer_profile && (
                        <InfluencerQuickStats profile={application.influencer_profile} />
                      )}

                      {/* Manage Collaboration Area for Accepted Applications */}
                      {application.status === 'accepted' && application.influencer_profile && (
                        <ManageCollaborationArea
                          application={application}
                          campaignTitle={campaign.title}
                          onViewProfile={() => handleViewProfile(application)}
                          inProgressIds={inProgressIds}
                          onToggleInProgress={handleToggleInProgress}
                        />
                      )}

                      {/* Action Buttons for Pending */}
                      {application.status === 'pending' && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProfile(application)}
                            disabled={!application.influencer_profile}
                          >
                            <User />
                            View profile
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectClick(application)}
                            disabled={isUpdating}
                          >
                            <XCircle />
                            Decline
                          </Button>
                          <Button
                            variant="form"
                            size="sm"
                            onClick={() => handleApprove(application.id)}
                            disabled={isUpdating}
                          >
                            <CheckCircle />
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Rise>
            ))}

            {applications.length === 0 && (
              <Card intent="dashed">
                <CardContent className="p-12 pt-12 text-center">
                  <span className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Users className="size-6" />
                  </span>
                  <h3 className="mb-2 font-display text-display-3">No applications yet</h3>
                  <p className="mx-auto max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
                    Creators will start applying once they discover your campaign.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ProfileViewModal
        isOpen={!!selectedInfluencer}
        onClose={() => setSelectedInfluencer(null)}
        profileType="influencer"
        influencerProfile={selectedInfluencer}
        matched={selectedMatched}
      />

      {/* Status Change Dialog */}
      {dialogState && campaign && (
        <CampaignStatusDialog
          open={dialogState.open}
          onOpenChange={(open) => !open && setDialogState(null)}
          action={dialogState.action}
          campaignTitle={campaign.title}
          onConfirm={handleConfirmAction}
          isLoading={isUpdatingStatus || isDeleting}
        />
      )}

      {/* Decline Reason Dialog */}
      <DeclineReasonDialog
        isOpen={declineDialogState.open}
        onClose={() => setDeclineDialogState({ open: false, application: null })}
        onConfirm={handleDeclineConfirm}
        influencerName={
          declineDialogState.application?.influencer_profile?.user?.username ||
          declineDialogState.application?.influencer?.username ||
          'this influencer'
        }
        campaignTitle={campaign?.title || ''}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default CampaignDetail;
