import { and, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm'
import { getFiscalYear, krToOre } from '../utils'
import db from '../db'
import { JournalEntries, JournalEntryTransactions } from '../schema'

// TODO this doesn't handle fiscal years that result in a loss

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
  let result = await db
    .select({
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      total: sql<number>`sum(amount)::int`,
    })
    .from(JournalEntryTransactions)
    .leftJoin(
      JournalEntries,
      eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
    )
    .where(
      and(
        gte(JournalEntries.date, startInclusive),
        lt(JournalEntries.date, endExclusive),
        gte(JournalEntryTransactions.accountId, 3000),
        lte(JournalEntryTransactions.accountId, 8799),
      ),
    )

  const profitBeforeTax = -result[0].total

  // Ej avdragsgilla kostnader
  result = await db
    .select({
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      total: sql<number>`sum(amount)::int`,
    })
    .from(JournalEntryTransactions)
    .leftJoin(
      JournalEntries,
      eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
    )
    .where(
      and(
        gte(JournalEntries.date, startInclusive),
        lt(JournalEntries.date, endExclusive),
        inArray(JournalEntryTransactions.accountId, [
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
      ),
    )

  const nonDeductibleExpenses = result[0].total

  // Ej skattepliktiga intäkter
  result = await db
    .select({
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      total: sql<number>`sum(amount)::int`,
    })
    .from(JournalEntryTransactions)
    .leftJoin(
      JournalEntries,
      eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
    )
    .where(
      and(
        gte(JournalEntries.date, startInclusive),
        lt(JournalEntries.date, endExclusive),
        inArray(JournalEntryTransactions.accountId, [
          8254,
          8314, // Skattefria ränteintäkter
        ]),
      ),
    )

  const nonDeductibleRevenue = -result[0].total

  const profitTaxable =
    profitBeforeTax + nonDeductibleExpenses - nonDeductibleRevenue

  const tax = calculateCorporateTax(profitTaxable)

  const profitAfterTax = profitBeforeTax - tax

  return {
    profitBeforeTax,
    profitTaxable,
    tax,
    profitAfterTax,
  }
}
