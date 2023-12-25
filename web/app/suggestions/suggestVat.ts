import { YEAR } from '../../scripts/annualReport/constants'
import { getAccountTotals } from '../accountTotals/getAccountTotals'
import { Suggestion } from './getSuggestions'

const VAT_ACCOUNT_IDS = [2610, 2620, 2630, 2640, 2614, 2645, 1650, 2650]

export async function suggestVat() {
  if (YEAR !== 2023) {
    throw new Error('This script is hardcoded for 2023')
  }

  const accountTotals = (await getAccountTotals(YEAR))
    .filter((a) => VAT_ACCOUNT_IDS.includes(a.id))
    .map((a) => ({
      id: a.id,
      description: a.description,
      closingBalance: a.closingBalance,
    }))

  const suggestion: Suggestion = {
    date: new Date('2023-06-30'),
    // TODO – the VAT period that this covers should be given special meaning somehow
    description: 'Momsredovisning: juli 2022 - juni 2023',
    transactions: accountTotals.map((a) => ({
      accountId: a.id,
      amount: -a.closingBalance,
    })),
    linkedToTransactionIds: [],
  }

  const finalVat = accountTotals.reduce((acc, a) => acc + a.closingBalance, 0)
  const finalVatAccountId = finalVat <= 0 ? 2650 : 1650

  const transactionToAdjust = suggestion.transactions.find(
    (t) => t.accountId === finalVatAccountId,
  )

  if (!transactionToAdjust) {
    throw new Error('Could not find transaction to adjust')
  }

  const adjustedAmount = transactionToAdjust.amount + finalVat
  const adjustedAmountNoDecimals = Math.trunc(adjustedAmount / 100) * 100
  const cents = adjustedAmount - adjustedAmountNoDecimals

  transactionToAdjust.amount = adjustedAmountNoDecimals

  if (Math.abs(cents) > 0) {
    suggestion.transactions.push({
      accountId: 3740,
      amount: cents,
    })
  }

  // TODO I think some utility functions for transactions will soon be needed
  return {
    ...suggestion,
    transactions: suggestion.transactions.filter((t) => t.amount !== 0),
  }
}
