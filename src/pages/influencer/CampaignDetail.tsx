import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle,
  Loader2,
  MapPin,
  Users,
  TrendingUp,
  FileText,
  Hash,
  MessageSquare,
  Send,
  Sparkles,
  Building2,
  Globe,
  Mail,
  Phone,
  Crown,
  Zap,
  ArrowRight,
  Clock,
  IndianRupee,
  ExternalLink
} from 'lucide-react';
import { formatDateDMY } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useInfluencerCampaign, useApplyToCampaign } from '@/hooks/useCampaigns';
import { useInfluencerApplications } from '@/hooks/useApplications';
import { useSubscription } from '@/hooks/useSubscription';
import { LockedFeature, LockedText, PremiumBadgeIndicator } from '@/components/LockedFeature';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { CreditWarning, InsufficientCreditsBlock, canApplyWithCredits } from '@/components/CreditWarning';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import CampaignDetailSkeleton from '@/components/CampaignDetailSkeleton';

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

  const getStatusBadge = () => {
    if (!hasApplied) return null;

    switch (applicationStatus) {
      case 'accepted':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
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
            <Button onClick={() => navigate('/influencer/campaigns')} className="bg-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Card>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/influencer/campaigns')}
              className="mb-4 group hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 group-hover:text-white transition-transform" />
              Back to Campaigns
            </Button>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border border-border border-border/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start gap-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold"
                      >
                        {brandName.charAt(0).toUpperCase()}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${campaign.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}`}
                          >
                            <motion.div
                              animate={campaign.status === 'active' ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"
                            />
                            <span className="capitalize">{campaign.status}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {campaign.category}
                          </Badge>
                          {getStatusBadge()}
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl mb-2">{campaign.title}</CardTitle>
                        <CardDescription className="text-base">{campaign.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Campaign Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card border border-border border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Deliverables */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Deliverables Required</h4>
                      <div className="flex flex-wrap gap-1 items-center">
                        {typeof campaign.deliverables_required === 'string'
                          ? (() => {
                            // Map old database formats to new display format
                            let displayText = campaign.deliverables_required;
                            const lowerText = displayText.toLowerCase();

                            // YouTube mappings
                            if (lowerText.includes('youtube') && lowerText.includes('short')) {
                              displayText = 'Shorts';
                            } else if (lowerText.includes('youtube') || lowerText.includes('yt')) {
                              displayText = 'YT video';
                            }
                            // Instagram mappings (remove IG/Instagram prefix)
                            else if (lowerText.includes('post')) {
                              displayText = 'Post';
                            } else if (lowerText.includes('story') || lowerText.includes('stories')) {
                              displayText = 'Story';
                            } else if (lowerText.includes('reel')) {
                              displayText = 'Reel';
                            } else if (lowerText.includes('video')) {
                              displayText = 'Video';
                            } else if (lowerText.includes('short')) {
                              displayText = 'Shorts';
                            }

                            return (
                              <span className="text-sm font-medium text-foreground px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
                                {displayText}
                              </span>
                            );
                          })()
                          : Array.isArray(campaign.deliverables_required)
                            ? campaign.deliverables_required.map((item, idx, arr) => {
                              const DELIVERABLE_LABELS: Record<string, string> = {
                                POST: 'Post',
                                STORY: 'Story',
                                REEL: 'Reel',
                                VIDEO: 'Video',
                                YOUTUBE_VIDEO: 'YT video',
                                YOUTUBE_SHORTS: 'Shorts',
                                MIXED: 'Mixed content',
                              };
                              let label = '';
                              let count = 0;
                              if (typeof item === 'string') {
                                // Map old database formats to new display format
                                let displayText = item;
                                const lowerText = displayText.toLowerCase();

                                // YouTube mappings
                                if (lowerText.includes('youtube') && lowerText.includes('short')) {
                                  displayText = 'Shorts';
                                } else if (lowerText.includes('youtube') || lowerText.includes('yt')) {
                                  displayText = 'YT video';
                                }
                                // Instagram mappings (remove IG/Instagram prefix)
                                else if (lowerText.includes('post')) {
                                  displayText = 'Post';
                                } else if (lowerText.includes('story') || lowerText.includes('stories')) {
                                  displayText = 'Story';
                                } else if (lowerText.includes('reel')) {
                                  displayText = 'Reel';
                                } else if (lowerText.includes('video')) {
                                  displayText = 'Video';
                                } else if (lowerText.includes('short')) {
                                  displayText = 'Shorts';
                                }

                                label = displayText;
                              } else {
                                label = DELIVERABLE_LABELS[item.type];

                                if (!label) {
                                  // Fallback for old database formats
                                  const typeStr = (item.type || '').toLowerCase();
                                  if (typeStr.includes('youtube') && typeStr.includes('short')) {
                                    label = 'Shorts';
                                  } else if (typeStr.includes('youtube') || typeStr.includes('yt')) {
                                    label = 'YT video';
                                  } else if (typeStr.includes('post')) {
                                    label = 'Post';
                                  } else if (typeStr.includes('story') || typeStr.includes('stories')) {
                                    label = 'Story';
                                  } else if (typeStr.includes('reel')) {
                                    label = 'Reel';
                                  } else if (typeStr.includes('video')) {
                                    label = 'Video';
                                  } else if (typeStr.includes('short')) {
                                    label = 'Shorts';
                                  } else {
                                    label = item.type;
                                  }
                                }

                                count = item.count || 0;
                              }
                              return (
                                <div key={idx} className="flex items-center">
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
                                    <span className="text-sm font-medium text-foreground">{label}</span>
                                    {count > 0 && (
                                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4 font-semibold">
                                        {count}
                                      </Badge>
                                    )}
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <span className="text-muted-foreground mx-1">,</span>
                                  )}
                                </div>
                              );
                            })
                            : (
                              <span className="text-sm font-medium text-foreground px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
                                {JSON.stringify(campaign.deliverables_required)}
                              </span>
                            )
                        }
                      </div>
                    </div>

                    {/* Location for On-field campaigns */}
                    {campaign.campaign_type === 'onfield' && campaign.location && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Event Location
                        </h4>
                        <p className="text-foreground">{campaign.location}</p>
                        {campaign.event_date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Event Date: {formatDateDMY(campaign.event_date)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Hashtags - Premium */}
                    {campaign.hashtags && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Campaign Hashtags
                          {!canViewFullDetails && <PremiumBadgeIndicator />}
                        </h4>
                        <LockedFeature
                          isLocked={!canViewFullDetails}
                          message="Upgrade to Premium to view hashtags"
                        >
                          <p className="text-foreground">{campaign.hashtags}</p>
                        </LockedFeature>
                      </div>
                    )}

                    {/* Key Messages - Premium */}
                    {campaign.key_messages && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Key Messages
                          {!canViewFullDetails && <PremiumBadgeIndicator />}
                        </h4>
                        <LockedFeature
                          isLocked={!canViewFullDetails}
                          message="Upgrade to Premium to view key messages"
                        >
                          <p className="text-foreground whitespace-pre-wrap">{campaign.key_messages}</p>
                        </LockedFeature>
                      </div>
                    )}

                    {/* Creative Brief - Premium */}
                    {campaign.creative_brief_url && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Creative Brief
                          {!canViewFullDetails && <PremiumBadgeIndicator />}
                        </h4>
                        <LockedFeature
                          isLocked={!canViewFullDetails}
                          message="Upgrade to Premium to access creative brief"
                        >
                          <Button variant="outline" size="sm" asChild>
                            <a href={campaign.creative_brief_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Creative Brief
                            </a>
                          </Button>
                        </LockedFeature>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Requirements */}
              {(campaign.target_cities || campaign.target_gender || campaign.min_followers || campaign.target_niche) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-card border border-border border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Influencer Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Target Cities</p>
                          <p className="font-medium text-sm">
                            {campaign.target_cities && campaign.target_cities.length > 0
                              ? campaign.target_cities
                              : 'All'}
                          </p>
                        </div>
                        {campaign.target_gender && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Gender</p>
                            <p className="font-medium text-sm capitalize">{campaign.target_gender}</p>
                          </div>
                        )}
                        {(campaign.min_followers || campaign.max_followers) && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Follower Range</p>
                            <p className="font-medium text-sm">
                              {campaign.min_followers?.toLocaleString() || '0'} - {campaign.max_followers?.toLocaleString() || 'Any'}
                            </p>
                          </div>
                        )}
                        {campaign.target_niche && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Preferred Niche</p>
                            <p className="font-medium text-sm">{campaign.target_niche}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Apply Now Button */}
              {!hasApplied ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-5"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full">
                          <Button
                            onClick={() => setShowApplyDialog(true)}
                            className="w-full bg-primary text-white group"
                            size="lg"
                            disabled={!user?.is_approved}
                          >
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-5"
                >
                  <Card className={`bg-card border border-border ${hasAcceptedApplication ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasAcceptedApplication ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                        <p className="font-semibold">
                          {hasAcceptedApplication ? 'Application Accepted!' : 'Application Submitted'}
                        </p>
                      </div>
                      {hasAcceptedApplication && campaign.contact_email && (
                        <Button
                          variant="outline"
                          className="mt-3 w-full"
                          size="sm"
                          asChild
                        >
                          <a href={`mailto:${campaign.contact_email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Brand
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="bg-card border border-border border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Campaign Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Budget */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-primary" />
                      </div>
                      <div>

                        <p className="text-xs text-muted-foreground">{campaign.budget_type === 'barter' ? "Item Worth" : "Budget"}</p>
                        <div className="font-bold text-lg">
                          {campaign.budget && canViewFullDetails ? (
                            `₹${campaign.budget.toLocaleString('en-IN')}`
                          ) : campaign.budget_type ? (
                            campaign.budget_type.charAt(0).toUpperCase() + campaign.budget_type.slice(1).toLowerCase()
                          ) : (
                            <LockedText
                              text="₹50,000"
                              isLocked={!canViewFullDetails}
                              message="Upgrade to view budget"
                            />
                          )}
                        </div>
                      </div>
                    </div>


                    {/* Objective */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Objective</p>
                        <p className="font-semibold capitalize">{campaign.objective || 'Awareness'}</p>
                      </div>
                    </div>

                    {/* Campaign Type */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-semibold capitalize">{campaign.campaign_type || 'Online'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Brand Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="bg-card border border-border border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Brand Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Brand Name */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Brand Name</p>
                      {campaign.brand?.username && canViewFullDetails ? (
                        <p className="font-semibold">{campaign.brand.username}</p>
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
                          <p className="text-xs text-muted-foreground mb-1">Company</p>
                          <p className="font-semibold">{campaign.brand_profile.company_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Industry</p>
                          <p className="font-semibold">{campaign.brand_profile.industry}</p>
                        </div>
                        {campaign.brand_profile.website && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Website</p>
                            <a
                              href={campaign.brand_profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              {campaign.brand_profile.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* Contact Info - Premium */}
                    {(campaign.contact_email || campaign.contact_phone) && canViewFullDetails && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Contact</p>
                        {campaign.contact_email && (
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{campaign.contact_email}</span>
                          </div>
                        )}
                        {campaign.contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{campaign.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!canViewFullDetails && (
                      <div className="pt-3 border-t border-border/50">
                        <div className="p-3 rounded-lg bg-primary/5 text-center">
                          <Crown className="h-5 w-5 text-primary mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            Upgrade to Premium to view full brand details
                          </p>
                          <Button
                            size="sm"
                            className="bg-primary mt-2"
                            onClick={() => setShowUpgradePrompt(true)}
                          >
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="bg-background border-border/50 sm:max-w-lg shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Apply to Campaign
              </DialogTitle>
              <DialogDescription>
                Write a message to the brand explaining why you're a great fit
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the brand about your experience, audience, and why you want to work on this campaign..."
                  rows={5}
                  className="mt-2 bg-background/50"
                />
              </div>

              {/* Credit Warning - Inline, no modal */}
              {canApplyWithCredits(user?.credits || 0) ? (
                <>
                  <CreditWarning credits={user?.credits || 0} />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApply}
                      disabled={isApplying || !applicationMessage.trim()}
                      className="bg-primary text-white flex-1 group"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          {user?.credits === 1 ? 'Apply (Last Credit)' : 'Submit Application'}
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
    </div>
  );
};

export default InfluencerCampaignDetail;
