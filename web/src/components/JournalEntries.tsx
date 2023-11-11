import { useState } from 'react'
import {
  classNames,
  getAllFiscalYearsInReverse,
  getCurrentFiscalYear,
  withinFiscalYear,
} from '../utils'
import Select from './Select'
import { JournalEntry } from './JournalEntry'
import useJournalEntries from '../hooks/useJournalEntries'

const filters = ['All', 'Non-linked'] as const

export default function JournalEntries() {
  const journalEntries = useJournalEntries()

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    getCurrentFiscalYear(),
  )

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

  if (!journalEntries.data) {
    return null
  }

  let yearFilteredJournalEntries = journalEntries.data.filter((j) =>
    withinFiscalYear(j, selectedFiscalYear),
  )

  let yearLinkFilteredJournalEntries = yearFilteredJournalEntries.filter(
    (j) => !j.linkedToTransactionIds.length,
  )

  return (
    <>
      <div className="flex items-center justify-end space-x-4">
        {filters.map((filter) => {
          const count =
            filter === 'All'
              ? yearFilteredJournalEntries.length
              : yearLinkFilteredJournalEntries.length

          return (
            <a
              key={filter}
              href="#"
              className={classNames(
                activeFilter === filter
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-500 hover:text-gray-700',
                'rounded-md px-3 py-2 text-xs font-medium',
              )}
              onClick={(e) => {
                e.preventDefault()

                setActiveFilter(filter)
              }}
            >
              {filter} ({count})
            </a>
          )
        })}
        <div className="flex justify-end">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500">FY</div>
            <Select
              value={selectedFiscalYear}
              onChange={setSelectedFiscalYear}
              items={getAllFiscalYearsInReverse()}
            />
          </div>
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
            ? yearFilteredJournalEntries
            : yearLinkFilteredJournalEntries
          ).map((journalEntry) => (
            <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
          ))}
        </tbody>
      </table>
    </>
  )
}
