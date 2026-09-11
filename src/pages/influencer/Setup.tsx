import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Upload,
  Plus,
  X,
  Instagram,
  Youtube,
  Globe,
  Hash,
  FileText,
  ArrowRight,
  Check,
  Camera,
  Loader2,
  Star,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCategories } from '@/hooks/useCategories';
import { Rise } from '@/components/motion';
import { cn } from '@/lib/utils';

/* Removed from the old wizard: FloatingOrb (looping animation), the gradient
   progress bar and glow-shadow submit button, the per-field entrance stagger,
   the pink/red brand-coloured input focus states, and the spinning
   framer-motion loader (`repeat: Infinity`). */

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

/** Restrained step meter: five hairline segments, no gradient, no glow. */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="mb-8">
    <div className="mb-2.5 flex items-baseline justify-between gap-4">
      <span className="eyebrow">Profile completeness</span>
      <span className="num text-sm text-muted-foreground">
        {Math.min(currentStep, totalSteps)}/{totalSteps}
      </span>
    </div>
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-200",
            i < currentStep ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </div>
  </div>
);

/** Field header: icon + label, and the required marker where it applies. */
const FieldLabel = ({
  icon: Icon,
  children,
  required,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <Icon className="size-4 text-muted-foreground" />
    <Label className="font-semibold">{children}</Label>
    {required && <span className="text-xs text-destructive">*</span>}
  </div>
);

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

  return (
    <div className="min-h-screen bg-background">
      {/* This route has no navbar, so the wizard carries its own hairline bar. */}
      <header className="border-b border-border bg-background/92 backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <Link
            to="/"
            className="font-display text-[1.4375rem] font-semibold tracking-[-0.035em] text-foreground"
          >
            FameSync
          </Link>
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.first_name || 'Creator'}</span>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl py-12">
        {isLoading ? (
          <SetupSkeleton />
        ) : (
          <>
            <Rise>
              <div className="mb-9">
                <span className="eyebrow">Creator onboarding</span>
                <h1 className="mt-2.5 font-display text-display-2">Complete your profile.</h1>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-muted-foreground">
                  Tell us about yourself to start applying to campaigns.
                </p>
              </div>

              <StepIndicator currentStep={completedFields} totalSteps={5} />
            </Rise>

            <Rise delay={0.06}>
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Social Media Section */}
                    <div className="space-y-4">
                      <FieldLabel icon={Instagram} required>
                        Social media profiles
                      </FieldLabel>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="relative">
                            <Instagram className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="url"
                              value={formData.instagramUrl}
                              onChange={(e) => handleSocialUrlChange('instagramUrl', e.target.value)}
                              placeholder="https://instagram.com/yourusername"
                              aria-invalid={Boolean(instagramUrlError)}
                              className="pl-10"
                            />
                          </div>
                          {instagramUrlError && (
                            <p className="flex items-center gap-1.5 text-xs text-destructive">
                              <X className="size-3" />
                              {instagramUrlError}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="relative">
                            <Youtube className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="url"
                              value={formData.youtubeUrl}
                              onChange={(e) => handleSocialUrlChange('youtubeUrl', e.target.value)}
                              placeholder="https://youtube.com/@yourchannel"
                              aria-invalid={Boolean(youtubeUrlError)}
                              className="pl-10"
                            />
                          </div>
                          {youtubeUrlError && (
                            <p className="flex items-center gap-1.5 text-xs text-destructive">
                              <X className="size-3" />
                              {youtubeUrlError}
                            </p>
                          )}
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

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddUrl}
                          className="w-full border-dashed"
                        >
                          <Plus />
                          Add another platform
                        </Button>
                        {socialUrlError && (
                          <p className="text-xs text-destructive">{socialUrlError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          At least one social media profile is required
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <FieldLabel icon={Hash}>Category</FieldLabel>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
                          <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {dynamicCategories.map((cat) => (
                            <SelectItem key={cat.slug} value={cat.slug}>
                              <span className="flex items-center gap-2">
                                <span>{cat.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Your follower count will be automatically fetched from Instagram
                      </p>
                    </div>

                    {/* Custom Category */}
                    <AnimatePresence>
                      {formData.category === 'other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="space-y-2">
                            <Label className="font-semibold">Specify your category</Label>
                            <Input
                              value={formData.customCategory}
                              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                              placeholder="Enter your category"
                              required
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Niche */}
                    <div className="space-y-2">
                      <FieldLabel icon={Star}>Your niche</FieldLabel>
                      <Input
                        value={formData.niche}
                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        placeholder="Sustainable fashion, vegan lifestyle, etc."
                        required
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <FieldLabel icon={Globe}>Location</FieldLabel>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. New York, USA"
                        required
                      />
                    </div>

                    {/* Audience Info */}
                    <div className="space-y-2">
                      <FieldLabel icon={FileText}>About you &amp; your audience</FieldLabel>
                      <Textarea
                        value={formData.audienceInfo}
                        onChange={(e) => setFormData({ ...formData, audienceInfo: e.target.value })}
                        placeholder="Tell us about your audience demographics, engagement rate, content style, and what makes you unique..."
                        rows={4}
                        required
                      />
                    </div>

                    {/* Profile Picture */}
                    <div className="space-y-2">
                      <FieldLabel icon={Camera}>Profile picture</FieldLabel>
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profilePicture"
                        className="block cursor-pointer rounded-lg border border-dashed border-muted-foreground/35 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted"
                      >
                        {previewUrl ? (
                          <span className="flex flex-col items-center">
                            <span className="relative">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="size-24 rounded-full object-cover ring-2 ring-border"
                              />
                              <span className="absolute -bottom-1 -right-1 inline-flex size-7 items-center justify-center rounded-full bg-success text-success-foreground">
                                <Check className="size-4" />
                              </span>
                            </span>
                            <span className="mt-3 text-sm text-muted-foreground">Click to change</span>
                          </span>
                        ) : (
                          <span className="block">
                            <span className="mx-auto mb-3 inline-flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <Upload className="size-5" />
                            </span>
                            <span className="block text-sm font-semibold">Click to upload your photo</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              PNG, JPG up to 10MB
                            </span>
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="form"
                        size="lg"
                        className="w-full"
                        disabled={setupMutation.isPending}
                      >
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
                </CardContent>
              </Card>
            </Rise>
          </>
        )}
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

export default InfluencerSetup;
