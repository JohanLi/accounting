import { and, asc, eq, isNull } from 'drizzle-orm'

import db from '../db'
import { Transaction } from '../getJournalEntries'
import { Transactions } from '../schema'

/*
  If it's a Swedish kapitalförsäkring, the whole account is treated
  like a black box as far as accounting is concerned — you only need to
  book deposits and withdrawals, and not avkastningsskatt and riskpremie
 */
export async function getCapitalInsuranceSuggestions() {
  const bankTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.description, 'TERNARY AB'),
        eq(Transactions.type, 'bankRegular'),
        isNull(Transactions.journalEntryId),
      ),
    )
    .orderBy(asc(Transactions.id))

  return bankTransactions.map((transaction) => ({
    date: transaction.date,
    description: `Bank – insättning kapitalförsäkring`,
    transactions: [
      {
        accountId: 1930,
        amount: transaction.amount,
      },
      { accountId: 1385, amount: -transaction.amount },
    ] satisfies Transaction[],
    linkedToTransactionIds: [transaction.id],
  }))
}
