import type { NextApiRequest, NextApiResponse } from 'next'
import { eq } from 'drizzle-orm'
import db from '../../db'
import { Transactions } from '../../schema'

export type LinksRequest = JournalEntryUpdate | TransactionUpdate

type JournalEntryUpdate = {
  transactionId?: never
  journalEntryId: number
  transactionIds: number[]
}

type TransactionUpdate = {
  transactionId: number
  journalEntryId: number | null
  transactionIds: number[]
}

function isJournalEntryUpdate(body: LinksRequest): body is JournalEntryUpdate {
  return !body.transactionId
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
    if (isJournalEntryUpdate(req.body)) {
      const { journalEntryId, transactionIds } = req.body

      await db.transaction(async (tx) => {
        await tx
          .update(Transactions)
          .set({ linkedToJournalEntryId: null })
          .where(eq(Transactions.linkedToJournalEntryId, journalEntryId))

        for (const transactionId of transactionIds) {
          await tx
            .update(Transactions)
            .set({ linkedToJournalEntryId: journalEntryId })
            .where(eq(Transactions.id, transactionId))
        }
      })

      res.status(200).end()
      return
    }

    // TODO this functionality is likely not needed long-term
    const { transactionId, journalEntryId, transactionIds } =
      req.body as TransactionUpdate

    await db.transaction(async (tx) => {
      const currentlyLinkedJournalEntry = await tx
        .select()
        .from(Transactions)
        .where(eq(Transactions.id, transactionId))

      const currentlyLinkedJournalEntryId =
        currentlyLinkedJournalEntry[0].linkedToJournalEntryId

      if (currentlyLinkedJournalEntryId) {
        await tx
          .update(Transactions)
          .set({ linkedToJournalEntryId: null })
          .where(
            eq(
              Transactions.linkedToJournalEntryId,
              currentlyLinkedJournalEntryId,
            ),
          )
      }

      if (journalEntryId) {
        for (const tId of [transactionId, ...transactionIds]) {
          await tx
            .update(Transactions)
            .set({ linkedToJournalEntryId: journalEntryId })
            .where(eq(Transactions.id, tId))
        }
      }
    })

    res.status(200).end()
    return
  }

  res.status(405)
}
