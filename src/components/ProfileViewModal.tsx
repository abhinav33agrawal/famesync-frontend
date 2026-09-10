import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Globe,
  Mail,
  Instagram,
  Users,
  Target,
  Package,
  CheckCircle2,
  Youtube,
} from 'lucide-react';
import { TrustLayer } from '@/components/TrustBadges';
import { SocialUrlEntry } from '@/lib/api/types';
import { buildInstagramInsightCards, InstagramAccountData, toInstagramDisplayCount } from '@/lib/instagramService';

interface BrandProfileData {
  company_name: string;
  industry: string;
  website?: string;
  description?: string;
  profile_completion?: number;
  user: {
    username: string;
    email?: string;
    email_verified?: boolean;
    is_new_member?: boolean;
    created_at?: string;
  };
}

interface InfluencerProfileData {
  niche: string;
  location?: string;
  engagement_rate?: number;
  instagram_handle: string;
  follower_count: number;
  bio?: string;
  profile_completion?: number;
  social_urls?: SocialUrlEntry[];
  instagram_data?: InstagramAccountData;
  user: {
    username: string;
    email?: string;
    email_verified?: boolean;
    is_new_member?: boolean;
    created_at?: string;
  };
}

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileType: 'brand' | 'influencer';
  brandProfile?: BrandProfileData;
  influencerProfile?: InfluencerProfileData;
}

const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('instagram')) return <Instagram className="h-4 w-4" />;
  if (platformLower.includes('youtube')) return <Youtube className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

const getPlatformColor = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('instagram')) return 'from-pink-500 to-purple-600';
  if (platformLower.includes('youtube')) return 'from-red-500 to-red-600';
  return 'from-primary to-secondary';
};

const formatFollowers = (count: number | null | undefined): string => {
  if (!count) return '—';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toLocaleString();
};

export function ProfileViewModal({
  isOpen,
  onClose,
  profileType,
  brandProfile,
  influencerProfile,
}: ProfileViewModalProps) {
  if (profileType === 'brand' && brandProfile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-xl font-bold">
                {brandProfile.company_name.charAt(0).toUpperCase()}
              </div>
              {brandProfile.company_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Trust Layer */}
            <TrustLayer
              emailVerified={brandProfile.user.email_verified}
              isNewMember={brandProfile.user.is_new_member}
              profileCompletion={brandProfile.profile_completion}
              size="md"
            />

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {brandProfile.industry}
              </Badge>
            </div>

            {/* Description */}
            {brandProfile.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    About the Company
                  </h3>
                  <p className="text-muted-foreground">{brandProfile.description}</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Contact Information */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {brandProfile.user.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${brandProfile.user.email}`}
                        className="text-primary hover:underline"
                      >
                        {brandProfile.user.email}
                      </a>
                    </div>
                  )}
                  {brandProfile.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={brandProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {brandProfile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">@{brandProfile.user.username}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              🎉 You're matched! Reach out to discuss collaboration details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (profileType === 'influencer' && influencerProfile && influencerProfile.user) {
    const username = influencerProfile.user.username || 'Unknown';
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-xl font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              @{username}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Trust Layer */}
            <TrustLayer
              emailVerified={influencerProfile.user.email_verified}
              isNewMember={influencerProfile.user.is_new_member}
              profileCompletion={influencerProfile.profile_completion}
              size="md"
            />

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Target className="h-3 w-3" />
                {influencerProfile.niche}
              </Badge>
              {influencerProfile.location && (
                <Badge variant="secondary" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {influencerProfile.location}
                </Badge>
              )}
              {influencerProfile.engagement_rate != null && (
                <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/20">
                  <Instagram className="h-3 w-3" />
                  {influencerProfile.engagement_rate}% Engagement
                </Badge>
              )}
            </div>

            {/* Platform-Specific Stats Cards */}
            {influencerProfile.social_urls && influencerProfile.social_urls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {influencerProfile.social_urls.map((social, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlatformColor(social.platform)} flex items-center justify-center text-white`}>
                          {getPlatformIcon(social.platform)}
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">{social.platform}</span>
                        {social.verified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xl font-bold">
                {formatFollowers(social.followers)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : influencerProfile.follower_count ? (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Followers</span>
          </div>
          <p className="text-2xl font-bold">
            {influencerProfile.follower_count.toLocaleString('en-IN')}
          </p>
        </CardContent>
      </Card>
    ) : null}
    
            {/* Detailed Instagram Insights */}
            {influencerProfile.instagram_data && influencerProfile.instagram_data.accountInsights && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Instagram className="h-4 w-4 text-white" />
                  </div>
                  Instagram Insights
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {buildInstagramInsightCards(influencerProfile.instagram_data).map((insight) => (
                    <Card key={insight.key} className="bg-card border border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-muted-foreground">{insight.label}</span>
                          <span className="text-2xl font-bold text-foreground">{toInstagramDisplayCount(insight.value)}</span>
                          <span className="text-xs text-muted-foreground truncate" title={insight.hint}>
                            {insight.hint}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {influencerProfile.bio && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    About
                  </h3>
                  <p className="text-muted-foreground">{influencerProfile.bio}</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Contact Information */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {influencerProfile.user.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${influencerProfile.user.email}`}
                        className="text-primary hover:underline"
                      >
                        {influencerProfile.user.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`https://instagram.com/${influencerProfile.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{influencerProfile.instagram_handle}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              🎉 You're matched! Reach out to discuss collaboration details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
