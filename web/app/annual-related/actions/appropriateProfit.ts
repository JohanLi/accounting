'use server'

import { updateJournalEntry } from '../../actions/updateJournalEntry'
import { Transaction } from '../../getJournalEntries'

export async function appropriateProfit(
  profit: number,
  dividendAmount: number,
) {
  if (dividendAmount < 0) {
    throw Error('Dividend amount cannot be negative')
  }

  if (dividendAmount > profit) {
    throw Error('Dividend amount cannot be greater than profit')
  }

  const journalEntry = {
    date: new Date(),
    description: 'Resultatdisposition',
    transactions: [
      {
        accountId: 2091,
        amount: -profit + dividendAmount,
      },
      {
        accountId: 2098,
        amount: profit,
      },
      {
        accountId: 2898,
        amount: -dividendAmount,
      },
    ] satisfies Transaction[],
    linkedToTransactionIds: [],
  }

  await updateJournalEntry(journalEntry)

  if (dividendAmount === 0) {
    return
  }

  const dividendPayoutJournalEntry = {
    date: new Date(),
    description: 'Utbetalning av utdelning',
    transactions: [
      {
        accountId: 1930,
        amount: -dividendAmount,
      },
      {
        accountId: 2898,
        amount: dividendAmount,
      },
    ] satisfies Transaction[],
    linkedToTransactionIds: [],
  }

  await updateJournalEntry(dividendPayoutJournalEntry)
}
