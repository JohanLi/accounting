import { SQLWrapper, and, eq, gte, isNull, lte } from 'drizzle-orm'

import db from './db'
import { Transactions } from './schema'

type GetNonLinkedBankTransactionsParams =
  | {
      date: Date
      dateMarginDays?: number
      where?: SQLWrapper
    }
  | {
      date?: undefined
      dateMarginDays?: never
      where?: SQLWrapper
    }

export function getNonLinkedBankTransactions({
  date,
  dateMarginDays,
  where,
}: GetNonLinkedBankTransactionsParams) {
  let dateCondition

  if (date) {
    if (!dateMarginDays) {
      dateCondition = eq(Transactions.date, date)
    } else {
      const startInclusive = new Date(date)
      startInclusive.setDate(startInclusive.getDate() - dateMarginDays)

      const endInclusive = new Date(date)
      endInclusive.setDate(endInclusive.getDate() + dateMarginDays)

      dateCondition = and(
        gte(Transactions.date, startInclusive),
        lte(Transactions.date, endInclusive),
      )
    }
  }

  return db
    .select({
      id: Transactions.id,
      amount: Transactions.amount,
      date: Transactions.date,
    })
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        isNull(Transactions.journalEntryId),
        dateCondition,
        where,
      ),
    )
}
