import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT

if (!PORT) {
  throw new Error('PORT is not set');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['html', { open: 'never', outputFolder: './tests/report' }]],
  outputDir: './tests/results',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'next dev --turbopack',
    url: `http://localhost:${PORT}`,
    stdout: 'pipe',
  },
  // There's no application support for accounts. Would need a separate database for each worker
  workers: 1,
})
