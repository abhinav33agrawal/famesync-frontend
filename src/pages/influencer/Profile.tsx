import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import {
  Instagram,
  Edit,
  Save,
  CreditCard,
  TrendingUp,
  Camera,
  User,
  Sparkles,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useInfluencerProfile, useUpdateInfluencerProfile, useInfluencerDashboard } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBadge } from '@/components/PremiumBadge';
import { TrustLayer } from '@/components/TrustBadges';
import LinkGoogleAccountButton from '@/components/auth/LinkGoogleAccountButton';
import { Link, useSearchParams } from 'react-router-dom';
import { ImageCropper } from '@/components/ui/image-cropper';
import { formatDistanceToNow } from 'date-fns';
import { getPreferredAccountEmail, hasUsableAccountEmail } from '@/lib/accountEmail';
import {
  buildInstagramInsightCards,
  clearInstagramServiceToken,
  fetchInstagramServiceUser,
  formatInstagramPostDate,
  formatInstagramSyncTimestamp,
  getInstagramServiceLoginUrl,
  getInstagramServiceToken,
  isInstagramServiceConfigured,
  setInstagramServiceToken,
  syncInstagramServiceUser,
  toInstagramDisplayCount,
  type InstagramServiceUser,
} from '@/lib/instagramService';

const formatFollowers = (count: number | null | undefined): string => {
  if (!count) return '—';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toLocaleString();
};

const getInstagramErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = `${(error as { message?: string }).message || ''}`.trim();
    if (message) return message;
  }
  return fallback;
};

const getInstagramErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: number }).status);
    if (Number.isFinite(status)) return status;
  }
  return 0;
};

const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.3, 0.2],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string | number; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ProfileSkeleton = () => (
  <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
    <FloatingOrb className="w-96 h-96 bg-primary -top-48 -left-48" delay={0} />
    <FloatingOrb className="w-80 h-80 bg-secondary top-1/3 -right-40" delay={2} />
    <FloatingOrb className="w-64 h-64 bg-accent bottom-20 left-1/4" delay={4} />

    <div className="relative z-10 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full bg-muted/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-5 w-64 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-card/50 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>

        <div className="h-96 bg-card/50 rounded-2xl animate-pulse" />
      </div>
    </div>
  </div>
);

const InfluencerProfile = () => {
  const { user, authSource } = useAuth();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const isInstagramOnlyMode = authSource === 'instagram';
  const shouldLoadFameeProfileData = user?.role === 'influencer' && !isInstagramOnlyMode;
  const { data: profile, isLoading } = useInfluencerProfile(shouldLoadFameeProfileData);
  const { data: dashboardData } = useInfluencerDashboard(shouldLoadFameeProfileData);
  const { data: subscription } = useSubscription(shouldLoadFameeProfileData);
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
  const [instagramServiceUser, setInstagramServiceUser] = useState<InstagramServiceUser | null>(null);
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramSyncing, setInstagramSyncing] = useState(false);
  const [instagramError, setInstagramError] = useState('');
  const instagramServiceReady = isInstagramServiceConfigured();

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

      const token = getInstagramServiceToken();
      if (!token) {
        if (isMounted) {
          setInstagramServiceUser(null);
          setInstagramError('');
        }
        return;
      }

      if (isMounted) {
        setInstagramLoading(true);
        setInstagramError('');
      }

      try {
        const { user: connectedUser } = await fetchInstagramServiceUser(token);
        if (!isMounted) return;
        setInstagramServiceUser(connectedUser);
      } catch (error) {
        if (!isMounted) return;
        const status = getInstagramErrorStatus(error);
        if (status === 401) {
          clearInstagramServiceToken();
          setInstagramServiceUser(null);
          setInstagramError('Instagram session expired. Please reconnect Instagram.');
          return;
        }
        setInstagramError(getInstagramErrorMessage(error, 'Unable to load Instagram profile.'));
      } finally {
        if (isMounted) {
          setInstagramLoading(false);
        }
      }
    };

    loadInstagramProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  const handleConnectInstagram = () => {
    const currentServiceToken = getInstagramServiceToken();
    const nextInstagramLoginUrl = getInstagramServiceLoginUrl({
      linkToken: currentServiceToken,
    });

    if (!instagramServiceReady || !nextInstagramLoginUrl) {
      toast.error('Instagram service is not configured yet.');
      return;
    }
    window.location.href = nextInstagramLoginUrl;
  };

  const handleInstagramSync = async () => {
    const token = getInstagramServiceToken();
    if (!token) {
      toast.error('Connect Instagram first to sync account details.');
      return;
    }

    setInstagramSyncing(true);
    setInstagramError('');

    try {
      const synced = await syncInstagramServiceUser(token);
      if (synced.token) {
        setInstagramServiceToken(synced.token);
      }
      setInstagramServiceUser(synced.user);
      toast.success('Instagram profile and insights synced.');
    } catch (error) {
      const status = getInstagramErrorStatus(error);
      if (status === 401) {
        clearInstagramServiceToken();
        setInstagramServiceUser(null);
        setInstagramError('Instagram session expired. Please reconnect Instagram.');
        toast.error('Instagram session expired. Please reconnect.');
      } else {
        const message = getInstagramErrorMessage(error, 'Failed to sync Instagram profile.');
        setInstagramError(message);
        toast.error(message);
      }
    } finally {
      setInstagramSyncing(false);
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

  const instagramAccount = instagramServiceUser?.instagram || null;
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
  const displayEmail = getPreferredAccountEmail(user?.email, instagramServiceUser?.email);
  const hasStableEmail = hasUsableAccountEmail(displayEmail);
  const accountRole: 'influencer' | 'brand' = user?.role === 'brand' ? 'brand' : 'influencer';
  const shouldShowGoogleLink = isInstagramOnlyMode || !hasStableEmail;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Floating Orbs */}
      <FloatingOrb className="w-96 h-96 bg-primary -top-48 -left-48" delay={0} />
      <FloatingOrb className="w-80 h-80 bg-secondary top-1/3 -right-40" delay={2} />
      <FloatingOrb className="w-64 h-64 bg-accent bottom-20 left-1/4" delay={4} />

      {/* Mesh Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <Avatar className="h-24 w-24 border-4 border-background relative">
                      <AvatarImage src={previewUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                        {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  {isEditing && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 shadow-lg"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.first_name || user?.username || 'My Profile'}
                    </h1>
                    {user?.subscription_plan && (
                      <PremiumBadge plan={user.subscription_plan} />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    @{displayUsername}
                  </p>
                  {/* Category Badge and Trust Layer */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {profile?.category && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary text-sm font-medium capitalize">
                          {profile.category.charAt(0).toUpperCase() + profile.category.slice(1).toLowerCase()}
                        </span>
                      </motion.div>
                    )}
                    <TrustLayer
                      emailVerified={user?.email_verified}
                      isNewMember={user?.is_new_member}
                      profileCompletion={profile?.profile_completion}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid - Removed from top, keeping for reference */}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats Cards & Subscription */}
            <div className="space-y-6">
              {/* Accepted Campaigns Card (moved up) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accepted Campaigns</p>
                        <p className="text-2xl font-bold">{stats?.accepted_applications || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Credits Available Card (moved down) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CreditCard className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground">Credits Available</p>
                        <p className="text-2xl font-bold">{user?.credits || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subscription Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-muted-foreground">Current Plan</p>
                        {user?.subscription_plan && (
                          <PremiumBadge plan={user.subscription_plan} size="sm" />
                        )}
                      </div>
                      <p className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {user?.subscription_plan ? user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1) : 'Free'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Credits</p>
                      </div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {user?.credits || 0}
                      </p>
                      {subscription && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Resets in {Math.ceil((new Date(subscription.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      )}
                    </div>
                    <Link to="/subscription">
                      <Button variant="outline" className="w-full mt-2">
                        Manage Subscription
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Profile Information */}
            <div className="lg:col-span-2 space-y-6">

              {profile?.social_urls && profile.social_urls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Social Media Platforms
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {profile.social_urls.map((social, index) => {
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

                          return (
                            <motion.a
                              key={index}
                              href={social.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="group relative flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all"
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPlatformColor(social.platform)} flex items-center justify-center text-white flex-shrink-0`}>
                                {getPlatformIcon(social.platform)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium capitalize">{social.platform}</p>
                                  {social.verified && (
                                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{social.link}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1">
                                  {/* <div className="w-1 h-3 rounded-full bg-gradient-to-t from-primary to-primary/60" /> */}
                                  <p className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {formatFollowers(social.followers)}
                                  </p>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Followers</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </motion.a>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Instagram className="h-5 w-5 text-primary" />
                          Instagram Insights
                        </CardTitle>
                        <CardDescription>
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
                          <RefreshCw className={`h-4 w-4 mr-2 ${instagramSyncing ? 'animate-spin' : ''}`} />
                          {instagramSyncing ? 'Syncing...' : 'Sync'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {!instagramServiceReady && (
                      <div className="p-3 rounded-xl border border-border/60 bg-background/40 text-sm text-muted-foreground">
                        Instagram service URL is not configured yet. Set <code>VITE_INSTAGRAM_SERVICE_URL</code> to enable connect and sync.
                      </div>
                    )}

                    {!instagramAccount && (
                      <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5">
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect Instagram to show followers, insights, and recent posts on your profile.
                        </p>
                        <Button
                          type="button"
                          onClick={handleConnectInstagram}
                          disabled={!instagramServiceReady}
                          className="gradient-instagram text-white"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Continue with Instagram
                        </Button>
                      </div>
                    )}

                    {instagramLoading && !instagramAccount && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
                        ))}
                      </div>
                    )}

                    {instagramError && (
                      <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                        {instagramError}
                      </div>
                    )}

                    {instagramAccount && (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-background/40">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-border/60">
                              <AvatarImage src={instagramServiceUser?.picture || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                                {(instagramAccount.username || user?.username || 'IG').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                @{instagramAccount.username || 'instagram'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {instagramAccount.accountType || 'Professional account'}
                              </p>
                              {instagramSyncLabel && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last synced {instagramSyncLabel}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleInstagramSync}
                            disabled={instagramSyncing}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${instagramSyncing ? 'animate-spin' : ''}`} />
                            {instagramSyncing ? 'Syncing...' : 'Refresh Data'}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-4 rounded-xl border border-border/60 bg-background/40">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Followers</p>
                            <p className="text-2xl font-bold mt-1">{toInstagramDisplayCount(instagramAccount.followersCount)}</p>
                          </div>
                          <div className="p-4 rounded-xl border border-border/60 bg-background/40">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Following</p>
                            <p className="text-2xl font-bold mt-1">{toInstagramDisplayCount(instagramAccount.followingCount)}</p>
                          </div>
                          <div className="p-4 rounded-xl border border-border/60 bg-background/40">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Posts</p>
                            <p className="text-2xl font-bold mt-1">{toInstagramDisplayCount(instagramAccount.postsCount)}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-3">Insights</p>
                          {instagramInsightCards.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {instagramInsightCards.map((metric) => (
                                <div
                                  key={metric.key}
                                  className="p-3 rounded-xl border border-border/60 bg-background/40"
                                >
                                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                                  <p className="text-xl font-bold mt-1">{toInstagramDisplayCount(metric.value)}</p>
                                  <p className="text-[11px] text-muted-foreground mt-1">{metric.hint}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No insight metrics available yet. Sync after connecting a Creator/Business account.
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-3">Recent Posts</p>
                          {instagramRecentPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {instagramRecentPosts.map((post) => (
                                <article
                                  key={post.id}
                                  className="rounded-xl border border-border/60 bg-background/40 overflow-hidden"
                                >
                                  <div className="aspect-square bg-muted/30 relative overflow-hidden">
                                    {post.thumbnailUrl || post.mediaUrl ? (
                                      <img
                                        src={post.thumbnailUrl || post.mediaUrl}
                                        alt={post.caption || 'Instagram post'}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                        {post.mediaType || 'POST'}
                                      </div>
                                    )}
                                    <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-white text-[10px]">
                                      {post.mediaProductType || post.mediaType || 'POST'}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    <p className="text-sm leading-relaxed max-h-16 overflow-hidden">
                                      {post.caption || 'No caption available for this post.'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{formatInstagramPostDate(post.timestamp) || 'Recently synced'}</span>
                                      {post.permalink ? (
                                        <a
                                          href={post.permalink}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                        >
                                          Open
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      ) : (
                                        <span>Private preview</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <Heart className="h-3 w-3" />
                                        {toInstagramDisplayCount(post.likeCount)}
                                      </span>
                                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <MessageCircle className="h-3 w-3" />
                                        {toInstagramDisplayCount(post.commentsCount)}
                                      </span>
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No recent posts synced yet. Use the sync button after connecting Instagram.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {isInstagramOnlyMode && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48 }}
                >
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        You are in Instagram-only mode. Instagram insights are connected, but FameSync profile and campaign features still require account sign in.
                      </p>
                      <div className="mt-3">
                        <Link to="/auth?mode=login">
                          <Button variant="outline" size="sm">Sign In to FameSync</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Profile Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Your public influencer profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={fullName}
                          disabled
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={displayEmail || ''}
                          disabled
                          className="bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground">
                          {hasStableEmail
                            ? 'Primary linked email'
                            : 'Temporary Instagram email detected. Link Google to use your Gmail here.'}
                        </p>
                        {shouldShowGoogleLink && (
                          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                            <p className="text-xs text-muted-foreground mb-2">
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
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            WhatsApp Number (Optional)
                          </div>
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
                          className="bg-background/50"
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
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border">
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
                          <Label htmlFor="customCategory">Specify Your Category</Label>
                          <Input
                            id="customCategory"
                            value={profileData.customCategory}
                            onChange={(e) => setProfileData({ ...profileData, customCategory: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your category"
                            className="bg-background/50"
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
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
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
                        className="bg-background/50"
                      />
                    </div>

                    {/* Edit Profile Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                      {isInstagramOnlyMode && (
                        <p className="text-xs text-muted-foreground mr-auto">
                          Sign in to edit FameSync profile fields.
                        </p>
                      )}
                      {!isEditing ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={() => setIsEditing(true)}
                            disabled={!user || isInstagramOnlyMode}
                            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </motion.div>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white">
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </motion.div>
                        </>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
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
