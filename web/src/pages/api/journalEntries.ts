import type { NextApiRequest, NextApiResponse } from 'next'
import { desc, eq, InferInsertModel, InferSelectModel } from 'drizzle-orm'
import db from '../../db'
import {
  JournalEntries,
  JournalEntryTransactions,
  Transactions,
} from '../../schema'

export type Transaction = {
  accountId: number
  amount: number
}

export type JournalEntryUpsert = InferInsertModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
}

export type JournalEntry = InferSelectModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
}

function isBalanced(entry: JournalEntryUpsert) {
  return entry.transactions.reduce((acc, v) => acc + v.amount, 0) === 0
}

export class InputError extends Error {}

async function upsertJournalEntry(entry: JournalEntryUpsert) {
  if (!isBalanced(entry)) {
    throw new InputError('Transactions do not balance')
  }

  const { transactions, linkedToTransactionIds, ...rest } = entry
  rest.date = new Date(rest.date)

  return db.transaction(async (tx) => {
    const upsertedEntry = await tx
      .insert(JournalEntries)
      .values(rest)
      .onConflictDoUpdate({
        target: JournalEntries.id,
        set: { date: rest.date, description: rest.description },
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JournalEntry[] | { error: string }>,
) {
  if (req.method === 'PUT') {
    const entry = req.body as JournalEntryUpsert

    try {
      const upsertedEntry = await upsertJournalEntry(entry)

      res.status(200).json([upsertedEntry])
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
      orderBy: [desc(JournalEntries.date), desc(JournalEntries.id)],
    })

    res.status(200).json(
      journalEntries.map((j) => {
        const { journalEntryTransactions, transactions: _, ...journalEntry } = j

        const linkedToTransactionIds = j.transactions.map((t) => t.id)

        return {
          ...journalEntry,
          transactions: journalEntryTransactions,
          linkedToTransactionIds,
        }
      }),
    )
    return
  }

  res.status(405)
}
