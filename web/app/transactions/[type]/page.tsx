'use client'

import { useQuery } from '@tanstack/react-query'
import { TransactionsResponse } from '../../../src/pages/api/transactions'
import { classNames } from '../../../src/utils'
import { useState } from 'react'
import { TransactionType, transactionTypes } from '../../../src/schema'
import { Transaction } from '../../../src/components/Transaction'
import Link from 'next/link'
import { transactionTypeToLabel } from './transactionTypeToLabel'

const filters = ['All', 'Non-linked'] as const

export default function Transactions({
  params,
}: {
  params: { type: TransactionType }
}) {
  const transactions = useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })

  const activeType = params.type

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

  const filteredTransactions = transactions.data?.filter(
    (t) => t.type === activeType,
  )

  return (
    <>
      <div className="flex space-x-6">
        {transactionTypes.map((type) => {
          return (
            <Link
              key={type}
              href={`/transactions/${type}`}
              className={classNames(
                activeType === type
                  ? 'bg-indigo-200 text-indigo-700'
                  : 'text-indigo-500 hover:text-indigo-700',
                'rounded-md px-4 py-3 text-sm font-medium',
              )}
            >
              {transactionTypeToLabel[type]}
            </Link>
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
                  : filteredTransactions.filter((t) => !t.journalEntryId).length

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
                    <th scope="col" className="py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions
                    .filter((t) =>
                      activeFilter === 'Non-linked' ? !t.journalEntryId : true,
                    )
                    .map((transaction) => (
                      <Transaction
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
