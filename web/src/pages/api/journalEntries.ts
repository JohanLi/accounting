import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, eq, InferModel, isNotNull } from 'drizzle-orm'
import db from '../../db'
import {
  JournalEntries,
  Documents,
  JournalEntryTransactions,
  Transactions,
} from '../../schema'

export type TransactionsInsert = {
  accountId: number
  amount: number
}[]

export type JournalEntryInsert = InferModel<typeof JournalEntries, 'insert'> & {
  transactions: TransactionsInsert
}

export type JournalEntry = InferModel<typeof JournalEntries> & {
  documents: Pick<InferModel<typeof Documents>, 'id'>[]
  transactions: InferModel<typeof JournalEntryTransactions>[]
  hasLink: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JournalEntry[]>,
) {
  if (req.method === 'POST') {
    const entry = req.body as JournalEntryInsert

    const { transactions, ...rest } = entry
    rest.date = new Date(rest.date)

    const insertedEntry = await db.transaction(async (tx) => {
      const insertedEntry = await tx
        .insert(JournalEntries)
        .values(rest)
        .onConflictDoUpdate({
          target: JournalEntries.id,
          set: { date: rest.date, description: rest.description },
        })
        .returning()

      await tx
        .delete(JournalEntryTransactions)
        .where(eq(JournalEntryTransactions.journalEntryId, insertedEntry[0].id))

      const insertedTransactions = await tx
        .insert(JournalEntryTransactions)
        .values(
          transactions.map((t) => ({
            ...t,
            journalEntryId: insertedEntry[0].id,
          })),
        )
        .returning()

      return {
        ...insertedEntry[0],
        documents: [],
        transactions: insertedTransactions,
        hasLink: false,
      }
    })

    res.status(200).json([insertedEntry])
    return
  }

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
