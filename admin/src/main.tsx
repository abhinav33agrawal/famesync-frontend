import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./lib/auth";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* Admin data changes underneath you; a stale approval queue is worse
         than an extra request. */
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      /* A 401/403 is an answer, not a blip - retrying just delays the
         redirect to /login. */
      retry: (count, error: any) => {
        const s = error?.response?.status;
        if (s === 401 || s === 403 || s === 404) return false;
        return count < 2;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
