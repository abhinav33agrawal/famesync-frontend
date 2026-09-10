import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api/config';
import { InfluencerProfile } from '@/lib/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, MapPin, Target, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { ProfileViewModal } from '@/components/ProfileViewModal';

interface DiscoverResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InfluencerProfile[];
}

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

      const response = await api.get<DiscoverResponse>(`/profiles/brand/discover/?${params.toString()}`);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Discover Creators</h1>
        <p className="text-muted-foreground">Find the perfect influencers for your next campaign.</p>
      </div>

      <Card className="glass overflow-hidden border-border/50">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Min Followers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  className="pl-9"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Min Engagement Rate (%)</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  className="pl-9"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City or Country"
                  className="pl-9"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 flex items-center gap-2 pb-2">
              <Switch
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
              />
              <Label htmlFor="verified" className="cursor-pointer">Verified Only</Label>
            </div>

            <Button type="submit" className="gradient-instagram text-white shadow-lg shadow-pink-500/25">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-64 p-6" />
            </Card>
          ))}
        </div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No creators found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">Found {totalCount} creators</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {influencers.map((profile) => {
              const username = profile.user.username || 'Unknown';
              const isVerified = profile.social_urls?.some(s => s.platform === 'instagram' && s.verified);
              
              return (
                <Card key={profile.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="p-6 pb-4 flex-1 flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full gradient-instagram p-1">
                          <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-2xl font-bold border-2 border-background">
                            {username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        {isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg line-clamp-1">@{username}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{profile.niche || 'Creator'}</p>
                      
                      <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                        <div className="bg-muted/50 rounded-lg p-2 flex flex-col">
                          <span className="text-xs text-muted-foreground">Followers</span>
                          <span className="font-semibold">{profile.follower_count?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 flex flex-col">
                          <span className="text-xs text-muted-foreground">Engagement</span>
                          <span className="font-semibold">
                            {profile.engagement_rate ? `${profile.engagement_rate.toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => setSelectedProfile(profile)}
                      >
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 pt-6 pb-12">
            <Button
              variant="outline"
              disabled={!previousPage}
              onClick={() => fetchInfluencers(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">Page {page}</span>
            <Button
              variant="outline"
              disabled={!nextPage}
              onClick={() => fetchInfluencers(page + 1)}
            >
              Next
            </Button>
          </div>
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
