// ═══════════════════════════════════════════════════════════════════════════
// AfriGate Market — Vite Configuration
// Optimized for production PWA deployment on Vercel
// ═══════════════════════════════════════════════════════════════════════════
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    target: "es2015",          // Support older Android browsers
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false,           // Disable in production for security
    rollupOptions: {
      output: {
        // Split chunks for faster loading
        manualChunks: {
          react: ["react", "react-dom"],
        },
        // Cache-friendly file names
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    // Warn if any chunk exceeds 600KB
    chunkSizeWarningLimit: 600,
  },

  // Dev server config
  server: {
    port: 3000,
    open: true,
    host: true,  // Allow LAN access for mobile testing
  },

  // Preview server (vite preview)
  preview: {
    port: 4000,
    host: true,
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify("1.0.0"),
  },
});
