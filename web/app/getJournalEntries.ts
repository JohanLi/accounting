import {
  InferSelectModel,
  SQLWrapper,
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  lt,
  sql,
} from 'drizzle-orm'

import db from './db'
import {
  JournalEntries,
  JournalEntryTransactions,
  Transactions,
} from './schema'

export type Transaction = {
  accountId: number
  amount: number
}

export type JournalEntryType = InferSelectModel<typeof JournalEntries> & {
  transactions: Transaction[]
  linkedToTransactionIds: number[]
  linkNotApplicable: boolean
}

const OLD_BANK_ACCOUNT_ID = 1932
const PERSONAL_PAYMENT_ACCOUNT_ID = 2890

export async function getJournalEntries({
  startInclusive,
  endExclusive,
  where,
}: {
  startInclusive?: Date
  endExclusive?: Date
  where?: SQLWrapper
}): Promise<JournalEntryType[]> {
  const journalEntries = await db
    .select({
      ...getTableColumns(JournalEntries),
      /*
        Some journal entries, particularly the tax account-related ones, are linked to two transactions.
        To prevent those cases from returning two sets of journal entry transactions, DISTINCT is used.
        I believe it can also be accomplished using two CTEs.
       */
      transactions: sql<Transaction[]>`array_agg(DISTINCT jsonb_build_object(
        'accountId', ${JournalEntryTransactions.accountId},
        'amount', ${JournalEntryTransactions.amount}
      ))`,
      linkedToTransactionIds: sql<
        number[]
      >`array_remove(array_agg(distinct ${Transactions.id}), NULL)`,
    })
    .from(JournalEntries)
    .leftJoin(
      JournalEntryTransactions,
      eq(JournalEntries.id, JournalEntryTransactions.journalEntryId),
    )
    .leftJoin(Transactions, eq(JournalEntries.id, Transactions.journalEntryId))
    .where(
      and(
        startInclusive && gte(JournalEntries.date, startInclusive),
        endExclusive && lt(JournalEntries.date, endExclusive),
        where,
      ),
    )
    .orderBy(desc(JournalEntries.date), desc(JournalEntries.id))
    .groupBy(JournalEntries.id)

  return journalEntries.map((j) => {
    const linkNotApplicable = j.transactions.some(
      (t) =>
        t.accountId === OLD_BANK_ACCOUNT_ID ||
        t.accountId === PERSONAL_PAYMENT_ACCOUNT_ID,
    )

    return {
      ...j,
      linkNotApplicable,
    }
  })
}
