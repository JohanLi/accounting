import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { Amount } from '../components/Amount'
import { TransactionsResponse } from './api/transactions'
import { DateFormatted } from '../components/DateFormatted'
import LinkedTo, { LinkedToProps } from '../components/LinkedTo'
import { useState } from 'react'
import TransactionsBank from '../components/TransactionsBank'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { classNames } from '../utils'

export default function Accounts() {
  const transactions = useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })

  const [linkedTo, setLinkedTo] = useState<LinkedToProps | null>(null)

  return (
    <Layout>
      <div className="mt-8 space-y-12">
        {transactions.data && (
          <TransactionsBank
            transactions={transactions.data.regular}
            type="regular"
          />
        )}
        {transactions.data && (
          <TransactionsBank
            transactions={transactions.data.savings}
            type="savings"
          />
        )}
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Skattekonto
          </h2>
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
                <th scope="col" className="w-32 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.data?.tax.map((transaction) => {
                const activeTransactionTax =
                  linkedTo?.taxTransaction?.id === transaction.id

                return (
                  <tr key={transaction.id}>
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
                      <a
                        href="#"
                        className={classNames(
                          'inline-flex items-center hover:text-gray-800',
                          !activeTransactionTax
                            ? 'text-gray-500'
                            : 'text-gray-800',
                        )}
                        onClick={(e) => {
                          e.preventDefault()

                          if (activeTransactionTax) {
                            setLinkedTo(null)
                          } else {
                            setLinkedTo({ taxTransaction: transaction })
                          }
                        }}
                      >
                        Link{' '}
                        {!activeTransactionTax ? (
                          <ChevronDownIcon className="h-5 w-5" />
                        ) : (
                          <ChevronUpIcon className="h-5 w-5" />
                        )}
                      </a>
                      {activeTransactionTax && <LinkedTo {...linkedTo} />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
