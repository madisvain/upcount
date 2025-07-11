// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.upcount.app",
  integrations: [sitemap()],
  build: {
    // Inline CSS for critical above-the-fold styles
    inlineStylesheets: "auto",
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize bundle size
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ['astro'],
          },
        },
      },
    },
  },
});
