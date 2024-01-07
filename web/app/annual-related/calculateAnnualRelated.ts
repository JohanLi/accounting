import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { getFiscalYear, krToOre } from '../utils'
import { JournalEntries, JournalEntryTransactions } from '../schema'
import { getJournalEntries } from '../getJournalEntries'
import { getTotal } from '../accountTotals/getAccountTotals'

/*
  The third-party service I use to submit the annual report calculates
  these values as well.

  Until I'm sure what I'm doing, and this code is unit-tested, journal entries
  suggested here are always compared against the third-party service.
 */

const CORPORATE_TAX_RATE = 0.206

/*
  "Det skattemässiga resultatet avrundas sedan nedåt till närmaste tiotal"

  It's a weird practice/convention, because if it's all about round numbers,
  you won't get that with 20.6% in corporate tax (2023). Perhaps this is
  from a time when rates were whole numbers.
 */
export function calculateCorporateTax(profitTaxable: number) {
  if (profitTaxable <= 0) {
    return 0
  }

  const roundedDownKrona = Math.floor(profitTaxable / 1000) * 10
  return krToOre(Math.floor(roundedDownKrona * CORPORATE_TAX_RATE))
}

export async function calculateAnnualRelated(fiscalYear: number) {
  const { startInclusive, endExclusive } = getFiscalYear(fiscalYear)

  /*
    Skattemässigt resultat

    "Använder man BAS-kontoplanen är det summan av alla resultatkonton 3000-8799"
    https://www.arsredovisning-online.se/berakna_skatt_pa_arets_resultat
   */
  let result = await getTotal({
    startInclusive,
    endExclusive,
    where: and(
      gte(JournalEntryTransactions.accountId, 3000),
      lte(JournalEntryTransactions.accountId, 8799),
    ),
  })

  const profitBeforeTax = -result[0].amount

  // Ej avdragsgilla kostnader
  result = await getTotal({
    startInclusive,
    endExclusive,
    where: inArray(JournalEntryTransactions.accountId, [
      5099,
      5199,
      6072,
      6342,
      6982,
      6992,
      6993,
      7421,
      7572,
      7622,
      7623,
      7632,
      8423, // Räntekostnader för skatter och avgifter
    ]),
  })

  const nonDeductibleExpenses = result[0].amount

  // Ej skattepliktiga intäkter
  result = await getTotal({
    startInclusive,
    endExclusive,
    where: inArray(JournalEntryTransactions.accountId, [
      8254,
      8314, // Skattefria ränteintäkter
    ]),
  })

  const nonDeductibleRevenue = -result[0].amount

  /*
    Note: current implementation doesn't handle multiple years with losses. Will likely happen in the event that
    I take a long break from doing consulting work.
   */
  let lossFromPrevious = 0

  const profitFromPrevious = await getJournalEntries({
    where: and(
      eq(JournalEntries.description, 'Vinst eller förlust från föregående år'),
      eq(JournalEntries.date, startInclusive),
    ),
  })

  if (profitFromPrevious.length > 0) {
    const amount =
      profitFromPrevious[0].transactions.find((t) => t.accountId === 2099)
        ?.amount || 0

    lossFromPrevious = amount < 0 ? -amount : 0
  }

  const profitTaxable =
    profitBeforeTax +
    nonDeductibleExpenses -
    nonDeductibleRevenue -
    lossFromPrevious

  const tax = calculateCorporateTax(profitTaxable)

  const profitAfterTax = profitBeforeTax - tax

  return {
    profitBeforeTax,
    profitTaxable,
    tax,
    profitAfterTax,
  }
}
