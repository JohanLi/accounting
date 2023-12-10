'use server'

import { validate } from './validateJournalEntry'
import db from '../db'
import {
  JournalEntries,
  JournalEntryTransactions,
  Transactions,
} from '../schema'
import { eq, InferInsertModel, sql } from 'drizzle-orm'
import { Transaction } from '../journalEntries'

export type JournalEntryUpdate = InferInsertModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
}

export async function updateJournalEntry(
  unvalidatedJournalEntry: JournalEntryUpdate,
) {
  const journalEntry = validate(unvalidatedJournalEntry)

  const { transactions, linkedToTransactionIds, ...rest } = journalEntry
  rest.date = new Date(rest.date)

  return db.transaction(async (tx) => {
    const updatedEntry = await tx
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
      .where(eq(JournalEntryTransactions.journalEntryId, updatedEntry[0].id))

    await tx.insert(JournalEntryTransactions).values(
      transactions.map((t) => ({
        ...t,
        journalEntryId: updatedEntry[0].id,
      })),
    )

    for (const linkedToTransactionId of linkedToTransactionIds) {
      /*
        Apparently the transaction is rolled back if nothing is updated.
        Not sure if this behavior is library-specific.
       */
      await tx
        .update(Transactions)
        .set({ journalEntryId: updatedEntry[0].id })
        .where(eq(Transactions.id, linkedToTransactionId))
    }

    return {
      ...updatedEntry[0],
      transactions,
      linkedToTransactionIds,
    }
  })
}
