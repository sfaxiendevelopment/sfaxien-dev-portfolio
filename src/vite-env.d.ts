/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ADMIN_USERNAME: string
  readonly VITE_ADMIN_PASSWORD: string
  readonly VITE_ADMIN_DISPLAY_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}