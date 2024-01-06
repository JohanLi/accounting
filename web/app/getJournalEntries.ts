import {
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  InferSelectModel,
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
}: {
  startInclusive: Date
  endExclusive: Date
}): Promise<JournalEntryType[]> {
  const journalEntries = await db
    .select({
      ...getTableColumns(JournalEntries),
      transactions: sql<Transaction[]>`array_agg(json_build_object(
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
        gte(JournalEntries.date, startInclusive),
        lt(JournalEntries.date, endExclusive),
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
