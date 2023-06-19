import { migrate } from 'drizzle-orm/postgres-js/migrator'
import db from '../../src/db'
import { Accounts } from '../../src/schema'
import { sql } from 'drizzle-orm'

async function main() {
  await migrate(db, { migrationsFolder: 'drizzle' })

  await db
    .insert(Accounts)
    .values([
      {
        code: 1630,
        description: 'Skattekonto',
      },
      {
        code: 1930,
        description: 'Företagskonto',
      },
      {
        code: 2610,
        description: 'Utgående moms 25%',
      },
      {
        code: 2640,
        description: 'Ingående moms',
      },
      {
        code: 2710,
        description: 'Personalskatt',
      },
      {
        code: 2731,
        description: 'Avräkning lagstadgade sociala avgifter',
      },
      {
        code: 2890,
        description: 'Övriga kortfristiga skulder',
      },
      {
        code: 3011,
        description: 'Försäljning inom Sverige 25%',
      },
      {
        code: 4535,
        description: 'Inköp av tjänster inom EU 25%',
      },
      {
        code: 6212,
        description: 'Mobiltelefoni',
      },
      {
        code: 6570,
        description: 'Bankkostnader',
      },
      {
        code: 7210,
        description: 'Löner till tjänstemän',
      },
      {
        code: 7510,
        description: 'Arbetsgivaravgifter',
      },
      {
        code: 7699,
        description: 'Övriga personalkostnader',
      },
    ])
    .onConflictDoUpdate({
      target: Accounts.code,
      // https://stackoverflow.com/a/36930792
      set: { description: sql`excluded.description` },
    })

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
