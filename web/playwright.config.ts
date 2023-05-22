import { defineConfig, devices } from '@playwright/test'

const PORT = 3001

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
    command: `PORT=${PORT} next dev`,
    url: 'http://localhost:3001',
  },
})
