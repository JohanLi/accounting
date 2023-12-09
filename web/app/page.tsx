import {
  classNames,
  getAllFiscalYearsInReverse,
  getCurrentFiscalYear,
} from '../src/utils'
import Select from './components/Select'
import { JournalEntry } from '../src/components/JournalEntry'
import { getJournalEntries } from './journalEntries'
import JournalEntryCreate from '../src/components/JournalEntryCreate'
import DocumentUpload from '../src/components/DocumentUpload'

const filters = ['All', 'Non-linked'] as const

export default async function Home({
  searchParams,
}: {
  searchParams: { fiscalYear: string; filter: (typeof filters)[number] }
}) {
  const currentFiscalYear = getCurrentFiscalYear()
  const selectedFiscalYear =
    parseInt(searchParams.fiscalYear) || currentFiscalYear
  const items = getAllFiscalYearsInReverse().map((fiscalYear) => ({
    href: fiscalYear === currentFiscalYear ? '/' : `/?fiscalYear=${fiscalYear}`,
    value: fiscalYear,
  }))

  const journalEntries = await getJournalEntries(selectedFiscalYear)
  const nonLinkedJournalEntries = journalEntries.filter(
    (j) => !j.linkedToTransactionIds.length,
  )

  const activeFilter = searchParams.filter || 'All'

  return (
    <>
      <DocumentUpload />
      <JournalEntryCreate />
      <div className="flex items-center justify-end space-x-4">
        {filters.map((filter) => {
          const count =
            filter === 'All'
              ? journalEntries.length
              : nonLinkedJournalEntries.length

          return (
            <a
              key={filter}
              href={`/?fiscalYear=${selectedFiscalYear}&filter=${filter}`}
              className={classNames(
                activeFilter === filter
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-500 hover:text-gray-700',
                'rounded-md px-3 py-2 text-xs font-medium',
              )}
            >
              {filter} ({count})
            </a>
          )
        })}
        <div className="flex justify-end">
          <label className="flex items-center space-x-4">
            <div className="text-gray-500">FY</div>
            <Select selectedValue={selectedFiscalYear} items={items} />
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
          {(activeFilter !== 'Non-linked'
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
