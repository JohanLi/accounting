import { configDefaults, defineConfig } from 'vitest/config'

/*
  Run tests in Swedish time, like the app, so that date handling affected by
  daylight saving time behaves the same locally and in CI (which runs in UTC).
 */
process.env.TZ = 'Europe/Stockholm'

export default defineConfig({
  test: {
    // this excludes Playwright tests
    exclude: [...configDefaults.exclude, 'tests/**'],
  },
})
