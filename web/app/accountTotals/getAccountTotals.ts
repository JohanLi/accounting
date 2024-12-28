import { SQLWrapper, and, asc, eq, gte, lt, sql } from 'drizzle-orm'

import { ACCOUNT_ID_BALANCE_END_EXCLUSIVE } from '../annual-related/accountIds'
import db from '../db'
import { Accounts, JournalEntries, JournalEntryTransactions } from '../schema'
import { getFiscalYear } from '../utils'

export async function getAccounts() {
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
        lt(Accounts.id, ACCOUNT_ID_BALANCE_END_EXCLUSIVE),
        lt(JournalEntries.date, startInclusive),
      ),
    )
    .groupBy(Accounts.id)
}

export async function getTotals({
  startInclusive,
  endExclusive,
  where,
}: {
  startInclusive: Date
  endExclusive: Date
  where?: SQLWrapper
}) {
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
        where,
      ),
    )
    .groupBy(Accounts.id)
}

export async function getTotal({
  startInclusive,
  endExclusive,
  where,
}: {
  startInclusive: Date
  endExclusive: Date
  where?: SQLWrapper
}) {
  return db
    .select({
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      amount: sql<number>`sum(amount)::int`,
    })
    .from(JournalEntryTransactions)
    .leftJoin(
      JournalEntries,
      eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
    )
    .where(
      and(
        gte(JournalEntries.date, startInclusive),
        lt(JournalEntries.date, endExclusive),
        where,
      ),
    )
}

type AccountTotal = {
  description: string
  openingBalance: number
  result: number
  closingBalance: number
}

export async function getAccountTotals(fiscalYear: number) {
  const accounts = await getAccounts()
  const openingBalance = await getOpeningBalance(fiscalYear)
  const totals = await getTotals(getFiscalYear(fiscalYear))

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
      t.id < ACCOUNT_ID_BALANCE_END_EXCLUSIVE
        ? accountTotals[t.id].closingBalance + t.amount
        : 0
  })

  return Object.entries(accountTotals).map(([id, totals]) => ({
    id: Number(id),
    ...totals,
  }))
}
