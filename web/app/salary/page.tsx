import { Amount } from '../components/Amount'
import { getAllIncomeYearsInReverse, getIncomeYear } from '../utils'
import { SALARY_ACCOUNT_ID } from '../tax'
import SalaryForm from './SalaryForm'
import { Metadata } from 'next'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { getJournalEntries } from '../getJournalEntries'
import { H1, H2 } from '../components/common/heading'
import { JournalEntries } from '../journalEntries/JournalEntries'

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
      <H1>Salary</H1>
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
      <H2>Related journal entries</H2>
      <JournalEntries journalEntries={salaryRelatedJournalEntries} />
    </>
  )
}
