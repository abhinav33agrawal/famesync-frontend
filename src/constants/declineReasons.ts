// Decline reason codes and labels for brand-to-influencer rejection
// Designed to be neutral, non-personal, and confidence-safe

export const DECLINE_REASONS = {
  // Code -> Display label (what brand sees)
  audience_mismatch: {
    code: 'audience_mismatch',
    label: 'Audience demographics didn\'t align',
    description: 'Their followers don\'t match your target audience',
  },
  content_style: {
    code: 'content_style',
    label: 'Content style wasn\'t the right fit',
    description: 'Their content aesthetic differs from campaign needs',
  },
  budget_constraints: {
    code: 'budget_constraints',
    label: 'Budget constraints',
    description: 'Budget limitations for this campaign',
  },
  timing_availability: {
    code: 'timing_availability',
    label: 'Timing or availability issues',
    description: 'Schedule conflicts or timeline concerns',
  },
  campaign_filled: {
    code: 'campaign_filled',
    label: 'Campaign positions already filled',
    description: 'Already selected enough influencers',
  },
  different_direction: {
    code: 'different_direction',
    label: 'Going in a different direction',
    description: 'Campaign strategy changed',
  },
  no_reason: {
    code: 'no_reason',
    label: 'Prefer not to specify',
    description: 'Skip providing a reason',
  },
} as const;

export type DeclineReasonCode = keyof typeof DECLINE_REASONS;

// Get all decline reasons as array for dropdowns
export const getDeclineReasonOptions = () => 
  Object.values(DECLINE_REASONS).map(reason => ({
    value: reason.code,
    label: reason.label,
    description: reason.description,
  }));

// Influencer-facing message templates (polite, confidence-safe)
// These are what the influencer sees - never the raw reason
export const INFLUENCER_MESSAGES: Record<DeclineReasonCode, string> = {
  audience_mismatch: 
    "Thank you for your interest! After careful consideration, we've decided to go with creators whose audience demographics more closely match our target market for this specific campaign. We encourage you to apply to other campaigns that might be a better fit!",
  
  content_style: 
    "We appreciate your application! For this particular campaign, we're looking for a slightly different content style. Your work is great – it's just not the right match for this project. Keep creating and applying!",
  
  budget_constraints: 
    "Thank you for applying! Unfortunately, budget limitations for this campaign mean we can't move forward at this time. We hope to work together on future opportunities!",
  
  timing_availability: 
    "We appreciate your interest! Due to scheduling considerations, we won't be able to proceed with your application for this campaign. We'd love to see you apply to upcoming campaigns!",
  
  campaign_filled: 
    "Thank you for your application! We received many great submissions and have already filled all available positions for this campaign. Please keep an eye out for our future campaigns!",
  
  different_direction: 
    "We appreciate your interest in our campaign! After reviewing all applications, we've decided to take the campaign in a different creative direction. Thank you for applying!",
  
  no_reason: 
    "Thank you for your interest in this campaign! After reviewing all applications, we've decided to move forward with other creators for this project. We encourage you to keep applying to campaigns that match your profile!",
};

// Short notification message (for in-app notifications)
export const getShortNotificationMessage = (
  campaignTitle: string, 
  reasonCode?: DeclineReasonCode
): string => {
  const baseMessage = `Your application for "${campaignTitle}" was not selected this time.`;
  
  // Add a soft hint based on reason (optional, non-specific)
  const hints: Partial<Record<DeclineReasonCode, string>> = {
    campaign_filled: ' The campaign filled up quickly!',
    budget_constraints: ' Keep applying to find the right fit!',
  };
  
  const hint = reasonCode ? (hints[reasonCode] || ' Keep trying!') : ' Keep trying!';
  
  return baseMessage + hint;
};

// Email subject line
export const getDeclineEmailSubject = (campaignTitle: string): string => 
  `Update on your application for "${campaignTitle}"`;

// Analytics-friendly data structure
export interface DeclineAnalytics {
  application_id: number;
  campaign_id: number;
  influencer_id: number;
  brand_id: number;
  reason_code: DeclineReasonCode | null;
  declined_at: string;
}
