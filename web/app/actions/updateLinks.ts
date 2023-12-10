'use server'

import { eq } from 'drizzle-orm'
import db from '../../src/db'
import { Transactions } from '../../src/schema'

export async function updateLinks(
  journalEntryId: number,
  transactionIds: number[],
) {
  await db.transaction(async (tx) => {
    await tx
      .update(Transactions)
      .set({ journalEntryId: null })
      .where(eq(Transactions.journalEntryId, journalEntryId))

    for (const transactionId of transactionIds) {
      await tx
        .update(Transactions)
        .set({ journalEntryId: journalEntryId })
        .where(eq(Transactions.id, transactionId))
    }
  })
}
