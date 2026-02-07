import { SQLWrapper, and, eq, isNull } from 'drizzle-orm'

import db from './db'
import { Transactions } from './schema'

export function getNonLinkedBankTransactions({
  where,
}: {
  where?: SQLWrapper
}) {
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
        where,
      ),
    )
}
