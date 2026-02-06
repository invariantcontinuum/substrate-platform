/// <reference types="vite/client" />

// JSON module declarations
declare module '*.json' {
  const content: any;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_MOCK_API: string;
  readonly VITE_MOCK_API_DELAY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
