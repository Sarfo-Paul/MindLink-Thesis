/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** MindLink backend, e.g. https://mindlink-ti7t.onrender.com */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SERVER_API_URL?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_SITE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

