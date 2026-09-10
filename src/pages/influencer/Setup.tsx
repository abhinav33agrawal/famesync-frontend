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
  User,
  Instagram,
  Youtube,
  Globe,
  Users,
  Hash,
  FileText,
  ArrowRight,
  CheckCircle2,
  Camera,
  Star
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ImageCropper } from '@/components/ui/image-cropper';
import { useCategories } from '@/hooks/useCategories';

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
            Welcome, <span className="font-medium text-foreground">{user?.first_name || 'Creator'}</span>
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
              <User className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Complete Your <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-muted-foreground">
                Tell us about yourself to start applying to campaigns.
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <StepIndicator currentStep={completedFields} totalSteps={5} />

          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Social Media Section */}
                <FormField index={0}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <Label className="text-base font-semibold">Social Media Profiles</Label>
                      <span className="text-xs text-destructive">*</span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="relative group">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-pink-500 transition-colors" />
                          <Input
                            type="url"
                            value={formData.instagramUrl}
                            onChange={(e) => handleSocialUrlChange('instagramUrl', e.target.value)}
                            placeholder="https://instagram.com/yourusername"
                            className={`pl-10 h-12 focus:border-pink-500 bg-background/50 ${
                              instagramUrlError ? 'border-destructive' : 'border-border/50'
                            }`}
                          />
                        </div>
                        {instagramUrlError && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {instagramUrlError}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="relative group">
                          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                          <Input
                            type="url"
                            value={formData.youtubeUrl}
                            onChange={(e) => handleSocialUrlChange('youtubeUrl', e.target.value)}
                            placeholder="https://youtube.com/@yourchannel"
                            className={`pl-10 h-12 focus:border-red-500 bg-background/50 ${
                              youtubeUrlError ? 'border-destructive' : 'border-border/50'
                            }`}
                          />
                        </div>
                        {youtubeUrlError && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <X className="h-3 w-3" />
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
                            className="flex gap-2"
                          >
                            <div className="relative group w-1/3">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Platform"
                                value={item.platform}
                                onChange={(e) => handleUrlChange(index, 'platform', e.target.value)}
                                className="pl-9 h-12 border-border/50"
                              />
                            </div>
                            <Input
                              placeholder="Profile URL"
                              type="url"
                              value={item.url}
                              onChange={(e) => handleUrlChange(index, 'url', e.target.value)}
                              className="flex-1 h-12 border-border/50"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveUrl(index)}
                              className="h-12 w-12 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddUrl}
                        className="w-full h-10 border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Platform
                      </Button>
                      {socialUrlError && (
                        <p className="text-xs text-destructive mt-1">{socialUrlError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        At least one social media profile is required
                      </p>
                    </div>
                  </div>
                </FormField>

                {/* Category */}
                <FormField index={1}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Category</Label>
                    </div>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="h-12 border-border/50">
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
                </FormField>

                {/* Custom Category */}
                <AnimatePresence>
                  {formData.category === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FormField index={2}>
                        <div className="space-y-2">
                          <Label className="font-medium">Specify Your Category</Label>
                          <Input
                            value={formData.customCategory}
                            onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                            placeholder="Enter your category"
                            className="h-12 border-border/50"
                            required
                          />
                        </div>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Niche */}
                <FormField index={3}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Your Niche</Label>
                    </div>
                    <Input
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      placeholder="Sustainable fashion, vegan lifestyle, etc."
                      className="h-12 border-border/50"
                      required
                    />
                  </div>
                </FormField>

                {/* Location */}
                <FormField index={4}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Location</Label>
                    </div>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. New York, USA"
                      className="h-12 border-border/50"
                      required
                    />
                  </div>
                </FormField>

                {/* Audience Info */}
                <FormField index={5}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <Label className="font-medium">About You & Your Audience</Label>
                    </div>
                    <Textarea
                      value={formData.audienceInfo}
                      onChange={(e) => setFormData({ ...formData, audienceInfo: e.target.value })}
                      placeholder="Tell us about your audience demographics, engagement rate, content style, and what makes you unique..."
                      rows={4}
                      className="border-border/50 resize-none"
                      required
                    />
                  </div>
                </FormField>

                {/* Profile Picture */}
                <FormField index={6}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      <Label className="font-medium">Profile Picture</Label>
                    </div>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
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
                              className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
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
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-sm font-medium">
                            Click to upload your photo
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB
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

export default InfluencerSetup;
