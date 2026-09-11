import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Edit,
  Save,
  Globe,
  Phone,
  Camera,
  X,
  Instagram,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import { useBrandProfile, useUpdateBrandProfile, useBrandDashboard } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBadge } from '@/components/PremiumBadge';
import { TrustLayer } from '@/components/TrustBadges';
import { Stat } from '@/components/Stat';
import { BrandLogo } from '@/components/Avatar';
import { Rise } from '@/components/motion';
import { formatCompact } from '@/lib/format';
import { toast } from 'sonner';
import { ImageCropper } from '@/components/ui/image-cropper';

/* Removed from the old Profile.tsx: FloatingOrb, the mesh/radial gradient
   background stack, the gradient StatCard tiles, the gradient-text plan
   values, the rotate-on-hover icon squares and every `dark:` variant. */

const FIELD_INPUT = 'disabled:opacity-100 disabled:text-muted-foreground';
const SELECT_INPUT =
  'h-12 rounded-lg border-input bg-card px-4 text-[0.95rem] disabled:opacity-100';

const ProfileSkeleton = () => (
  <div className="container py-10">
    <div className="mb-9 flex items-center gap-4">
      <div className="size-[46px] animate-pulse rounded-md bg-muted" />
      <div className="space-y-2">
        <div className="h-9 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-5 lg:col-span-2">
        <div className="h-52 animate-pulse rounded-xl bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  </div>
);

const platformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('instagram')) return <Instagram className="size-4" />;
  if (p.includes('youtube')) return <Youtube className="size-4" />;
  return <Globe className="size-4" />;
};

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading } = useBrandProfile(user?.role === 'brand');
  const { data: dashboardData } = useBrandDashboard(user?.role === 'brand');
  const { mutate: updateProfile } = useUpdateBrandProfile();
  const { data: subscription } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // Get dynamic stats from dashboard
  const stats = dashboardData?.stats;

  const industries = [
    { value: 'fashion', label: 'Fashion & Apparel', icon: '👗' },
    { value: 'beauty', label: 'Beauty & Cosmetics', icon: '💄' },
    { value: 'tech', label: 'Technology', icon: '💻' },
    { value: 'food', label: 'Food & Beverage', icon: '🍕' },
    { value: 'fitness', label: 'Fitness & Wellness', icon: '💪' },
    { value: 'travel', label: 'Travel & Tourism', icon: '✈️' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '🏠' },
    { value: 'other', label: 'Other', icon: '✨' },
  ];

  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    customIndustry: '',
    website: '',
    description: '',
    phone_number: '',
  });

  useEffect(() => {
    if (profile) {
      const predefinedIndustries = ['fashion', 'beauty', 'tech', 'food', 'fitness', 'travel', 'lifestyle'];
      const isCustomIndustry = profile.industry && !predefinedIndustries.includes(profile.industry);

      setFormData({
        company_name: profile.company_name || '',
        industry: isCustomIndustry ? 'other' : profile.industry || '',
        customIndustry: isCustomIndustry ? profile.industry : '',
        website: profile.website || '',
        description: profile.description || '',
        phone_number: profile.phone_number || '',
      });
      setPreviewUrl(profile.profile_picture || profile.logo || '');
    }
  }, [profile]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const submitData = new FormData();
    const finalIndustry = formData.industry === 'other' ? formData.customIndustry : formData.industry;
    submitData.append('company_name', formData.company_name);
    submitData.append('industry', finalIndustry);
    submitData.append('website', formData.website);
    submitData.append('description', formData.description);
    if (formData.phone_number) {
      submitData.append('phone_number', formData.phone_number);
    }

    if (profilePicture) {
      submitData.append('profile_picture', profilePicture);
    }

    updateProfile(submitData as any, {
      onSuccess: () => {
        setIsEditing(false);
        setProfilePicture(null);
      },
    });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="max-w-md p-8 text-center">
          <h1 className="mb-2 font-display text-display-3">Profile unavailable</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your brand profile. Please refresh and try again.
          </p>
        </Card>
      </div>
    );
  }

  // Uploaded pictures come back as a server-relative path; blob: previews and
  // Instagram URLs are already absolute.
  const logoSrc = (() => {
    if (!previewUrl) return undefined;
    if (previewUrl.startsWith('http') || previewUrl.startsWith('blob:')) return previewUrl;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') ?? ''}${previewUrl}`;
  })();

  const industryLabel = profile?.industry || formData.customIndustry;
  const planLabel = user?.subscription_plan
    ? user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)
    : 'Free';

  return (
    <div className="container py-10 sm:py-12">
      {/* ------------------------------------------------------ page header */}
      <Rise>
        <header className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <BrandLogo
              src={logoSrc}
              name={formData.company_name || user?.username}
              className="size-[72px] rounded-xl text-2xl"
            />
            <input
              ref={fileInputRef}
              id="brand_logo"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change brand logo"
                className="absolute -bottom-2 -right-2 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-e1 transition-colors hover:bg-muted"
              >
                <Camera className="size-4" />
              </button>
            )}
          </div>

          <div className="min-w-0">
            <p className="eyebrow mb-2">Brand profile</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-[2rem] leading-none sm:text-[2.375rem]">
                {formData.company_name || 'Brand name'}
              </h1>
              {user?.subscription_plan && <PremiumBadge plan={user.subscription_plan} size="sm" />}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">@{user?.username}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {industryLabel && (
                <Badge className="capitalize">{industryLabel.toLowerCase()}</Badge>
              )}
              <TrustLayer
                emailVerified={user?.is_approved}
                isNewMember={user?.is_new_member}
                profileCompletion={profile?.profile_completion}
                size="sm"
              />
            </div>
          </div>
        </header>
      </Rise>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ------------------------------------------------- left: overview */}
        <div className="space-y-5">
          <Rise>
            <Stat label="Total applications" value={formatCompact(stats?.total_applications || 0)} />
          </Rise>

          <Rise delay={0.06}>
            <Stat
              label="Credits available"
              value={user?.credits ?? 0}
              tone="feature"
              note={
                subscription
                  ? `Resets in ${Math.ceil(
                      (new Date(subscription.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                    )} days`
                  : undefined
              }
            />
          </Rise>

          <Rise delay={0.12}>
            <Card>
              <CardHeader>
                <span className="eyebrow">Plan</span>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Current plan</p>
                    {user?.subscription_plan && (
                      <PremiumBadge plan={user.subscription_plan} size="sm" />
                    )}
                  </div>
                  <p className="num text-[1.375rem] leading-none">{planLabel}</p>
                </div>
                <Button variant="form" className="w-full" asChild>
                  <Link to="/subscription">Manage subscription</Link>
                </Button>
              </CardContent>
            </Card>
          </Rise>
        </div>

        {/* --------------------------------------- right: socials + details */}
        <div className="space-y-5 lg:col-span-2">
          <Rise>
            <Card>
              <CardHeader>
                <span className="eyebrow">Presence</span>
                <CardTitle>Social platforms</CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.social_urls && profile.social_urls.length > 0 ? (
                  <ul className="grid gap-2.5">
                    {profile.social_urls.map((social: any, index: number) => (
                      <li key={index}>
                        <a
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-[44px] items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted"
                        >
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            {platformIcon(social.platform)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold capitalize">
                              {social.platform}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {social.link}
                            </span>
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No social media links added yet. You can add them during signup.
                  </p>
                )}
              </CardContent>
            </Card>
          </Rise>

          <Rise delay={0.06}>
            <Card>
              <CardHeader>
                <span className="eyebrow">Details</span>
                <CardTitle>Brand information</CardTitle>
                <CardDescription>Your public brand profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input
                      id="full_name"
                      value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
                      disabled
                      className={FIELD_INPUT}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled className={FIELD_INPUT} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      WhatsApp number (optional)
                    </Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
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
                          handleInputChange('phone_number', formatted);
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="+91 XXXXXXXXXX"
                      className={FIELD_INPUT}
                    />
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">
                        Enter 10-digit mobile number (e.g., 9876543210)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      disabled={!isEditing}
                      className={FIELD_INPUT}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      className={FIELD_INPUT}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange('industry', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="industry" className={SELECT_INPUT}>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            <span className="flex items-center gap-2">
                              <span>{ind.icon}</span>
                              <span>{ind.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customIndustry">Specify your industry</Label>
                    <Input
                      id="customIndustry"
                      value={formData.customIndustry}
                      onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your industry"
                      className={FIELD_INPUT}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About your brand</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className={FIELD_INPUT}
                  />
                </div>

                {/* Edit Profile Buttons */}
                <div className="flex flex-col gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
                  {!isEditing ? (
                    <Button variant="form" onClick={() => setIsEditing(true)}>
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
          </Rise>
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

export default Profile;
