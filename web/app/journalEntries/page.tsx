import { Metadata } from 'next'

import { H1 } from '../components/common/heading'
import { getFilterPill } from '../components/filterPill/getFilterPill'
import { getSelect } from '../components/select/getSelect'
import { getJournalEntries } from '../getJournalEntries'
import { NextPageProps } from '../types'
import {
  getAllFiscalYearsInReverse,
  getCurrentFiscalYear,
  getFiscalYear,
} from '../utils'
import { JournalEntries } from './JournalEntries'

export const metadata: Metadata = {
  title: 'Journal entries',
}

export default async function JournalEntriesPage(props: NextPageProps) {
  const searchParams = await props.searchParams
  const currentFiscalYear = getCurrentFiscalYear()

  const [selectedFiscalYear, Select] = getSelect({
    searchParams,
    name: 'fiscalYear',
    defaultValue: currentFiscalYear,
    values: getAllFiscalYearsInReverse(),
  })

  const journalEntries = await getJournalEntries(
    getFiscalYear(selectedFiscalYear),
  )
  const nonLinkedJournalEntries = journalEntries.filter(
    (j) => !j.linkedToTransactionIds.length && !j.linkNotApplicable,
  )

  const [journalEntryFilter, FilterPills] = getFilterPill({
    searchParams,
    name: 'filter',
    defaultValue: 'all',
    items: [
      {
        label: `All (${journalEntries.length})`,
        value: 'all',
      },
      {
        label: `Non-linked (${nonLinkedJournalEntries.length})`,
        value: 'non-linked',
      },
    ],
  })

  return (
    <>
      <H1>Journal entries</H1>
      <div className="flex items-center justify-end space-x-4">
        <FilterPills />
        <div className="flex justify-end">
          <label className="flex items-center space-x-4">
            <div className="text-gray-500">FY</div>
            <Select />
          </label>
        </div>
      </div>
      <JournalEntries
        journalEntries={
          journalEntryFilter === 'all'
            ? journalEntries
            : nonLinkedJournalEntries
        }
      />
    </>
  )
}
