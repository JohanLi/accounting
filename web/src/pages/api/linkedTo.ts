import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { Transactions, JournalEntries } from '../../schema'
import { and, eq, InferModel, ne } from 'drizzle-orm'
import { JournalEntry } from './journalEntries'

export type LinkedToResponse = {
  linkedBankTransactions: InferModel<typeof Transactions>[]
  linkedJournalEntry: Omit<JournalEntry, 'hasLink'> | null
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<LinkedToResponse>,
) => {
  if (req.method === 'GET') {
    const bankTransactionId = parseInt(req.query.bankTransactionId as string)
    const journalEntryId = parseInt(req.query.journalEntryId as string)

    if (!bankTransactionId && !journalEntryId) {
      res.status(400).end()
      return
    }

    if (bankTransactionId) {
      const bankTransaction = await db
        .select()
        .from(Transactions)
        .where(eq(Transactions.id, bankTransactionId))

      const { linkedToJournalEntryId } = bankTransaction[0]

      if (!linkedToJournalEntryId) {
        res.status(200).json({
          linkedBankTransactions: [],
          linkedJournalEntry: null,
        })
        return
      }

      const linkedBankTransactions = await db
        .select()
        .from(Transactions)
        .where(
          and(
            eq(Transactions.linkedToJournalEntryId, linkedToJournalEntryId),
            ne(Transactions.id, bankTransactionId),
          ),
        )

      const linkedJournalEntry =
        (await db.query.JournalEntries.findFirst({
          with: {
            transactions: true,
            documents: {
              columns: {
                id: true,
              },
            },
          },
          where: eq(JournalEntries.id, linkedToJournalEntryId),
        })) || null

      res.status(200).json({
        linkedBankTransactions,
        linkedJournalEntry,
      })
      return
    }

    const linkedBankTransactions = await db
      .select()
      .from(Transactions)
      .where(eq(Transactions.linkedToJournalEntryId, journalEntryId))

    res.status(200).json({
      linkedBankTransactions,
      linkedJournalEntry: null,
    })
    return
  }

  res.status(405).end()
  return
}

export default handler
