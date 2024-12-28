import { and, asc, eq, isNull } from 'drizzle-orm'

import db from '../db'
import { Transactions } from '../schema'

export function getTaxTransactions() {
  return db
    .select()
    .from(Transactions)
    .where(
      and(eq(Transactions.type, 'tax'), isNull(Transactions.journalEntryId)),
    )
    .orderBy(asc(Transactions.id))
}
