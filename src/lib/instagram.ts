import api from './api/config';
import type { User } from './api/types';

/* Instagram now lives on our own API. The Node service on Railway that used
   to own this (and hand out a second token we stored alongside the FameSync
   one) is gone -- there is a single session again. */

export interface InstagramRecentPost {
  id: string;
  caption: string;
  mediaType: string;
  mediaProductType: string;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  timestamp: string | null;
  likeCount: number | null;
  commentsCount: number | null;
}

export interface InstagramAccountData {
  id: string;
  username: string;
  accountType: string;
  bio: string;
  picture: string;
  followersCount: number | null;
  followingCount: number | null;
  postsCount: number | null;
  accountInsights: Record<string, number>;
  recentPosts: InstagramRecentPost[];
  lastSyncedAt: string | null;
}

export interface InstagramInsightCard {
  key: string;
  label: string;
  hint: string;
  value: number | null;
}

export interface InstagramStatus {
  connected: boolean;
  configured: boolean;
  instagram: InstagramAccountData | null;
  lastSyncedAt: string | null;
}

const toSafeCount = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
};

const normalizeInsights = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.entries(value).reduce<Record<string, number>>((acc, [key, raw]) => {
    const metric = `${key || ''}`.trim();
    const count = toSafeCount(raw);
    if (!metric || count === null) return acc;
    acc[metric] = count;
    return acc;
  }, {});
};

const normalizeRecentPosts = (items: unknown): InstagramRecentPost[] => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item: any) => ({
      id: `${item?.id || ''}`.trim(),
      caption: `${item?.caption || ''}`.trim(),
      mediaType: `${item?.mediaType || ''}`.trim().toUpperCase(),
      mediaProductType: `${item?.mediaProductType || ''}`.trim().toUpperCase(),
      mediaUrl: `${item?.mediaUrl || ''}`.trim(),
      thumbnailUrl: `${item?.thumbnailUrl || ''}`.trim(),
      permalink: `${item?.permalink || ''}`.trim(),
      timestamp: item?.timestamp || null,
      likeCount: toSafeCount(item?.likeCount),
      commentsCount: toSafeCount(item?.commentsCount),
    }))
    .filter((post) => post.id);
};

/** Accepts both the API payload and a stored `profile.instagram_data` blob. */
export const normalizeInstagramAccount = (value: unknown): InstagramAccountData => {
  const account = value && typeof value === 'object' ? (value as Record<string, any>) : {};

  return {
    id: `${account.id || ''}`.trim(),
    username: `${account.username || ''}`.trim(),
    accountType: `${account.accountType || ''}`.trim().toUpperCase(),
    bio: `${account.bio || ''}`.trim(),
    picture: `${account.picture || ''}`.trim(),
    followersCount: toSafeCount(account.followersCount),
    followingCount: toSafeCount(account.followingCount),
    postsCount: toSafeCount(account.postsCount),
    accountInsights: normalizeInsights(account.accountInsights),
    recentPosts: normalizeRecentPosts(account.recentPosts),
    lastSyncedAt: account.lastSyncedAt || null,
  };
};

export const getInstagramErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as any)?.response?.data?.error;
  return `${message || ''}`.trim() || fallback;
};

export const getInstagramErrorStatus = (error: unknown): number =>
  Number((error as any)?.response?.status) || 0;

// ------------------------------------------------------------------ requests

/** Ask the API where to send the browser, then go there. */
export const startInstagramAuth = async (role: 'influencer' | 'brand') => {
  const { data } = await api.post('/auth/instagram/start/', { role });
  const url = `${data?.authorize_url || ''}`.trim();
  if (!url) throw new Error('Instagram login is not available right now.');
  window.location.href = url;
};

export type InstagramExchangeResult =
  | { status: 'signed_in'; access: string; refresh: string; user: User }
  | { status: 'needs_email'; instagram: InstagramAccountData };

/** Trade the one-time code from /auth/callback for a real session. */
export const exchangeInstagramCode = async (
  code: string,
  options: { email?: string; role?: 'influencer' | 'brand' } = {},
): Promise<InstagramExchangeResult> => {
  const response = await api.post(
    '/auth/instagram/exchange/',
    { code, ...options },
    // 206 means "we need an email first" -- a normal branch, not a failure.
    { validateStatus: (status) => (status >= 200 && status < 300) || status === 206 },
  );

  if (response.status === 206 || response.data?.needs_email) {
    return {
      status: 'needs_email',
      instagram: normalizeInstagramAccount(response.data?.instagram),
    };
  }

  return {
    status: 'signed_in',
    access: response.data.access,
    refresh: response.data.refresh,
    user: response.data.user as User,
  };
};

export const fetchInstagramStatus = async (): Promise<InstagramStatus> => {
  const { data } = await api.get('/auth/instagram/status/');
  return {
    connected: Boolean(data?.connected),
    configured: Boolean(data?.configured),
    instagram: data?.instagram ? normalizeInstagramAccount(data.instagram) : null,
    lastSyncedAt: data?.last_synced_at || null,
  };
};

export const syncInstagram = async (): Promise<InstagramAccountData> => {
  const { data } = await api.post('/auth/instagram/sync/');
  return normalizeInstagramAccount(data?.instagram);
};

export const disconnectInstagram = async () => {
  await api.post('/auth/instagram/disconnect/');
};

// ----------------------------------------------------------------- insights

const INSIGHT_META: Record<string, { label: string; hint: string }> = {
  views: { label: 'Views', hint: 'Views reported by Instagram' },
  reach: { label: 'Reach', hint: 'Accounts reached' },
  accounts_engaged: { label: 'Engaged', hint: 'Accounts engaged' },
  total_interactions: { label: 'Interactions', hint: 'Profile + content interactions' },
  profile_views: { label: 'Profile Visits', hint: 'Profile views reported by Instagram' },
  external_link_taps: { label: 'Link Taps', hint: 'External link taps from profile' },
  profile_activity: { label: 'Profile Activity', hint: 'Profile visits + external link taps' },
  impressions: { label: 'Impressions', hint: 'Total content impressions' },
  website_clicks: { label: 'Website Clicks', hint: 'Website clicks from profile' },
};

export const buildInstagramInsightCards = (
  account: Pick<InstagramAccountData, 'accountInsights'>,
): InstagramInsightCard[] => {
  const insights = normalizeInsights(account.accountInsights);
  const profileViews = toSafeCount(insights.profile_views);
  const linkTapCandidates = [
    toSafeCount(insights.profile_links_taps),
    toSafeCount(insights.website_clicks),
  ].filter((value): value is number => value !== null);

  if (linkTapCandidates.length > 0) {
    insights.external_link_taps = Math.max(...linkTapCandidates);
  }

  const externalLinkTaps = toSafeCount(insights.external_link_taps);
  if (profileViews !== null || externalLinkTaps !== null) {
    insights.profile_activity = (profileViews || 0) + (externalLinkTaps || 0);
  }

  const hiddenKeys = new Set(['profile_links_taps', 'website_clicks']);
  const visibleInsights = Object.fromEntries(
    Object.entries(insights).filter(([key]) => !hiddenKeys.has(key)),
  );
  const knownKeys = Object.keys(INSIGHT_META).filter((key) => key in visibleInsights);
  const extraKeys = Object.keys(visibleInsights)
    .filter((key) => !knownKeys.includes(key))
    .sort();

  return [...knownKeys, ...extraKeys].map((key) => ({
    key,
    label:
      INSIGHT_META[key]?.label ||
      key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    hint: INSIGHT_META[key]?.hint || 'Reported by Instagram',
    value: toSafeCount(visibleInsights[key]),
  }));
};

export const toInstagramDisplayCount = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 'N/A';
  return value.toLocaleString();
};

export const formatInstagramPostDate = (value: string | null | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatInstagramSyncTimestamp = (value: string | null | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};
