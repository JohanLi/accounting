import { eq } from 'drizzle-orm'

import { DESCRIPTIONS } from '../descriptions'
import { getJournalEntries } from '../getJournalEntries'
import { JournalEntries } from '../schema'
import { DIVIDEND_ACCOUNT_ID } from '../tax'
import { getIncomeYear } from '../utils'

export async function getDividend(incomeYear: number) {
  const journalEntries = await getJournalEntries({
    ...getIncomeYear(incomeYear),
    where: eq(JournalEntries.description, DESCRIPTIONS.DIVIDEND),
  })

  if (journalEntries.length > 1) {
    throw new Error(
      `More than one dividend journal entry found for ${incomeYear}`,
    )
  }

  return (
    journalEntries[0]?.transactions.find(
      (t) => t.accountId === DIVIDEND_ACCOUNT_ID,
    )?.amount || 0
  )
}
