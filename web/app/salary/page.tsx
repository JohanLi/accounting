import { JournalEntry } from '../journalEntry/JournalEntry'
import { Amount } from '../components/Amount'
import { getAllIncomeYearsInReverse, getIncomeYear } from '../utils'
import { SALARY_ACCOUNT_ID } from '../tax'
import SalaryForm from './SalaryForm'
import { Metadata } from 'next'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { getJournalEntries } from '../getJournalEntries'

export const metadata: Metadata = {
  title: 'Salary',
}

export default async function Salary({ searchParams }: NextPageProps) {
  const currentYear = new Date().getFullYear()

  const [selectedYear, Select] = useSelect({
    searchParams,
    name: 'year',
    defaultValue: currentYear,
    values: getAllIncomeYearsInReverse(),
  })

  const journalEntries = await getJournalEntries(getIncomeYear(selectedYear))

  let salaryRelatedJournalEntries = journalEntries.filter((journalEntry) =>
    journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID),
  )

  const incomeThisYear = salaryRelatedJournalEntries.reduce(
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
          <Select />
        </label>
      </div>
      {selectedYear === currentYear && (
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
          {salaryRelatedJournalEntries.map((journalEntry) => (
            <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
          ))}
        </tbody>
      </table>
    </>
  )
}
