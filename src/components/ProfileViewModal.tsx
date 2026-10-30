import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Globe,
  Mail,
  Instagram,
  Users,
  Target,
} from 'lucide-react';
import { Avatar, BrandLogo } from '@/components/Avatar';
import { Stat } from '@/components/Stat';
import { TrustLayer } from '@/components/TrustBadges';
import { PlatformFollowersCard } from '@/components/PlatformFollowersCard';
import { formatCompact } from '@/lib/format';
import { SocialUrlEntry } from '@/lib/api/types';
import { buildInstagramInsightCards, InstagramAccountData, toInstagramDisplayCount } from '@/lib/instagram';

/* Every gradient chip, `text-white` icon tile and green/blue tinted badge is
   gone: brand marks come from BrandLogo/Avatar, reach from
   PlatformFollowersCard + `formatCompact`, numerals from `.num`. */

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
  /** True only when the two sides are actually matched (an accepted
   *  application). Until then the contact card and "You're matched" stay
   *  hidden -- the brand-side views used to show both on every profile. */
  matched?: boolean;
}

const MatchedNote = () => (
  <p className="text-center text-sm text-muted-foreground">
    You&apos;re matched — reach out to discuss collaboration details.
  </p>
);

export function ProfileViewModal({
  isOpen,
  onClose,
  profileType,
  brandProfile,
  influencerProfile,
  matched = false,
}: ProfileViewModalProps) {
  if (profileType === 'brand' && brandProfile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-10 font-display text-display-3">
              <BrandLogo name={brandProfile.company_name} />
              <span className="min-w-0 break-words">{brandProfile.company_name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Trust Layer */}
            <TrustLayer
              emailVerified={brandProfile.user.email_verified}
              isNewMember={brandProfile.user.is_new_member}
              profileCompletion={brandProfile.profile_completion}
              size="md"
            />

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Building2 className="size-3" />
                {brandProfile.industry}
              </Badge>
            </div>

            {/* Description */}
            {brandProfile.description && (
              <Card className="p-5">
                <p className="eyebrow mb-2.5">About the company</p>
                <p className="leading-relaxed text-muted-foreground">{brandProfile.description}</p>
              </Card>
            )}

            <Separator />

            {/* Contact Information */}
            <Card className="p-5">
              <p className="eyebrow mb-4">Contact</p>
              <div className="space-y-3">
                {matched && brandProfile.user.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${brandProfile.user.email}`}
                      className="min-w-0 break-all text-sm font-medium text-primary hover:underline"
                    >
                      {brandProfile.user.email}
                    </a>
                  </div>
                )}
                {brandProfile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={brandProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 break-all text-sm font-medium text-primary hover:underline"
                    >
                      {brandProfile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">@{brandProfile.user.username}</span>
                </div>
              </div>
            </Card>

            {matched && <MatchedNote />}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (profileType === 'influencer' && influencerProfile && influencerProfile.user) {
    const username = influencerProfile.user.username || 'Unknown';
    const insightCards = influencerProfile.instagram_data?.accountInsights
      ? buildInstagramInsightCards(influencerProfile.instagram_data)
      : [];

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-10 font-display text-display-3">
              <Avatar name={username} size={46} />
              <span className="min-w-0 break-all">@{username}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Trust Layer */}
            <TrustLayer
              emailVerified={influencerProfile.user.email_verified}
              isNewMember={influencerProfile.user.is_new_member}
              profileCompletion={influencerProfile.profile_completion}
              size="md"
            />

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Target className="size-3" />
                {influencerProfile.niche}
              </Badge>
              {influencerProfile.location && (
                <Badge variant="secondary">
                  <Globe className="size-3" />
                  {influencerProfile.location}
                </Badge>
              )}
              {influencerProfile.engagement_rate != null && (
                <Badge variant="success">
                  <Instagram className="size-3" />
                  <span className="num">{influencerProfile.engagement_rate}%</span> engagement
                </Badge>
              )}
            </div>

            {/* Platform-Specific Stats */}
            {influencerProfile.social_urls && influencerProfile.social_urls.length > 0 ? (
              <PlatformFollowersCard socialUrls={influencerProfile.social_urls} compact />
            ) : influencerProfile.follower_count ? (
              <Stat label="Followers" value={formatCompact(influencerProfile.follower_count)} />
            ) : null}

            {/* Detailed Instagram Insights */}
            {insightCards.length > 0 && (
              <div className="space-y-3">
                <p className="eyebrow">Instagram insights</p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {insightCards.map((insight) => (
                    <Card key={insight.key} className="p-4">
                      <span className="eyebrow text-[10.5px]">{insight.label}</span>
                      <div className="num mt-2 text-[1.5rem] leading-none">
                        {toInstagramDisplayCount(insight.value)}
                      </div>
                      <p className="mt-1.5 truncate text-xs text-muted-foreground" title={insight.hint}>
                        {insight.hint}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {influencerProfile.bio && (
              <Card className="p-5">
                <p className="eyebrow mb-2.5">About</p>
                <p className="leading-relaxed text-muted-foreground">{influencerProfile.bio}</p>
              </Card>
            )}

            <Separator />

            {/* Contact Information */}
            <Card className="p-5">
              <p className="eyebrow mb-4">Contact</p>
              <div className="space-y-3">
                {matched && influencerProfile.user.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${influencerProfile.user.email}`}
                      className="min-w-0 break-all text-sm font-medium text-primary hover:underline"
                    >
                      {influencerProfile.user.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Instagram className="size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`https://instagram.com/${influencerProfile.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 break-all text-sm font-medium text-primary hover:underline"
                  >
                    @{influencerProfile.instagram_handle}
                  </a>
                </div>
              </div>
            </Card>

            {matched && <MatchedNote />}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
