import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      input: {
        home: "index.html",
        suites: "rooms.html",
        amenities: "amenities.html",
        gallery: "gallery.html",
        pricing: "pricing.html",
        contact: "contact.html",
      },
    },
  },
});
