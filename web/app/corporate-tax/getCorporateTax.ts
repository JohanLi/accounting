import { getTotals } from '../accountTotals/getAccountTotals'
import { Accounts, JournalEntries, JournalEntryTransactions } from '../schema'
import { and, desc, eq, ne } from 'drizzle-orm'
import { getCurrentFiscalYear, getFiscalYear } from '../utils'
import db from '../db'

export async function getCorporateTax() {
  const currentFiscalYear = getCurrentFiscalYear()
  const recentFiscalYears: {
    fiscalYear: number
    total: number
  }[] = []

  for (let year = currentFiscalYear; year > currentFiscalYear - 4; year--) {
    const fiscalYear = getFiscalYear(year)

    // preliminary tax is shifted one month forward
    const startInclusive = new Date(fiscalYear.startInclusive)
    startInclusive.setMonth(startInclusive.getMonth() + 1)

    const endExclusive = new Date(fiscalYear.endExclusive)
    endExclusive.setMonth(endExclusive.getMonth() + 1)

    const totals = await getTotals({
      startInclusive,
      endExclusive,
      where: and(
        eq(JournalEntries.description, 'Skatt – Debiterad preliminärskatt'),
        eq(Accounts.id, 2510),
      ),
    })

    recentFiscalYears.push({
      fiscalYear: year,
      total: totals[0].amount,
    })
  }

  const journalEntries = await db
    .select()
    .from(JournalEntries)
    .innerJoin(
      JournalEntryTransactions,
      eq(JournalEntries.id, JournalEntryTransactions.journalEntryId),
    )
    .where(
      and(
        eq(JournalEntryTransactions.accountId, 2510),
        ne(JournalEntries.description, 'Skatt – Debiterad preliminärskatt'),
      ),
    )
    .orderBy(desc(JournalEntries.date))

  return {
    recentFiscalYears: await Promise.all(recentFiscalYears),
    journalEntries,
  }
}
