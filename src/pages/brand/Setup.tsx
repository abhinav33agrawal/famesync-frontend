import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, Globe, Instagram, Loader2, ShieldCheck, Youtube } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCategories } from '@/hooks/useCategories';
import { BrandLogo } from '@/components/Avatar';
import { AvatarPicker, OnboardingShell, SetupSection } from '@/components/onboarding/OnboardingShell';

/* Setup renders with no app chrome. OnboardingShell supplies the layout: the
   ink panel with a live brand-card preview and checklist, and the form in
   three numbered sections. Fields, validation and the payload are unchanged. */

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

  const industryName =
    formData.industry === 'other'
      ? formData.customIndustry
      : dynamicCategories.find((ind) => ind.slug === formData.industry)?.name;
  const websiteHost = (() => {
    try {
      return formData.website ? new URL(formData.website).host.replace(/^www\./, '') : '';
    } catch {
      return '';
    }
  })();
  const brandName = formData.brandName.trim();

  return (
    <OnboardingShell
      firstName={user?.first_name}
      eyebrow="Brand onboarding"
      title="Set up"
      highlight="your brand."
      intro="Creators see this before they apply, so tell them who they'd be working with."
      previewLabel="How creators will see you"
      preview={
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <BrandLogo src={previewUrl || null} name={brandName || 'Your brand'} className="size-12" />
            <div className="min-w-0">
              <p className="truncate font-display text-[1.0625rem] font-extrabold tracking-[-0.02em]">
                {brandName || 'Your brand'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {[industryName, websiteHost].filter(Boolean).join(' · ') || 'Industry · website'}
              </p>
            </div>
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {formData.description || 'Your description shows here — what you make, and the creators you want to work with.'}
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">
            <ShieldCheck className="size-3.5" />
            Reviewed by the FameSync team
          </div>
        </Card>
      }
      checklist={[
        { label: 'Brand name', done: Boolean(brandName) },
        { label: 'Industry', done: Boolean(formData.industry) },
        { label: 'A social profile', done: hasValidSocialUrl(socialUrls) },
        { label: 'Description', done: Boolean(formData.description) },
      ]}
      reviewNote="Every brand is checked by hand before its first brief goes live."
    >
      <div className="mb-10">
        <h1 className="font-display text-[2.5rem] leading-[1.02] tracking-[-0.04em]">Set up your brand</h1>
        <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">
          Takes about two minutes. You can edit it any time from your brand profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ------------------------------------------------ the basics */}
        <SetupSection index={1} title="The basics">
          <input
            id="profilePicture"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileChange}
            className="sr-only"
          />
          <AvatarPicker
            inputId="profilePicture"
            previewUrl={previewUrl}
            fallback={(brandName || 'B').charAt(0).toUpperCase()}
            shape="square"
            label="logo"
            hint="Optional · PNG, JPG or SVG up to 10MB."
          />

          <div className="space-y-2">
            <Label htmlFor="brandName" className="font-semibold">Brand name</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="Your brand name"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry" className="font-semibold">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger id="industry" className={SELECT_INPUT}>
                  <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select industry'} />
                </SelectTrigger>
                <SelectContent>
                  {dynamicCategories.map((ind) => (
                    <SelectItem key={ind.slug} value={ind.slug}>
                      {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.industry === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customIndustry" className="font-semibold">Specify your industry</Label>
                <Input
                  id="customIndustry"
                  value={formData.customIndustry}
                  onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                  placeholder="Enter your industry"
                />
              </div>
            )}
          </div>
        </SetupSection>

        {/* -------------------------------------------- where to find you */}
        <SetupSection
          index={2}
          title="Where creators can find you"
          hint="At least one social profile, so creators can check you out."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {socialUrls.map((social, index) => {
              const platformLabel = SOCIAL_PLATFORMS.find((p) => p.platform === social.platform)?.label || social.platform;
              const Icon = social.platform === 'youtube' ? Youtube : Instagram;
              const hasError = urlErrors[social.platform];
              return (
                <div key={social.platform} className="space-y-2">
                  <Label htmlFor={social.platform} className="font-semibold">{platformLabel}</Label>
                  <div className="relative">
                    <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={social.platform}
                      type="url"
                      value={social.url}
                      onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                      placeholder={`https://${social.platform}.com/yourbrand`}
                      aria-required={true}
                      aria-invalid={hasError ? true : false}
                      aria-describedby={socialUrlError ? 'social-url-error' : undefined}
                      className="pl-10"
                    />
                  </div>
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

          <div className="space-y-2">
            <Label htmlFor="website" className="font-semibold">
              Website <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                className="pl-10"
              />
            </div>
          </div>
        </SetupSection>

        {/* ---------------------------------------------- your story */}
        <SetupSection index={3} title="Your story" hint="A good description gets better applications.">
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">Brand description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What you make, who it's for, and the kind of creators you want to work with…"
              rows={5}
              required
            />
          </div>
        </SetupSection>

        <div className="border-t border-border pt-7">
          <Button type="submit" variant="form" size="lg" className="w-full" disabled={setupMutation.isPending}>
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
        </div>
      </form>

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

export default BrandSetup;
