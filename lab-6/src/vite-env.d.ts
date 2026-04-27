/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Default API base URL injected at build time (e.g. set in Vercel env). */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
