import type { NextApiRequest, NextApiResponse } from 'next'
import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'
import db from '../../db'
import {
  Accounts,
  JournalEntryTransactions,
  JournalEntries,
} from '../../schema'
import { getFiscalYear } from '../../utils'

export type AccountsResponse = {
  id: number
  description: string
  total: number
}[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccountsResponse>,
) {
  if (req.method === 'GET') {
    const fiscalYear = Number(req.query.fiscalYear)

    const { startInclusive, endExclusive } = getFiscalYear(fiscalYear)

    const accounts = await db
      .select({
        id: Accounts.id,
        description: Accounts.description,
        total: sql<number>`sum(amount)`,
      })
      .from(Accounts)
      .leftJoin(
        JournalEntryTransactions,
        eq(Accounts.id, JournalEntryTransactions.accountId),
      )
      .leftJoin(
        JournalEntries,
        eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
      )
      .where(
        and(
          gte(JournalEntries.date, startInclusive),
          lt(JournalEntries.date, endExclusive),
        ),
      )
      .groupBy(Accounts.id)
      .orderBy(asc(Accounts.id))

    res.status(200).json(accounts)
    return
  }

  res.status(405)
}
