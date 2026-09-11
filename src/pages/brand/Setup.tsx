import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCategories } from '@/hooks/useCategories';
import { Rise } from '@/components/motion';
import { cn } from '@/lib/utils';

/* Setup renders with no app chrome — it carries its own hairline header and
   owns the full viewport height.
   Removed from the old Setup.tsx: FloatingOrb, the animated gradient progress
   bar, the border-2/bg-background-50 field styling, the shadow-2xl card and
   the unused SetupSkeleton. */

// Social media platforms configuration
const SOCIAL_PLATFORMS = [
  { platform: 'instagram', label: 'Instagram' },
  { platform: 'youtube', label: 'YouTube' },
] as const;

const SELECT_INPUT = 'h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]';

// URL validation helpers with platform-specific validation
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Empty is valid (optional field)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

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

const validateSocialUrl = (platform: string, url: string): boolean => {
  if (!url.trim()) return true; // Empty is valid
  if (platform === 'instagram') return validateInstagramUrl(url);
  if (platform === 'youtube') return validateYoutubeUrl(url);
  return isValidUrl(url); // For other platforms, just check valid URL format
};

// Check if at least one social URL is provided and valid
const hasValidSocialUrl = (socialUrls: { platform: string; url: string }[]): boolean => {
  return socialUrls.some(social => social.url.trim() !== '' && validateSocialUrl(social.platform, social.url));
};

/** Restrained completion meter — four hairline segments, no gradient, no glow. */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="mb-9">
    <div className="mb-2.5 flex items-center justify-between">
      <span className="eyebrow">Profile completeness</span>
      <span className="num text-sm text-muted-foreground">
        {Math.min(currentStep, totalSteps)}/{totalSteps}
      </span>
    </div>
    <div className="flex gap-1.5" role="presentation">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={cn('h-1.5 flex-1 rounded-sm', i < currentStep ? 'bg-primary' : 'bg-border')}
        />
      ))}
    </div>
  </div>
);

const BrandSetup = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    brandName: '',
    industry: '',
    customIndustry: '',
    website: '',
    description: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [socialUrls, setSocialUrls] = useState<{ platform: string; url: string }[]>(
    SOCIAL_PLATFORMS.map(({ platform }) => ({ platform, url: '' }))
  );
  const [socialUrlError, setSocialUrlError] = useState<string>('');
  const [urlErrors, setUrlErrors] = useState<{ [key: string]: string }>({});

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { categories: dynamicCategories, isLoading: categoriesLoading } = useCategories();



  const setupMutation = useMutation({
    mutationFn: (data: any) => profilesApi.brand.setup(data),
    onSuccess: async () => {
      toast.success('Profile created successfully!');
      // Refresh user to update has_profile flag before navigating
      await refreshUser();
      navigate('/brand/dashboard');
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
    // Use timestamp to ensure unique filename
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

  const handleSocialUrlChange = useCallback((index: number, value: string) => {
    const platform = socialUrls[index].platform;

    setSocialUrls(prev => {
      const updated = [...prev];
      updated[index].url = value;
      return updated;
    });

    // Real-time validation
    if (value.trim() && !validateSocialUrl(platform, value)) {
      let errorMsg = 'Invalid URL format';
      if (platform === 'instagram') {
        errorMsg = 'Invalid Instagram URL. Must be a valid Instagram profile link.';
      } else if (platform === 'youtube') {
        errorMsg = 'Invalid YouTube URL. Must be a valid YouTube channel link.';
      }
      setUrlErrors(prev => ({ ...prev, [platform]: errorMsg }));
    } else {
      setUrlErrors(prev => {
        const updated = { ...prev };
        delete updated[platform];
        return updated;
      });
    }

    // Clear global error when user starts typing
    if (socialUrlError) setSocialUrlError('');
  }, [socialUrls, socialUrlError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one social URL is filled and valid
    if (!hasValidSocialUrl(socialUrls)) {
      setSocialUrlError('Please provide at least one valid social media link');
      toast.error('At least one valid social media profile is required');
      return;
    }

    // Validate platform-specific URLs
    const invalidSocialUrls = socialUrls.filter(social => {
      const url = social.url.trim();
      if (!url) return false; // Empty is okay
      return !validateSocialUrl(social.platform, url);
    });

    if (invalidSocialUrls.length > 0) {
      const invalidPlatform = invalidSocialUrls[0].platform;
      if (invalidPlatform === 'instagram') {
        setSocialUrlError('Please enter a valid Instagram profile URL (e.g., https://instagram.com/yourbrand)');
        toast.error('Invalid Instagram URL. Please enter a valid Instagram profile link.');
      } else if (invalidPlatform === 'youtube') {
        setSocialUrlError('Please enter a valid YouTube channel URL (e.g., https://youtube.com/@yourchannel)');
        toast.error('Invalid YouTube URL. Please enter a valid YouTube channel link.');
      } else {
        setSocialUrlError('Please enter valid URLs');
        toast.error('Please enter valid social media URLs');
      }
      return;
    }
    setSocialUrlError('');

    const formDataToSend = new FormData();
    formDataToSend.append('company_name', formData.brandName);
    const finalIndustry = formData.industry === 'other' ? formData.customIndustry : formData.industry;
    formDataToSend.append('industry', finalIndustry);
    formDataToSend.append('website', formData.website);
    formDataToSend.append('description', formData.description);

    // Add social URLs
    const socialUrlsData = socialUrls
      .filter(social => social.url.trim() !== '')
      .map(social => ({ platform: social.platform, link: social.url }));
    if (socialUrlsData.length > 0) {
      formDataToSend.append('social_urls', JSON.stringify(socialUrlsData));
    }

    if (profilePicture) {
      formDataToSend.append('profile_picture', profilePicture);
    }

    setupMutation.mutate(formDataToSend);
  };

  const completedFields = [
    formData.brandName,
    formData.industry,
    formData.description,
  ].filter(Boolean).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ------------------------------------------------- standalone header */}
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/"
            className="font-display text-[1.25rem] font-semibold tracking-[-0.035em] text-foreground"
          >
            FameSync
          </Link>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.first_name || 'there'}</span>
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 pb-16 pt-10 sm:pt-14">
          <Rise>
            <p className="eyebrow mb-4">Step 1 of 1 · Brand setup</p>
            <h1 className="font-display text-display-2">Set up your brand.</h1>
            <p className="mt-4 max-w-[46ch] leading-relaxed text-muted-foreground">
              Tell us about your brand so creators know who they&apos;re working with.
            </p>
          </Rise>

          <div className="mt-9">
            <StepIndicator currentStep={completedFields} totalSteps={3} />

            <Card>
              <CardContent className="p-5 pt-5 sm:p-7 sm:pt-7">
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Brand Name */}
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand name *</Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="Your brand name"
                      required
                    />
                  </div>

                  {/* Industry */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => setFormData({ ...formData, industry: value })}
                      >
                        <SelectTrigger id="industry" className={SELECT_INPUT}>
                          <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select industry"} />
                        </SelectTrigger>
                        <SelectContent>
                          {dynamicCategories.map((ind) => (
                            <SelectItem key={ind.slug} value={ind.slug}>
                              <span className="flex items-center gap-2">
                                <span>{ind.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Industry Field - Only show when "other" is selected */}
                    {formData.industry === 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="customIndustry">Specify your industry</Label>
                        <Input
                          id="customIndustry"
                          value={formData.customIndustry}
                          onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                          placeholder="Enter your industry"
                        />
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      Website URL <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = formData.website.trim();
                          if (value && !value.match(/^https?:\/\//i)) {
                            // Check if it has a domain extension like .com, .in, .org, etc.
                            if (value.match(/\.[a-z]{2,}$/i)) {
                              setFormData({ ...formData, website: `https://${value}` });
                            }
                          }
                        }
                      }}
                      onBlur={() => {
                        const value = formData.website.trim();
                        if (value && !value.match(/^https?:\/\//i)) {
                          // Check if it has a domain extension like .com, .in, .org, etc.
                          if (value.match(/\.[a-z]{2,}$/i)) {
                            setFormData({ ...formData, website: `https://${value}` });
                          }
                        }
                      }}
                      placeholder="https://yourbrand.com"
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="space-y-4">
                    <div>
                      <Label>Social media links *</Label>
                      <p id="social-url-help" className="mt-1 text-xs text-muted-foreground">
                        At least one valid social media link is required
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {socialUrls.map((social, index) => {
                        const platformLabel = SOCIAL_PLATFORMS.find(p => p.platform === social.platform)?.label || social.platform;
                        const hasError = urlErrors[social.platform];
                        return (
                          <div key={social.platform} className="space-y-2">
                            <Label htmlFor={social.platform} className="capitalize">
                              {platformLabel}
                            </Label>
                            <Input
                              id={social.platform}
                              type="url"
                              value={social.url}
                              onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                              placeholder={`https://${social.platform}.com/yourbrand`}
                              aria-required={true}
                              aria-invalid={hasError ? true : false}
                              aria-describedby={socialUrlError ? 'social-url-error' : 'social-url-help'}
                            />
                            {hasError && <p className="text-xs text-destructive">{hasError}</p>}
                          </div>
                        );
                      })}
                    </div>
                    {socialUrlError && (
                      <p id="social-url-error" className="text-xs text-destructive" role="alert">
                        {socialUrlError}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Brand description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your brand, your mission, target audience, and what you're looking for in influencer partnerships..."
                      rows={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      A good description helps creators understand your brand better
                    </p>
                  </div>

                  {/* Brand Logo */}
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture">Brand logo</Label>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="block cursor-pointer rounded-xl border border-dashed border-muted-foreground/35 bg-card p-7 text-center transition-colors hover:bg-muted"
                    >
                      {previewUrl ? (
                        <span className="flex flex-col items-center">
                          <span className="relative">
                            <img
                              src={previewUrl}
                              alt="Brand logo preview"
                              className="size-24 rounded-xl border border-border object-cover"
                            />
                            <span className="absolute -bottom-1.5 -right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-success text-success-foreground">
                              <CheckCircle2 className="size-4" />
                            </span>
                          </span>
                          <span className="mt-3.5 text-sm text-muted-foreground">Click to change</span>
                        </span>
                      ) : (
                        <span className="flex flex-col items-center">
                          <span className="mb-3.5 inline-flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <Upload className="size-5" />
                          </span>
                          <span className="text-sm font-semibold">Click to upload your logo</span>
                          <span className="mt-1 text-xs text-muted-foreground">
                            PNG, JPG, SVG up to 10MB
                          </span>
                        </span>
                      )}
                    </label>
                  </div>

                  {/* Submit */}
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
                        Creating profile…
                      </>
                    ) : (
                      <>
                        Complete setup
                        <ArrowRight />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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

export default BrandSetup;
