'use server'

import { updateJournalEntry } from '../../actions/updateJournalEntry'
import { getJournalEntries } from '../../getJournalEntries'
import { and, eq } from 'drizzle-orm'
import { JournalEntries } from '../../schema'
import { getFiscalYear } from '../../utils'

const descriptionTax = 'Skatt på årets resultat'
const descriptionProfit = 'Årets resultat'
const descriptionProfitFromPrevious = 'Vinst eller förlust från föregående år'

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
      eq(JournalEntries.description, descriptionTax),
      eq(JournalEntries.date, lastDayOfCurrent),
    ),
  })

  const tax = {
    id: existingTax[0]?.id,
    date: lastDayOfCurrent,
    description: descriptionTax,
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
      eq(JournalEntries.description, descriptionProfit),
      eq(JournalEntries.date, lastDayOfCurrent),
    ),
  })

  const profit = {
    id: existingProfit[0]?.id,
    date: lastDayOfCurrent,
    description: descriptionProfit,
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
      eq(JournalEntries.description, descriptionProfitFromPrevious),
      eq(JournalEntries.date, firstDayOfNext),
    ),
  })

  const profitFromPrevious = {
    id: existingProfitFromPrevious[0]?.id,
    date: firstDayOfNext,
    description: descriptionProfitFromPrevious,
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
