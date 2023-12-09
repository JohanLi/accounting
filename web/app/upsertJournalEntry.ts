'use server'

import { validate } from '../src/validateJournalEntry'
import db from '../src/db'
import {
  JournalEntries,
  JournalEntryTransactions,
  Transactions,
} from '../src/schema'
import { eq, InferInsertModel, sql } from 'drizzle-orm'
import { Transaction } from './journalEntries'

export type JournalEntryUpsert = InferInsertModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
}

export async function upsertJournalEntry(
  unvalidatedJournalEntry: JournalEntryUpsert,
) {
  const journalEntry = validate(unvalidatedJournalEntry)

  const { transactions, linkedToTransactionIds, ...rest } = journalEntry
  rest.date = new Date(rest.date)

  return db.transaction(async (tx) => {
    const upsertedEntry = await tx
      .insert(JournalEntries)
      .values(rest)
      .onConflictDoUpdate({
        target: JournalEntries.id,
        set: {
          date: rest.date,
          description: rest.description,
          updatedAt: sql`NOW()`,
        },
      })
      .returning()

    await tx
      .delete(JournalEntryTransactions)
      .where(eq(JournalEntryTransactions.journalEntryId, upsertedEntry[0].id))

    await tx.insert(JournalEntryTransactions).values(
      transactions.map((t) => ({
        ...t,
        journalEntryId: upsertedEntry[0].id,
      })),
    )

    for (const linkedToTransactionId of linkedToTransactionIds) {
      /*
        Apparently the transaction is rolled back if nothing is updated.
        Not sure if this behavior is library-specific.
       */
      await tx
        .update(Transactions)
        .set({ journalEntryId: upsertedEntry[0].id })
        .where(eq(Transactions.id, linkedToTransactionId))
    }

    return {
      ...upsertedEntry[0],
      transactions,
      linkedToTransactionIds,
    }
  })
}
