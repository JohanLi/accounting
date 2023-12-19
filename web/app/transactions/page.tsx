import { transactionTypes } from '../schema'
import { Transaction } from './Transaction'
import { transactionTypeToLabel } from './transactionTypeToLabel'
import { getTransactions } from '../api/transactions/transactions'
import { useFilterPill } from '../components/filterPill/useFilterPill'
import { NextPageProps } from '../types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transactions',
}

export default async function Transactions({ searchParams }: NextPageProps) {
  const transactions = await getTransactions()

  const [selectedType, TypeFilterPill] = useFilterPill({
    searchParams,
    name: 'type',
    defaultValue: 'bankRegular',
    items: transactionTypes.map((type) => ({
      label: transactionTypeToLabel[type],
      value: type,
    })),
  })

  const filteredTransactions = transactions.filter(
    (t) => t.type === selectedType,
  )
  const filteredNonLinkedTransactions = filteredTransactions.filter(
    (t) => !t.journalEntryId,
  )

  const [linkedFilter, LinkedFilterPill] = useFilterPill({
    searchParams,
    name: 'linkedFilter',
    defaultValue: 'all',
    items: [
      {
        label: `All (${filteredTransactions.length})`,
        value: 'all',
      },
      {
        label: `Non-linked (${filteredNonLinkedTransactions.length})`,
        value: 'non-linked',
      },
    ],
  })

  return (
    <>
      <div className="flex space-x-6">
        <TypeFilterPill />
      </div>
      <div className="mb-4 flex justify-end space-x-4">
        <LinkedFilterPill />
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
              {(linkedFilter === 'all'
                ? filteredTransactions
                : filteredNonLinkedTransactions
              ).map((transaction) => (
                <Transaction key={transaction.id} transaction={transaction} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
