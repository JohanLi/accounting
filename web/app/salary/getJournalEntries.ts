import { JournalEntry as JournalEntryType } from '../journalEntries'
import db from '../db'
import { desc } from 'drizzle-orm'
import { JournalEntries } from '../schema'

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
