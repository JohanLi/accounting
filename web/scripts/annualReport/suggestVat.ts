import { YEAR } from './constants'
import { getAccountTotals } from '../../src/pages/api/accountTotals'
import { Suggestion } from '../../src/pages/api/journalEntries/suggestions'

/*
  TODO
    The idea is to create a UI that wraps this. There'll be more to it,
    because from FY 2024 and onwards, VAT period is quarterly instead of yearly.

    For now, the console output is sent to the API endpoint.
 */

const VAT_ACCOUNT_IDS = [2610, 2620, 2630, 2640, 2614, 2645, 1650, 2650]

async function main() {
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
  const adjustedAmountRoundedNoCents = Math.floor(adjustedAmount / 100) * 100
  const cents = adjustedAmount - adjustedAmountRoundedNoCents

  transactionToAdjust.amount = adjustedAmountRoundedNoCents

  if (cents > 0) {
    suggestion.transactions.push({
      accountId: 3740,
      amount: cents,
    })
  }

  console.log(JSON.stringify(suggestion, null, 2))

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
