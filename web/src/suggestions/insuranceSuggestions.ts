/*
  My liability insurance provider, Trygg-Hansa, does not actually provide a
  monthly receipt even though they charge every month. In their FAQ, they
  verbatim tell you to just take the first receipt and edit the dates yourself.

  After asking Skatteverket about it, they told me to simply link all journal
  entries to the same receipt.

  Because there's no monthly receipt, journal entries will be created based on
  bank transactions.
 */

import db from '../db'
import { Transactions } from '../schema'
import { and, asc, eq, isNull } from 'drizzle-orm'

// set this to the first receipt
const DOCUMENT_ID = null

export async function getInsuranceSuggestions() {
  const insuranceProviderTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        eq(Transactions.description, 'TRYGG-HANSA'),
        isNull(Transactions.journalEntryId),
      ),
    )
    .orderBy(asc(Transactions.id))

  return insuranceProviderTransactions.map((transaction) => {
    const transactions = [
      { accountId: 1930, amount: -transaction.amount },
      { accountId: 6310, amount: transaction.amount },
    ]

    const linkedToTransactionIds = [transaction.id]

    return {
      date: transaction.date,
      // TODO implement a way to tag journal entries
      description: `Insurance – Trygg-Hansa`,
      transactions,
      linkedToTransactionIds,
      documentId: DOCUMENT_ID,
    }
  })
}
