import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    legacy(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      filename: "sw.js",
      manifestFilename: "manifest.json",
      includeAssets: [
        "favicon.ico",
        "favicon.png",
        "pwa-64x64-v3.png",
        "pwa-128x128-v3.png",
        "pwa-192x192-v3.png",
        "pwa-256x256-v3.png",
        "pwa-512x512-v3.png",
        "apple-touch-icon-v3.png",
      ],
      manifest: {
        name: "Facturación PWA",
        short_name: "Facturación",
        description: "Sistema de Facturación Móvil y PWA",
        theme_color: "#2563eb",
        background_color: "#2563eb",
        display: "standalone",
        orientation: "portrait",
        start_url: "/?mode=pwa",
        icons: [
          {
            src: "pwa-64x64-v3.png",
            sizes: "64x64",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-128x128-v3.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-192x192-v3.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-256x256-v3.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512-v3.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-192x192-v3.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-512x512-v3.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
        suppressWarnings: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    cors: true,
    proxy: {
      "/api": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    proxy: {
      "/api": {
        target: "https://localhost:7259",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@ionic")) {
              return "vendor-ionic";
            }
          }
        },
      },
    },
  },
});

