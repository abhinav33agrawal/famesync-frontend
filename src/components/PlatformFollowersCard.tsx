import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Youtube, Globe, CheckCircle2, Users } from 'lucide-react';
import { SocialUrlEntry } from '@/lib/api/types';
import { formatDistanceToNow } from 'date-fns';

interface PlatformFollowersCardProps {
  socialUrls?: SocialUrlEntry[];
  className?: string;
  compact?: boolean;
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
  if (platformLower.includes('tiktok')) return 'from-gray-900 to-gray-700';
  if (platformLower.includes('twitter') || platformLower.includes('x')) return 'from-blue-400 to-blue-600';
  return 'from-primary to-secondary';
};

const formatFollowers = (count: number | null | undefined): string => {
  if (!count) return '—';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toLocaleString();
};

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
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {socialUrls.map((social, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlatformColor(social.platform)} flex items-center justify-center text-white flex-shrink-0`}>
              {getPlatformIcon(social.platform)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground capitalize">{social.platform}</span>
                {social.verified && (
                  <CheckCircle2 className="h-3 w-3 text-blue-500" />
                )}
              </div>
              <p className="text-sm font-bold truncate">
                {formatFollowers(social.followers)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Platform Followers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {socialUrls.map((social, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPlatformColor(social.platform)} flex items-center justify-center text-white`}>
                  {getPlatformIcon(social.platform)}
                </div>
                {social.verified && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground capitalize mb-1">{social.platform}</p>
              <p className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {formatFollowers(social.followers)}
              </p>
              {social.synced_at && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Synced {formatDistanceToNow(new Date(social.synced_at), { addSuffix: true })}
                </p>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Total Followers */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reach</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {formatFollowers(totalFollowers)} followers
              </p>
            </div>
            {lastSynced && (
              <p className="text-xs text-muted-foreground text-right">
                Last synced<br />
                {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
