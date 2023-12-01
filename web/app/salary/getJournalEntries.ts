import { JournalEntry as JournalEntryType } from '../../src/pages/api/journalEntries'
import db from '../../src/db'
import { desc } from 'drizzle-orm'
import { JournalEntries } from '../../src/schema'

export async function getJournalEntries(): Promise<JournalEntryType[]> {
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
          id: true,
        },
      },
    },
    orderBy: [desc(JournalEntries.date), desc(JournalEntries.id)],
  })

  return journalEntries.map((j) => {
    const { journalEntryTransactions, transactions: _, ...journalEntry } = j

    const linkedToTransactionIds = j.transactions.map((t) => t.id)

    return {
      ...journalEntry,
      transactions: journalEntryTransactions,
      linkedToTransactionIds,
    }
  })
}
