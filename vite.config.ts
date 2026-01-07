import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.webp', 'robots.txt'],
      manifest: {
        name: 'UniTrack – One place to organize your day and stay on track',
        short_name: 'UniTrack',
        description: 'UniTrack is a simple, mobile-first day planner to manage tasks, schedules, expenses, and notes — all in one place.',
        theme_color: '#6366f1',
        icons: [
          {
            src: 'logo.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'logo.webp',
            sizes: '512x512',
            type: 'image/webp'
          },
          {
            src: 'logo.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
