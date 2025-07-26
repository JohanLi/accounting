import { execSync } from 'child_process'
import { config as loadEnv } from 'dotenv'

loadEnv()

const POSTGRES_PORT = process.env.E2E_POSTGRES_PORT

if (!POSTGRES_PORT) {
  throw new Error('E2E_POSTGRES_PORT is not set in the environment variables')
}

async function globalSetup() {
  execSync(
    'docker compose --file docker-compose.test.yml up -d --wait && sh ./scripts/reset.sh',
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        POSTGRES_PORT,
      },
    },
  )

  process.env.POSTGRES_PORT = POSTGRES_PORT
}

export default globalSetup
