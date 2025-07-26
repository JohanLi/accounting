import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv';

loadEnv();

const PORT = process.env.E2E_PORT

if (!PORT) {
  throw new Error('E2E_PORT is not set in the environment variables');
}

const POSTGRES_PORT = process.env.E2E_POSTGRES_PORT

if (!POSTGRES_PORT) {
  throw new Error('E2E_POSTGRES_PORT is not set in the environment variables');
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
  globalSetup: require.resolve('./tests/globalSetup'),
  webServer: {
    command: 'next dev',
    url: `http://localhost:${PORT}`,
    stdout: 'pipe',
    env: {
      ...process.env,
      PORT,
      POSTGRES_PORT,
    },
  },
  // There's no application support for accounts. Would need a separate database for each worker
  workers: 1,
})
