import { Amount } from '../components/Amount'
import { getAllIncomeYearsInReverse } from '../utils'
import SalaryForm from './SalaryForm'
import { Metadata } from 'next'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { H1, H2 } from '../components/common/heading'
import { JournalEntries } from '../journalEntries/JournalEntries'
import { getSalaries } from './getSalaries'

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

  const { journalEntries, total } = await getSalaries(selectedYear)

  return (
    <>
      <H1>Salary</H1>
      <div className="flex">
        <h2 className="flex w-64 justify-between">
          <span className="text-base font-semibold leading-6 text-gray-900">
            Income this year
          </span>
          <Amount amount={total} />
        </h2>
        <label className="ml-auto flex items-center space-x-4">
          <div className="text-gray-500">Year</div>
          <Select />
        </label>
      </div>
      {selectedYear === currentYear && <SalaryForm incomeThisYear={total} />}
      <H2>Related journal entries</H2>
      <JournalEntries journalEntries={journalEntries} />
    </>
  )
}
