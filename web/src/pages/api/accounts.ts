import type { NextApiRequest, NextApiResponse } from 'next'
import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'
import db from '../../db'
import {
  Accounts,
  JournalEntryTransactions,
  JournalEntries,
} from '../../schema'
import { getFiscalYear } from '../../utils'

async function getTotals(options: {
  fiscalYear: number
  untilExclusive?: true
}) {
  const { startInclusive, endExclusive } = getFiscalYear(options.fiscalYear)

  return db
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
      !options.untilExclusive
        ? and(
            gte(JournalEntries.date, startInclusive),
            lt(JournalEntries.date, endExclusive),
          )
        : lt(JournalEntries.date, startInclusive),
    )
    .groupBy(Accounts.id)
    .orderBy(asc(Accounts.id))
}

export async function getAccounts(fiscalYear: number) {
  const currentAccounts = await getTotals({ fiscalYear })

  const previousAccounts = await getTotals({ fiscalYear, untilExclusive: true })

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

  return accounts.sort((a, b) => a.id - b.id)
}

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

    const accounts = await getAccounts(fiscalYear)

    res.status(200).json(accounts)
    return
  }

  res.status(405)
}
