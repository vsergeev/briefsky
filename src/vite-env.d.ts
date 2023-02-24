/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    __APP_VERSION__: string;
    __APP_COMMIT_ID__: string;
  }
}

export {};
