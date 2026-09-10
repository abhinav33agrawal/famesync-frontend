import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("famee_tokens");

  if (tokens) {
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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
