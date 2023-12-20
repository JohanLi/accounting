import { and, desc, gte, InferSelectModel, lt } from 'drizzle-orm'
import db from './db'
import { JournalEntries } from './schema'

export type Transaction = {
  accountId: number
  amount: number
}

export type JournalEntryType = InferSelectModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
  linkNotApplicable: boolean
}

const OLD_BANK_ACCOUNT_ID = 1932
const PERSONAL_PAYMENT_ACCOUNT_ID = 2890

export async function getJournalEntries({
  startInclusive,
  endExclusive,
}: {
  startInclusive: Date
  endExclusive: Date
}): Promise<JournalEntryType[]> {
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

    const linkNotApplicable = journalEntryTransactions.some(
      (t) =>
        t.accountId === OLD_BANK_ACCOUNT_ID ||
        t.accountId === PERSONAL_PAYMENT_ACCOUNT_ID,
    )

    return {
      ...journalEntry,
      transactions: journalEntryTransactions,
      linkedToTransactionIds,
      linkNotApplicable,
    }
  })
}
