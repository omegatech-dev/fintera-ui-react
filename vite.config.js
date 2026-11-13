import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Add PWA configuration
const pwaConfig = {
  registerType: "autoUpdate",
  includeAssets: [],
  workbox: {
    globPatterns: ["**/*.{js,css,html,png,jpg,gif,svg}"],
    navigateFallback: "/index.html",
    navigateFallbackAllowlist: [/^(?!\/__).*/],
    runtimeCaching: [
      {
        urlPattern: /\.(png|jpg|gif|svg)$/,
        handler: "StaleWhileRevalidate",
      },
      // Cache GET API responses briefly to reduce Railway egress on repeat visits
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/v1\//,
        handler: "NetworkFirst",
        options: {
          networkTimeoutSeconds: 8,
          cacheName: "api-cache",
          expiration: { maxEntries: 64, maxAgeSeconds: 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
  manifest: {
    id: "/",
    name: "Fintera — Gestión de financiamiento",
    short_name: "Fintera",
    description: "Gestión de proyectos, contratos, pagos y comisiones inmobiliarias.",
    lang: "es",
    dir: "ltr",
    scope: "/",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F7F9",
    theme_color: "#15803D",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "pwa-64x64.png",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@config": path.resolve(import.meta.dirname, "./config.js"),
      "@auth": path.resolve(import.meta.dirname, "./auth.js"),
    },
  },
  plugins: [react(), tailwindcss(), VitePWA(pwaConfig)],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    // Performance/benchmark suites can exceed the 5s default under CI load.
    testTimeout: 20000,
    hookTimeout: 20000,
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    include: ['jwt-decode']
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // Core React and any package that uses React – must share same chunk to avoid "createContext of undefined"
            if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("react/")) return "vendor";
            if (id.includes("@rollbar/react")) return "vendor";
            // Heavy UI / chart libs – split so no single chunk blows the limit
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) return "charts";
            // Keep @fortawesome in vendor – splitting it causes "Cannot access 'Te' before initialization"
            if (id.includes("@fortawesome")) return "vendor";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("quill")) return "quill";
            // Medium libs (no React dependency)
            if (id.includes("date-fns")) return "date-fns";
            if (id.includes("@rollbar") || id.includes("rollbar")) return "rollbar";
            if (id.includes("aos")) return "aos";
            if (id.includes("driver.js")) return "driver";
            if (id.includes("dompurify")) return "dompurify";
            // Do NOT catch-all the rest into "vendor-misc" – that chunk can load before
            // React is available and breaks packages that use createContext (e.g. React libs).
            // Let Rollup put remaining node_modules in default chunks so React stays a singleton.
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      }
    },
    chunkSizeWarningLimit: 600,
  }
});
