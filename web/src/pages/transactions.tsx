import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { TransactionsResponse } from './api/transactions'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import { classNames } from '../utils'
import { LinkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import Modal from '../components/Modal'
import LinkedTo, { LinkedToProps } from '../components/LinkedTo'
import { TransactionType, transactionTypes } from '../schema'

const typeToLabel: {
  [key in TransactionType]: string
} = {
  bankRegular: 'Företagskonto',
  bankSavings: 'Sparkonto',
  bankOld: 'Gamla företagskontot',
  bankPersonal: 'Privat konto',
  tax: 'Skattekonto',
}

const filters = ['All', 'Non-linked'] as const

export default function Transactions() {
  const transactions = useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })

  const [activeType, setActiveType] = useState<TransactionType>('bankRegular')

  const [showLinkedTo, setShowLinkedTo] = useState<LinkedToProps | null>(null)

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

  const filteredTransactions = transactions.data?.filter(
    (t) => t.type === activeType,
  )

  return (
    <Layout>
      <div className="flex space-x-6">
        {transactionTypes.map((type) => {
          return (
            <a
              key={type}
              href="#"
              className={classNames(
                activeType === type
                  ? 'bg-indigo-200 text-indigo-700'
                  : 'text-indigo-500 hover:text-indigo-700',
                'rounded-md px-4 py-3 text-sm font-medium',
              )}
              onClick={(e) => {
                e.preventDefault()

                setActiveType(type)
              }}
            >
              {typeToLabel[type]}
            </a>
          )
        })}
      </div>
      {filteredTransactions && (
        <>
          <div className="mb-4 flex justify-end space-x-4">
            {filters.map((filter) => {
              const count =
                filter === 'All'
                  ? filteredTransactions.length
                  : filteredTransactions.filter(
                      (t) => !t.linkedToJournalEntryId,
                    ).length

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
          </div>
          <div className="space-y-12">
            <div>
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
                      className="w-32 py-3.5 text-right text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="w-32 py-3.5 text-right text-sm font-semibold text-gray-900"
                    >
                      Balance
                    </th>
                    <th scope="col" className="w-16 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions
                    .filter((t) =>
                      activeFilter === 'Non-linked'
                        ? !t.linkedToJournalEntryId
                        : true,
                    )
                    .map((transaction) => (
                      <tr
                        className="border-t border-gray-200 first:border-t-0"
                        key={transaction.id}
                      >
                        <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                          <DateFormatted date={transaction.date} />
                        </td>
                        <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="whitespace-nowrap py-4 text-right text-sm">
                          <Amount amount={transaction.amount} />
                        </td>
                        <td className="whitespace-nowrap py-4 text-right text-sm">
                          <Amount amount={transaction.balance} />
                        </td>
                        <td className="relative whitespace-nowrap py-4 text-right text-xs">
                          {transaction.linkedToJournalEntryId && (
                            <a
                              href="#"
                              className="inline-flex items-center text-gray-500 hover:text-gray-800"
                              onClick={(e) => {
                                e.preventDefault()

                                setShowLinkedTo({ transaction })
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
            </div>
          </div>
        </>
      )}
      {!!showLinkedTo && (
        <Modal
          open={!!showLinkedTo}
          setOpen={() => setShowLinkedTo(null)}
          size="large"
        >
          <LinkedTo {...showLinkedTo} />
        </Modal>
      )}
    </Layout>
  )
}
