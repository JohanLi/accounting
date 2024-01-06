import { getJournalEntries } from '../getJournalEntries'
import { and, inArray } from 'drizzle-orm'
import { JournalEntries } from '../schema'
import { getFiscalYear } from '../utils'

const descriptions = [
  'Skatt på årets resultat',
  'Årets resultat',
  'Vinst eller förlust från föregående år',
  'Resultatdisposition',
  'Utbetalning av utdelning',
]

export async function getAnnualRelated(fiscalYear: number) {
  const { endInclusive: startInclusive } = getFiscalYear(fiscalYear)
  const { endInclusive: endExclusive } = getFiscalYear(fiscalYear + 1)

  const journalEntries = await getJournalEntries({
    startInclusive,
    endExclusive,
    condition: and(inArray(JournalEntries.description, descriptions)),
  })

  const profitLoss = journalEntries
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
    dividendAmount =
      appropriatedProfit.transactions.find((t) => t.accountId === 2898)
        ?.amount || 0
  }

  return {
    journalEntries,
    profitLoss,
    corporateTax,
    dividendAmount,
  }
}
