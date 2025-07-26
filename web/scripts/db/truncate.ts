import db from '../../app/db'
import { Documents, JournalEntries, Transactions } from '../../app/schema'

async function main() {
  await db.delete(JournalEntries)
  await db.delete(Transactions)
  await db.delete(Documents)

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
