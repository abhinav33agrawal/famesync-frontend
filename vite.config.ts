import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  /* `vite dev` proxies the API through its own origin. The browser calls
     http://localhost:8080/api/..., Vite forwards it server-to-server to
     VITE_API_URL, and the backend's CORS list never sees localhost — so a
     local frontend works against backend.famesync.com without loosening
     production CORS. Builds are untouched: they call VITE_API_URL directly. */
  const apiUrl = new URL(env.VITE_API_URL || "http://localhost:8000/api");
  const apiPath = apiUrl.pathname.replace(/\/$/, "");

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: apiUrl.origin,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api/, apiPath),
        },
        // server-relative uploads (mediaUrl) live on the API origin too
        "/media": { target: apiUrl.origin, changeOrigin: true, secure: true },
      },
    },
    define: {
      __API_DEV_PROXY__: JSON.stringify(command === "serve"),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
