import { getFiscalYear, oreToKrona } from '../../src/utils'
import { YEAR } from './year'
import db from '../../src/db'
import { JournalEntries, JournalEntryTransactions } from '../../src/schema'
import { and, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm'
import { upsertJournalEntry } from '../../src/pages/api/journalEntries'

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

  console.log(`Profit and Loss: ${oreToKrona(profitAndLossTaxable)}`)
  console.log(`Rounded down to nearest ten: ${roundedDownKrona}`)
  console.log(`Tax: ${tax}`)

  const amount = tax * 100

  const corporateTaxTransaction = [
    {
      /*
        Previously, 2510 was used instead of 2512. It doesn't matter much,
        but not using 2510 for everything Skatteverket-related lets you be
        more "granular" in understanding what types of taxes you're owed.

        Preliminary tax should in the future use 2518 instead of 2510. Then,
        2512 can be compared against 2518, rather than all types of taxes
        being aggregated into 2510.
       */
      accountId: 2512,
      amount: -amount,
    },
    {
      accountId: 8910,
      amount,
    },
  ]

  const journalEntry = {
    date: endInclusive,
    description: `Corporate tax ${YEAR}`,
    transactions: corporateTaxTransaction,
    linkedToTransactionIds: [],
  }

  console.log(JSON.stringify(journalEntry, null, 2))

  await upsertJournalEntry(journalEntry)

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
