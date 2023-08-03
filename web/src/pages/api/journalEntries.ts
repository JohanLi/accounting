import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, InferModel, isNotNull } from 'drizzle-orm'
import db from '../../db'
import {
  JournalEntries,
  Documents,
  JournalEntryTransactions,
  Transactions,
} from '../../schema'

export type JournalEntry = InferModel<typeof JournalEntries> & {
  documents: Pick<InferModel<typeof Documents>, 'id'>[]
  transactions: InferModel<typeof JournalEntryTransactions>[]
  hasLink: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JournalEntry[]>,
) {
  if (req.method === 'GET') {
    const linkedToJournalEntryIds = new Set(
      (
        await db
          .selectDistinct({
            linkedToJournalEntryId: Transactions.linkedToJournalEntryId,
          })
          .from(Transactions)
          .where(isNotNull(Transactions.linkedToJournalEntryId))
      ).map((t) => t.linkedToJournalEntryId),
    )

    const journalEntries = await db.query.JournalEntries.findMany({
      with: {
        transactions: true,
        documents: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: asc(JournalEntries.date),
    })

    res.status(200).json(
      journalEntries.map((v) => ({
        ...v,
        hasLink: linkedToJournalEntryIds.has(v.id),
      })),
    )
    return
  }

  res.status(405)
}
