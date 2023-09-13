import { YEAR } from './year'
import db from '../../src/db'
import { and, desc, gte, lt } from 'drizzle-orm'
import { JournalEntries } from '../../src/schema'
import { getFiscalYear } from '../../src/utils'

/*
  There's a 10 öre difference when comparing my journal entries against the
  bank account for FY 2023. Gotta find it.

  Turns out it's 3 Google Workspace entries
 */

async function main() {
  const { startInclusive, endExclusive } = getFiscalYear(YEAR)

  /*
   I'm not sure how to get the filtering to work, hence doing most
   of it in the application layer
   */
  const journalEntries = await db.query.JournalEntries.findMany({
    with: {
      journalEntryTransactions: {
        columns: {
          accountId: true,
          amount: true,
        },
      },
      transactions: {
        columns: {
          type: true,
          amount: true,
        },
      },
    },
    where: and(
      gte(JournalEntries.date, startInclusive),
      lt(JournalEntries.date, endExclusive),
    ),
    orderBy: [desc(JournalEntries.date), desc(JournalEntries.id)],
  })

  const entriesBankRegular = journalEntries.filter((j) =>
    j.transactions.some((t) => t.type === 'bankRegular'),
  )

  for (const entry of entriesBankRegular) {
    const journalEntryTransaction = entry.journalEntryTransactions.find(
      (t) => t.accountId === 1930,
    )
    const transaction = entry.transactions.find((t) => t.type === 'bankRegular')

    if (journalEntryTransaction?.amount !== transaction?.amount) {
      console.log(
        `Mismatch ${entry.id} ${entry.date}, ${journalEntryTransaction?.amount}, ${transaction?.amount}`,
      )
    }
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
