import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // this excludes Playwright tests
    exclude: [...configDefaults.exclude, 'tests/**'],
  },
})
