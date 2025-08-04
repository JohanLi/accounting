import { sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

import db from '../../app/db'
import { Accounts } from '../../app/schema'
import { chartOfAccounts } from '../../app/types'

// these values are largely based on https://www.bas.se/wp-content/uploads/2022/01/Kontoplan-2022.pdf

async function main() {
  await migrate(db, { migrationsFolder: 'drizzle' })

  await db
    .insert(Accounts)
    .values(
      Object.entries(chartOfAccounts).map(([id, description]) => ({
        id: Number(id),
        description,
      })),
    )
    .onConflictDoUpdate({
      target: Accounts.id,
      // https://stackoverflow.com/a/36930792
      set: { description: sql`excluded.description` },
    })

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
