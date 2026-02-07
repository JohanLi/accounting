import { asc, like } from 'drizzle-orm'

import { getNonLinkedBankTransactions } from '../getNonLinkedBankTransactions'
import { Transaction } from '../getJournalEntries'
import { Transactions } from '../schema'

export async function getPaidInvoiceSuggestions() {
  const insuranceProviderTransactions = await getNonLinkedBankTransactions({
    where: like(Transactions.description, 'BG %'),
  })
    .orderBy(asc(Transactions.id))

  return insuranceProviderTransactions.map((transaction) => {
    const transactions = [
      { accountId: 1930, amount: transaction.amount },
      { accountId: 1510, amount: -transaction.amount },
    ] satisfies Transaction[]

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
