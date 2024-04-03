import { getJournalEntries } from '../getJournalEntries'
import { getIncomeYear } from '../utils'
import { SALARY_ACCOUNT_ID } from '../tax'
import { eq } from 'drizzle-orm'
import { JournalEntries } from '../schema'
import { DESCRIPTIONS } from '../descriptions'

export async function getSalaries(incomeYear: number) {
  const journalEntries = await getJournalEntries({
    ...getIncomeYear(incomeYear),
    where: eq(JournalEntries.description, DESCRIPTIONS.SALARY),
  })

  const total = journalEntries.reduce((acc, journalEntry) => {
    const salary =
      journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID)
        ?.amount || 0
    return acc + salary
  }, 0)

  return { journalEntries, total }
}
