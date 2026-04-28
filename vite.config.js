import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    target: "es2015",
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      input: "./index.html",
      output: {
        manualChunks: { react: ["react", "react-dom"] },
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 800,
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
});
