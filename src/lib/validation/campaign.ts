import { z } from 'zod';

// Validation thresholds - easily configurable
export const CAMPAIGN_VALIDATION = {
  title: {
    min: 5,
    max: 100,
  },
  description: {
    min: 20,
    max: 5000,
    softMin: 100, // Warning threshold for better quality
  },
  requirements: {
    min: 20,
    max: 2000,
  },
  budget: {
    min: 1, // Minimum budget of 1
    max: 10000000,
  },
  deliverables: {
    min: 1,
    max: 10,
  },
} as const;

// Friendly error messages - non-technical, helpful tone
export const CAMPAIGN_MESSAGES = {
  title: {
    required: "Give your campaign a catchy title so influencers know what it's about!",
    tooShort: `Your title needs at least ${CAMPAIGN_VALIDATION.title.min} characters to stand out.`,
    tooLong: `Keep your title under ${CAMPAIGN_VALIDATION.title.max} characters for better readability.`,
  },
  description: {
    required: "Tell influencers about your campaign vision!",
    tooShort: `Add a bit more detail (at least ${CAMPAIGN_VALIDATION.description.min} characters) so influencers can understand your vision clearly.`,
    tooLong: "That's quite detailed! Consider trimming it down for easier reading.",
    qualityHint: "💡 Pro tip: Campaigns with detailed descriptions (100+ characters) get 3x more quality applications!",
  },
  category: {
    required: "Pick a category to help influencers find your campaign.",
  },
  objective: {
    required: "What's your main goal? This helps influencers tailor their pitch.",
  },
  budget: {
    required: "Let influencers know your budget - even 'negotiable' works!",
    invalid: `Please enter a significant budget amount (at least ${CAMPAIGN_VALIDATION.budget.min}).`,
    budgetTypeRequired: "Is your budget fixed, a range, or negotiable?",
  },
  deliverables: {
    required: "What content do you need? Add at least one deliverable (e.g., 1 Instagram Post).",
    tooMany: "That's a lot of deliverables! Consider splitting into multiple campaigns for better results.",
  },
  location: {
    required: "Where's the event happening?",
  },
  eventDate: {
    required: "When is the event taking place?",
    pastDate: "The event date should be in the future.",
  },
  contactEmail: {
    required: "Add your contact email so accepted influencers can reach you.",
    invalid: "Please enter a valid email address.",
  },
  requirements: {
    tooShort: "Add a few more details about your requirements to help influencers prepare.",
  },
} as const;

// Zod schema for campaign validation
export const campaignBasicsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, CAMPAIGN_MESSAGES.title.required)
    .min(CAMPAIGN_VALIDATION.title.min, CAMPAIGN_MESSAGES.title.tooShort)
    .max(CAMPAIGN_VALIDATION.title.max, CAMPAIGN_MESSAGES.title.tooLong),
  description: z
    .string()
    .trim()
    .min(1, CAMPAIGN_MESSAGES.description.required)
    .min(CAMPAIGN_VALIDATION.description.min, CAMPAIGN_MESSAGES.description.tooShort)
    .max(CAMPAIGN_VALIDATION.description.max, CAMPAIGN_MESSAGES.description.tooLong),
  category: z
    .string()
    .min(1, CAMPAIGN_MESSAGES.category.required),
  objective: z
    .string()
    .optional(),
  budget: z
    .string()
    .min(1, CAMPAIGN_MESSAGES.budget.required)
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= CAMPAIGN_VALIDATION.budget.min,
      CAMPAIGN_MESSAGES.budget.invalid
    ),
  budget_type: z
    .string()
    .min(1, CAMPAIGN_MESSAGES.budget.budgetTypeRequired),
});

export const campaignDeliverablesSchema = z.object({
  deliverables: z
    .array(z.object({
      type: z.string(),
      count: z.number().min(1),
    }))
    .min(CAMPAIGN_VALIDATION.deliverables.min, CAMPAIGN_MESSAGES.deliverables.required)
    .max(CAMPAIGN_VALIDATION.deliverables.max, CAMPAIGN_MESSAGES.deliverables.tooMany),
  campaign_type: z.enum(['online', 'onfield']),
  location: z.string().optional(),
  event_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.campaign_type === 'onfield') {
      return data.location && data.location.trim().length > 0;
    }
    return true;
  },
  { message: CAMPAIGN_MESSAGES.location.required, path: ['location'] }
).refine(
  (data) => {
    if (data.campaign_type === 'onfield') {
      return data.event_date && data.event_date.trim().length > 0;
    }
    return true;
  },
  { message: CAMPAIGN_MESSAGES.eventDate.required, path: ['event_date'] }
);

export const campaignContactSchema = z.object({
  contact_email: z
    .string()
    .trim()
    .min(1, CAMPAIGN_MESSAGES.contactEmail.required)
    .email(CAMPAIGN_MESSAGES.contactEmail.invalid),
  contact_phone: z.string().optional(),
});

// Helper to check description quality (soft validation - shows tip, doesn't block)
export const checkDescriptionQuality = (description: string): { 
  isGood: boolean; 
  hint?: string;
} => {
  const length = description.trim().length;
  
  if (length < CAMPAIGN_VALIDATION.description.softMin) {
    return {
      isGood: false,
      hint: CAMPAIGN_MESSAGES.description.qualityHint,
    };
  }
  
  return { isGood: true };
};

// Validate step and return errors
export const validateCampaignStep = (
  step: number,
  formData: Record<string, any>,
  deliverables: { type: string; count: number }[]
): { isValid: boolean; errors: string[]; warnings: string[]; fieldErrors: Record<string, string> } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Record<string, string> = {};

  if (step === 1) {
    // Validate basics
    const result = campaignBasicsSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
        errors.push(issue.message);
      });
    }
    
    // Check quality (soft validation)
    if (formData.description) {
      const quality = checkDescriptionQuality(formData.description);
      if (!quality.isGood && quality.hint) {
        warnings.push(quality.hint);
      }
    }
  }

  if (step === 2) {
    // Validate deliverables
    const result = campaignDeliverablesSchema.safeParse({
      deliverables,
      campaign_type: formData.campaign_type,
      location: formData.location,
      event_date: formData.event_date,
    });
    if (!result.success) {
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
        errors.push(issue.message);
      });
    }
    
  }

  if (step === 4) {
    // Validate contact
    const result = campaignContactSchema.safeParse({
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
    });
    if (!result.success) {
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
        errors.push(issue.message);
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldErrors,
  };
};
