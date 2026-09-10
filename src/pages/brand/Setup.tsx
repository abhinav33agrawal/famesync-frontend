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
  Building2,
  Globe,
  Wallet,
  FileText,
  ArrowRight,
  CheckCircle2,
  Camera,
  Briefcase
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCategories } from '@/hooks/useCategories';

// Social media platforms configuration
const SOCIAL_PLATFORMS = [
  { platform: 'instagram', label: 'Instagram' },
  { platform: 'youtube', label: 'YouTube' },
] as const;

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

// Floating orb component
const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Progress indicator
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <motion.div
        key={i}
        className={`h-2 rounded-full transition-all duration-300 ${i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary/50' : 'bg-muted'
          }`}
        initial={{ width: 0 }}
        animate={{ width: i <= currentStep ? '100%' : '40px' }}
        style={{ flex: i <= currentStep ? 1 : 'none' }}
      />
    ))}
  </div>
);

// Form field wrapper with animation
const FormField = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {children}
  </motion.div>
);

// Loading skeleton
const SetupSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 mb-8">
      <Skeleton className="w-16 h-16 rounded-2xl" />
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <Card className="border-0 shadow-xl">
      <CardContent className="pt-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <FloatingOrb className="w-[400px] h-[400px] bg-primary/10 -top-40 -left-40" delay={0} />
      <FloatingOrb className="w-[500px] h-[500px] bg-accent/10 -bottom-40 -right-40" delay={2} />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 border-b border-border/50 backdrop-blur-sm bg-background/80"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="brand gradient-text">FameSync</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{user?.first_name || 'there'}</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header section */}
          <div className="flex items-start gap-4 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0"
            >
              <Building2 className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Setup Your <span className="gradient-text">Brand</span>
              </h1>
              <p className="text-muted-foreground">
                Tell us about your brand to start connecting with creators.
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <StepIndicator currentStep={completedFields} totalSteps={4} />

          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Brand Name */}
                <FormField index={0}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Brand Name</Label>
                    </div>
                    <Input
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="Your Brand Name"
                      className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                      required
                    />
                  </div>
                </FormField>

                {/* Industry & Budget */}
                <FormField index={1}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <Label className="font-medium">Industry</Label>
                      </div>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => setFormData({ ...formData, industry: value })}
                      >
                        <SelectTrigger className="h-12 border-border/50">
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
                        <Label htmlFor="customIndustry">Specify Your Industry</Label>
                        <Input
                          id="customIndustry"
                          value={formData.customIndustry}
                          onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                          placeholder="Enter your industry"
                          className="h-12 border-border/50"
                        />
                      </div>
                    )}

                  </div>
                </FormField>

                {/* Website */}
                <FormField index={2}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Website URL</Label>
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </div>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
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
                        className="pl-10 h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                      />
                    </div>
                  </div>
                </FormField>

                {/* Social Media Links */}
                <FormField index={3}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Social Media Links</Label>
                      <span className="text-xs text-destructive">*</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {socialUrls.map((social, index) => {
                        const platformLabel = SOCIAL_PLATFORMS.find(p => p.platform === social.platform)?.label || social.platform;
                        const hasError = urlErrors[social.platform];
                        return (
                          <div key={social.platform} className="space-y-1.5">
                            <Label htmlFor={social.platform} className="capitalize">
                              {platformLabel}
                            </Label>
                            <Input
                              id={social.platform}
                              type="url"
                              value={social.url}
                              onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                              placeholder={`https://${social.platform}.com/yourbrand`}
                              className={`h-12 border-2 focus:border-primary bg-background/50 ${hasError ? 'border-destructive' : 'border-border/50'
                                }`}
                              aria-required={true}
                              aria-invalid={hasError ? true : false}
                              aria-describedby={socialUrlError ? 'social-url-error' : 'social-url-help'}
                            />
                            {hasError && (
                              <p className="text-xs text-destructive flex items-center gap-1">
                                <span className="font-bold">×</span>
                                {hasError}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {socialUrlError && (
                      <p id="social-url-error" className="text-xs text-destructive mt-1" role="alert">
                        {socialUrlError}
                      </p>
                    )}
                    <p id="social-url-help" className="text-xs text-muted-foreground">
                      At least one valid social media link is required
                    </p>
                  </div>
                </FormField>

                {/* Description */}
                <FormField index={4}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Brand Description</Label>
                    </div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your brand, your mission, target audience, and what you're looking for in influencer partnerships..."
                      rows={5}
                      className="border-2 border-border/50 resize-none focus:border-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      A good description helps creators understand your brand better
                    </p>
                  </div>
                </FormField>

                {/* Brand Logo */}
                <FormField index={5}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Brand Logo</Label>
                    </div>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer block group"
                    >
                      {previewUrl ? (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary/20"
                            />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">
                            Click to change
                          </p>
                        </motion.div>
                      ) : (
                        <>
                          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-sm font-medium">
                            Click to upload your logo
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, SVG up to 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </FormField>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    className="w-full h-14 gradient-instagram text-white font-semibold text-lg shadow-lg shadow-primary/25 shimmer"
                    disabled={setupMutation.isPending}
                  >
                    {setupMutation.isPending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        Complete Setup
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
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

export default BrandSetup;
