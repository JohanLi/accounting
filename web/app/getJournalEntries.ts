import { and, desc, gte, InferSelectModel, lt } from 'drizzle-orm'
import db from './db'
import { JournalEntries } from './schema'

export type Transaction = {
  accountId: number
  amount: number
}

export type JournalEntry = InferSelectModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
}

export async function getJournalEntries({
  startInclusive,
  endExclusive,
}: {
  startInclusive: Date
  endExclusive: Date
}) {
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
    where: and(
      gte(JournalEntries.date, startInclusive),
      lt(JournalEntries.date, endExclusive),
    ),
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
