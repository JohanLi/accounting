import { getTotals } from '../accountTotals/getAccountTotals'
import { Accounts, JournalEntries } from '../schema'
import { and, eq } from 'drizzle-orm'
import { getFiscalYear } from '../utils'

export async function getPaidPreliminaryTax(fiscalYear: number) {
  const currentFiscalYear = getFiscalYear(fiscalYear)

  /*
   Preliminary tax is shifted one month forward. E.g., the installment for June 2023, which is the final month of
   FY 2023, is paid in July 2023.
   */
  const startInclusive = new Date(currentFiscalYear.startInclusive)
  startInclusive.setMonth(startInclusive.getMonth() + 1)

  const endExclusive = new Date(currentFiscalYear.endExclusive)
  endExclusive.setMonth(endExclusive.getMonth() + 1)

  const totals = await getTotals({
    startInclusive,
    endExclusive,
    where: and(
      eq(JournalEntries.description, 'Skatt – Debiterad preliminärskatt'),
      eq(Accounts.id, 2510),
    ),
  })

  return totals[0].amount
}
