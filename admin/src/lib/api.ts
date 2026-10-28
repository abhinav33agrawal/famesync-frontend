import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/* Distinct from the main site's "famee_tokens". admin.famesync.com is a
   separate origin so storage is already isolated in production, but the two
   apps share an origin during local development on localhost. */
const TOKEN_KEY = "famesync_admin_tokens";

export interface Tokens {
  access: string;
  refresh: string;
}

export const readTokens = (): Tokens | null => {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
};

export const writeTokens = (t: Tokens) =>
  localStorage.setItem(TOKEN_KEY, JSON.stringify(t));

export const clearTokens = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({ baseURL: API_BASE_URL });

/* A second instance for the refresh call. Using `api` itself would send the
   expired token and recurse through this same interceptor on failure. */
const refreshApi = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const t = readTokens();
  if (t?.access) config.headers.Authorization = `Bearer ${t.access}`;
  if (!(config.data instanceof FormData))
    config.headers["Content-Type"] = "application/json";
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const t = readTokens();
      if (t?.refresh) {
        try {
          const res = await refreshApi.post("/auth/refresh/", {
            refresh: t.refresh,
          });
          /* ROTATE_REFRESH_TOKENS is on in SIMPLE_JWT, so the response may
             carry a new refresh token. Keeping the old one would break the
             next refresh once the previous is blacklisted. */
          writeTokens({
            access: res.data.access,
            refresh: res.data.refresh ?? t.refresh,
          });
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          clearTokens();
          if (!location.pathname.startsWith("/login"))
            location.href = "/login";
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/* ------------------------------------------------------------------ types */

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "influencer" | "brand";
  credits: number;
  is_approved: boolean;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  total_campaigns: number;
  total_applications: number;
  plan: string;
  profile_completeness: number;
  is_profile_completed: boolean;
}

export interface DashboardStats {
  users: { total: number; influencers: number; brands: number; pending: number };
  campaigns: { total: number; active: number };
  approvals: { pending: number };
  revenue: { mrr: number };
}

export interface PendingApproval {
  id: string;
  username: string;
  email: string;
  role: "influencer" | "brand";
  profile_picture: string | null;
  created_at: string;
  profile_completeness: number;
  total_followers?: number;
  instagram_verified?: boolean;
}

export interface AdminCampaign {
  id: string;
  title: string;
  status: string;
  created_at: string;
  [k: string]: unknown;
}

export interface AuditLog {
  id: string;
  [k: string]: unknown;
}

/* The list endpoints are paginated (PageNumberPagination, PAGE_SIZE 20) but a
   few hand-written views return a bare array. Normalise both shapes. */
export const asList = <T,>(data: Paginated<T> | T[] | undefined): T[] =>
  Array.isArray(data) ? data : data?.results ?? [];

export const asCount = <T,>(data: Paginated<T> | T[] | undefined): number =>
  Array.isArray(data) ? data.length : data?.count ?? 0;

/* ------------------------------------------------------- subscriptions */

export interface SubscriptionRow {
  id: string;
  user: number;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  role: "influencer" | "brand";
  user_is_active: boolean;
  plan: "free" | "pro";
  status: "active" | "cancelled" | "expired";
  credit_limit: number;
  start_date: string;
  renewal_date: string;
  monthly_price: number;
}

/* --------------------------------------------------------- user detail */

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaType?: string;
  mediaProductType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string | null;
  likeCount?: number | null;
  commentsCount?: number | null;
}

export interface InstagramPayload {
  id: string;
  username: string;
  accountType?: string;
  bio?: string;
  picture?: string;
  followersCount?: number | null;
  followingCount?: number | null;
  postsCount?: number | null;
  accountInsights?: Record<string, number>;
  recentPosts?: InstagramPost[];
  lastSyncedAt?: string | null;
  tokenExpiresAt?: string | null;
}

export interface SocialUrl {
  platform?: string;
  link?: string;
  followers?: number | null;
  verified?: boolean;
}

/** Both profile shapes are serialised with fields='__all__', so every column
 *  is present for its role. Kept loose on purpose: the page renders what is
 *  there rather than failing on a field the backend adds later. */
export interface AdminProfile {
  id: string;
  profile_picture?: string | null;
  bio?: string;
  niche?: string;
  category?: string;
  location?: string;
  instagram_handle?: string;
  engagement_rate?: number | null;
  media_kit?: string | null;
  company_name?: string;
  industry?: string;
  website?: string | null;
  description?: string;
  target_audience?: string;
  logo?: string | null;
  phone_number?: string | null;
  social_urls?: (SocialUrl | string)[];
  created_at?: string;
  updated_at?: string;
  [k: string]: unknown;
}

export interface AdminUserDetail {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "influencer" | "brand";
  credits: number;
  is_approved: boolean;
  is_active: boolean;
  is_staff: boolean;
  email_verified: boolean;
  has_usable_password: boolean;
  created_at: string;
  last_login: string | null;
  profile: AdminProfile | null;
  subscription: SubscriptionRow | null;
  instagram: InstagramPayload | null;
  stats: {
    campaigns?: number;
    active_campaigns?: number;
    applications_received?: number;
    applications?: number;
    accepted?: number;
    pending?: number;
  };
}

/* ------------------------------------------------------------ insights */

export interface Metric {
  value: number | null;
  previous: number | null;
  /** Percent change, except acceptance_rate, where it is in points. */
  change: number | null;
}

export interface Insights {
  range: {
    from: string;
    to: string;
    days: number;
    granularity: "day" | "week" | "month";
    previous_from: string;
    previous_to: string;
  };
  buckets: string[];
  totals: Record<
    | "signups"
    | "influencers"
    | "brands"
    | "campaigns"
    | "applications"
    | "accepted"
    | "acceptance_rate"
    | "pro_checkouts"
    | "credits_used"
    | "unlocks",
    Metric
  >;
  series: Record<
    "influencer_signups" | "brand_signups" | "campaigns" | "applications" | "accepted",
    number[]
  >;
  applications_by_status: { status: string; count: number }[];
  campaigns_by_category: { category: string; count: number }[];
  top_campaigns: {
    id: string;
    title: string;
    brand: string;
    status: string;
    applications: number;
  }[];
  snapshot: {
    users: number;
    approved: number;
    pending_approval: number;
    active_campaigns: number;
    pro_subscribers: number;
  };
}
