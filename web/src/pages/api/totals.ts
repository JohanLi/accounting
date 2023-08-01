import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, eq, sql } from 'drizzle-orm'
import db from '../../db'
import { JournalEntryTransactions, JournalEntries } from '../../schema'

export type Total = {
  accountId: number
  amount: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Total[]>,
) {
  if (req.method === 'GET') {
    const totals = await db
      .select({
        accountId: JournalEntryTransactions.accountId,
        amount: sql<number>`sum(amount)`,
      })
      .from(JournalEntryTransactions)
      .leftJoin(
        JournalEntries,
        eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
      )
      .groupBy(JournalEntryTransactions.accountId)
      .orderBy(asc(JournalEntryTransactions.accountId))

    res.status(200).json(totals)
    return
  }

  res.status(405)
}
