import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['html', { open: 'never', outputFolder: './tests/report' }]],
  outputDir: './tests/results',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  /*
   chromium does not work well with react-dropzone
   https://github.com/microsoft/playwright/issues/8850
   https://github.com/microsoft/playwright/issues/12369
   */
  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  timeout: 3000,
})
