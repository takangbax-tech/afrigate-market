// ═══════════════════════════════════════════════════════════════════════════
// AfriGate Market — Vite Configuration v2.0
// Optimized for production PWA deployment on Vercel
// ═══════════════════════════════════════════════════════════════════════════
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    target: "es2015",
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 600,
  },

  server: {
    port: 3000,
    open: true,
    host: true,
  },

  preview: {
    port: 4000,
    host: true,
  },

  define: {
    __APP_VERSION__: JSON.stringify("2.0.0"),
  },
});
