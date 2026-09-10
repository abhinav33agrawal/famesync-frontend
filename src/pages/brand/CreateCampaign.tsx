import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Sparkles,
  Crown,
  Megaphone,
  FileText,
  Users,
  Rocket,
  CheckCircle,
  ArrowRight,
  Loader2,
  Target,
  Calendar,
  MapPin,
  Hash,
  MessageSquare,
  Mail,
  Phone,
  Lock,
  Zap,
  AlertCircle,
  Lightbulb,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiError, Campaign, CampaignSuggestion } from '@/lib/api/types';
import { campaignsApi } from '@/lib/api/campaigns';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBadgeIndicator } from '@/components/LockedFeature';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import {
  validateCampaignStep,
  CAMPAIGN_VALIDATION,
  checkDescriptionQuality
} from '@/lib/validation/campaign';
import { useCategories } from '@/hooks/useCategories';
import { useCities } from '@/hooks/useCities';
import { useNiches } from '@/hooks/useNiches';

// Floating Orb Component
const FloatingOrb = ({
  className,
  delay = 0
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      y: [0, -20, 0]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  />
);

// Step Indicator Component
const StepIndicator = ({
  steps,
  currentStep
}: {
  steps: { icon: any; label: string }[];
  currentStep: number;
}) => (
  <div className="flex justify-between mb-8">
    {steps.map((s, idx) => {
      const StepIcon = s.icon;
      const stepNum = idx + 1;
      const isActive = currentStep === stepNum;
      const isCompleted = currentStep > stepNum;

      return (
        <div key={idx} className="flex items-center flex-1">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 ${isActive
                ? 'bg-primary text-white border-transparent shadow-lg shadow-primary/30'
                : isCompleted
                  ? 'bg-green-500/20 border-green-500/50 text-green-500'
                  : 'border-border/50 bg-card/50 text-muted-foreground'
                }`}
              whileHover={{ scale: 1.05 }}
            >
              {isCompleted ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <StepIcon className="h-5 w-5" />
              )}
            </motion.div>
            <span className={`text-xs mt-2 hidden md:block ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </motion.div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 transition-all duration-300 ${isCompleted ? 'bg-green-500/50' : 'bg-border/50'
              }`} />
          )}
        </div>
      );
    })}
  </div>
);

// Form Field Wrapper
const FormField = ({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// Reusable Badge List Component
const BadgeList = ({
  items,
  onRemove,
  label,
  delay = 0.075
}: {
  items: string[];
  onRemove: (item: string) => void;
  label: string;
  delay?: number;
}) => (
  <FormField delay={delay}>
    <Label className="mb-3">{label}</Label>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <motion.div
          key={item}
          className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm flex items-center gap-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          <span>{item}</span>
          <button
            className="text-sm opacity-70 hover:opacity-100 hover:text-destructive transition-colors"
            onClick={() => onRemove(item)}
            type="button"
            aria-label={`Remove ${item}`}
          >
            ×
          </button>
        </motion.div>
      ))}
    </div>
  </FormField>
);

// Info Tooltip Component
const InfoTooltip = ({ title, description }: { title: string; description: string }) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors ml-1"
        aria-label="More information"
      >
        <Info className="h-3 w-3 text-primary" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="max-w-xs sm:max-w-sm md:max-w-md p-4 bg-popover border-border shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Info className="h-4 w-4 text-primary" />
          {title}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
);

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // AI Suggestions State
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [campaignSuggestions, setCampaignSuggestions] = useState<CampaignSuggestion[]>([]);
  const [highlightEmptyFields, setHighlightEmptyFields] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { data: subscription } = useSubscription();

  const { categories: dynamicCategories, isLoading: categoriesLoading } = useCategories();
  const { cities: dynamicCities, isLoading: citiesLoading } = useCities();
  const { niches: dynamicNiches, isLoading: nichesLoading } = useNiches();

  const filteredCategories = dynamicCategories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const userPlan = subscription?.plan || 'free';
  const isPremium = userPlan === 'pro';

  const steps = [
    { icon: FileText, label: 'Basic Info' },
    { icon: Target, label: 'Details' },
    { icon: Users, label: 'Targeting' },
    { icon: Rocket, label: 'Launch' },
  ];

  const DELIVERABLE_OPTIONS = [
    { code: 'POST', label: 'Instagram Post' },
    { code: 'STORY', label: 'Instagram Story' },
    { code: 'REEL', label: 'Instagram Reel' },
    { code: 'VIDEO', label: 'Instagram Video' },
    { code: 'YOUTUBE_VIDEO', label: 'YouTube Video' },
    { code: 'YOUTUBE_SHORTS', label: 'YouTube Shorts' },
    { code: 'MIXED', label: 'Mixed Content' },
  ];
  const codeToLabel = (code: string) => DELIVERABLE_OPTIONS.find(o => o.code === code)?.label || code;
  const labelToCode = (label: string) => DELIVERABLE_OPTIONS.find(o => o.label === label)?.code || label;

  // NICHE_OPTIONS replaced by dynamicNiches from hook
  const nicheOptions = dynamicNiches.map(n => n.name);
  const cityOptions = dynamicCities.map(c => c.name);

  // Badge input limits
  const MAX_CITIES = 15;
  const MAX_NICHES = 10;
  const MAX_HASHTAGS = 20;

  const [deliverables, setDeliverables] = useState<{ type: string; count: number }[]>([]);
  const [targetNiches, setTargetNiches] = useState<string[]>([]);
  const [nicheInput, setNicheInput] = useState('');
  const [showNicheSuggestions, setShowNicheSuggestions] = useState(false);
  const [targetCities, setTargetCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [campaignHashtags, setCampaignHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    objective: 'none',
    budget: '',
    budget_type: 'fixed',
    deliverable_type: '',
    quantity: '',
    post_date: '',
    campaign_type: 'online',
    location: '',
    deadline: '',
    event_date: '',
    target_cities: '',
    target_gender: 'any',
    min_followers: '',
    max_followers: '',
    target_niche: '',
    requirements: '',
    creative_brief_url: '',
    hashtags: '',
    key_messages: '',
    is_private: false,
    contact_email: user?.email || '',
    contact_phone: '',
  });

  // Load saved form data from sessionStorage on mount (persists during prev/next navigation only)
  useEffect(() => {
    const savedData = sessionStorage.getItem('campaign_form_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.targetNiches) setTargetNiches(parsed.targetNiches);
        if (parsed.targetCities) setTargetCities(parsed.targetCities);
        if (parsed.campaignHashtags) setCampaignHashtags(parsed.campaignHashtags);
        if (parsed.deliverables) setDeliverables(parsed.deliverables);
      } catch (e) {
        console.error('Failed to parse saved campaign data:', e);
        toast({
          variant: 'destructive',
          title: 'Could not restore your campaign draft',
          description:
            'Your previously saved campaign draft could not be loaded and has been discarded. Please re-enter your campaign details.',
        });
      }
    }

    // Cleanup: Clear form data when component unmounts (when exiting create campaign section)
    return () => {
      sessionStorage.removeItem('campaign_form_draft');
    };
  }, []);

  // Save form data to sessionStorage (not localStorage) for prev/next navigation only
  useEffect(() => {
    const dataToSave = {
      formData,
      targetNiches,
      targetCities,
      campaignHashtags,
      deliverables,
      timestamp: Date.now()
    };
    sessionStorage.setItem('campaign_form_draft', JSON.stringify(dataToSave));
  }, [formData, targetNiches, targetCities, campaignHashtags, deliverables]);

  // Clear storage on successful submission
  const clearFormDraft = () => {
    localStorage.removeItem('campaign_form_draft');
    sessionStorage.removeItem('campaign_form_draft');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Special handling for contact phone: auto-add '+91 ' prefix when user starts typing
    if (field === 'contact_phone' && typeof value === 'string') {
      let digits = '';

      // If value already has our prefix, extract digits only from AFTER the prefix
      // This prevents re-extracting the "91" from "+91" prefix
      if (value.startsWith('+91 ')) {
        digits = value.slice(4).replace(/\D/g, '');
      } else {
        // Otherwise extract all digits (handles paste scenarios)
        digits = value.replace(/\D/g, '');

        // Remove leading '91' if user pastes a number with country code
        if (digits.startsWith('91') && digits.length > 10) {
          digits = digits.slice(2);
        }
      }

      // Limit to 10 digits
      digits = digits.slice(0, 10);

      // Only add prefix if user has entered at least one digit
      setFormData(prev => ({ ...prev, contact_phone: digits ? `+91 ${digits}` : '' }));
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (s: number) => {
    const validation = validateCampaignStep(s, formData, deliverables);

    // Use structured field errors from validation
    if (!validation.isValid && Object.keys(validation.fieldErrors).length > 0) {
      setFieldErrors(validation.fieldErrors);
      return false;
    }

    // Clear errors if validation passes
    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await campaignsApi.brand.getSuggestions();
      setCampaignSuggestions(suggestions);
      setShowSuggestionsModal(true);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast({
        title: "Couldn't load suggestions",
        description: "There was a problem generating AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const getInputHighlightClass = (value: any, isArray: boolean = false) => {
    if (!highlightEmptyFields) return '';
    const isEmpty = isArray ? (value as any[]).length === 0 : !value;
    return isEmpty ? 'ring-2 ring-primary border-primary bg-primary/10 transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : '';
  };

  const applySuggestion = (suggestion: CampaignSuggestion) => {
    setFormData(prev => ({
      ...prev,
      title: formData.title || suggestion.title, // Only override if empty or keep? Let's just override to make it easy
      description: suggestion.description,
      category: suggestion.category,
      objective: suggestion.objective,
    }));

    // Set the deliverable type
    setDeliverables([{ type: suggestion.deliverable_type, count: 1 }]);
    setShowSuggestionsModal(false);
    setHighlightEmptyFields(true);
    toast({
      title: "Suggestion Applied!",
      description: "We've filled out some basic details. You can tweak them and proceed to the next steps."
    });
  };

  const handleSubmit = async (publishStatus: 'draft' | 'active' = 'active') => {
    if (!user) return toast({ title: "Not Authenticated", description: "Please log in.", variant: "destructive" });

    // Enforce draft status if user is not approved
    const status = (publishStatus === 'active' && !user.is_approved) ? 'draft' : publishStatus;

    // Only check credits when publishing
    if (status === 'active' && user.credits < 1) {
      return toast({ title: "Insufficient Credits", description: "You need at least 1 credit to publish.", variant: "destructive" });
    }

    setIsSubmitting(true);

    try {
      const deliverablesArray: { type: string; count: number }[] = deliverables.length > 0
        ? deliverables.map(d => ({ type: d.type, count: d.count }))
        : (formData.quantity && formData.deliverable_type
          ? [{ type: labelToCode(String(formData.deliverable_type)), count: Number(formData.quantity) }]
          : []);

      if (deliverablesArray.length === 0) {
        toast({
          title: 'Deliverables Required',
          description: 'Please select at least one deliverable type.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const payload: Partial<Campaign> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        objective: formData.objective as any,
        budget: formData.budget ? Number(formData.budget) : 0,
        budget_type: formData.budget_type as any,
        requirements: formData.requirements,
        deliverables_required: deliverablesArray,
        post_date: formData.post_date ? new Date(formData.post_date).toISOString() : undefined,
        campaign_type: formData.campaign_type as any,
        location: formData.location,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : undefined,
        target_cities: targetCities,
        target_gender: formData.target_gender,
        min_followers: formData.min_followers ? Number(formData.min_followers) : undefined,
        max_followers: formData.max_followers ? Number(formData.max_followers) : undefined,
        target_niche: targetNiches.join(', '),
        creative_brief_url: formData.creative_brief_url,
        hashtags: campaignHashtags.join(' '),
        key_messages: formData.key_messages,
        is_private: formData.is_private,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        status: status,
      };

      const createdCampaign = await campaignsApi.brand.create(payload);

      // Only track usage for published campaigns
      if (status === 'active') {
        // Tracked in backend now
      }

      if (publishStatus === 'active' && !user.is_approved) {
        setShowApprovalModal(true);
        clearFormDraft();
        return; // Don't navigate away yet, let model handle it
      }

      toast({
        title: status === 'draft' ? "Draft Saved!" : "Campaign Published!",
        description: status === 'draft'
          ? `Your campaign "${createdCampaign.title}" has been saved as a draft.`
          : `Your campaign "${createdCampaign.title}" is now live.`,
      });

      clearFormDraft();
      navigate('/brand/campaigns', { state: { refresh: true } });
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      const apiError = error?.response?.data as ApiError;

      if (apiError?.limit_reached) {
        if (!isPremium) {
          setShowUpgradePrompt(true);
        }
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Error Creating Campaign",
        description: apiError?.detail || apiError?.error || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 opacity-30" />
        <FloatingOrb
          className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          delay={0}
        />
        <FloatingOrb
          className="absolute bottom-40 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          delay={2}
        />
        <FloatingOrb
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
          delay={4}
        />

        <div className="relative z-10 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  clearFormDraft();
                  navigate('/brand/dashboard');
                }}
                className="mb-6 group hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Megaphone className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-2">
                Create <span className="text-foreground">Campaign</span>
              </h1>
              <p className="text-muted-foreground mb-4">Set up a new campaign for creators to apply to</p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSuggestions}
                  disabled={isGeneratingSuggestions}
                  className="rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                >
                  {isGeneratingSuggestions ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingSuggestions ? "Generating Ideas..." : "Get AI Campaign Suggestions"}
                </Button>
              </motion.div>

              {!isPremium && (
                <motion.div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Crown className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Campaigns this month: <span className="font-semibold text-foreground">0/2</span>
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StepIndicator steps={steps} currentStep={step} />
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border border-border border-border/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div
                      key={step}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring" }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                    >
                      {step === 1 && <FileText className="h-5 w-5 text-primary" />}
                      {step === 2 && <Target className="h-5 w-5 text-primary" />}
                      {step === 3 && <Users className="h-5 w-5 text-primary" />}
                      {step === 4 && <Rocket className="h-5 w-5 text-primary" />}
                    </motion.div>
                    <div>
                      <CardTitle>
                        {step === 1 && 'Basic Information'}
                        {step === 2 && 'Campaign Details'}
                        {step === 3 && 'Influencer Targeting'}
                        {step === 4 && 'Final Details & Launch'}
                      </CardTitle>
                      <CardDescription>
                        {step === 1 && 'Tell us about your campaign'}
                        {step === 2 && 'Define objectives and deliverables'}
                        {step === 3 && 'Specify your target audience'}
                        {step === 4 && 'Review and launch your campaign'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <FormField delay={0.05}>
                          <Label htmlFor="title" className="flex items-center mb-3">
                            <span>Campaign Title *</span>
                            <InfoTooltip
                              title="Campaign Title"
                              description="Give your campaign a clear, catchy title that describes what you're promoting. This is the first thing influencers will see, so make it compelling and specific. Example: 'Summer Fashion Collection Launch' or 'Fitness App Review Campaign'."
                            />
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., Summer Product Launch"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 mb-2 ${getInputHighlightClass(formData.title)}`}
                            required
                          />
                          {fieldErrors.title && (
                            <p className="text-sm text-destructive mt-1.5">{fieldErrors.title}</p>
                          )}
                        </FormField>

                        <FormField delay={0.1}>
                          <Label htmlFor="description" className="flex items-center mb-3">
                            <span>Description *</span>
                            <InfoTooltip
                              title="Campaign Description"
                              description="Provide a detailed overview of your campaign. Include what you're promoting, campaign goals, content expectations, and any special requirements. A thorough description (200+ characters recommended) helps attract the right influencers and results in better applications."
                            />
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your campaign goals and what you're looking for..."
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`border-2 border-border/50 resize-none focus:border-primary bg-background/50 ${getInputHighlightClass(formData.description)}`}
                            required
                          />
                          {fieldErrors.description && (
                            <p className="text-sm text-destructive mt-1.5">{fieldErrors.description}</p>
                          )}
                          {/* Character counter and quality hint */}
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-1.5">
                              {formData.description.length >= CAMPAIGN_VALIDATION.description.min &&
                                formData.description.length < CAMPAIGN_VALIDATION.description.softMin && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                                    Add more detail for better applications
                                  </span>
                                )}
                              {formData.description.length >= CAMPAIGN_VALIDATION.description.softMin && (
                                <span className="text-xs text-green-500 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Great description!
                                </span>
                              )}
                            </div>
                            <span className={`text-xs ${formData.description.length < CAMPAIGN_VALIDATION.description.min
                              ? 'text-destructive'
                              : formData.description.length < CAMPAIGN_VALIDATION.description.softMin
                                ? 'text-yellow-500'
                                : 'text-muted-foreground'
                              }`}>
                              {formData.description.length}/{CAMPAIGN_VALIDATION.description.min} min
                            </span>
                          </div>
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField delay={0.15}>
                            <Label htmlFor="category" className="flex items-center mb-3">
                              <span>Category *</span>
                              <InfoTooltip
                                title="Campaign Category"
                                description="Select the category that best matches your campaign's industry or niche. This helps us match you with relevant influencers who specialize in your field. Choose the most specific category that applies."
                              />
                            </Label>
                            <Select onValueChange={(value) => handleInputChange('category', value)} value={formData.category}>
                              <SelectTrigger className="h-12 border-2 border-border/50 bg-background/50">
                                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="px-2 pb-2">
                                  <Input
                                    placeholder="Search categories..."
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="h-8 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {filteredCategories.length > 0 ? (
                                  filteredCategories.map((cat) => (
                                    <SelectItem key={cat.slug} value={cat.slug}>
                                      {cat.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                    No categories found
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                            {fieldErrors.category && (
                              <p className="text-sm text-destructive mt-1.5">{fieldErrors.category}</p>
                            )}
                          </FormField>

                          <FormField delay={0.2}>
                            <Label htmlFor="objective" className="flex items-center mb-3">
                              <span>Campaign Objective</span>
                              <InfoTooltip
                                title="Campaign Objective"
                                description="What's the main goal of your campaign? Brand Awareness (reach new audiences), Engagement (likes, comments, shares), Sales & Conversions (drive purchases), or UGC (user-generated content). This helps influencers understand your priorities."
                              />
                            </Label>
                            <Select
                              value={formData.objective}
                              onValueChange={(value) => handleInputChange('objective', value)}
                            >
                              <SelectTrigger className="h-12 border-2 border-border/50 bg-background/50">
                                <SelectValue placeholder="Select objective" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Preference</SelectItem>
                                <SelectItem value="awareness">Brand Awareness</SelectItem>
                                <SelectItem value="engagement">Engagement</SelectItem>
                                <SelectItem value="sales">Sales & Conversions</SelectItem>
                                <SelectItem value="ugc">User Generated Content</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField delay={0.25}>
                            <Label htmlFor="budget" className="flex items-center mb-3">
                              <span className="text-primary font-bold mr-2">₹</span>
                              <span>{formData.budget_type === 'barter' ? 'Item Worth *' : 'Budget *'}</span>
                              <InfoTooltip
                                title={formData.budget_type === 'barter' ? "Item Worth" : "Campaign Budget"}
                                description={formData.budget_type === 'barter'
                                  ? "Enter the monetary value of the product or service you are offering in exchange for the collaboration."
                                  : "Enter the total amount you're willing to pay for this campaign in Indian Rupees (₹)."
                                }
                              />
                            </Label>
                            <Input
                              id="budget"
                              type="number"
                              placeholder="5000"
                              value={formData.budget}
                              onChange={(e) => handleInputChange('budget', e.target.value)}
                              className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 ${getInputHighlightClass(formData.budget)}`}
                              required
                            />
                            {fieldErrors.budget && (
                              <p className="text-sm text-destructive mt-1.5">{fieldErrors.budget}</p>
                            )}
                          </FormField>

                          <FormField delay={0.3}>
                            <Label htmlFor="budget_type" className="flex items-center mb-3">
                              <span>Budget Type *</span>
                              <InfoTooltip
                                title="Budget Type"
                                description="Fixed Payment: Pay each influencer the same amount. Product Exchange: Offer your product/service in exchange for promotion. Negotiable: Budget is open to discussion with influencers. Revenue Share: Share a percentage of sales generated."
                              />
                            </Label>
                            <Select
                              value={formData.budget_type}
                              onValueChange={(value) => handleInputChange('budget_type', value)}
                            >
                              <SelectTrigger className="h-12 border-2 border-border/50 bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Payment</SelectItem>
                                <SelectItem value="barter">Barter/Product Exchange</SelectItem>
                                <SelectItem value="negotiable">Negotiable</SelectItem>
                                <SelectItem value="sourcing">Sourcing</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Campaign Details */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <FormField delay={0.05}>
                          <Label className="flex items-center mb-3">
                            <Target className="h-4 w-4 text-primary mr-2" />
                            <span>Deliverable Types *</span>
                            <InfoTooltip
                              title="Deliverable Types"
                              description="Select what type of content you want influencers to create: Instagram Posts, Stories, Reels, YouTube Videos, etc. You can choose multiple types and specify the quantity for each. This helps influencers understand exactly what content you expect."
                            />
                          </Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between bg-background/50">
                                {deliverables.length > 0 ? `${deliverables.length} selected` : 'Select types'}
                                <span className="opacity-60">▾</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-popover">
                              {DELIVERABLE_OPTIONS.map(({ code, label }) => {
                                const checked = !!deliverables.find(d => d.type === code);
                                const currentCount = deliverables.find(d => d.type === code)?.count || 0;
                                return (
                                  <DropdownMenuCheckboxItem
                                    key={code}
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      // Clear deliverables error when user selects
                                      if (fieldErrors.deliverables) {
                                        setFieldErrors(prev => ({ ...prev, deliverables: '' }));
                                      }
                                      setDeliverables(prev => {
                                        const exists = prev.find(d => d.type === code);
                                        if (isChecked) {
                                          if (exists) return prev;
                                          return [...prev, { type: code, count: 1 }];
                                        } else {
                                          return prev.filter(d => d.type !== code);
                                        }
                                      });
                                    }}
                                  >
                                    <span className="flex w-full items-center gap-2">
                                      <span className="flex-1">{label}</span>
                                      {checked && (
                                        <span className="ml-auto flex items-center gap-2">
                                          <button
                                            type="button"
                                            className="px-2 py-0.5 text-sm rounded border hover:bg-accent"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setDeliverables(prev => prev.map(d => d.type === code ? { ...d, count: Math.max(1, d.count - 1) } : d));
                                            }}
                                          >
                                            −
                                          </button>
                                          <span className="text-sm w-5 text-center">{currentCount}</span>
                                          <button
                                            type="button"
                                            className="px-2 py-0.5 text-sm rounded border hover:bg-accent"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setDeliverables(prev => prev.map(d => d.type === code ? { ...d, count: d.count + 1 } : d));
                                            }}
                                          >
                                            +
                                          </button>
                                        </span>
                                      )}
                                    </span>
                                  </DropdownMenuCheckboxItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {fieldErrors.deliverables && (
                            <p className="text-sm text-destructive mt-1.5">{fieldErrors.deliverables}</p>
                          )}
                        </FormField>

                        {deliverables.length > 0 && (
                          <FormField delay={0.1}>
                            <Label className="mb-3">Added Deliverables</Label>
                            <div className="flex flex-wrap gap-2">
                              {deliverables.map((d) => (
                                <motion.div
                                  key={d.type}
                                  className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm flex items-center gap-2"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <span>{d.count}x {codeToLabel(d.type)}</span>
                                  <button
                                    className="text-sm opacity-70 hover:opacity-100 hover:text-destructive transition-colors"
                                    onClick={() => setDeliverables(prev => prev.filter(x => x.type !== d.type))}
                                    type="button"
                                  >
                                    ×
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          </FormField>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField delay={0.15}>
                            <Label htmlFor="deadline" className="flex items-center mb-3">
                              <Calendar className="h-4 w-4 text-primary mr-2" />
                              <span>Deadline *</span>
                              <InfoTooltip
                                title="Campaign Deadline"
                                description="The final date by which all content must be delivered and posted. Give influencers enough time to create quality content - typically 2-4 weeks from campaign start. This deadline helps manage expectations and ensures timely delivery."
                              />
                            </Label>
                            <Input
                              id="deadline"
                              type="date"
                              value={formData.deadline}
                              onChange={(e) => handleInputChange('deadline', e.target.value)}
                              className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 ${getInputHighlightClass(formData.deadline)}`}
                              min={getTodayDate()}
                              required
                            />
                            {fieldErrors.deadline && (
                              <p className="text-sm text-destructive mt-1.5">{fieldErrors.deadline}</p>
                            )}
                          </FormField>
                          <FormField delay={0.2}>
                            <Label htmlFor="post_date" className="flex items-center mb-3">
                              <span>Preferred Post Date</span>
                              {!isPremium && <PremiumBadgeIndicator />}
                              <InfoTooltip
                                title="Preferred Post Date"
                                description="(Premium Feature) Specify an exact date when you want content to go live. This is useful for product launches, events, or coordinated campaigns. Influencers will be asked to post on or around this date."
                              />
                            </Label>
                            <Input
                              id="post_date"
                              type="date"
                              value={formData.post_date}
                              onChange={(e) => handleInputChange('post_date', e.target.value)}
                              className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                              min={getTodayDate()}
                              disabled={!isPremium}
                            />
                          </FormField>
                        </div >

                        <FormField delay={0.25}>
                          <Label htmlFor="campaign_type" className="flex items-center mb-3">
                            <span>Campaign Type *</span>
                            <InfoTooltip
                              title="Campaign Type"
                              description="Online Campaign: Content creation and posting on social media platforms. On-Field Event: In-person event attendance where influencers create content at a physical location. Select based on how influencers will participate."
                            />
                          </Label>
                          <Select
                            value={formData.campaign_type}
                            onValueChange={(value) => handleInputChange('campaign_type', value)}
                          >
                            <SelectTrigger className="h-12 border-2 border-border/50 bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online Campaign</SelectItem>
                              <SelectItem value="onfield">On-Field Event</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>

                        {
                          formData.campaign_type === 'onfield' && (
                            <motion.div
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border/50 rounded-xl bg-muted/30"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                            >
                              <div>
                                <Label htmlFor="location" className="flex items-center mb-3">
                                  <MapPin className="h-4 w-4 text-primary mr-2" />
                                  <span>Event Location *</span>
                                  <InfoTooltip
                                    title="Event Location"
                                    description="Specify the city and venue where the on-field event will take place. Be as specific as possible to help influencers determine if they can attend. Example: 'Mumbai, Phoenix MarketCity' or 'Bangalore, Cubbon Park'."
                                  />
                                </Label>
                                <Input
                                  id="location"
                                  placeholder="City, Venue"
                                  value={formData.location}
                                  onChange={(e) => handleInputChange('location', e.target.value)}
                                  className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 ${getInputHighlightClass(formData.location)}`}
                                  required
                                />
                                {fieldErrors.location && (
                                  <p className="text-sm text-destructive mt-1.5">{fieldErrors.location}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="event_date" className="flex items-center mb-3">
                                  <span>Event Date *</span>
                                  <InfoTooltip
                                    title="Event Date"
                                    description="The date when the on-field event will occur. Influencers need to be available on this specific date to attend and create content at the event location."
                                  />
                                </Label>
                                <Input
                                  id="event_date"
                                  type="date"
                                  value={formData.event_date}
                                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                                  className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 ${getInputHighlightClass(formData.event_date)}`}
                                  min={getTodayDate()}
                                  required
                                />
                                {fieldErrors.event_date && (
                                  <p className="text-sm text-destructive mt-1.5">{fieldErrors.event_date}</p>
                                )}
                              </div>
                            </motion.div>
                          )
                        }

                        <FormField delay={0.3}>
                          <Label htmlFor="requirements" className="flex items-center mb-3">
                            <span>Requirements & Guidelines</span>
                            <InfoTooltip
                              title="Requirements & Guidelines"
                              description="Provide detailed instructions for influencers: content style, dos and don'ts, brand guidelines, mandatory mentions, photo/video specs, caption requirements, etc. Clear guidelines result in better content that aligns with your brand."
                            />
                          </Label>
                          <Textarea
                            id="requirements"
                            placeholder="Describe what you expect from influencers..."
                            rows={4}
                            value={formData.requirements}
                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                            className={`border-2 border-border/50 resize-none focus:border-primary bg-background/50 ${getInputHighlightClass(formData.requirements)}`}
                          />
                        </FormField>
                      </motion.div >
                    )}

                    {/* Step 3: Influencer Targeting */}
                    {
                      step === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <FormField delay={0.05}>
                            <Label className="flex items-center mb-3">
                              <Target className="h-4 w-4 text-primary mr-2" />
                              <span>Target Niche</span>
                              <InfoTooltip
                                title="Target Niche"
                                description="Select specific niches or industries that align with your campaign. This helps match you with influencers who have relevant audiences. You can choose multiple niches like 'Fashion & Style', 'Technology', 'Food & Beverage', etc. Type to search or select from suggestions."
                              />
                            </Label>
                            <div className="relative">
                              <Input
                                placeholder="Type or select niche (press Enter to add)"
                                value={nicheInput}
                                onChange={(e) => {
                                  setNicheInput(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && nicheInput.trim()) {
                                    e.preventDefault();
                                    if (targetNiches.length >= MAX_NICHES) {
                                      toast({
                                        title: 'Maximum Niches Reached',
                                        description: `You can add up to ${MAX_NICHES} target niches.`,
                                        variant: 'destructive'
                                      });
                                      return;
                                    }
                                    if (!targetNiches.includes(nicheInput.trim())) {
                                      setTargetNiches(prev => [...prev, nicheInput.trim()]);
                                    }
                                    setNicheInput('');
                                    setShowNicheSuggestions(false);
                                  }
                                }}
                                onFocus={() => setShowNicheSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowNicheSuggestions(false), 200)}
                                className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                                role="combobox"
                                aria-expanded={showNicheSuggestions}
                                aria-controls="niche-suggestions"
                                aria-autocomplete="list"
                              />
                              {showNicheSuggestions && (
                                <motion.div
                                  id="niche-suggestions"
                                  role="listbox"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                  {nicheOptions
                                    .filter(niche =>
                                      niche.toLowerCase().includes(nicheInput.toLowerCase()) &&
                                      !targetNiches.includes(niche)
                                    )
                                    .map((niche) => (
                                      <button
                                        key={niche}
                                        type="button"
                                        role="option"
                                        aria-selected={targetNiches.includes(niche)}
                                        className="w-full text-left px-4 py-2 hover:bg-accent transition-colors text-sm"
                                        onClick={() => {
                                          if (targetNiches.length >= MAX_NICHES) {
                                            toast({
                                              title: 'Maximum Niches Reached',
                                              description: `You can add up to ${MAX_NICHES} target niches.`,
                                              variant: 'destructive'
                                            });
                                            return;
                                          }
                                          if (!targetNiches.includes(niche)) {
                                            setTargetNiches(prev => [...prev, niche]);
                                          }
                                          setNicheInput('');
                                          setShowNicheSuggestions(false);
                                        }}
                                      >
                                        {niche}
                                      </button>
                                    ))}
                                  {nicheInput.trim() && nicheOptions.filter(niche =>
                                    niche.toLowerCase().includes(nicheInput.toLowerCase()) &&
                                    !targetNiches.includes(niche)
                                  ).length === 0 && (
                                      <div className="px-4 py-2 text-sm text-muted-foreground">
                                        Press Enter to add "{nicheInput}"
                                      </div>
                                    )}
                                  {nicheOptions.filter(niche => !targetNiches.includes(niche)).length === 0 && (
                                    <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                                      All niches selected
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </FormField>

                          {targetNiches.length > 0 && (
                            <BadgeList
                              items={targetNiches}
                              onRemove={(niche) => setTargetNiches(prev => prev.filter(n => n !== niche))}
                              label="Selected Niches"
                              delay={0.075}
                            />
                          )}

                          <FormField delay={0.1}>
                            <Label htmlFor="target_cities" className="flex items-center mb-3">
                              <MapPin className="h-4 w-4 text-primary mr-2" />
                              <span>Target Cities</span>
                              <InfoTooltip
                                title="Target Cities"
                                description="Specify which cities or locations you want to target. This helps find influencers who have followers from these areas or are based in these locations. Add at least one city. Press Enter to add multiple cities. Example: Mumbai, Delhi, Bangalore."
                              />
                            </Label>
                            <div className="relative">
                              <Input
                                id="target_cities"
                                placeholder="Type or select city (press Enter to add)"
                                value={cityInput}
                                onChange={(e) => setCityInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && cityInput.trim()) {
                                    e.preventDefault();
                                    if (targetCities.length >= MAX_CITIES) {
                                      toast({
                                        title: 'Maximum Cities Reached',
                                        description: `You can add up to ${MAX_CITIES} target cities.`,
                                        variant: 'destructive'
                                      });
                                      return;
                                    }
                                    const city = cityInput.trim();
                                    if (!targetCities.includes(city)) {
                                      setTargetCities(prev => [...prev, city]);
                                    }
                                    setCityInput('');
                                    setShowCitySuggestions(false);
                                  }
                                }}
                                onFocus={() => setShowCitySuggestions(true)}
                                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                                className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 ${getInputHighlightClass(targetCities, true)}`}
                              />
                              {showCitySuggestions && (
                                <motion.div
                                  role="listbox"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                  {cityOptions
                                    .filter(city =>
                                      city.toLowerCase().includes(cityInput.toLowerCase()) &&
                                      !targetCities.includes(city)
                                    )
                                    .map((city) => (
                                      <button
                                        key={city}
                                        type="button"
                                        role="option"
                                        className="w-full text-left px-4 py-2 hover:bg-accent transition-colors text-sm"
                                        onClick={() => {
                                          if (targetCities.length >= MAX_CITIES) {
                                            toast({
                                              title: 'Maximum Cities Reached',
                                              description: `You can add up to ${MAX_CITIES} target cities.`,
                                              variant: 'destructive'
                                            });
                                            return;
                                          }
                                          if (!targetCities.includes(city)) {
                                            setTargetCities(prev => [...prev, city]);
                                          }
                                          setCityInput('');
                                          setShowCitySuggestions(false);
                                        }}
                                      >
                                        {city}
                                      </button>
                                    ))}
                                  {cityInput.trim() && cityOptions.filter(city =>
                                    city.toLowerCase().includes(cityInput.toLowerCase()) &&
                                    !targetCities.includes(city)
                                  ).length === 0 && (
                                      <div className="px-4 py-2 text-sm text-muted-foreground">
                                        Press Enter to add "{cityInput}"
                                      </div>
                                    )}
                                </motion.div>
                              )}
                            </div>
                          </FormField>

                          {targetCities.length > 0 && (
                            <BadgeList
                              items={targetCities}
                              onRemove={(city) => setTargetCities(prev => prev.filter(c => c !== city))}
                              label="Selected Cities"
                              delay={0.125}
                            />
                          )}

                          <FormField delay={0.15}>
                            <Label htmlFor="target_gender" className="flex items-center mb-3">
                              <Users className="h-4 w-4 text-primary mr-2" />
                              <span>Target Gender</span>
                              <InfoTooltip
                                title="Target Gender"
                                description="Filter influencers based on the gender of their primary audience. Select 'Any' if your campaign isn't gender-specific. This helps match you with influencers whose followers match your target demographic."
                              />
                            </Label>
                            <Select
                              value={formData.target_gender}
                              onValueChange={(value) => handleInputChange('target_gender', value)}
                            >
                              <SelectTrigger className="h-12 border-2 border-border/50 bg-background/50">
                                <SelectValue placeholder="Any" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField delay={0.2}>
                              <Label htmlFor="min_followers" className="flex items-center mb-3">
                                <span>Min Followers</span>
                                <InfoTooltip
                                  title="Minimum Followers"
                                  description="The minimum number of followers an influencer should have to apply. This helps filter by influencer tier: Nano (1K-10K), Micro (10K-100K), Macro (100K-1M), Mega (1M+). Leave empty for no minimum."
                                />
                              </Label>
                              <Input
                                id="min_followers"
                                type="number"
                                placeholder="10000"
                                value={formData.min_followers}
                                onChange={(e) => handleInputChange('min_followers', e.target.value)}
                                className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                              />
                            </FormField>

                            <FormField delay={0.25}>
                              <Label htmlFor="max_followers" className="flex items-center mb-3">
                                <span>Max Followers</span>
                                <InfoTooltip
                                  title="Maximum Followers"
                                  description="The maximum number of followers an influencer can have to apply. Useful if you want to focus on micro-influencers for better engagement rates or budget considerations. Leave empty for no maximum."
                                />
                              </Label>
                              <Input
                                id="max_followers"
                                type="number"
                                placeholder="100000"
                                value={formData.max_followers}
                                onChange={(e) => handleInputChange('max_followers', e.target.value)}
                                className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                              />
                            </FormField>
                          </div>
                        </motion.div>
                      )
                    }

                    {/* Step 4: Final Details */}
                    {
                      step === 4 && (
                        <motion.div
                          key="step4"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <FormField delay={0.05}>
                            <Label htmlFor="hashtags" className="flex items-center mb-3">
                              <Hash className="h-4 w-4 text-primary mr-2" />
                              <span>Campaign Hashtags</span>
                              <InfoTooltip
                                title="Campaign Hashtags"
                                description="Add hashtags that influencers must include in their posts. Great for tracking campaign reach and engagement. Type each hashtag and press Enter to add (the # symbol is optional). Example: #YourBrand, #ProductLaunch, #Sponsored."
                              />
                            </Label>
                            <Input
                              id="hashtags"
                              placeholder="Type hashtag and press Enter to add (# optional)"
                              value={hashtagInput}
                              onChange={(e) => setHashtagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && hashtagInput.trim()) {
                                  e.preventDefault();

                                  if (campaignHashtags.length >= MAX_HASHTAGS) {
                                    toast({
                                      title: 'Maximum Hashtags Reached',
                                      description: `You can add up to ${MAX_HASHTAGS} hashtags.`,
                                      variant: 'destructive'
                                    });
                                    return;
                                  }

                                  let hashtag = hashtagInput.trim();

                                  // Validate hashtag format
                                  const hashtagPattern = /^[#]?[a-zA-Z0-9_]+$/;
                                  const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;

                                  if (!hashtagPattern.test(`#${cleanHashtag}`)) {
                                    toast({
                                      title: 'Invalid Hashtag',
                                      description: 'Hashtags can only contain letters, numbers, and underscores.',
                                      variant: 'destructive'
                                    });
                                    return;
                                  }

                                  hashtag = `#${cleanHashtag}`;
                                  if (!campaignHashtags.includes(hashtag)) {
                                    setCampaignHashtags(prev => [...prev, hashtag]);
                                  }
                                  setHashtagInput('');
                                }
                              }}
                              className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                            />
                          </FormField>

                          {campaignHashtags.length > 0 && (
                            <BadgeList
                              items={campaignHashtags}
                              onRemove={(hashtag) => setCampaignHashtags(prev => prev.filter(h => h !== hashtag))}
                              label="Added Hashtags"
                              delay={0.075}
                            />
                          )}

                          <FormField delay={0.1}>
                            <Label htmlFor="key_messages" className="flex items-center mb-3">
                              <MessageSquare className="h-4 w-4 text-primary mr-2" />
                              <span>Key Messages</span>
                              {!isPremium && <PremiumBadgeIndicator />}
                              <InfoTooltip
                                title="Key Messages"
                                description="(Premium Feature) Provide specific talking points, phrases, or messages you want influencers to communicate. This ensures consistent messaging across all creators while allowing them to maintain their authentic voice."
                              />
                            </Label>
                            <Textarea
                              id="key_messages"
                              placeholder="Key talking points for influencers..."
                              rows={3}
                              value={formData.key_messages}
                              onChange={(e) => handleInputChange('key_messages', e.target.value)}
                              className="border-2 border-border/50 resize-none focus:border-primary bg-background/50"
                              disabled={!isPremium}
                            />
                          </FormField>

                          <FormField delay={0.15}>
                            <Label htmlFor="creative_brief_url" className="flex items-center mb-3">
                              <FileText className="h-4 w-4 text-primary mr-2" />
                              <span>Creative Brief URL</span>
                              {!isPremium && <PremiumBadgeIndicator />}
                              <InfoTooltip
                                title="Creative Brief URL"
                                description="(Premium Feature) Share a link to your detailed creative brief (Google Drive, Dropbox, etc.). Include brand assets, style guides, sample content, product photos, or any reference materials influencers need to create great content."
                              />
                            </Label>
                            <Input
                              id="creative_brief_url"
                              placeholder="https://drive.google.com/..."
                              value={formData.creative_brief_url}
                              onChange={(e) => handleInputChange('creative_brief_url', e.target.value)}
                              className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                              disabled={!isPremium}
                            />
                          </FormField>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField delay={0.2}>
                              <Label htmlFor="contact_email" className="flex items-center mb-3">
                                <Mail className="h-4 w-4 text-primary mr-2" />
                                <span>Contact Email *</span>
                                <InfoTooltip
                                  title="Contact Email"
                                  description="The email address where influencers can reach you for campaign-related questions, collaboration details, or content approvals. This should be actively monitored during the campaign period."
                                />
                              </Label>
                              <Input
                                id="contact_email"
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                className={`h-12 border-2 border-border/50 focus:border-primary bg-background/50 ${getInputHighlightClass(formData.contact_email)}`}
                                required
                              />
                              {fieldErrors.contact_email && (
                                <p className="text-sm text-destructive mt-1.5">{fieldErrors.contact_email}</p>
                              )}
                            </FormField>

                            <FormField delay={0.25}>
                              <Label htmlFor="contact_phone" className="flex items-center mb-3">
                                <Phone className="h-4 w-4 text-primary mr-2" />
                                <span>Contact Phone</span>
                                <InfoTooltip
                                  title="Contact Phone"
                                  description="Optional phone number for direct communication with influencers. Enter only the 10-digit mobile number - the +91 country code for India is automatically added. Useful for time-sensitive campaigns or if you prefer phone/WhatsApp communication."
                                />
                              </Label>
                              <Input
                                id="contact_phone"
                                placeholder="+91 98765 43210"
                                value={formData.contact_phone}
                                onChange={e => handleInputChange('contact_phone', e.target.value)}
                                className="h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                              />
                            </FormField>
                          </div>

                          <FormField delay={0.35}>
                            <Card className="bg-card border border-border border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                                  >
                                    <Zap className="h-5 w-5 text-primary" />
                                  </motion.div>
                                  <div>
                                    <h4 className="font-medium mb-1">Campaign Cost</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Creating this campaign will cost <span className="text-primary font-semibold">1 credit</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Available credits: <span className="font-semibold">{user?.credits || 0}</span>
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </FormField>
                        </motion.div>
                      )
                    }
                  </AnimatePresence >

                  {/* Navigation Buttons */}
                  < motion.div
                    className="flex justify-between pt-6 border-t border-border/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {step > 1 ? (
                      <Button variant="outline" onClick={handleBack} className="group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}
                    {
                      step < 4 ? (
                        <Button onClick={handleNext} className="bg-primary group">
                          Next
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleSubmit('draft')}
                            className="group"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Save as Draft
                              </>
                            )}
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex-1">
                                  <Button
                                    onClick={() => handleSubmit('active')}
                                    className="w-full bg-primary group"
                                    disabled={isSubmitting || !user?.is_approved}
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Publishing...
                                      </>
                                    ) : (
                                      <>
                                        <Rocket className="mr-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Publish Campaign
                                      </>
                                    )}
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!user?.is_approved && (
                                <TooltipContent>
                                  <p>Your account is pending approval. You can save as draft but cannot publish yet.</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )
                    }
                  </motion.div >
                </CardContent >
              </Card >
            </motion.div >
          </div >
        </div >

        {(!isPremium) && (
          <UpgradePrompt
            open={showUpgradePrompt && !isPremium}
            onClose={() => setShowUpgradePrompt(false)}
            title="Campaign Limit Reached"
            description={`You've reached the 2 campaign limit for ${userPlan} plan.`}
            limitType="campaigns"
            currentPlan={userPlan}
          />
        )}

        {/* Approval Modal */}
        <AlertDialog open={showApprovalModal} onOpenChange={(open) => {
          if (!open) {
            setShowApprovalModal(false);
            navigate('/brand/campaigns');
          }
        }}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Profile Approval Required
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your profile is currently pending approval. As a result, your campaign has been successfully <strong>saved as a draft</strong>.
                <br /><br />
                You will be able to publish campaigns once your profile is fully approved by our team. You can check your profile status and request approval if your profile is complete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => navigate('/brand/profile')}>
                Go to Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AI Suggestions Modal */}
        <Dialog open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Campaign Suggestions
              </DialogTitle>
              <DialogDescription>
                Select a template below to auto-fill your campaign details. You can customize everything before publishing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {campaignSuggestions.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:border-primary/50 cursor-pointer transition-colors group" onClick={() => applySuggestion(suggestion)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{suggestion.title}</CardTitle>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                          {suggestion.objective}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-muted rounded-md tracking-wider font-medium">
                          🎥 {codeToLabel(suggestion.deliverable_type)}
                        </span>
                        <span className="px-2 py-1 bg-muted rounded-md tracking-wider font-medium capitalize">
                          🏷️ {suggestion.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

      </div >
    </TooltipProvider >
  );
};

export default CreateCampaign;
