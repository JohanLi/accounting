import { classNames } from '../../src/utils'
import { TransactionType, transactionTypes } from '../../src/schema'
import { Transaction } from '../../src/components/Transaction'
import Link from 'next/link'
import { transactionTypeToLabel } from './transactionTypeToLabel'
import { getTransactions } from '../api/transactions/transactions'

const filters = ['All', 'Non-linked'] as const

export default async function Transactions({
  searchParams,
}: {
  searchParams: { type: TransactionType; filter: (typeof filters)[number] }
}) {
  const transactions = await getTransactions()

  const defaultType = 'bankRegular'
  const activeType = searchParams.type || defaultType

  const defaultFilter = 'All'
  const activeFilter = searchParams.filter || defaultFilter

  const filteredTransactions = transactions.filter((t) => t.type === activeType)

  return (
    <>
      <div className="flex space-x-6">
        {transactionTypes.map((type) => {
          return (
            <Link
              key={type}
              href={
                type === defaultType
                  ? '/transactions'
                  : `/transactions?type=${type}`
              }
              className={classNames(
                type === activeType
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
      <div className="mb-4 flex justify-end space-x-4">
        {filters.map((filter) => {
          const count =
            filter === defaultFilter
              ? filteredTransactions.length
              : filteredTransactions.filter((t) => !t.journalEntryId).length

          return (
            <a
              key={filter}
              href={`/transactions?type=${activeType}&filter=${filter}`}
              className={classNames(
                filter === activeFilter
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-500 hover:text-gray-700',
                'rounded-md px-3 py-2 text-xs font-medium',
              )}
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
                  <Transaction key={transaction.id} transaction={transaction} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
