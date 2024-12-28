'use server'

import { and, eq } from 'drizzle-orm'

import { updateJournalEntry } from '../../actions/updateJournalEntry'
import { DESCRIPTIONS } from '../../descriptions'
import { getJournalEntries } from '../../getJournalEntries'
import { JournalEntries } from '../../schema'
import { getFiscalYear } from '../../utils'

export type SubmitProfitAndTax = {
  corporateTax: number
  profitAfterTax: number
  fiscalYear: number
}

export async function submitProfitAndTax({
  corporateTax,
  profitAfterTax,
  fiscalYear,
}: SubmitProfitAndTax) {
  const lastDayOfCurrent = getFiscalYear(fiscalYear).endInclusive
  const firstDayOfNext = getFiscalYear(fiscalYear + 1).startInclusive

  const existingTax = await getJournalEntries({
    where: and(
      eq(JournalEntries.description, DESCRIPTIONS.TAX),
      eq(JournalEntries.date, lastDayOfCurrent),
    ),
  })

  const tax = {
    id: existingTax[0]?.id,
    date: lastDayOfCurrent,
    description: DESCRIPTIONS.TAX,
    transactions: [
      {
        accountId: 2510,
        amount: -corporateTax,
      },
      {
        accountId: 8910,
        amount: corporateTax,
      },
    ],
    linkedToTransactionIds: [],
  }

  const existingProfit = await getJournalEntries({
    where: and(
      eq(JournalEntries.description, DESCRIPTIONS.PROFIT),
      eq(JournalEntries.date, lastDayOfCurrent),
    ),
  })

  const profit = {
    id: existingProfit[0]?.id,
    date: lastDayOfCurrent,
    description: DESCRIPTIONS.PROFIT,
    transactions: [
      {
        accountId: 2099,
        amount: -profitAfterTax,
      },
      {
        accountId: 8999,
        amount: profitAfterTax,
      },
    ],
    linkedToTransactionIds: [],
  }

  const existingProfitFromPrevious = await getJournalEntries({
    where: and(
      eq(JournalEntries.description, DESCRIPTIONS.PROFIT_FROM_PREVIOUS),
      eq(JournalEntries.date, firstDayOfNext),
    ),
  })

  const profitFromPrevious = {
    id: existingProfitFromPrevious[0]?.id,
    date: firstDayOfNext,
    description: DESCRIPTIONS.PROFIT_FROM_PREVIOUS,
    transactions: [
      {
        accountId: 2098,
        amount: -profitAfterTax,
      },
      {
        accountId: 2099,
        amount: profitAfterTax,
      },
    ],
    linkedToTransactionIds: [],
  }

  await updateJournalEntry(tax)
  await updateJournalEntry(profit)
  await updateJournalEntry(profitFromPrevious)
}
