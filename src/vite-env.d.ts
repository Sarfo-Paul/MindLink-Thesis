/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_API_URL?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_SITE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

