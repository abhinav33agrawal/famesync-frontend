import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
import { Rise } from '@/components/motion';
import { ApiError, Campaign, CampaignSuggestion } from '@/lib/api/types';
import { campaignsApi } from '@/lib/api/campaigns';
import { useSubscription } from '@/hooks/useSubscription';
import { useBrandCampaigns } from '@/hooks/useCampaigns';
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

// Step Indicator Component
const StepIndicator = ({
  steps,
  currentStep
}: {
  steps: { icon: any; label: string }[];
  currentStep: number;
}) => (
  <ol className="mb-8 flex items-start">
    {steps.map((s, idx) => {
      const stepNum = idx + 1;
      const isActive = currentStep === stepNum;
      const isCompleted = currentStep > stepNum;

      return (
        <li key={idx} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <span
              aria-current={isActive ? 'step' : undefined}
              className={`num flex h-11 w-11 items-center justify-center rounded-lg border text-[0.95rem] transition-colors ${isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : isCompleted
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-border bg-card text-muted-foreground'
                }`}
            >
              {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNum}
            </span>
            <span className={`hidden text-xs md:block ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={`mx-2 mt-[1.375rem] h-px flex-1 sm:mx-3 ${isCompleted ? 'bg-success/40' : 'bg-border'}`}
            />
          )}
        </li>
      );
    })}
  </ol>
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
    <Label className="mb-3 block">{label}</Label>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item}
          className="flex min-h-11 items-center gap-1 rounded-sm bg-muted pl-3.5 pr-0.5 text-sm font-medium"
        >
          <span>{item}</span>
          <button
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-base leading-none text-muted-foreground transition-colors hover:text-destructive"
            onClick={() => onRemove(item)}
            type="button"
            aria-label={`Remove ${item}`}
          >
            ×
          </button>
        </div>
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
        className="-my-3 -mr-3 ml-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        aria-label="More information"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="max-w-xs sm:max-w-sm md:max-w-md rounded-lg border-border bg-popover p-4 shadow-e2">
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

/** A saved campaign's deliverables, in the form's {type, count} shape. Older
 *  rows hold a JSON string or a list of plain labels. */
const toDeliverables = (raw: Campaign['deliverables_required']) => {
  let value: unknown = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      value = value ? [value] : [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.map((d: string | { type?: unknown; count?: unknown }) =>
    typeof d === 'string' ? { type: d, count: 1 } : { type: String(d.type), count: Number(d.count) || 1 }
  );
};

/** The most useful message in an API error body: ours ({error}), DRF's
 *  ({detail}), or the first field error of a validation response. */
const firstApiError = (data: unknown): string => {
  if (!data || typeof data !== 'object') return 'Something went wrong.';
  const body = data as Record<string, unknown>;
  if (typeof body.error === 'string') return body.error;
  if (typeof body.detail === 'string') return body.detail;
  for (const [field, messages] of Object.entries(body)) {
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (typeof message === 'string') return `${formatFieldName(field)}: ${message}`;
  }
  return 'Something went wrong.';
};

const formatFieldName = (field: string) =>
  field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** "5 minutes" until a just-published campaign appears to creators. */
const goLiveMinutes = (liveAt?: string | null) => {
  const mins = liveAt ? Math.max(1, Math.ceil((new Date(liveAt).getTime() - Date.now()) / 60000)) : 5;
  return `${mins} minute${mins === 1 ? '' : 's'}`;
};

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Opened at /brand/campaigns/:slug/edit, this same form edits an existing
  // campaign: a draft, or a published one still inside its 5-minute window.
  const { slug: editSlug } = useParams<{ slug: string }>();
  const isEdit = !!editSlug;
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [editState, setEditState] = useState<'loading' | 'ready' | 'locked' | 'error'>('loading');
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
  const { data: myCampaigns = [] } = useBrandCampaigns();

  /* Mirrors the API's limit (campaigns/views.py): active campaigns created
     since the 1st count against SUBSCRIPTION_PLANS.brand.free
     .campaigns_per_month. The chip used to be a hard-coded "0/2". */
  const FREE_CAMPAIGNS_PER_MONTH = 3;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const campaignsThisMonth = myCampaigns.filter(
    (c) => c.status === 'active' && new Date(c.created_at) >= monthStart
  ).length;

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
    if (isEdit) return;
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
  }, [isEdit]);

  // Save form data to sessionStorage (not localStorage) for prev/next navigation only
  useEffect(() => {
    if (isEdit) return;
    const dataToSave = {
      formData,
      targetNiches,
      targetCities,
      campaignHashtags,
      deliverables,
      timestamp: Date.now()
    };
    sessionStorage.setItem('campaign_form_draft', JSON.stringify(dataToSave));
  }, [isEdit, formData, targetNiches, targetCities, campaignHashtags, deliverables]);

  // Fetched fresh rather than from the query cache: whether it is still
  // editable is time-sensitive.
  useEffect(() => {
    if (!editSlug) return;
    let cancelled = false;
    campaignsApi.brand.get(editSlug)
      .then((c) => {
        if (cancelled) return;
        setEditTarget(c);
        if (!c.is_editable) {
          setEditState('locked');
          return;
        }
        setFormData(prev => ({
          ...prev,
          title: c.title || '',
          description: c.description || '',
          category: c.category || '',
          objective: c.objective || 'none',
          budget: c.budget != null ? String(Number(c.budget)) : '',
          budget_type: c.budget_type || 'fixed',
          post_date: c.post_date ? c.post_date.slice(0, 10) : '',
          campaign_type: c.campaign_type || 'online',
          location: c.location || '',
          deadline: c.deadline || '',
          event_date: c.event_date ? c.event_date.slice(0, 10) : '',
          target_gender: c.target_gender || 'any',
          min_followers: c.min_followers != null ? String(c.min_followers) : '',
          max_followers: c.max_followers != null ? String(c.max_followers) : '',
          requirements: c.requirements || '',
          creative_brief_url: c.creative_brief_url || '',
          key_messages: c.key_messages || '',
          is_private: !!c.is_private,
          contact_email: c.contact_email || '',
          contact_phone: c.contact_phone || '',
        }));
        setDeliverables(toDeliverables(c.deliverables_required));
        setTargetNiches((c.target_niche || '').split(',').map(n => n.trim()).filter(Boolean));
        setTargetCities(c.target_cities || []);
        setCampaignHashtags((c.hashtags || '').split(/\s+/).filter(Boolean));
        setEditState('ready');
      })
      .catch(() => {
        if (!cancelled) setEditState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [editSlug]);

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
    return isEmpty ? 'border-primary ring-[3px] ring-primary/[0.12] transition-colors' : '';
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

  /** The form's fields as the API expects them -- shared by create and edit. */
  const campaignFields = (deliverablesArray: { type: string; count: number }[]): Partial<Campaign> => ({
    title: formData.title,
    description: formData.description,
    category: formData.category,
    objective: formData.objective as Campaign['objective'],
    budget: formData.budget ? Number(formData.budget) : 0,
    budget_type: formData.budget_type as Campaign['budget_type'],
    requirements: formData.requirements,
    deliverables_required: deliverablesArray,
    deadline: formData.deadline || null,
    post_date: formData.post_date ? new Date(formData.post_date).toISOString() : undefined,
    campaign_type: formData.campaign_type as Campaign['campaign_type'],
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
  });

  const handleSaveEdit = async () => {
    if (!editSlug) return;
    // Every step is reachable from the Save button, so check them all and
    // jump to the first one that needs attention.
    for (const s of [1, 2, 4]) {
      const validation = validateCampaignStep(s, formData, deliverables);
      if (!validation.isValid) {
        setFieldErrors(validation.fieldErrors);
        setStep(s);
        return;
      }
    }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await campaignsApi.brand.update(editSlug, campaignFields(deliverables));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaign', 'brand', editSlug] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns', 'brand'] }),
      ]);
      toast({ title: 'Changes saved', description: `"${formData.title}" has been updated.` });
      navigate(`/brand/campaigns/${editSlug}`);
    } catch (error) {
      const data = (error as { response?: { data?: { edit_locked?: boolean; error?: string } } })?.response?.data;
      if (data?.edit_locked) {
        toast({ title: 'This campaign is now live', description: data.error, variant: 'destructive' });
        await queryClient.invalidateQueries({ queryKey: ['campaign', 'brand', editSlug] });
        navigate(`/brand/campaigns/${editSlug}`);
        return;
      }
      toast({ title: "Couldn't save changes", description: firstApiError(data), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
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
        ...campaignFields(deliverablesArray),
        status: status,
      };

      const createdCampaign = await campaignsApi.brand.create(payload);
      // Publishing spends a credit; this page calls the API directly, so the
      // navbar's balance (the ['user'] query) stayed stale until next sign-in.
      for (const key of [['user'], ['subscription'], ['credit-usage'], ['campaigns', 'brand']]) {
        void queryClient.invalidateQueries({ queryKey: key });
      }

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
        /* Creators can't see a published campaign until live_at (publish + 5
           minutes, the edit window), so "is now live" was wrong. */
        description: status === 'draft'
          ? `Your campaign "${createdCampaign.title}" has been saved as a draft.`
          : `"${createdCampaign.title}" goes live for creators in ${goLiveMinutes(createdCampaign.live_at)}. You can still edit it until then.`,
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

  if (isEdit && editState !== 'ready') {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="max-w-md p-8 text-center">
          {editState === 'loading' ? (
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" aria-label="Loading campaign" />
          ) : (
            <>
              <span className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                {editState === 'locked' ? <Lock className="size-6" /> : <FileText className="size-6" />}
              </span>
              <h1 className="mb-2 font-display text-display-3">
                {editState === 'locked' ? 'This campaign is live' : 'Campaign not found'}
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                {editState === 'locked'
                  ? 'Published campaigns can only be edited in the first 5 minutes, before creators can see them.'
                  : 'This campaign may have been deleted or the link is wrong.'}
              </p>
              <Button
                variant="form"
                onClick={() => navigate(editTarget ? `/brand/campaigns/${editTarget.slug}` : '/brand/campaigns')}
              >
                <ArrowLeft />
                {editTarget ? 'Back to campaign' : 'Back to campaigns'}
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-3xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => {
                if (isEdit) {
                  navigate(`/brand/campaigns/${editSlug}`);
                  return;
                }
                clearFormDraft();
                navigate('/brand/dashboard');
              }}
              className="-ml-3 mb-6"
            >
              <ArrowLeft />
              {isEdit ? 'Back to campaign' : 'Back to dashboard'}
            </Button>

            {/* Header */}
            <Rise className="mb-9">
              <p className="eyebrow mb-3">{isEdit ? 'Editing' : 'New brief'}</p>
              <h1 className="font-display text-display-2">{isEdit ? 'Edit campaign.' : 'Create campaign.'}</h1>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">
                {!isEdit
                  ? 'Set up a new campaign for creators to apply to.'
                  : editTarget?.status === 'active' && editTarget.live_at
                    ? `Creators can't see this campaign yet. You can save changes until it goes live at ${new Date(editTarget.live_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                    : 'Changes are saved to your draft. Publish it from the campaign page when it is ready.'}
              </p>

              {!isEdit && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateSuggestions}
                  disabled={isGeneratingSuggestions}
                >
                  {isGeneratingSuggestions ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  {isGeneratingSuggestions ? "Generating ideas…" : "Get AI suggestions"}
                </Button>

                {!isPremium && (
                  <p className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground">
                    <Crown className="h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Campaigns this month{' '}
                      <span className="num text-foreground">
                        {campaignsThisMonth}/{FREE_CAMPAIGNS_PER_MONTH}
                      </span>
                    </span>
                  </p>
                )}
              </div>
              )}
            </Rise>

            {/* Progress Steps */}
            <StepIndicator steps={steps} currentStep={step} />

            {/* Form Card */}
            <Card className="rounded-2xl shadow-e1">
              <CardHeader>
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    {step === 1 && <FileText className="h-5 w-5" />}
                    {step === 2 && <Target className="h-5 w-5" />}
                    {step === 3 && <Users className="h-5 w-5" />}
                    {step === 4 && <Rocket className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="eyebrow mb-1.5">
                      Step <span className="num">{step}</span> of <span className="num">4</span>
                    </p>
                    <CardTitle>
                      {step === 1 && 'Basic information'}
                      {step === 2 && 'Campaign details'}
                      {step === 3 && 'Influencer targeting'}
                      {step === 4 && 'Final details & launch'}
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
              <CardContent className="space-y-6">
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
                          className={`mb-2 ${getInputHighlightClass(formData.title)}`}
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
                          className={getInputHighlightClass(formData.description)}
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
                                  <Lightbulb className="h-3 w-3 text-warning" />
                                  Add more detail for better applications
                                </span>
                              )}
                            {formData.description.length >= CAMPAIGN_VALIDATION.description.softMin && (
                              <span className="flex items-center gap-1 text-xs text-success">
                                <CheckCircle className="h-3 w-3" />
                                Great description!
                              </span>
                            )}
                          </div>
                          <span className={`num text-xs ${formData.description.length < CAMPAIGN_VALIDATION.description.min
                            ? 'text-destructive'
                            : formData.description.length < CAMPAIGN_VALIDATION.description.softMin
                              ? 'text-warning'
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
                            <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
                              <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 pb-2">
                                <Input
                                  placeholder="Search categories..."
                                  value={categorySearch}
                                  onChange={(e) => setCategorySearch(e.target.value)}
                                  className="h-10 text-sm"
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
                            <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
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
                            <span className="num mr-2 text-primary">₹</span>
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
                            className={`num ${getInputHighlightClass(formData.budget)}`}
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
                            <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
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
                            <Button variant="outline" className="w-full justify-between px-4 font-normal">
                              {deliverables.length > 0 ? `${deliverables.length} selected` : 'Select types'}
                              <span className="text-muted-foreground">▾</span>
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
                                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeliverables(prev => prev.map(d => d.type === code ? { ...d, count: Math.max(1, d.count - 1) } : d));
                                          }}
                                        >
                                          −
                                        </button>
                                        <span className="num w-5 text-center text-sm">{currentCount}</span>
                                        <button
                                          type="button"
                                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
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
                          <Label className="mb-3 block">Added Deliverables</Label>
                          <div className="flex flex-wrap gap-2">
                            {deliverables.map((d) => (
                              <div
                                key={d.type}
                                className="flex min-h-11 items-center gap-1 rounded-sm bg-muted pl-3.5 pr-0.5 text-sm font-medium"
                              >
                                <span className="num">{d.count}</span>
                                <span>× {codeToLabel(d.type)}</span>
                                <button
                                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-base leading-none text-muted-foreground transition-colors hover:text-destructive"
                                  onClick={() => setDeliverables(prev => prev.filter(x => x.type !== d.type))}
                                  type="button"
                                  aria-label={`Remove ${codeToLabel(d.type)}`}
                                >
                                  ×
                                </button>
                              </div>
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
                            className={getInputHighlightClass(formData.deadline)}
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
                            min={getTodayDate()}
                            disabled={!isPremium}
                          />
                        </FormField>
                      </div>

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
                          <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
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
                            className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/50 p-4 md:grid-cols-2"
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
                                className={getInputHighlightClass(formData.location)}
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
                                className={getInputHighlightClass(formData.event_date)}
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
                          className={getInputHighlightClass(formData.requirements)}
                        />
                      </FormField>
                    </motion.div>
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
                                className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-e2"
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
                                      className="flex min-h-11 w-full items-center px-4 text-left text-sm transition-colors hover:bg-muted"
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
                              className={getInputHighlightClass(targetCities, true)}
                            />
                            {showCitySuggestions && (
                              <motion.div
                                role="listbox"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-e2"
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
                                      className="flex min-h-11 w-full items-center px-4 text-left text-sm transition-colors hover:bg-muted"
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
                            <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
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
                              className="num"
                              value={formData.min_followers}
                              onChange={(e) => handleInputChange('min_followers', e.target.value)}
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
                              className="num"
                              value={formData.max_followers}
                              onChange={(e) => handleInputChange('max_followers', e.target.value)}
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
                              className={getInputHighlightClass(formData.contact_email)}
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
                            />
                          </FormField>
                        </div>

                        {!isEdit && (
                        <FormField delay={0.35}>
                          <Card intent="tinted" className="p-5">
                            <div className="flex items-start gap-3.5">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                                <Zap className="h-5 w-5" />
                              </span>
                              <div className="min-w-0">
                                <p className="eyebrow mb-1.5 text-secondary-foreground/70">Cost</p>
                                <h4 className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
                                  Publishing costs <span className="num">1</span> credit
                                </h4>
                                <p className="mt-1.5 text-sm text-secondary-foreground/80">
                                  Available credits{' '}
                                  <span className="num text-secondary-foreground">{user?.credits || 0}</span>
                                </p>
                              </div>
                            </div>
                          </Card>
                        </FormField>
                        )}
                      </motion.div>
                    )
                  }
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft />
                      Back
                    </Button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                  {isEdit ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {step < 4 && (
                        <Button variant="outline" onClick={handleNext}>
                          Next
                          <ArrowRight />
                        </Button>
                      )}
                      <Button variant="form" onClick={handleSaveEdit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <CheckCircle />
                            Save changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) :
                    step < 4 ? (
                      <Button variant="form" onClick={handleNext}>
                        Next
                        <ArrowRight />
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          variant="outline"
                          onClick={() => handleSubmit('draft')}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin" />
                              Saving…
                            </>
                          ) : (
                            <>
                              <FileText />
                              Save as draft
                            </>
                          )}
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex-1">
                                <Button
                                  variant="form"
                                  onClick={() => handleSubmit('active')}
                                  className="w-full"
                                  disabled={isSubmitting || !user?.is_approved}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="animate-spin" />
                                      Publishing…
                                    </>
                                  ) : (
                                    <>
                                      <Rocket />
                                      Publish campaign
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
              <AlertDialogTitle className="flex items-center gap-2 font-display">
                <AlertCircle className="h-5 w-5 text-warning" />
                Profile Approval Required
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your profile is currently pending approval. As a result, your campaign has been successfully <strong>saved as a draft</strong>.
                <br /><br />
                You will be able to publish campaigns once your profile is fully approved by our team. You can check your profile status and request approval if your profile is complete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="rounded-lg" onClick={() => navigate('/brand/profile')}>
                Go to Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AI Suggestions Modal */}
        <Dialog open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-display-3">
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
                  <Card intent="interactive" className="shadow-e1" onClick={() => applySuggestion(suggestion)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle>{suggestion.title}</CardTitle>
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-secondary-foreground">
                          {suggestion.objective}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{suggestion.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium">
                          {codeToLabel(suggestion.deliverable_type)}
                        </span>
                        <span className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                          {suggestion.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
};

export default CreateCampaign;
