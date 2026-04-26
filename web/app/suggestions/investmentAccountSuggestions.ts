import { and, asc, eq, inArray, isNull } from 'drizzle-orm'

import db from '../db'
import { Transaction } from '../getJournalEntries'
import { Transactions } from '../schema'

export async function getInvestmentAccountSuggestions() {
  const bankTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.description, 'TERNARY AB'),
        inArray(Transactions.type, ['bankSavings', 'bankRegular']),
        isNull(Transactions.journalEntryId),
      ),
    )
    .orderBy(asc(Transactions.id))

  return bankTransactions.map((transaction) => ({
    date: transaction.date,
    description: `Bank – insättning kapitalförsäkring`,
    transactions: [
      {
        accountId: transaction.type === 'bankRegular' ? 1930 : 1931,
        amount: transaction.amount,
      },
      { accountId: 1385, amount: -transaction.amount },
    ] satisfies Transaction[],
    linkedToTransactionIds: [transaction.id],
  }))
}
