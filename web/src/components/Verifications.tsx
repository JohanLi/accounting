import { Amount } from './Amount'
import Documents from './Documents'
import { Verification } from '../pages/api/verifications'
import { DateFormatted } from './DateFormatted'
import Modal from './Modal'
import LinkedTo, { LinkedToProps } from './LinkedTo'
import { useState } from 'react'
import { classNames, withinFiscalYear } from '../utils'
import { LinkIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import Dropdown from './Dropdown'

const filters = ['All', 'Non-linked'] as const

export default function Verifications() {
  const verifications = useQuery<Verification[]>({
    queryKey: ['verifications'],
    queryFn: () => fetch('/api/verifications').then((res) => res.json()),
  })

  // TODO hardcoded to 2023 right now, as no entries exist for 2024 yet
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(2023)

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

  const [showLinkedTo, setShowLinkedTo] = useState<LinkedToProps | null>(null)

  if (!verifications.data) {
    return null
  }

  let yearFilteredVerifications = verifications.data.filter((v) =>
    withinFiscalYear(v, selectedFiscalYear),
  )

  let yearLinkFilteredVerifications = yearFilteredVerifications.filter(
    (v) => !v.hasLink,
  )

  return (
    <div>
      <div className="flex items-center justify-end space-x-4">
        {filters.map((filter) => {
          const count =
            filter === 'All'
              ? yearFilteredVerifications.length
              : yearLinkFilteredVerifications.length

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
        Verifications
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {(activeFilter !== 'Non-linked'
            ? yearFilteredVerifications
            : yearLinkFilteredVerifications
          ).map((verification) => (
            <tr key={verification.id}>
              <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                <DateFormatted date={verification.date} />
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                {verification.description}
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-sm text-gray-500">
                {verification.transactions.length && (
                  <table className="min-w-full divide-y divide-gray-300">
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {verification.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="w-16 py-2 pr-3 text-sm text-gray-500">
                            {transaction.accountCode}
                          </td>
                          <td className="px-2 py-2 text-right text-sm font-medium">
                            <Amount amount={transaction.amount} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <Documents documents={verification.documents} />
              </td>
              <td className="relative whitespace-nowrap py-4 text-right text-xs">
                {verification.hasLink && (
                  <a
                    href="#"
                    className={classNames(
                      'inline-flex items-center text-gray-500 hover:text-gray-800',
                      showLinkedTo ? 'text-gray-800' : '',
                    )}
                    onClick={(e) => {
                      e.preventDefault()

                      setShowLinkedTo({ verification })
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!!showLinkedTo && (
        <Modal
          open={!!showLinkedTo}
          setOpen={() => setShowLinkedTo(null)}
          size="large"
        >
          <LinkedTo {...showLinkedTo} />
        </Modal>
      )}
    </div>
  )
}
