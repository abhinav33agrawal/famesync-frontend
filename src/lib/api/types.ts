// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'influencer' | 'brand';
  credits: number;
  created_at: string;
  subscription_plan?: 'free' | 'pro';
  has_profile?: boolean;
  email_verified?: boolean;
  is_approved?: boolean;
  is_new_member?: boolean;
  /** False for accounts created via Instagram or Google that never set one. */
  has_usable_password?: boolean;
  instagram_connected?: boolean;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Niche {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  slug: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: 'influencer' | 'brand';
}

// Profile Types
export interface SocialUrlEntry {
  platform: string;
  link: string;
  followers?: number | null;
  verified?: boolean;
  synced_at?: string | null;
}

export interface InfluencerProfile {
  id: string;
  user: User;
  profile_picture?: string;
  bio: string;
  niche: string;
  category: string;
  instagram_handle: string;
  phone_number?: string;
  follower_count: number; // Computed from social_urls total
  social_urls?: SocialUrlEntry[];
  instagram_data?: any;
  location?: string;
  engagement_rate?: number;
  profile_completion?: number;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  user: User;
  profile_picture?: string;
  company_name: string;
  website?: string;
  industry: string;
  description: string;
  phone_number?: string;
  logo?: string;
  profile_completion?: number;
  social_urls?: { platform: string; link: string }[];
  created_at: string;
  updated_at: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  slug: string;
  brand: User;
  brand_profile?: BrandProfile;
  title: string;
  description: string;
  category: string;
  objective?: 'awareness' | 'engagement' | 'sales' | 'ugc' | 'other';
  budget: number | null;
  budget_type?: 'fixed' | 'barter' | 'negotiable' | 'sourcing';
  requirements: string;
  deliverables_required: string | string[] | { type: string; count: number }[];
  post_date?: string;
  /** "YYYY-MM-DD": content must be posted by this date. */
  deadline?: string | null;

  // Campaign type and location
  campaign_type?: 'online' | 'onfield';
  location?: string;
  event_date?: string;

  // Influencer filters
  target_cities?: string[];
  target_gender?: string;
  min_followers?: number;
  max_followers?: number;
  target_niche?: string;

  // Premium fields
  creative_brief_url?: string;
  hashtags?: string;
  key_messages?: string;
  is_private?: boolean;

  // Contact
  contact_email?: string;
  contact_phone?: string;

  // mirrors Campaign.STATUS_CHOICES in campaigns/models.py
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  /** When influencers can first see it (publish + 5 min). Null while a draft. */
  live_at?: string | null;
  /** Server's verdict: a draft, or published and still inside the edit window. */
  is_editable?: boolean;
  applications_count?: number;
  has_applied?: boolean;
  /** Creator views only. False until the creator spends a credit to unlock
   *  it (or applied before unlocks existed); while false the server sends
   *  no brand, budget, contacts, creative brief or key messages. */
  is_unlocked?: boolean;
  applications?: Application[];
}

/** POST /campaigns/influencer/<slug>/unlock/ — the full brief, plus whether
 *  this call spent a credit (false when it was already unlocked). */
export type CampaignUnlockResponse = Campaign & {
  charged: boolean;
  credits_remaining: number;
};

export interface CampaignSuggestion {
  title: string;
  description: string;
  category: string;
  objective: 'awareness' | 'engagement' | 'sales' | 'ugc' | 'other';
  deliverable_type: string;
}

export interface Application {
  id: string;
  influencer: User;
  influencer_profile?: InfluencerProfile;
  campaign: Campaign;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  campaign: string;
  message: string;
}

// Deliverable Types
export interface Deliverable {
  id: string;
  application: Application;
  // mirrors deliverables.models.Deliverable.DELIVERABLE_TYPE / STATUS_CHOICES
  deliverable_type: 'post' | 'story' | 'reel' | 'video' | 'youtube_video' | 'youtube_shorts' | 'mixed';
  link: string;
  description?: string;
  file?: string;
  status: 'pending' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface DeliverableCreate {
  application: string;
  deliverable_type: Deliverable['deliverable_type'];
  link: string;
  description?: string;
  file?: File;
}

// Subscription Types
export interface Subscription {
  id: string;
  user: User;
  plan: 'free' | 'pro';
  credit_limit: number;
  start_date: string;
  renewal_date: string;
}

export interface UsageTracker {
  id: string;
  user: User;
  action: string;
  credits_used: number;
  timestamp: string;
  details?: string;
}

// Payment Types
export interface RazorpayCreateResponse {
  subscription_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  key_id: string;
}

export interface StripeCreateResponse {
  url: string;
  session_id: string;
}

export type CreatePaymentResponse = RazorpayCreateResponse | StripeCreateResponse;

export interface VerifyPaymentPayload {
  gateway: 'stripe' | 'razorpay';
  session_id?: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

// Dashboard Stats Types
export interface InfluencerDashboardStats {
  profile: InfluencerProfile;
  stats: {
    total_applications: number;
    accepted_applications: number;
    pending_applications: number;
  };
}

export interface BrandDashboardStats {
  profile: BrandProfile;
  stats: {
    total_campaigns: number;
    active_campaigns: number;
    total_applications: number;
    pending_applications: number;
  };
  /** Newest first, max 5. Names and status only -- no contact details. */
  recent_applications?: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    applied_at: string;
    influencer: { username: string; first_name: string; last_name: string };
    campaign: { title: string; slug: string };
  }[];
}

// API Error Type
export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: any;
}

// Configuration Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: 'free' | 'pro';
  price_monthly: number; // decimal from backend comes as string or number depending on serializer settings, usually string if DecimalField, but let's assume number or we handle it
  price_yearly: number;
  description: string;
  features: string[];
  credits_influencer: number;
  credits_brand: number;
  is_popular: boolean;
  stripe_price_id?: string;
}

export interface DeclineReason {
  id: string;
  code: string;
  label: string;
  description: string;
  influencer_message: string;
}
