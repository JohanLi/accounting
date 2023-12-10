import { sql } from 'drizzle-orm'
import db from '../../app/db'

async function main() {
  await db.execute(
    sql`DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA public CASCADE; CREATE SCHEMA public;`,
  )
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
