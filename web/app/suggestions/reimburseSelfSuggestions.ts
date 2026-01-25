import { and, eq, isNull } from 'drizzle-orm'

import { getTotal } from '../accountTotals/getAccountTotals'
import db from '../db'
import { PERSONAL_PAYMENT_ACCOUNT_ID, Transaction } from '../getJournalEntries'
import { JournalEntryTransactions, Transactions } from '../schema'
import { getCurrentFiscalYear, getFiscalYear } from '../utils'

export async function getReimburseSelfSuggestions() {
  /*
   Debt doesn't have to be repaid within the same fiscal year. A likely scenario
   is that I make a personal payment in June, which doesn't get reimbursed until
   July (next fiscal year).
   */
  const previousFiscalYear = getCurrentFiscalYear() - 1
  const { startInclusive } = getFiscalYear(previousFiscalYear)

  const totals = await getTotal({
    startInclusive,
    where: eq(JournalEntryTransactions.accountId, PERSONAL_PAYMENT_ACCOUNT_ID),
  })
  const { amount } = totals[0]

  if (!amount) {
    return []
  }

  const transactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        isNull(Transactions.journalEntryId),
        eq(Transactions.amount, -amount),
      ),
    )

  return transactions.map((transaction) => {
    const transactions = [
      { accountId: 1930, amount: transaction.amount },
      { accountId: PERSONAL_PAYMENT_ACCOUNT_ID, amount: -transaction.amount },
    ] satisfies Transaction[]

    return {
      date: transaction.date,
      description: 'Utlägg utbetalning',
      transactions,
      linkedToTransactionIds: [transaction.id],
    }
  })
}
