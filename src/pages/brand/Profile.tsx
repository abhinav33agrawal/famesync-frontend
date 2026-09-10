import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Edit,
  Save,
  Building2,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Crown,
  Camera,
  X,
  Sparkles,
  Target,
  FileCheck,
  Instagram,
  Youtube,
  ArrowRight,
  Plus,
  Users,
} from 'lucide-react';
import { useBrandProfile, useUpdateBrandProfile, useBrandDashboard } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBadge } from '@/components/PremiumBadge';
import { TrustLayer } from '@/components/TrustBadges';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ImageCropper } from '@/components/ui/image-cropper';

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
        <div className="flex items-center justify-between mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-card/50 rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-card/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

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
      <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <p className="relative z-10 text-destructive">Failed to load profile. Please try again.</p>
      </div>
    );
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
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Building2 className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {formData.company_name || 'Brand Name'}
                    </h1>
                    {user?.subscription_plan && (
                      <PremiumBadge plan={user.subscription_plan} size="sm" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    @{user?.username}
                  </p>
                  {/* Category Badge and Trust Layer */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(profile?.industry || formData.customIndustry) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary text-sm font-medium capitalize">
                          {(profile?.industry || formData.customIndustry || 'edtech').charAt(0).toUpperCase() + (profile?.industry || formData.customIndustry || 'edtech').slice(1).toLowerCase()}
                        </span>
                      </motion.div>
                    )}
                    <TrustLayer
                      emailVerified={user?.is_approved}
                      isNewMember={user?.is_new_member}
                      profileCompletion={profile?.profile_completion}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats Cards */}
            <div className="space-y-4">
              <StatCard
                icon={FileCheck}
                label="Total Applications"
                value={stats?.total_applications || 0}
                color="bg-gradient-to-br from-secondary to-secondary/80"
                delay={0.1}
              />
              <StatCard
                icon={CreditCard}
                label="Credits Available"
                value={user?.credits || 0}
                color="bg-gradient-to-br from-green-500 to-green-600"
                delay={0.2}
              />

              {/* Subscription Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
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
                        <p className="text-sm text-muted-foreground">Credits Remaining</p>
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

            {/* Right Column - Social Media Links & Brand Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Social Media Links Card - Display Only */}
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
                  <CardContent>
                    {profile?.social_urls && profile.social_urls.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {profile.social_urls.map((social: any, index: number) => {
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
                                <p className="text-sm font-medium capitalize">{social.platform}</p>
                                <p className="text-xs text-muted-foreground truncate">{social.link}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </motion.a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No social media links added yet. You can add them during signup.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Brand Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Brand Information
                    </CardTitle>
                    <CardDescription>
                      Your public brand profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
                          disabled
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="bg-background/50"
                        />
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
                          className="bg-background/50"
                        />
                        {isEditing && (
                          <p className="text-xs text-muted-foreground">
                            Enter 10-digit mobile number (e.g., 9876543210)
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleInputChange('industry', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-background/50">
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
                        <Label htmlFor="customIndustry">Specify Your Industry</Label>
                        <Input
                          id="customIndustry"
                          value={formData.customIndustry}
                          onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your industry"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">About Your Brand</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        disabled={!isEditing}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Edit Profile Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                      {!isEditing ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white">
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

export default Profile;
