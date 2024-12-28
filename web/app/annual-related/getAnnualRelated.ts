import { and, eq, gte, inArray, lt, or } from 'drizzle-orm'

import { getJournalEntries } from '../getJournalEntries'
import { JournalEntries } from '../schema'
import { getFiscalYear } from '../utils'

export async function getAnnualRelated(fiscalYear: number) {
  const currentFiscalYear = getFiscalYear(fiscalYear)
  const nextFiscalYear = getFiscalYear(fiscalYear + 1)

  const journalEntries = await getJournalEntries({
    where: or(
      and(
        eq(
          JournalEntries.description,
          'Vinst eller förlust från föregående år',
        ),
        eq(JournalEntries.date, currentFiscalYear.startInclusive),
      ),
      and(
        inArray(JournalEntries.description, [
          'Skatt på årets resultat',
          'Årets resultat',
        ]),
        eq(JournalEntries.date, currentFiscalYear.endInclusive),
      ),
      and(
        inArray(JournalEntries.description, [
          'Resultatdisposition',
          'Utbetalning av utdelning',
        ]),
        gte(JournalEntries.date, nextFiscalYear.startInclusive),
        lt(JournalEntries.date, nextFiscalYear.endExclusive),
      ),
    ),
  })

  const profitAfterTax = journalEntries
    .find((j) => j.description === 'Årets resultat')
    ?.transactions.find((t) => t.accountId === 8999)?.amount
  const corporateTax = journalEntries
    .find((j) => j.description === 'Skatt på årets resultat')
    ?.transactions.find((t) => t.accountId === 8910)?.amount

  let dividendAmount
  const appropriatedProfit = journalEntries.find(
    (j) => j.description === 'Resultatdisposition',
  )
  if (appropriatedProfit) {
    const setAsideForDividend = appropriatedProfit.transactions.find(
      (t) => t.accountId === 2898,
    )?.amount

    if (setAsideForDividend) {
      dividendAmount = -setAsideForDividend
    } else {
      dividendAmount = 0
    }
  }

  return {
    journalEntries,
    profitAfterTax,
    corporateTax,
    dividendAmount,
  }
}
