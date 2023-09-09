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
  totals: {
    incoming: number
    thisYear: number
    outgoing: number
  }
}[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccountsResponse>,
) {
  if (req.method === 'GET') {
    const fiscalYear = Number(req.query.fiscalYear)

    const { startInclusive, endExclusive } = getFiscalYear(fiscalYear)

    const currentAccounts = await db
      .select({
        id: Accounts.id,
        description: Accounts.description,
        // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
        total: sql<number>`sum(amount)::int`,
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

    const previousAccounts = await db
      .select({
        id: Accounts.id,
        description: Accounts.description,
        total: sql<number>`sum(amount)::int`,
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
      .where(lt(JournalEntries.date, startInclusive))
      .groupBy(Accounts.id)
      .orderBy(asc(Accounts.id))

    const accounts = previousAccounts.map((previousAccount) => ({
      id: previousAccount.id,
      description: previousAccount.description,
      totals: {
        incoming: previousAccount.total,
        thisYear: 0,
        outgoing: 0,
      },
    }))

    for (const currentAccount of currentAccounts) {
      const account = accounts.find((a) => a.id === currentAccount.id)

      if (!account) {
        accounts.push({
          id: currentAccount.id,
          description: currentAccount.description,
          totals: {
            incoming: 0,
            thisYear: currentAccount.total,
            outgoing: currentAccount.total,
          },
        })
      } else {
        account.totals.thisYear = currentAccount.total
        account.totals.outgoing =
          account.totals.incoming + account.totals.thisYear
      }
    }

    res.status(200).json(accounts)
    return
  }

  res.status(405)
}
