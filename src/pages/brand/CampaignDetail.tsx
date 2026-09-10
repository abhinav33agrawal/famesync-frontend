import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Users,
  User,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  PartyPopper,
  MessageSquare,
  Mail,
  PlayCircle,
  MoreVertical,
  Rocket,
  Pencil,
  Trash2,
  Send,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrandCampaign, useUpdateApplicationStatus, useUpdateCampaignStatus, useDeleteCampaign } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { ProfileViewModal } from '@/components/ProfileViewModal';
import { CampaignStatusDialog } from '@/components/CampaignStatusDialog';
import { DeclineReasonDialog } from '@/components/DeclineReasonDialog';
import { InfluencerQuickStats } from '@/components/InfluencerQuickStats';
import { formatLabel } from '@/lib/utils';
import type { InfluencerProfile, Application } from '@/lib/api/types';
import CampaignDetailSkeleton from '@/components/CampaignDetailSkeleton';

const DELIVERABLE_LABELS: Record<string, string> = {
  POST: 'Instagram post',
  STORY: 'Instagram story',
  REEL: 'Instagram reel',
  VIDEO: 'Instagram video',
  YOUTUBE_VIDEO: 'YouTube video',
  YOUTUBE_SHORTS: 'YouTube shorts',
  MIXED: 'Mixed content',
};

const capitalizeText = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const renderDeliverables = (d: unknown) => {
  if (Array.isArray(d)) {
    const first = d[0] as unknown;
    const isObjArray = typeof first === 'object' && first !== null && 'type' in (first as Record<string, unknown>);
    if (isObjArray) {
      return (
        <div className="flex flex-wrap gap-2">
          {(d as { type: string; count?: number }[]).map((it, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1.5 text-sm font-medium"
            >
              {it.count ?? 1}-{capitalizeText(DELIVERABLE_LABELS[it.type] || it.type)}
            </Badge>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        {(d as string[]).map((item, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1.5 text-sm font-medium"
          >
            {capitalizeText(item)}
          </Badge>
        ))}
      </div>
    );
  }
  if (typeof d === 'string') {
    return (
      <Badge
        variant="secondary"
        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1.5 text-sm font-medium"
      >
        {capitalizeText(d)}
      </Badge>
    );
  }
  return null;
};

// Floating Orb Component
const FloatingOrb = ({
  className,
  delay = 0
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      y: [0, -20, 0]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`hidden md:block ${className}`}
  />
);

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  gradient = false,
  delay = 0
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  gradient?: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -2 }}
    className="h-full"
  >
    <Card className="bg-card border border-border border-border/50 hover:border-primary/30 transition-all duration-300 group h-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
            whileHover={{ rotate: 5 }}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
            <div className={`text-base sm:text-xl font-bold truncate ${gradient ? 'text-foreground' : ''}`}>
              {value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

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
  inProgressIds: Set<number>;
  onToggleInProgress: (id: number) => void;
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

  const handleSendOnboarding = async () => {
    setIsSending(true);
    try {
      // TODO: Replace with actual API call to send email
      // For now, simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Message Sent',
        description: `Onboarding info has been sent to ${influencerEmail}`,
      });

      setIsOnboardingDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send onboarding message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          </motion.div>
          <span className="font-semibold text-sm sm:text-base text-green-600 dark:text-green-400">Manage Collaboration</span>
        </div>
        {isInProgress && (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 w-fit">
            <PlayCircle className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )}
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {influencerEmail && (
          <Button
            size="sm"
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white group text-xs sm:text-sm"
            onClick={() => setIsOnboardingDialogOpen(true)}
          >
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            <span className="hidden sm:inline">Send Onboarding Info</span>
            <span className="sm:hidden">Send Info</span>
            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        )}
        <Button
          size="sm"
          variant={isInProgress ? "secondary" : "outline"}
          className={`text-xs sm:text-sm ${isInProgress ? "bg-blue-500/20 hover:bg-blue-500/30" : "border-green-500/30 hover:bg-green-500/10"}`}
          onClick={() => onToggleInProgress(application.id)}
        >
          <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
          {isInProgress ? 'Not Started' : 'In Progress'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onViewProfile}
          className="group/btn text-xs sm:text-sm"
        >
          <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">View Profile</span>
          <span className="sm:hidden">Profile</span>
          <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </div>
      {influencerEmail && (
        <p className="text-xs text-muted-foreground mt-2 truncate">
          Contact: {influencerEmail}
        </p>
      )}

      {/* Onboarding Message Dialog */}
      <Dialog open={isOnboardingDialogOpen} onOpenChange={setIsOnboardingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send Onboarding Info
            </DialogTitle>
            <DialogDescription>
              Customize your welcome message for {influencerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={onboardingMessage}
                onChange={(e) => setOnboardingMessage(e.target.value)}
                className="min-h-[300px] bg-background/50 resize-none"
                placeholder="Enter your onboarding message..."
              />
            </div>
            <div className="text-xs text-muted-foreground">
              This message will be sent to: <span className="font-medium text-foreground">{influencerEmail}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOnboardingDialogOpen(false)}
              disabled={isSending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={handleSendOnboarding}
              disabled={isSending || !onboardingMessage.trim()}
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const CampaignDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerProfile | null>(null);
  const [inProgressIds, setInProgressIds] = useState<Set<number>>(new Set());
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
  const { mutate: updateApplicationStatus, isPending: isUpdating } = useUpdateApplicationStatus();
  const { mutate: updateCampaignStatus, isPending: isUpdatingStatus } = useUpdateCampaignStatus();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();

  const handleApprove = (applicationId: number) => {
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

  const handleToggleInProgress = (applicationId: number) => {
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

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'draft': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return '';
    }
  };

  if (campaignLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <FloatingOrb className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="bg-card border border-border border-border/50 p-8 text-center max-w-md">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center mx-auto mb-6"
            >
              <FileText className="h-10 w-10 text-destructive" />
            </motion.div>
            <p className="text-destructive mb-4 text-lg font-semibold">Campaign not found</p>
            <Button onClick={() => navigate('/brand/campaigns')} className="bg-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const applications = campaign.applications || [];
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 opacity-30" />
      <FloatingOrb
        className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        delay={0}
      />
      <FloatingOrb
        className="absolute bottom-40 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        delay={2}
      />
      <FloatingOrb
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
        delay={4}
      />

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/brand/campaigns')}
              className="mb-4 sm:mb-6 group hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all text-sm sm:text-base"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Campaigns</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </motion.div>

          {/* Campaign Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border border-border border-border/50 mb-4 sm:mb-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              <CardHeader className="relative p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0"
                      >
                        <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl sm:text-2xl lg:text-3xl truncate">{campaign.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClasses(campaign.status)}
                          >
                            <motion.div
                              animate={campaign.status === 'active' ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="w-2 h-2 rounded-full bg-current mr-2"
                            />
                            {formatLabel(campaign.status)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-secondary/80">
                            {formatLabel(campaign.category)}
                          </Badge>
                        </div>
                      </div>
                      {/* Campaign Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border border-border/50">
                          {campaign.status === 'draft' && (
                            <>
                              <DropdownMenuItem onClick={() => setDialogState({ open: true, action: 'publish' })}>
                                <Rocket className="mr-2 h-4 w-4 text-green-500" />
                                Publish Campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/brand/campaigns/${campaign.slug}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Draft
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDialogState({ open: true, action: 'delete' })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Draft
                              </DropdownMenuItem>
                            </>
                          )}
                          {campaign.status === 'active' && (
                            <>
                              <DropdownMenuItem onClick={() => setDialogState({ open: true, action: 'complete' })}>
                                <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDialogState({ open: true, action: 'cancel' })}
                                className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Campaign
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
                    <CardDescription className="text-sm sm:text-base line-clamp-2 sm:line-clamp-none">{campaign.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  <StatCard
                    icon={() => <span className="text-primary font-bold text-base sm:text-lg">₹</span>}
                    label={campaign.budget_type === 'barter' ? "Item Worth" : "Budget"}
                    value={`₹${campaign.budget.toLocaleString('en-IN')}`}
                    gradient
                    delay={0.2}
                  />
                  <StatCard
                    icon={Users}
                    label="Applications"
                    value={campaign.applications_count || 0}
                    gradient
                    delay={0.3}
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Accepted"
                    value={acceptedCount}
                    gradient
                    delay={0.4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-card border border-border border-border/50 mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                >
                  <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                >
                  <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Applications</span>
                  <span className="sm:hidden">Apps</span>
                  {pendingCount > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-white text-primary border-white/20 text-[10px] sm:text-xs px-1 sm:px-2 shadow-sm">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="bg-card border border-border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        Deliverables
                      </h4>
                      <Card className="bg-card border border-border border-border/50">
                        <CardContent className="p-4">
                          <div>{renderDeliverables(campaign.deliverables_required as unknown)}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-secondary" />
                        </div>
                        Requirements
                      </h4>
                      <Card className="bg-card border border-border border-border/50">
                        <CardContent className="p-4">
                          <p className="text-muted-foreground whitespace-pre-wrap">{campaign.requirements}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications">
                <div className="space-y-4">
                  {applications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-card border border-border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                        <CardContent className="p-4 sm:pt-6">
                          <div className="flex flex-col gap-4">
                            {/* Mobile Layout: Stack vertically */}
                            <div className="flex items-start gap-3 sm:gap-4">
                              <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
                                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-primary/20">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="bg-primary text-white text-lg sm:text-xl">
                                    {application.influencer.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                                      {application.influencer.first_name} {application.influencer.last_name}
                                    </h3>
                                    {application.status === 'accepted' && (
                                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                                        <PartyPopper className="mr-1 h-3 w-3" />
                                        Matched
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${application.status === 'accepted'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                                        : application.status === 'rejected'
                                          ? 'bg-destructive/10 text-destructive border-destructive/30'
                                          : 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                                        }`}
                                    >
                                      {application.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                                      {application.status === 'accepted' && <CheckCircle className="mr-1 h-3 w-3" />}
                                      {application.status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                                      {application.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  @{application.influencer.username}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                  Applied {new Date(application.applied_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Message */}
                            {application.message && (
                              <Card className="bg-card border border-border border-border/50">
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <p className="text-xs sm:text-sm text-muted-foreground italic line-clamp-3 sm:line-clamp-none">
                                      "{application.message}"
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
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
                              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewProfile(application)}
                                  disabled={!application.influencer_profile}
                                  className="group/btn text-xs sm:text-sm"
                                >
                                  <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                  View Profile
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(application.id)}
                                  disabled={isUpdating}
                                  className="bg-green-600 hover:bg-green-700 group/btn text-xs sm:text-sm"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:scale-110 transition-transform" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectClick(application)}
                                  disabled={isUpdating}
                                  className="text-xs sm:text-sm"
                                >
                                  <XCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {applications.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="bg-card border border-border border-border/50">
                        <CardContent className="py-16 text-center">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6"
                          >
                            <Users className="h-10 w-10 text-primary" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                          <p className="text-muted-foreground">
                            Influencers will start applying once they discover your campaign
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <ProfileViewModal
          isOpen={!!selectedInfluencer}
          onClose={() => setSelectedInfluencer(null)}
          profileType="influencer"
          influencerProfile={selectedInfluencer}
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
    </div>
  );
};

export default CampaignDetail;
