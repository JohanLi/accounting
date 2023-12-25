import { getFiscalYear, oreToKrona } from '../../app/utils'
import { YEAR } from './constants'
import db from '../../app/db'
import { JournalEntries, JournalEntryTransactions } from '../../app/schema'
import { and, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm'
import { Suggestion } from '../../app/suggestions/getSuggestions'

/*
  The third-party service I use to submit the annual report calculates
  these values as well.

  Until I'm sure what I'm doing, and this code is unit-tested, journal entries
  suggested here are always compared against the third-party service.
 */

const CORPORATE_TAX_RATE = 0.206

async function main() {
  const { startInclusive, endInclusive, endExclusive } = getFiscalYear(YEAR)

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

  const profitAndLoss = -result[0].total

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

  const profitAndLossTaxable =
    profitAndLoss + nonDeductibleExpenses - nonDeductibleRevenue

  /*
    "Det skattemässiga resultatet avrundas sedan nedåt till närmaste tiotal"

    It's a weird practice/convention, because if it's all about round numbers,
    you won't get that with 20.6% in corporate tax (2023). Perhaps this is
    from a time when rates were whole numbers.
   */
  const roundedDownKrona = Math.floor(profitAndLossTaxable / 1000) * 10
  const tax = Math.floor(roundedDownKrona * CORPORATE_TAX_RATE)

  console.log(`Profit and Loss: ${oreToKrona(profitAndLoss)}`)
  console.log(`Profit and Loss (taxable): ${oreToKrona(profitAndLossTaxable)}`)
  console.log(`Rounded down to nearest ten: ${roundedDownKrona}`)
  console.log(`Tax: ${tax}`)

  const taxAmount = tax * 100

  const suggestionCorporateTax: Suggestion = {
    date: endInclusive,
    description: 'Skatt på årets resultat',
    transactions: [
      {
        accountId: 2510,
        amount: -taxAmount,
      },
      {
        accountId: 8910,
        amount: taxAmount,
      },
    ],
    linkedToTransactionIds: [],
  }

  console.log(JSON.stringify(suggestionCorporateTax, null, 2))

  const resultAmount = profitAndLoss - taxAmount

  const suggestionResult: Suggestion = {
    date: endInclusive,
    description: 'Årets resultat',
    transactions: [
      {
        accountId: 2099,
        amount: -resultAmount,
      },
      {
        accountId: 8999,
        amount: resultAmount,
      },
    ],
    linkedToTransactionIds: [],
  }

  console.log(JSON.stringify(suggestionResult, null, 2))

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
