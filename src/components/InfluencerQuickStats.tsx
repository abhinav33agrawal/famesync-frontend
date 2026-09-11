import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, Instagram, Youtube, Twitter, Users } from 'lucide-react';
import { formatCompact } from '@/lib/format';
import type { InfluencerProfile, SocialUrlEntry } from '@/lib/api/types';

/* The per-platform tiles are a hairline-split numeric strip in the display
   face (the CreatorCard idiom), not blue-tinted pills. Reach goes through
   `formatCompact`, the local formatFollowers helper is gone. */

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="size-3" />;
    case 'youtube':
      return <Youtube className="size-3" />;
    case 'twitter':
    case 'x':
      return <Twitter className="size-3" />;
    default:
      return <Users className="size-3" />;
  }
};

interface InfluencerQuickStatsProps {
  profile: InfluencerProfile;
}

export const InfluencerQuickStats = ({ profile }: InfluencerQuickStatsProps) => {
  const socialUrls = profile.social_urls as SocialUrlEntry[] | undefined;
  const platformsWithFollowers = socialUrls?.filter(s => s.followers && s.followers > 0) || [];

  const completion = profile.profile_completion;
  const completionVariant =
    completion === undefined || completion === null
      ? 'neutral'
      : completion >= 80
        ? 'success'
        : completion >= 50
          ? 'warning'
          : 'destructive';

  return (
    <div className="space-y-2.5 py-2">
      {platformsWithFollowers.length > 0 && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
          {platformsWithFollowers.map((social) => (
            <div key={social.platform} className="min-w-0 bg-card px-2.5 py-2">
              <dd className="num flex items-center gap-1.5 text-[0.9375rem]">
                {formatCompact(social.followers)}
                {social.verified && <CheckCircle className="size-3 shrink-0 text-success" />}
              </dd>
              <dt className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-medium capitalize text-muted-foreground/75">
                {getPlatformIcon(social.platform)}
                {social.platform}
              </dt>
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {profile.niche && (
          <Badge variant="outline">
            <Target className="size-3" />
            {profile.niche}
          </Badge>
        )}

        {completion ? (
          <Badge variant={completionVariant}>
            <span className="num">{completion}%</span> complete
          </Badge>
        ) : null}
      </div>
    </div>
  );
};
