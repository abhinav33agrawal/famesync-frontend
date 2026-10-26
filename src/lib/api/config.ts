import axios from "axios";

/* Under `vite dev` the browser talks to the dev server's /api proxy (see
   vite.config.ts), which forwards to VITE_API_URL. Calling the backend
   directly from http://localhost:8080 is blocked by its CORS policy. */
export const API_BASE_URL = __API_DEV_PROXY__
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/** Where uploaded media lives: the API origin without the /api suffix.
 *
 *  Only a *trailing* /api is stripped. Call sites used to inline
 *  `VITE_API_URL.replace("/api", "")`, which removes the first match
 *  anywhere in the string -- so the obvious production value
 *  "https://api.famesync.com/api" became "https:/.famesync.com/api" and
 *  every profile picture 404'd. It only worked on localhost. */
export const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/** Absolute URL for a server-relative upload path.
 *  Values that are already absolute (Instagram CDN, S3, blob: previews)
 *  are returned untouched. */
export const mediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${MEDIA_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Create main axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: { "Content-Type": "application/json" },
});

// Use a separate instance for refresh token to avoid loops
const refreshApi = axios.create({ baseURL: API_BASE_URL });

// Request interceptor to attach access token
// api.interceptors.request.use((config) => {
//   const tokens = localStorage.getItem("famee_tokens");
//   if (tokens) {
//     const { access } = JSON.parse(tokens);
//     config.headers.Authorization = `Bearer ${access}`;
//   }
//   return config;
// });

/* Signed-out endpoints never get the saved token. The backend rejects an
   expired Bearer token with 401 even on public views, so a stale session
   used to break the signup availability checks (and the 401 handler below
   would then bounce the page to /auth mid-form). */
const PUBLIC_AUTH_PATHS = [
  "/auth/check-username/",
  "/auth/check-email/",
  "/auth/register/",
  "/auth/login/",
  "/auth/forgot-password/",
  "/auth/reset-password/",
  "/auth/verify-email/",
  "/auth/resend-verification/",
  "/auth/google-login/",
];

const isPublicAuthPath = (url?: string) =>
  Boolean(url) && PUBLIC_AUTH_PATHS.some((path) => url!.includes(path));

api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("famee_tokens");

  if (tokens && !isPublicAuthPath(config.url)) {
    const { access } = JSON.parse(tokens);
    config.headers.Authorization = `Bearer ${access}`;
  }

  // ✅ Only set JSON header if it's NOT a FormData upload
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Response interceptor to refresh access token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthPath(originalRequest?.url)) {
      originalRequest._retry = true;

      const tokens = localStorage.getItem("famee_tokens");
      if (tokens) {
        const { refresh } = JSON.parse(tokens);
        try {
          const response = await refreshApi.post("/auth/refresh/", { refresh });
          const newTokens = {
            ...JSON.parse(tokens),
            access: response.data.access,
          };
          localStorage.setItem("famee_tokens", JSON.stringify(newTokens));

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch {
          // Refresh failed → logout
          localStorage.removeItem("famee_tokens");
          localStorage.removeItem("famee_user");
          window.location.href = "/auth";
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
