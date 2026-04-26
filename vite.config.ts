import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` is set so the production bundle works under
// https://<user>.github.io/pagebound/. For a custom domain or root deploy,
// override with VITE_BASE=/ before `npm run build`.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/pagebound/",
});
