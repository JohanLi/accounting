import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

import { CHATGPT_HOST_PERMISSIONS } from './entrypoints/chatgpt.content/permissions.ts'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    host_permissions: CHATGPT_HOST_PERMISSIONS,
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  imports: false,
  dev: {
    server: {
      // the default 3000 clashes with Next.js
      port: 3001,
    },
  },
  webExt: {
    // I prefer to load the unpacked extension into my regular Chrome profile as it's more convenient for logins
    disabled: true,
  },
})
