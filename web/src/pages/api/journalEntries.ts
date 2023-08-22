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
  linkedToTransactionIds?: number[]
}

export type JournalEntry = InferModel<typeof JournalEntries> & {
  documents: Pick<InferModel<typeof Documents>, 'id'>[]
  transactions: InferModel<typeof JournalEntryTransactions>[]
  hasLink: boolean
}

function isBalanced(entry: JournalEntryInsert) {
  return entry.transactions.reduce((acc, v) => acc + v.amount, 0) === 0
}

export class InputError extends Error {}

async function createJournalEntry(entry: JournalEntryInsert) {
  if (!isBalanced(entry)) {
    throw new InputError('Transactions do not balance')
  }

  const { transactions, linkedToTransactionIds, ...rest } = entry
  rest.date = new Date(rest.date)

  return db.transaction(async (tx) => {
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

    for (const linkedToTransactionId of linkedToTransactionIds || []) {
      /*
        Apparently the transaction is rolled back if nothing is updated.
        Not sure if this behavior is library-specific.
       */
      await tx
        .update(Transactions)
        .set({ linkedToJournalEntryId: insertedEntry[0].id })
        .where(eq(Transactions.id, linkedToTransactionId))
    }

    return {
      ...insertedEntry[0],
      documents: [],
      transactions: insertedTransactions,
      hasLink: !!linkedToTransactionIds,
    }
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JournalEntry[] | { error: string }>,
) {
  if (req.method === 'POST') {
    const entry = req.body as JournalEntryInsert

    try {
      const insertedEntry = await createJournalEntry(entry)

      res.status(200).json([insertedEntry])
      return
    } catch (e) {
      if (e instanceof InputError) {
        res.status(400).json({ error: e.message })
        return
      }

      res.status(500)
      return
    }
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
