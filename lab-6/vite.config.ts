import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` controls where the bundle expects to live:
//   - Vercel (default)            → "/"            served at the project root
//   - GitHub Pages (mono-repo)    → VITE_BASE="/tum-web-lab/lab-6/"
//   - GitHub Pages (separate repo)→ VITE_BASE="/pagebound/"
// Override with `VITE_BASE=/ npm run build` for any non-Vercel deploy.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/",
});
