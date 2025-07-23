import { and, asc, eq, isNull, like } from 'drizzle-orm'

import db from '../db'
import { Transactions } from '../schema'

export async function getPaidInvoiceSuggestions() {
  const insuranceProviderTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        like(Transactions.description, 'BG %'),
        isNull(Transactions.journalEntryId),
      ),
    )
    .orderBy(asc(Transactions.id))

  return insuranceProviderTransactions.map((transaction) => {
    const transactions = [
      { accountId: 1930, amount: transaction.amount },
      { accountId: 1510, amount: -transaction.amount },
    ]

    const linkedToTransactionIds = [transaction.id]

    return {
      date: transaction.date,
      // TODO implement a way to tag journal entries
      description: `Inkomst – betalning av kundfordran`,
      transactions,
      linkedToTransactionIds,
    }
  })
}
