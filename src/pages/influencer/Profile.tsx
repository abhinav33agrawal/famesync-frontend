import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import {
  Instagram,
  Edit,
  Save,
  CreditCard,
  Camera,
  User,
  Crown,
  X,
  CheckCircle2,
  Globe,
  Youtube,
  ArrowRight,
  Users,
  Phone,
  RefreshCw,
  ExternalLink,
  Heart,
  MessageCircle,
  Unlink,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useInfluencerProfile, useUpdateInfluencerProfile, useInfluencerDashboard } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBadge } from '@/components/PremiumBadge';
import { TrustLayer } from '@/components/TrustBadges';
import LinkGoogleAccountButton from '@/components/auth/LinkGoogleAccountButton';
import { Link, useSearchParams } from 'react-router-dom';
import { ImageCropper } from '@/components/ui/image-cropper';
import { Rise } from '@/components/motion';
import { Stat } from '@/components/Stat';
import { Avatar } from '@/components/Avatar';
import { formatCompact } from '@/lib/format';
import { hasUsableAccountEmail } from '@/lib/accountEmail';
import {
  buildInstagramInsightCards,
  disconnectInstagram,
  fetchInstagramStatus,
  formatInstagramPostDate,
  formatInstagramSyncTimestamp,
  getInstagramErrorMessage,
  getInstagramErrorStatus,
  startInstagramAuth,
  syncInstagram,
  toInstagramDisplayCount,
  type InstagramAccountData,
} from '@/lib/instagram';
import { INSTAGRAM_LOGIN_ENABLED } from '@/lib/features';

/* Removed from the old page: FloatingOrb (looping animation), the unused
   gradient StatCard, the mesh/radial page backgrounds, every gradient
   fill and blur-glow, the local formatFollowers() (now `formatCompact`)
   and the backdrop-blur card surfaces. */

const ProfileSkeleton = () => (
  <div className="container py-10 sm:py-12">
    <div className="flex items-center gap-5">
      <div className="size-[88px] animate-pulse rounded-full bg-muted" />
      <div className="space-y-2.5">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>
    </div>

    <div className="mt-10 grid gap-5 lg:grid-cols-3">
      <div className="space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-[26rem] animate-pulse rounded-xl bg-muted lg:col-span-2" />
    </div>
  </div>
);

const InfluencerProfile = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const isInfluencer = user?.role === 'influencer';
  const { data: profile, isLoading } = useInfluencerProfile(isInfluencer);
  const { data: dashboardData } = useInfluencerDashboard(isInfluencer);
  const { data: subscription } = useSubscription(isInfluencer);
  const updateProfile = useUpdateInfluencerProfile();

  // Get dynamic stats from dashboard
  const stats = dashboardData?.stats;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    instagram_handle: '',
    category: '',
    customCategory: '',
    niche: '',
    location: '',
    follower_count: '',
    bio: '',
    phone_number: '',
  });
  const [instagramAccountData, setInstagramAccountData] = useState<InstagramAccountData | null>(null);
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramSyncing, setInstagramSyncing] = useState(false);
  const [instagramDisconnecting, setInstagramDisconnecting] = useState(false);
  const queryClient = useQueryClient();
  const [instagramError, setInstagramError] = useState('');
  const [instagramConfigured, setInstagramServiceReady] = useState(true);

  useEffect(() => {
    if (profile) {
      const predefinedCategories = ['fashion', 'beauty', 'fitness', 'tech', 'food', 'travel', 'lifestyle', 'gaming'];
      const isCustomCategory = profile.category && !predefinedCategories.includes(profile.category);

      setProfileData({
        instagram_handle: profile.instagram_handle || '',
        category: isCustomCategory ? 'other' : profile.category || '',
        customCategory: isCustomCategory ? profile.category : '',
        niche: profile.niche || '',
        location: profile.location || '',
        follower_count: profile.follower_count?.toString() || '',
        bio: profile.bio || '',
        phone_number: profile.phone_number || '',
      });

      setPreviewUrl(profile.profile_picture || '');
    }
  }, [profile]);

  useEffect(() => {
    const status = `${searchParams.get('instagram') || ''}`.trim().toLowerCase();
    if (status === 'connected') {
      toast.success('Instagram connected. Sync to fetch latest account insights.');
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadInstagramProfile = async () => {
      if (user && user.role !== 'influencer') return;

      setInstagramLoading(true);
      setInstagramError('');

      try {
        const status = await fetchInstagramStatus();
        if (!isMounted) return;
        setInstagramServiceReady(status.configured);
        setInstagramAccountData(status.instagram);
      } catch (error) {
        if (!isMounted) return;
        // 401 means the FameSync session lapsed, which the API client is
        // already handling -- don't shout about Instagram for that.
        if (getInstagramErrorStatus(error) === 401) return;
        setInstagramError(getInstagramErrorMessage(error, 'Unable to load Instagram profile.'));
      } finally {
        if (isMounted) setInstagramLoading(false);
      }
    };

    loadInstagramProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  const handleConnectInstagram = async () => {
    try {
      // Redirects the browser; nothing after this runs on success.
      await startInstagramAuth('influencer');
    } catch (error) {
      toast.error(getInstagramErrorMessage(error, 'Instagram login is not available right now.'));
    }
  };

  const handleInstagramSync = async () => {
    setInstagramSyncing(true);
    setInstagramError('');

    try {
      setInstagramAccountData(await syncInstagram());
      toast.success('Instagram profile and insights synced.');
    } catch (error) {
      const message = getInstagramErrorMessage(error, 'Failed to sync Instagram profile.');
      setInstagramError(message);
      toast.error(message);
    } finally {
      setInstagramSyncing(false);
    }
  };

  const handleInstagramDisconnect = async () => {
    if (
      !confirm(
        'Disconnect Instagram? Your insights, recent posts and verified badge will be removed from your FameSync profile. You can reconnect at any time.',
      )
    ) {
      return;
    }
    setInstagramDisconnecting(true);
    setInstagramError('');

    try {
      await disconnectInstagram();
      setInstagramAccountData(null);
      // The profile row held a copy of the Instagram data; refetch so the
      // verified badge and follower count go too.
      await queryClient.invalidateQueries({ queryKey: ['profile', 'influencer'] });
      toast.success('Instagram disconnected and its data removed from your profile.');
    } catch (error) {
      const message = getInstagramErrorMessage(error, 'Failed to disconnect Instagram.');
      setInstagramError(message);
      toast.error(message);
    } finally {
      setInstagramDisconnecting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result?.toString() || '');
        setCropperOpen(true);
      });
      reader.readAsDataURL(file);

      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "profile_picture.jpg", { type: "image/jpeg" });
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCropperOpen(false);
  };

  const handleSave = () => {
    const submitData = new FormData();
    submitData.append('instagram_handle', profileData.instagram_handle);
    const finalCategory = profileData.category === 'other' ? profileData.customCategory : profileData.category;
    submitData.append('category', finalCategory);
    submitData.append('niche', profileData.niche);
    submitData.append('location', profileData.location);
    submitData.append('bio', profileData.bio);
    if (profileData.phone_number) {
      submitData.append('phone_number', profileData.phone_number);
    }
    if (profilePicture) {
      submitData.append('profile_picture', profilePicture);
    }

    updateProfile.mutate(submitData as any);
    setIsEditing(false);
    setProfilePicture(null);
  };

  const instagramAccount = instagramAccountData;
  const instagramInsightCards = instagramAccount
    ? buildInstagramInsightCards(instagramAccount)
    : [];
  const instagramRecentPosts = instagramAccount?.recentPosts || [];
  const instagramSyncLabel = formatInstagramSyncTimestamp(
    instagramAccount?.lastSyncedAt || null
  );
  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : '';
  const displayUsername = user?.username || instagramAccount?.username || 'instagram-user';
  const displayEmail = `${user?.email || ''}`.trim();
  const hasStableEmail = hasUsableAccountEmail(displayEmail);
  const accountRole: 'influencer' | 'brand' = user?.role === 'brand' ? 'brand' : 'influencer';
  const shouldShowGoogleLink = !hasStableEmail;

  const headline =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.username || 'My Profile';

  const renewalDays = subscription
    ? Math.ceil((new Date(subscription.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container py-10 sm:py-12">
      {/* --------------------------------------------------- page header */}
      <Rise>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar src={previewUrl} name={headline} size={88} className="ring-2 ring-border" />
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Change profile picture"
                className="absolute -bottom-1.5 -right-1.5 rounded-full shadow-e1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera />
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="min-w-0">
            <span className="eyebrow">Creator profile</span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-display-2">{headline}</h1>
              {user?.subscription_plan && <PremiumBadge plan={user.subscription_plan} />}
            </div>
            <p className="mt-2 text-muted-foreground">@{displayUsername}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {profile?.category && (
                <Badge className="capitalize">
                  {profile.category.charAt(0).toUpperCase() + profile.category.slice(1).toLowerCase()}
                </Badge>
              )}
              <TrustLayer
                emailVerified={user?.email_verified}
                isNewMember={user?.is_new_member}
                profileCompletion={profile?.profile_completion}
                size="sm"
              />
            </div>
          </div>
        </header>
      </Rise>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ------------------------------------ left: numbers + plan */}
        <div className="space-y-5">
          <Rise>
            <Stat
              label="Accepted campaigns"
              value={stats?.accepted_applications || 0}
              note="Briefs you've been picked for"
            />
          </Rise>

          <Rise delay={0.06}>
            <Stat
              label="Credits available"
              value={user?.credits || 0}
              tone="feature"
              note={
                renewalDays !== null
                  ? `Resets in ${renewalDays} days`
                  : 'One credit per application'
              }
            />
          </Rise>

          <Rise delay={0.12}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="size-[1.125rem] text-primary" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="eyebrow">Current plan</p>
                    {user?.subscription_plan && (
                      <PremiumBadge plan={user.subscription_plan} size="sm" />
                    )}
                  </div>
                  <p className="num text-[1.375rem] capitalize leading-none">
                    {user?.subscription_plan
                      ? user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)
                      : 'Free'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="size-4 shrink-0" />
                  <span>
                    {user?.credits || 0} credits
                    {renewalDays !== null ? ` · resets in ${renewalDays} days` : ''}
                  </span>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/subscription">Manage subscription</Link>
                </Button>
              </CardContent>
            </Card>
          </Rise>
        </div>

        {/* ------------------------------- right: platforms + profile */}
        <div className="lg:col-span-2">
          {/* Tabs rather than one long scroll: the Instagram card alone
              is longer than the rest of the page put together, and it
              pushed the editable profile form below the fold. */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-5 h-auto w-full justify-start gap-1 overflow-x-auto p-1">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {INSTAGRAM_LOGIN_ENABLED && (
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
              )}
              <TabsTrigger value="social">Social links</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 space-y-5">
              {/* Profile Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-[1.125rem] text-primary" />
                    Profile information
                  </CardTitle>
                  <CardDescription>Your public creator profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" value={fullName} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={displayEmail || ''} disabled />
                      <p className="text-xs text-muted-foreground">
                        {hasStableEmail
                          ? 'Primary linked email'
                          : 'Temporary Instagram email detected. Link Google to use your Gmail here.'}
                      </p>
                      {shouldShowGoogleLink && (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                            Link your Google account to make Gmail your primary login and contact email.
                          </p>
                          <LinkGoogleAccountButton
                            role={accountRole}
                            label="Continue with Google to Link"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">
                        <span className="flex items-center gap-2">
                          <Phone className="size-4" />
                          WhatsApp number (optional)
                        </span>
                      </Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        value={profileData.phone_number}
                        onChange={(e) => {
                          let value = e.target.value;

                          // Remove +91 prefix if present to get just the digits
                          if (value.startsWith('+91 ')) {
                            value = value.substring(4);
                          } else if (value.startsWith('+91')) {
                            value = value.substring(3);
                          }

                          // Allow only digits
                          const digits = value.replace(/\D/g, '');

                          // Limit to 10 digits
                          if (digits.length <= 10) {
                            // Auto-prefix with +91 if there are digits
                            const formatted = digits ? `+91 ${digits}` : '';
                            setProfileData({ ...profileData, phone_number: formatted });
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="+91 XXXXXXXXXX"
                      />
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">
                          Enter 10-digit mobile number (e.g., 9876543210)
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={profileData.category}
                        onValueChange={(value) => setProfileData({ ...profileData, category: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Category Field - Only show when "other" is selected */}
                    {profileData.category === 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="customCategory">Specify your category</Label>
                        <Input
                          id="customCategory"
                          value={profileData.customCategory}
                          onChange={(e) => setProfileData({ ...profileData, customCategory: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Enter your category"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="niche">Niche</Label>
                      <Input
                        id="niche"
                        value={profileData.niche}
                        onChange={(e) => setProfileData({ ...profileData, niche: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g. New York, USA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>

                  {/* Edit Profile Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
                    {!isEditing ? (
                      <Button
                        variant="form"
                        onClick={() => setIsEditing(true)}
                        disabled={!user}
                      >
                        <Edit />
                        Edit profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X />
                          Cancel
                        </Button>
                        <Button variant="form" onClick={handleSave}>
                          <Save />
                          Save changes
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {INSTAGRAM_LOGIN_ENABLED && (
              <TabsContent value="instagram" className="mt-0 space-y-5">
              <Rise delay={0.06}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="eyebrow">Connected account</span>
                        <CardTitle className="mt-2 flex items-center gap-2">
                          <Instagram className="size-[1.125rem] text-primary" />
                          Instagram insights
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          Sync your Instagram professional account to show audience and performance metrics.
                        </CardDescription>
                      </div>
                      {instagramAccount && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleInstagramSync}
                          disabled={instagramSyncing || instagramLoading}
                          className="shrink-0"
                        >
                          <RefreshCw className={instagramSyncing ? 'animate-spin' : ''} />
                          {instagramSyncing ? 'Syncing...' : 'Sync'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {!instagramConfigured && (
                      <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                        Instagram sign-in isn&apos;t switched on for this environment yet. Connect and
                        sync will light up once it is.
                      </div>
                    )}

                    {!instagramAccount && (
                      <div className="rounded-lg border border-dashed border-muted-foreground/35 p-5">
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          Connect Instagram to show followers, insights, and recent posts on your profile.
                        </p>
                        <Button
                          type="button"
                          variant="form"
                          onClick={handleConnectInstagram}
                          disabled={!instagramConfigured}
                        >
                          <Instagram />
                          Continue with Instagram
                        </Button>
                      </div>
                    )}

                    {instagramLoading && !instagramAccount && (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
                        ))}
                      </div>
                    )}

                    {instagramError && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {instagramError}
                      </div>
                    )}

                    {instagramAccount && (
                      <>
                        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={instagramAccount.picture || ''}
                              name={instagramAccount.username || user?.username || 'IG'}
                              size={48}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold">@{instagramAccount.username || 'instagram'}</p>
                              <p className="text-xs text-muted-foreground">
                                {instagramAccount.accountType || 'Professional account'}
                              </p>
                              {instagramSyncLabel && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Last synced {instagramSyncLabel}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleInstagramSync}
                              disabled={instagramSyncing || instagramDisconnecting}
                            >
                              <RefreshCw className={instagramSyncing ? 'animate-spin' : ''} />
                              {instagramSyncing ? 'Syncing...' : 'Refresh data'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleInstagramDisconnect}
                              disabled={instagramSyncing || instagramDisconnecting}
                              className="text-destructive hover:text-destructive"
                            >
                              <Unlink />
                              {instagramDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Stat
                            className="p-5"
                            label="Followers"
                            value={toInstagramDisplayCount(instagramAccount.followersCount)}
                          />
                          <Stat
                            className="p-5"
                            label="Following"
                            value={toInstagramDisplayCount(instagramAccount.followingCount)}
                          />
                          <Stat
                            className="p-5"
                            label="Posts"
                            value={toInstagramDisplayCount(instagramAccount.postsCount)}
                          />
                        </div>

                        <div>
                          <p className="eyebrow mb-3">Insights</p>
                          {instagramInsightCards.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {instagramInsightCards.map((metric) => (
                                <div key={metric.key} className="rounded-lg bg-muted p-4">
                                  <p className="eyebrow">{metric.label}</p>
                                  <p className="num mt-2 text-[1.375rem] leading-none">
                                    {toInstagramDisplayCount(metric.value)}
                                  </p>
                                  <p className="mt-1.5 text-xs text-muted-foreground">{metric.hint}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              No insight metrics available yet. Sync after connecting a Creator/Business account.
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="eyebrow mb-3">Recent posts</p>
                          {instagramRecentPosts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {instagramRecentPosts.map((post) => (
                                <article
                                  key={post.id}
                                  className="overflow-hidden rounded-lg border border-border"
                                >
                                  <div className="relative aspect-square overflow-hidden bg-muted">
                                    {post.thumbnailUrl || post.mediaUrl ? (
                                      <img
                                        src={post.thumbnailUrl || post.mediaUrl}
                                        alt={post.caption || 'Instagram post'}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                        {post.mediaType || 'POST'}
                                      </div>
                                    )}
                                    <span className="absolute right-2 top-2 rounded-sm bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                                      {post.mediaProductType || post.mediaType || 'POST'}
                                    </span>
                                  </div>
                                  <div className="space-y-2 p-3">
                                    <p className="max-h-16 overflow-hidden text-sm leading-relaxed">
                                      {post.caption || 'No caption available for this post.'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{formatInstagramPostDate(post.timestamp) || 'Recently synced'}</span>
                                      {post.permalink ? (
                                        <a
                                          href={post.permalink}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 font-medium hover:text-primary"
                                        >
                                          Open
                                          <ExternalLink className="size-3" />
                                        </a>
                                      ) : (
                                        <span>Private preview</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <Heart className="size-3" />
                                        {toInstagramDisplayCount(post.likeCount)}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <MessageCircle className="size-3" />
                                        {toInstagramDisplayCount(post.commentsCount)}
                                      </span>
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              No recent posts synced yet. Use the sync button after connecting Instagram.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Rise>
              </TabsContent>
            )}

            <TabsContent value="social" className="mt-0 space-y-5">
              {profile?.social_urls && profile.social_urls.length > 0 && (
                <Rise>
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="size-[1.125rem] text-primary" />
                        Social platforms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        {profile.social_urls.map((social: any, index) => {
                          /* Entries are not guaranteed to be {platform, link}
                             objects -- apply_to_profile() in the backend guards
                             the same array with isinstance(s, dict) because older
                             rows can hold bare URL strings. Reading .platform off
                             one of those yields undefined, and .toLowerCase() on
                             undefined throws hard enough to blank the page. */
                          const entry =
                            social && typeof social === 'object' ? social : { link: social };
                          const platform = `${entry.platform || ''}`.trim();
                          const link = `${entry.link || ''}`.trim();

                          const getPlatformIcon = () => {
                            const haystack = `${platform} ${link}`.toLowerCase();
                            if (haystack.includes('instagram')) return <Instagram className="size-4" />;
                            if (haystack.includes('youtube')) return <Youtube className="size-4" />;
                            return <Globe className="size-4" />;
                          };

                          return (
                            <a
                              key={index}
                              href={link || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted"
                            >
                              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                {getPlatformIcon()}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="mb-0.5 flex items-center gap-1.5">
                                  <p className="text-sm font-semibold capitalize">
                                    {platform || 'Profile'}
                                  </p>
                                  {entry.verified && <CheckCircle2 className="size-3.5 text-success" />}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">{link}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="num text-[1.0625rem] leading-none">
                                  {formatCompact(entry.followers)}
                                </p>
                                <p className="eyebrow mt-1 text-[10px]">Followers</p>
                              </div>
                              <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Rise>
              )}
              {(!profile?.social_urls || profile.social_urls.length === 0) && (
                <Card>
                  <CardContent className="py-14 text-center">
                    <p className="text-sm font-medium">No social links yet</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Add them from Profile, or connect Instagram to have yours
                      filled in and verified automatically.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ImageCropper
        imageSrc={tempImageSrc}
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        onCropComplete={handleCropComplete}
        aspect={1}
      />
    </div>
  );
};

export default InfluencerProfile;
