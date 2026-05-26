import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["drizzle-orm", "mysql2"],
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        ws: true,
      },
    },
    hmr: { overlay: false },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "radix-ui": [
            "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar", "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label", "@radix-ui/react-popover",
            "@radix-ui/react-progress", "@radix-ui/react-scroll-area",
            "@radix-ui/react-select", "@radix-ui/react-separator",
            "@radix-ui/react-slot", "@radix-ui/react-switch",
            "@radix-ui/react-tabs", "@radix-ui/react-tooltip",
          ],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
