import {
  getAllFiscalYearsInReverse,
  getCurrentFiscalYear,
  getFiscalYear,
} from './utils'
import { JournalEntry } from './journalEntry/JournalEntry'
import { getJournalEntries } from './getJournalEntries'
import JournalEntryCreate from './journalEntry/JournalEntryCreate'
import DocumentUpload from './upload/DocumentUpload'
import JournalEntrySuggestions from './journalEntry/JournalEntrySuggestions'
import { NextPageProps } from './types'
import { useSelect } from './components/select/useSelect'
import { useFilterPill } from './components/filterPill/useFilterPill'

export default async function Home({ searchParams }: NextPageProps) {
  const currentFiscalYear = getCurrentFiscalYear()

  const [selectedFiscalYear, Select] = useSelect({
    searchParams,
    name: 'fiscalYear',
    defaultValue: currentFiscalYear,
    values: getAllFiscalYearsInReverse(),
  })

  const journalEntries = await getJournalEntries(
    getFiscalYear(selectedFiscalYear),
  )
  const nonLinkedJournalEntries = journalEntries.filter(
    (j) => !j.linkedToTransactionIds.length,
  )

  const [journalEntryFilter, FilterPills] = useFilterPill({
    searchParams,
    name: 'journalEntryFilter',
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
      <DocumentUpload />
      <JournalEntryCreate />
      <JournalEntrySuggestions />
      <div className="flex items-center justify-end space-x-4">
        <FilterPills />
        <div className="flex justify-end">
          <label className="flex items-center space-x-4">
            <div className="text-gray-500">FY</div>
            <Select />
          </label>
        </div>
      </div>
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Journal entries
      </h1>
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
          {(journalEntryFilter === 'all'
            ? journalEntries
            : nonLinkedJournalEntries
          ).map((journalEntry) => (
            <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
          ))}
        </tbody>
      </table>
    </>
  )
}
