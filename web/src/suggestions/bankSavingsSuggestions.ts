import db from '../db'
import { Transactions } from '../schema'
import { and, asc, eq, gte, isNull } from 'drizzle-orm'

export async function getBankSavingsSuggestions() {
  const bankSavingsTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankSavings'),
        isNull(Transactions.journalEntryId),
        gte(Transactions.date, new Date('2022-07-01')),
      ),
    )
    .orderBy(asc(Transactions.id))

  // doesn't need to be performant, as these suggestions are few and far between
  return Promise.all(
    bankSavingsTransactions.map(async (transaction) => {
      const bankRegularTransactionMatch = await db
        .select()
        .from(Transactions)
        .where(
          and(
            eq(Transactions.type, 'bankRegular'),
            isNull(Transactions.journalEntryId),
            eq(Transactions.date, transaction.date),
            eq(Transactions.amount, -transaction.amount),
          ),
        )

      if (!bankRegularTransactionMatch.length) {
        return null
      }

      const transactions = [
        { accountId: 1930, amount: -transaction.amount },
        { accountId: 1931, amount: transaction.amount },
      ]

      const linkedToTransactionIds = [
        transaction.id,
        bankRegularTransactionMatch[0].id,
      ]

      return {
        date: transaction.date,
        // TODO implement a way to tag journal entries
        description: `Bank – överföring sparkonto`,
        transactions,
        linkedToTransactionIds,
      }
    }),
  )
}
