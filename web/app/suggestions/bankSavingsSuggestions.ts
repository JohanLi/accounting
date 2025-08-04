import { and, asc, eq, isNull } from 'drizzle-orm'

import db from '../db'
import { Transactions } from '../schema'
import { Transaction } from '../getJournalEntries'

const INTEREST_DESCRIPTION = 'RÄNTA'

export async function getBankSavingsSuggestions() {
  const bankSavingsTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankSavings'),
        isNull(Transactions.journalEntryId),
      ),
    )
    .orderBy(asc(Transactions.id))

  // doesn't need to be performant, as these suggestions are few and far between
  const transfers = bankSavingsTransactions
    .filter((transaction) => transaction.description !== INTEREST_DESCRIPTION)
    .map(async (transaction) => {
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
        { accountId: 1931, amount: transaction.amount },
        { accountId: 1930, amount: -transaction.amount },
      ] satisfies Transaction[]

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
    })

  const interests = bankSavingsTransactions
    .filter((transaction) => transaction.description === INTEREST_DESCRIPTION)
    .map((transaction) => ({
      date: transaction.date,
      description: `Bank – ränta sparkonto`,
      transactions: [
        { accountId: 1931, amount: transaction.amount },
        { accountId: 8310, amount: -transaction.amount },
      ] satisfies Transaction[],
      linkedToTransactionIds: [transaction.id],
    }))

  return Promise.all([...transfers, ...interests])
}
