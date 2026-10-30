import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Search, Target, Users } from 'lucide-react';
import api from '@/lib/api/config';
import { InfluencerProfile } from '@/lib/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreatorCard } from '@/components/CreatorCard';
import { Rise, listItemMotion } from '@/components/motion';
import { formatCompact } from '@/lib/format';
import { ProfileViewModal } from '@/components/ProfileViewModal';

interface DiscoverResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InfluencerProfile[];
}

/* Every creator now renders through CreatorCard — the local gradient ring
   avatar, the blue verified tick and the muted/50 metric tiles are gone. */

export default function Discover() {
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<InfluencerProfile | null>(null);

  // Filters
  const [minFollowers, setMinFollowers] = useState<string>('');
  const [minEngagement, setMinEngagement] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchInfluencers = async (targetPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', targetPage.toString());
      if (minFollowers) params.append('min_followers', minFollowers);
      if (minEngagement) params.append('min_engagement_rate', minEngagement);
      if (location) params.append('location', location);
      if (verifiedOnly) params.append('verified', 'true');

      const response = await api.get<DiscoverResponse>(`/brand/discover/?${params.toString()}`);
      setInfluencers(response.data.results);
      setTotalCount(response.data.count);
      setNextPage(response.data.next);
      setPreviousPage(response.data.previous);
      setPage(targetPage);
    } catch (error) {
      console.error('Failed to fetch influencers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInfluencers(1);
  };

  return (
    <div className="container space-y-8 py-10 md:py-14">
      {/* ------------------------------------------------------ page header */}
      <Rise>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Find creators</p>
            <h1 className="font-display text-display-2">Discover creators.</h1>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">
              Verified micro-creators, filtered by reach, engagement and city.
            </p>
          </div>
          <Button type="submit" form="creator-filters" className="shrink-0">
            <Search />
            Search
          </Button>
        </div>
      </Rise>

      {/* ------------------------------------------------------ filter rail */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <form id="creator-filters" onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="min-followers">Min followers</Label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="min-followers"
                  type="number"
                  placeholder="e.g. 10000"
                  className="pl-11"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-engagement">Min engagement rate (%)</Label>
              <div className="relative">
                <Target className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="min-engagement"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  className="pl-11"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creator-location">Location</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="creator-location"
                  placeholder="City or country"
                  className="pl-11"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <label
              htmlFor="verified"
              className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-[0.9375rem] font-medium"
            >
              <Switch id="verified" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
              Verified only
            </label>
          </form>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------- results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden p-0">
              <div className="h-[150px] bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 rounded-sm bg-muted" />
                <div className="h-3 w-1/2 rounded-sm bg-muted" />
                <div className="h-14 rounded-md bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      ) : influencers.length === 0 ? (
        <Card intent="dashed" className="mx-auto max-w-md p-10 text-center">
          <h3 className="font-display text-display-3">No creators found</h3>
          <p className="mx-auto mt-2 max-w-[32ch] leading-relaxed text-muted-foreground">
            Try widening your filters — a lower follower floor usually helps.
          </p>
        </Card>
      ) : (
        <>
          <p className="eyebrow">
            <span className="num">{formatCompact(totalCount)}</span> creators match
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {influencers.map((profile) => {
                const username = profile.user.username || 'Unknown';
                const isVerified = profile.social_urls?.some(s => s.platform === 'instagram' && s.verified);
                const fullName = `${profile.user.first_name ?? ''} ${profile.user.last_name ?? ''}`.trim();

                return (
                  <motion.div key={profile.id} {...listItemMotion}>
                    <CreatorCard
                      creator={{
                        id: profile.id,
                        name: fullName || username,
                        username,
                        niches: profile.niche ? [profile.niche] : [],
                        city: profile.location,
                        photo: profile.profile_picture,
                        followers: profile.follower_count,
                        engagement: profile.engagement_rate,
                        verified: isVerified,
                      }}
                      onView={() => setSelectedProfile(profile)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* --------------------------------------------------- pagination */}
          <nav className="flex items-center justify-center gap-4 pt-2" aria-label="Pagination">
            <Button
              variant="outline"
              className="h-11 px-4 text-sm"
              disabled={!previousPage}
              onClick={() => fetchInfluencers(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page <span className="num text-foreground">{page}</span>
            </span>
            <Button
              variant="outline"
              className="h-11 px-4 text-sm"
              disabled={!nextPage}
              onClick={() => fetchInfluencers(page + 1)}
            >
              Next
            </Button>
          </nav>
        </>
      )}

      {selectedProfile && (
        <ProfileViewModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          profileType="influencer"
          influencerProfile={selectedProfile}
        />
      )}
    </div>
  );
}
