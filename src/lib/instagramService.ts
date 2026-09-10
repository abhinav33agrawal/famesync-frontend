const normalizeBaseUrl = (value: string) => `${value || ""}`.trim().replace(/\/+$/, "");

export const INSTAGRAM_SERVICE_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_INSTAGRAM_SERVICE_URL || "",
);
export const INSTAGRAM_SERVICE_TOKEN_KEY = "famee_instagram_service_token";

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
  followersCount: number | null;
  followingCount: number | null;
  postsCount: number | null;
  accountInsights: Record<string, number>;
  recentPosts: InstagramRecentPost[];
  lastSyncedAt: string | null;
}

export interface InstagramServiceUser {
  id: string;
  username: string;
  email: string;
  role: string;
  authProvider: string;
  picture: string;
  instagram: InstagramAccountData;
}

export interface InstagramInsightCard {
  key: string;
  label: string;
  hint: string;
  value: number | null;
}

export interface InstagramServiceProvidersStatus {
  database: {
    configured: boolean;
    ready: boolean;
    message: string;
  };
  google: {
    configured: boolean;
  };
  instagram: {
    configured: boolean;
    ready: boolean;
    disabledReason: string | null;
    redirectUri: string | null;
    profileFields: string;
    accountInsightMetrics: string[];
    accountInsightWindowDays: number;
    recentMediaLimit: number;
  };
}

class InstagramServiceError extends Error {
  status: number;
  payload: Record<string, any>;

  constructor(message: string, status = 500, payload: Record<string, any> = {}) {
    super(message);
    this.name = "InstagramServiceError";
    this.status = status;
    this.payload = payload;
  }
}

const toSafeCount = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
};

const normalizeInsights = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.entries(value).reduce<Record<string, number>>((acc, [key, raw]) => {
    const metric = `${key || ""}`.trim();
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
      id: `${item?.id || ""}`.trim(),
      caption: `${item?.caption || ""}`.trim(),
      mediaType: `${item?.mediaType || ""}`.trim().toUpperCase(),
      mediaProductType: `${item?.mediaProductType || ""}`.trim().toUpperCase(),
      mediaUrl: `${item?.mediaUrl || ""}`.trim(),
      thumbnailUrl: `${item?.thumbnailUrl || ""}`.trim(),
      permalink: `${item?.permalink || ""}`.trim(),
      timestamp: item?.timestamp || null,
      likeCount: toSafeCount(item?.likeCount),
      commentsCount: toSafeCount(item?.commentsCount),
    }))
    .filter((post) => post.id);
};

const normalizeInstagramAccount = (value: unknown): InstagramAccountData => {
  const account = value && typeof value === "object" ? (value as Record<string, any>) : {};

  return {
    id: `${account.id || ""}`.trim(),
    username: `${account.username || ""}`.trim(),
    accountType: `${account.accountType || ""}`.trim().toUpperCase(),
    bio: `${account.bio || ""}`.trim(),
    followersCount: toSafeCount(account.followersCount),
    followingCount: toSafeCount(account.followingCount),
    postsCount: toSafeCount(account.postsCount),
    accountInsights: normalizeInsights(account.accountInsights),
    recentPosts: normalizeRecentPosts(account.recentPosts),
    lastSyncedAt: account.lastSyncedAt || null,
  };
};

const normalizeInstagramUser = (value: unknown): InstagramServiceUser => {
  const user = value && typeof value === "object" ? (value as Record<string, any>) : {};

  return {
    id: `${user.id || ""}`.trim(),
    username: `${user.username || ""}`.trim(),
    email: `${user.email || ""}`.trim(),
    role: `${user.role || ""}`.trim(),
    authProvider: `${user.authProvider || ""}`.trim(),
    picture: `${user.picture || ""}`.trim(),
    instagram: normalizeInstagramAccount(user.instagram),
  };
};

const parseResponseJson = async (response: Response): Promise<Record<string, any>> => {
  try {
    return (await response.json()) || {};
  } catch {
    return {};
  }
};

const requestInstagramService = async (
  path: string,
  {
    method = "GET",
    token = "",
    body,
  }: {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
  } = {},
) => {
  if (!INSTAGRAM_SERVICE_BASE_URL) {
    throw new InstagramServiceError(
      "Instagram service URL is not configured. Set VITE_INSTAGRAM_SERVICE_URL.",
      500,
    );
  }

  const response = await fetch(`${INSTAGRAM_SERVICE_BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await parseResponseJson(response);
  if (!response.ok) {
    throw new InstagramServiceError(
      payload.error || "Instagram service request failed.",
      response.status,
      payload,
    );
  }

  return payload;
};

export const isInstagramServiceConfigured = () => Boolean(INSTAGRAM_SERVICE_BASE_URL);

export const getInstagramServiceLoginUrl = ({
  linkToken = "",
}: {
  linkToken?: string;
} = {}) => {
  if (!INSTAGRAM_SERVICE_BASE_URL) return "";

  const loginUrl = new URL(`${INSTAGRAM_SERVICE_BASE_URL}/auth/instagram/start`);
  const normalizedLinkToken = `${linkToken || ""}`.trim();
  if (normalizedLinkToken) {
    loginUrl.searchParams.set("linkToken", normalizedLinkToken);
  }

  return loginUrl.toString();
};

export const getInstagramServiceToken = () =>
  localStorage.getItem(INSTAGRAM_SERVICE_TOKEN_KEY) || "";

export const setInstagramServiceToken = (token: string) => {
  const value = `${token || ""}`.trim();
  if (!value) return;
  localStorage.setItem(INSTAGRAM_SERVICE_TOKEN_KEY, value);
};

export const clearInstagramServiceToken = () => {
  localStorage.removeItem(INSTAGRAM_SERVICE_TOKEN_KEY);
};

export const fetchInstagramServiceUser = async (token: string) => {
  const payload = await requestInstagramService("/auth/me", { token });
  return {
    user: normalizeInstagramUser(payload?.user),
  };
};

export const fetchInstagramServiceProvidersStatus =
  async (): Promise<InstagramServiceProvidersStatus> => {
    const payload = await requestInstagramService("/auth/providers");

    return {
      database: {
        configured: Boolean(payload?.database?.configured),
        ready: Boolean(payload?.database?.ready),
        message: `${payload?.database?.message || ""}`.trim(),
      },
      google: {
        configured: Boolean(payload?.google?.configured),
      },
      instagram: {
        configured: Boolean(payload?.instagram?.configured),
        ready: Boolean(payload?.instagram?.ready),
        disabledReason: payload?.instagram?.disabledReason
          ? `${payload.instagram.disabledReason}`.trim()
          : null,
        redirectUri: payload?.instagram?.redirectUri
          ? `${payload.instagram.redirectUri}`.trim()
          : null,
        profileFields: `${payload?.instagram?.profileFields || ""}`.trim(),
        accountInsightMetrics: Array.isArray(payload?.instagram?.accountInsightMetrics)
          ? payload.instagram.accountInsightMetrics.map((entry) => `${entry || ""}`.trim()).filter(Boolean)
          : [],
        accountInsightWindowDays: Number(payload?.instagram?.accountInsightWindowDays || 0),
        recentMediaLimit: Number(payload?.instagram?.recentMediaLimit || 0),
      },
    };
  };

export const syncInstagramServiceUser = async (token: string) => {
  const payload = await requestInstagramService("/auth/instagram/sync", {
    method: "POST",
    token,
  });

  return {
    user: normalizeInstagramUser(payload?.user),
    token: `${payload?.token || ""}`.trim(),
    syncedAt: payload?.syncedAt || null,
  };
};

export const linkGoogleAccountInInstagramService = async ({
  token,
  idToken,
}: {
  token: string;
  idToken: string;
}) => {
  const authToken = `${token || ""}`.trim();
  const googleIdToken = `${idToken || ""}`.trim();

  if (!authToken) {
    throw new InstagramServiceError("Instagram session token is missing.", 401);
  }

  if (!googleIdToken) {
    throw new InstagramServiceError("Missing Google ID token.", 400);
  }

  const payload = await requestInstagramService("/auth/google/link", {
    method: "POST",
    token: authToken,
    body: {
      idToken: googleIdToken,
    },
  });

  return {
    user: normalizeInstagramUser(payload?.user),
    token: `${payload?.token || ""}`.trim(),
  };
};

const INSIGHT_META: Record<string, { label: string; hint: string }> = {
  views: {
    label: "Views",
    hint: "Views reported by Instagram",
  },
  reach: {
    label: "Reach",
    hint: "Accounts reached",
  },
  accounts_engaged: {
    label: "Engaged",
    hint: "Accounts engaged",
  },
  total_interactions: {
    label: "Interactions",
    hint: "Profile + content interactions",
  },
  profile_views: {
    label: "Profile Visits",
    hint: "Profile views reported by Instagram",
  },
  external_link_taps: {
    label: "Link Taps",
    hint: "External link taps from profile",
  },
  profile_activity: {
    label: "Profile Activity",
    hint: "Profile visits + external link taps",
  },
  impressions: {
    label: "Impressions",
    hint: "Total content impressions",
  },
  website_clicks: {
    label: "Website Clicks",
    hint: "Website clicks from profile",
  },
};

export const buildInstagramInsightCards = (
  account: InstagramAccountData,
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

  const hiddenKeys = new Set(["profile_links_taps", "website_clicks"]);
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
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    hint: INSIGHT_META[key]?.hint || "Reported by Instagram",
    value: toSafeCount(visibleInsights[key]),
  }));
};

export const toInstagramDisplayCount = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return "N/A";
  }
  return value.toLocaleString();
};

export const formatInstagramPostDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatInstagramSyncTimestamp = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export { InstagramServiceError };
