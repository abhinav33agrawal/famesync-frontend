import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, X, Instagram, Youtube, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCategories } from '@/hooks/useCategories';
import { CreatorCard } from '@/components/CreatorCard';
import { AvatarPicker, OnboardingShell, SetupSection } from '@/components/onboarding/OnboardingShell';

/* Laid out by OnboardingShell (ink panel with a live CreatorCard preview and
   checklist, form on the right in three numbered sections). Field names,
   validation and the setup payload are unchanged. */

// URL Validation Functions
const validateInstagramUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Empty is allowed (optional field)
  const instagramPatterns = [
    /^https?:\/\/(www\.)?instagram\.com\/.+$/i,
    /^instagram\.com\/.+$/i,
    /^www\.instagram\.com\/.+$/i
  ];
  return instagramPatterns.some(pattern => pattern.test(url.trim()));
};

const validateYoutubeUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Empty is allowed (optional field)
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/|@).+$/i,
    /^https?:\/\/youtube\.com\/(c\/|channel\/|user\/|@).+$/i,
    /^youtube\.com\/(c\/|channel\/|user\/|@).+$/i,
    /^(www\.)?youtube\.com\/(c\/|channel\/|user\/|@).+$/i,
    /^https?:\/\/youtu\.be\/.+$/i
  ];
  return youtubePatterns.some(pattern => pattern.test(url.trim()));
};

// Loading skeleton
const SetupSkeleton = () => (
  <div className="space-y-6">
    <div className="mb-8 flex items-center gap-4">
      <Skeleton className="size-16 rounded-xl" />
      <div>
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <Skeleton className="h-1.5 w-full rounded-full" />
    <Card>
      <CardContent className="space-y-6 pt-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  </div>
);

const InfluencerSetup = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    instagramUrl: '',
    youtubeUrl: '',
    category: '',
    customCategory: '',
    niche: '',
    location: '',
    audienceInfo: '',
  });
  const [additionalUrls, setAdditionalUrls] = useState<{ platform: string; url: string }[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [socialUrlError, setSocialUrlError] = useState<string>('');
  const [instagramUrlError, setInstagramUrlError] = useState<string>('');
  const [youtubeUrlError, setYoutubeUrlError] = useState<string>('');

  const { categories: dynamicCategories, isLoading: categoriesLoading } = useCategories();

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const setupMutation = useMutation({
    mutationFn: (data: any) => profilesApi.influencer.setup(data),
    onSuccess: async () => {
      toast.success('Profile created successfully!');
      // Refresh user to update has_profile flag before navigating
      await refreshUser();
      navigate('/influencer/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create profile');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result?.toString() || '');
        setCropperOpen(true);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);

      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const timestamp = Date.now();
    const file = new File([croppedBlob], `profile_picture_${timestamp}.jpg`, {
      type: croppedBlob.type || "image/jpeg"
    });
    setProfilePicture(file);
    // Revoke old URL before creating new one
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setCropperOpen(false);
  };

  // Reusable handler for social URL changes with error clearing and validation
  const handleSocialUrlChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (socialUrlError) setSocialUrlError('');

    // Real-time validation for Instagram
    if (field === 'instagramUrl') {
      if (value.trim() && !validateInstagramUrl(value)) {
        setInstagramUrlError('Invalid Instagram URL. Must be a valid Instagram profile link.');
      } else {
        setInstagramUrlError('');
      }
    }

    // Real-time validation for YouTube
    if (field === 'youtubeUrl') {
      if (value.trim() && !validateYoutubeUrl(value)) {
        setYoutubeUrlError('Invalid YouTube URL. Must be a valid YouTube channel link.');
      } else {
        setYoutubeUrlError('');
      }
    }
  }, [socialUrlError]);

  const handleAddUrl = () => {
    setAdditionalUrls([...additionalUrls, { platform: '', url: '' }]);
  };

  const handleRemoveUrl = (index: number) => {
    setAdditionalUrls(additionalUrls.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...additionalUrls];
    updated[index][field] = value;
    setAdditionalUrls(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Instagram URL if provided
    if (formData.instagramUrl && !validateInstagramUrl(formData.instagramUrl)) {
      setSocialUrlError('Please enter a valid Instagram profile URL (e.g., https://instagram.com/username)');
      toast.error('Invalid Instagram URL. Please enter a valid Instagram profile link.');
      return;
    }

    // Validate YouTube URL if provided
    if (formData.youtubeUrl && !validateYoutubeUrl(formData.youtubeUrl)) {
      setSocialUrlError('Please enter a valid YouTube channel URL (e.g., https://youtube.com/@channel)');
      toast.error('Invalid YouTube URL. Please enter a valid YouTube channel link.');
      return;
    }

    // Validate that at least one social URL is filled (simplified and efficient)
    const hasAtLeastOneSocialUrl = [
      formData.instagramUrl,
      formData.youtubeUrl,
      ...additionalUrls.map(u => u.url)
    ].some(url => url?.trim());

    if (!hasAtLeastOneSocialUrl) {
      setSocialUrlError('Please provide at least one social media profile');
      toast.error('At least one social media profile is required');
      return;
    }
    setSocialUrlError('');

    const socialUrls: { platform: string; link: string }[] = [];
    if (formData.instagramUrl) {
      socialUrls.push({ platform: 'instagram', link: formData.instagramUrl });
    }
    if (formData.youtubeUrl) {
      socialUrls.push({ platform: 'youtube', link: formData.youtubeUrl });
    }
    additionalUrls.forEach(({ platform, url }) => {
      if (platform && url) {
        socialUrls.push({ platform: platform.toLowerCase(), link: url });
      }
    });

    const formDataToSend = new FormData();
    const finalCategory = formData.category === 'other' ? formData.customCategory : formData.category;
    formDataToSend.append('category', finalCategory);
    formDataToSend.append('niche', formData.niche);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('bio', formData.audienceInfo);
    formDataToSend.append('social_urls', JSON.stringify(socialUrls));

    if (profilePicture) {
      formDataToSend.append('profile_picture', profilePicture);
    }

    setupMutation.mutate(formDataToSend);
  };

  const completedFields = [
    formData.instagramUrl || formData.youtubeUrl,
    formData.category,
    formData.niche,
    formData.location,
    formData.audienceInfo,
  ].filter(Boolean).length;

  const categoryName =
    formData.category === 'other'
      ? formData.customCategory
      : dynamicCategories.find((cat) => cat.slug === formData.category)?.name;
  const handle =
    formData.instagramUrl.match(/instagram\.com\/([^/?#]+)/i)?.[1] || user?.username || 'yourhandle';
  const displayName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username || 'You';

  const fieldError = (message: string) => (
    <p className="flex items-center gap-1.5 text-xs text-destructive">
      <X className="size-3" />
      {message}
    </p>
  );

  return (
    <OnboardingShell
      firstName={user?.first_name}
      eyebrow="Creator onboarding"
      title="Almost"
      highlight="there."
      intro="Fill this in once. Brands see it on every application you send."
      previewLabel="How brands will see you"
      preview={
        <>
          <CreatorCard
            preview
            creator={{
              id: 'preview',
              name: displayName,
              username: handle,
              niches: [formData.niche || categoryName].filter(Boolean) as string[],
              city: formData.location || null,
              photo: previewUrl || null,
              followers: null,
              engagement: null,
            }}
          />
          <p className="mt-3 text-xs text-ink-muted">
            Followers and engagement sync from Instagram once your profile is live.
          </p>
        </>
      }
      checklist={[
        { label: 'A social profile', done: Boolean(formData.instagramUrl || formData.youtubeUrl) },
        { label: 'Category', done: Boolean(formData.category) },
        { label: 'Niche', done: Boolean(formData.niche) },
        { label: 'Location', done: Boolean(formData.location) },
        { label: 'About you', done: Boolean(formData.audienceInfo) },
      ]}
      reviewNote="Every profile is reviewed by hand before it goes live."
    >
      {isLoading ? (
        <SetupSkeleton />
      ) : (
        <>
          <div className="mb-10">
            <h1 className="font-display text-[2.5rem] leading-[1.02] tracking-[-0.04em]">Complete your profile</h1>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">
              Takes about two minutes. You can change any of it later from your profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* ------------------------------------------------ socials */}
            <SetupSection
              index={1}
              title="Where you post"
              hint="At least one profile. Your follower count is fetched from Instagram automatically."
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="instagramUrl" className="sr-only">Instagram profile URL</Label>
                  <div className="relative">
                    <Instagram className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="instagramUrl"
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleSocialUrlChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/yourusername"
                      aria-invalid={Boolean(instagramUrlError)}
                      className="pl-10"
                    />
                  </div>
                  {instagramUrlError && fieldError(instagramUrlError)}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="youtubeUrl" className="sr-only">YouTube channel URL</Label>
                  <div className="relative">
                    <Youtube className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="youtubeUrl"
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => handleSocialUrlChange('youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      aria-invalid={Boolean(youtubeUrlError)}
                      className="pl-10"
                    />
                  </div>
                  {youtubeUrlError && fieldError(youtubeUrlError)}
                </div>

                <AnimatePresence>
                  {additionalUrls.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2"
                    >
                      <div className="relative w-full sm:w-1/3">
                        <Globe className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Platform"
                          value={item.platform}
                          onChange={(e) => handleUrlChange(index, 'platform', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Input
                        placeholder="Profile URL"
                        type="url"
                        value={item.url}
                        onChange={(e) => handleUrlChange(index, 'url', e.target.value)}
                        className="min-w-0 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Remove platform"
                        onClick={() => handleRemoveUrl(index)}
                        className="size-12 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  <Plus className="size-4" />
                  Add another platform
                </button>
                {socialUrlError && <p className="text-xs text-destructive">{socialUrlError}</p>}
              </div>
            </SetupSection>

            {/* ------------------------------------------- what you make */}
            <SetupSection index={2} title="What you make" hint="This is how brands find you in search.">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-semibold">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category" className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
                      <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {dynamicCategories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niche" className="font-semibold">Your niche</Label>
                  <Input
                    id="niche"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    placeholder="Vegan food, budget travel…"
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {formData.category === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="customCategory" className="font-semibold">Specify your category</Label>
                      <Input
                        id="customCategory"
                        value={formData.customCategory}
                        onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                        placeholder="Enter your category"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SetupSection>

            {/* ------------------------------------------------ about you */}
            <SetupSection index={3} title="About you">
              <input
                id="profilePicture"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="sr-only"
              />
              <AvatarPicker
                inputId="profilePicture"
                previewUrl={previewUrl}
                fallback={displayName.charAt(0).toUpperCase()}
                label="photo"
                hint="Optional · PNG or JPG up to 10MB. A clear face photo gets more replies."
              />

              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold">City</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Pune, India"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceInfo" className="font-semibold">About you &amp; your audience</Label>
                <Textarea
                  id="audienceInfo"
                  value={formData.audienceInfo}
                  onChange={(e) => setFormData({ ...formData, audienceInfo: e.target.value })}
                  placeholder="Who follows you, what you post, and what makes your content yours…"
                  rows={4}
                  required
                />
              </div>
            </SetupSection>

            <div className="border-t border-border pt-7">
              <Button type="submit" variant="form" size="lg" className="w-full" disabled={setupMutation.isPending}>
                {setupMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  <>
                    Complete setup
                    <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}

      <ImageCropper
        imageSrc={tempImageSrc}
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        onCropComplete={handleCropComplete}
        aspect={1}
      />
    </OnboardingShell>
  );
};

export default InfluencerSetup;
