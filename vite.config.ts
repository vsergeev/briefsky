import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

import * as child_process from 'child_process';

/* Get commit id */
let commitId: string;
try {
  commitId = child_process.execSync('git rev-parse --short HEAD 2>/dev/null').toString();
} catch {
  commitId = 'unknown';
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  define: {
    'window.__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    'window.__APP_COMMIT_ID__': JSON.stringify(commitId),
  },
  plugins: [svelte()],
});
