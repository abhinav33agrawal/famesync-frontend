import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, Instagram, Youtube, Twitter } from 'lucide-react';
import type { InfluencerProfile, SocialUrlEntry } from '@/lib/api/types';

const formatFollowers = (count: number | undefined): string => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const getPlatformIcon = (platform: string) => {
  const iconClass = "h-3 w-3";
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className={iconClass} />;
    case 'youtube':
      return <Youtube className={iconClass} />;
    case 'twitter':
    case 'x':
      return <Twitter className={iconClass} />;
    default:
      return null;
  }
};

interface InfluencerQuickStatsProps {
  profile: InfluencerProfile;
}

export const InfluencerQuickStats = ({ profile }: InfluencerQuickStatsProps) => {
  const socialUrls = profile.social_urls as SocialUrlEntry[] | undefined;
  const platformsWithFollowers = socialUrls?.filter(s => s.followers && s.followers > 0) || [];

  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      {/* Platform Follower Badges */}
      {platformsWithFollowers.map((social) => (
        <Badge 
          key={social.platform} 
          variant="secondary" 
          className="text-xs bg-secondary/50 gap-1"
        >
          {getPlatformIcon(social.platform)}
          <span>{formatFollowers(social.followers)}</span>
          {social.verified && (
            <CheckCircle className="h-3 w-3 text-blue-500" />
          )}
        </Badge>
      ))}

      {/* Niche Badge */}
      {profile.niche && (
        <Badge variant="outline" className="text-xs gap-1">
          <Target className="h-3 w-3" />
          {profile.niche}
        </Badge>
      )}

      {/* Profile Completion */}
      {profile.profile_completion && (
        <Badge 
          variant="outline" 
          className={`text-xs ${
            profile.profile_completion >= 80 
              ? 'border-green-500/30 text-green-600' 
              : profile.profile_completion >= 50 
              ? 'border-yellow-500/30 text-yellow-600' 
              : 'border-orange-500/30 text-orange-600'
          }`}
        >
          {profile.profile_completion}% complete
        </Badge>
      )}
    </div>
  );
};
