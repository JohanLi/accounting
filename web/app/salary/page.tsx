import { Metadata } from 'next'

import { Amount } from '../components/Amount'
import { H1, H2 } from '../components/common/heading'
import { getSelect } from '../components/select/getSelect'
import { JournalEntries } from '../journalEntries/JournalEntries'
import { NextPageProps } from '../types'
import { getAllIncomeYearsInReverse } from '../utils'
import SalaryForm from './SalaryForm'
import { getSalaries } from './getSalaries'

export const metadata: Metadata = {
  title: 'Salary',
}

export default async function Salary(props: NextPageProps) {
  const searchParams = await props.searchParams
  const currentYear = new Date().getFullYear()

  const [selectedYear, Select] = getSelect({
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
          <span className="text-base leading-6 font-semibold text-gray-900">
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
