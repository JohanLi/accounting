import { JournalEntry as JournalEntryType } from './api/journalEntries'
import { useState } from 'react'
import { classNames, withinFiscalYear } from '../utils'
import { useQuery } from '@tanstack/react-query'
import Dropdown from '../components/Dropdown'
import { JournalEntry } from '../components/JournalEntry'

const filters = ['All', 'Non-linked'] as const

export default function JournalEntries() {
  const journalEntries = useQuery<JournalEntryType[]>({
    queryKey: ['journalEntries'],
    queryFn: () => fetch('/api/journalEntries').then((res) => res.json()),
  })

  // TODO hardcoded to 2023 right now, as no entries exist for 2024 yet
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(2023)

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

  if (!journalEntries.data) {
    return null
  }

  let yearFilteredJournalEntries = journalEntries.data.filter((v) =>
    withinFiscalYear(v, selectedFiscalYear),
  )

  let yearLinkFilteredJournalEntries = yearFilteredJournalEntries.filter(
    (v) => !v.hasLink,
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
            <Dropdown
              selectedFiscalYear={selectedFiscalYear}
              setSelectedFiscalYear={setSelectedFiscalYear}
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
