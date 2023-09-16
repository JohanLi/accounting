import type { NextApiRequest, NextApiResponse } from 'next'
import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'
import db from '../../db'
import {
  Accounts,
  JournalEntryTransactions,
  JournalEntries,
} from '../../schema'
import { getFiscalYear } from '../../utils'

const BALANCE_END_EXCLUSIVE = 3000

async function getAccounts() {
  return db.select().from(Accounts).orderBy(asc(Accounts.id))
}

async function getOpeningBalance(fiscalYear: number) {
  const { startInclusive } = getFiscalYear(fiscalYear)

  return db
    .select({
      id: Accounts.id,
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      openingBalance: sql<number>`sum(amount)::int`,
    })
    .from(Accounts)
    .innerJoin(
      JournalEntryTransactions,
      eq(Accounts.id, JournalEntryTransactions.accountId),
    )
    .innerJoin(
      JournalEntries,
      eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
    )
    .where(
      and(
        lt(Accounts.id, BALANCE_END_EXCLUSIVE),
        lt(JournalEntries.date, startInclusive),
      ),
    )
    .groupBy(Accounts.id)
}

async function getTotals(fiscalYear: number) {
  const { startInclusive, endExclusive } = getFiscalYear(fiscalYear)

  return db
    .select({
      id: Accounts.id,
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      amount: sql<number>`sum(amount)::int`,
    })
    .from(Accounts)
    .innerJoin(
      JournalEntryTransactions,
      eq(Accounts.id, JournalEntryTransactions.accountId),
    )
    .innerJoin(
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
}

type AccountTotal = {
  description: string
  openingBalance: number
  result: number
  closingBalance: number
}

export type AccountTotalsResponse = ({
  id: number
} & AccountTotal)[]

export async function getAccountTotals(fiscalYear: number) {
  const accounts = await getAccounts()
  const openingBalance = await getOpeningBalance(fiscalYear)
  const totals = await getTotals(fiscalYear)

  const accountTotals: { [id: number]: AccountTotal } = {}

  accounts.forEach((a) => {
    accountTotals[a.id] = {
      description: a.description,
      openingBalance: 0,
      result: 0,
      closingBalance: 0,
    }
  })

  openingBalance.forEach((o) => {
    accountTotals[o.id].openingBalance = o.openingBalance
    accountTotals[o.id].closingBalance = o.openingBalance
  })

  totals.forEach((t) => {
    accountTotals[t.id].result = t.amount
    accountTotals[t.id].closingBalance =
      t.id < BALANCE_END_EXCLUSIVE
        ? accountTotals[t.id].closingBalance + t.amount
        : 0
  })

  return Object.entries(accountTotals).map(([id, totals]) => ({
    id: Number(id),
    ...totals,
  }))
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccountTotalsResponse>,
) {
  if (req.method === 'GET') {
    const fiscalYear = Number(req.query.fiscalYear)

    const accounts = await getAccountTotals(fiscalYear)

    res.status(200).json(accounts)
    return
  }

  res.status(405)
}
