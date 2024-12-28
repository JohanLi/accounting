import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const client = postgres(
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}`,
  { max: 1 },
)

export default drizzle(client, { schema })

export function logPostgresError(e: unknown) {
  if (e instanceof postgres.PostgresError) {
    console.info(e.query)
    console.info(e.parameters)
  }
}
