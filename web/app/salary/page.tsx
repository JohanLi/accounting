import { JournalEntry } from '../components/JournalEntry'
import { getJournalEntries } from './getJournalEntries'
import { Amount } from '../../src/components/Amount'
import { getAllIncomeYearsInReverse } from '../../src/utils'
import Select from '../components/Select'
import { SALARY_ACCOUNT_ID } from '../../src/tax'
import SalaryForm from './SalaryForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salary',
}

export default async function Salary({
  searchParams,
}: {
  searchParams: { year: string }
}) {
  const journalEntries = await getJournalEntries()

  const currentYear = new Date().getFullYear()
  const selectedIncomeYear = parseInt(searchParams.year) || currentYear
  const items = getAllIncomeYearsInReverse().map((year) => ({
    href: year === currentYear ? '/salary' : `/salary?year=${year}`,
    value: year,
  }))

  let yearFilteredJournalEntries = journalEntries.filter(
    (journalEntry) =>
      new Date(journalEntry.date).getFullYear() === selectedIncomeYear &&
      journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID),
  )

  const incomeThisYear = yearFilteredJournalEntries.reduce(
    (acc, journalEntry) => {
      const income =
        journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID)
          ?.amount || 0
      return acc + income
    },
    0,
  )

  return (
    <>
      <div className="flex">
        <h2 className="flex w-64 justify-between">
          <span className="text-base font-semibold leading-6 text-gray-900">
            Income this year
          </span>
          <Amount amount={incomeThisYear} />
        </h2>
        <label className="ml-auto flex items-center space-x-4">
          <div className="text-gray-500">Year</div>
          <Select selectedValue={selectedIncomeYear} items={items} />
        </label>
      </div>
      {selectedIncomeYear === currentYear && (
        <SalaryForm incomeThisYear={incomeThisYear} />
      )}
      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Journal entries
      </h2>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Date
            </th>
            <th
              scope="col"
              className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Description
            </th>
            <th
              scope="col"
              className="w-48 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Transactions
            </th>
            <th
              scope="col"
              className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Documents
            </th>
            <th scope="col" className="w-16 py-3.5" />
            <th scope="col" className="py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {yearFilteredJournalEntries.map((journalEntry) => (
            <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
          ))}
        </tbody>
      </table>
    </>
  )
}
