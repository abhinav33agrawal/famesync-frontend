import { Instagram, Youtube, Globe, CheckCircle2 } from 'lucide-react';
import { Stat } from '@/components/Stat';
import { formatCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { SocialUrlEntry } from '@/lib/api/types';
import { formatDistanceToNow } from 'date-fns';

/* Reach is expressed with `Stat` (one aubergine `feature` block for the
   total) instead of gradient-chip tiles with clipped-gradient numerals.
   Counts go through `formatCompact`. */

interface PlatformFollowersCardProps {
  socialUrls?: SocialUrlEntry[];
  className?: string;
  compact?: boolean;
}

const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('instagram')) return <Instagram className="size-4" />;
  if (platformLower.includes('youtube')) return <Youtube className="size-4" />;
  return <Globe className="size-4" />;
};

const syncedLabel = (syncedAt?: string | null) =>
  syncedAt ? `Synced ${formatDistanceToNow(new Date(syncedAt), { addSuffix: true })}` : undefined;

export function PlatformFollowersCard({ socialUrls, className, compact = false }: PlatformFollowersCardProps) {
  if (!socialUrls || socialUrls.length === 0) {
    return null;
  }

  const totalFollowers = socialUrls.reduce((sum, social) => sum + (social.followers || 0), 0);

  // Find the most recent sync time
  const lastSynced = socialUrls
    .filter(s => s.synced_at)
    .sort((a, b) => new Date(b.synced_at!).getTime() - new Date(a.synced_at!).getTime())[0]?.synced_at;

  if (compact) {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
        {socialUrls.map((social, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {getPlatformIcon(social.platform)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs capitalize text-muted-foreground">{social.platform}</span>
                {social.verified && <CheckCircle2 className="size-3 shrink-0 text-success" />}
              </div>
              <p className="num truncate text-[0.9375rem]">{formatCompact(social.followers)}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <p className="eyebrow">Platform followers</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {socialUrls.map((social, index) => (
          <Stat
            key={index}
            label={social.platform}
            value={formatCompact(social.followers)}
            note={
              [social.verified ? 'Verified' : null, syncedLabel(social.synced_at)]
                .filter(Boolean)
                .join(' · ') || undefined
            }
            noteTone={social.verified ? 'success' : 'muted'}
          />
        ))}

        <Stat
          tone="feature"
          label="Total reach"
          value={`${formatCompact(totalFollowers)} followers`}
          note={syncedLabel(lastSynced)?.replace('Synced', 'Last synced')}
          className="sm:col-span-2"
        />
      </div>
    </div>
  );
}
