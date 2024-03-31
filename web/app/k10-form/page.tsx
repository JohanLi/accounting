import { H1, H2 } from '../components/common/heading'
import { getJournalEntries } from '../getJournalEntries'
import { eq } from 'drizzle-orm'
import { JournalEntries } from '../schema'
import { getAllIncomeYearsInReverse, getIncomeYear } from '../utils'
import { Amount } from '../components/Amount'
import { K10_INTEREST_RATE_PERCENT, SALARY_ACCOUNT_ID } from '../tax'
import { Metadata } from 'next'
import { NextPageProps } from '../types'
import { useSelect } from '../components/select/useSelect'

export const metadata: Metadata = {
  title: 'K10 form',
}

// in ören
const STOCK_ACQUISITION_COST = 2500000
const somethingThatBoostsDividendPool =
  (STOCK_ACQUISITION_COST * K10_INTEREST_RATE_PERCENT) / 100

export default async function K10Form({ searchParams }: NextPageProps) {
  const currentYear = new Date().getFullYear()

  const [selectedYear, Select] = useSelect({
    searchParams,
    name: 'year',
    defaultValue: currentYear,
    values: getAllIncomeYearsInReverse(),
  })

  const lastYear = selectedYear - 1

  const dividendJournalEntry = await getJournalEntries({
    ...getIncomeYear(lastYear),
    where: eq(JournalEntries.description, 'Utbetalning av utdelning'),
  })

  const dividend =
    dividendJournalEntry[0]?.transactions.find((t) => t.accountId === 2898)
      ?.amount || 0

  const twoYearsAgo = selectedYear - 2

  const salaryJournalEntries = await getJournalEntries({
    ...getIncomeYear(twoYearsAgo),
    where: eq(JournalEntries.description, 'Lön'),
  })

  const salary = salaryJournalEntries.reduce((acc, journalEntry) => {
    const income =
      journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID)
        ?.amount || 0
    return acc + income
  }, 0)

  return (
    <>
      <H1>K10 form</H1>
      <div className="flex items-center justify-end space-x-4">
        <div className="flex justify-end">
          <label className="flex items-center space-x-4">
            <div className="text-gray-500">Year</div>
            <Select />
          </label>
        </div>
      </div>
      <div className="space-y-8">
        <H2>Steps and values</H2>
        <ul className="list-inside list-disc space-y-4">
          <li>
            <i>Allmänna uppgifter</i> {'>'} <i>Huvudregel</i>
          </li>
          <li>
            All <i>antal andelar</i> inputs: <Amount amount={50000} />
          </li>
          <li>
            <i>Förvärvade</i>: <Amount amount={0} />
          </li>
          <li>
            <i>Erhållen utdelning</i>: <Amount amount={dividend} />{' '}
            <span className="text-xs text-gray-500">({lastYear})</span>
          </li>
          <li>
            Save and continue to <i>Huvudregeln - Utdelning</i>
          </li>
        </ul>
        <ul className="list-inside list-disc space-y-4">
          <li>
            <i>
              Omkostnadsbelopp * {K10_INTEREST_RATE_PERCENT}% (enligt verklig
              anskaffningsutgift)
            </i>
            : <Amount amount={somethingThatBoostsDividendPool} />
          </li>
          <li>
            Click <i>Lönebaserat utrymme</i>
          </li>
          <li>
            <i>Din kontanta ersättning</i> and{' '}
            <i>Sammanlagd kontant ersättning</i>: <Amount amount={salary} />{' '}
            <span className="text-xs text-gray-500">({twoYearsAgo})</span>
          </li>
          <li>
            Click <i>Kontrollera</i>
          </li>
          <li>
            <i>Kontant ersättning</i>: <Amount amount={salary} />{' '}
            <span className="text-xs text-gray-500">({twoYearsAgo})</span>
          </li>
          <li>Save and go back.</li>
          <li>Submit the rest of the tax return. Done!</li>
        </ul>
      </div>
    </>
  )
}
