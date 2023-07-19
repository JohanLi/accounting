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
import { transactionBankTaxTypes } from '../schema'

const typeToLabel: {
  [key in (typeof transactionBankTaxTypes)[number]]: string
} = {
  bankRegular: 'Företagskonto',
  bankSavings: 'Sparkonto',
  tax: 'Skattekonto',
}

const filters = ['All', 'Non-linked'] as const

export default function Accounts() {
  const transactions = useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })

  const [showLinkedTo, setShowLinkedTo] = useState<LinkedToProps | null>(null)

  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

  return (
    <Layout>
      {transactions.data && (
        <>
          <div className="flex items-center justify-end space-x-4">
            {filters.map((filter) => {
              const count =
                filter === 'All'
                  ? transactions.data.length
                  : transactions.data.filter((t) => t.verificationId).length

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
            {transactionBankTaxTypes.map((type) => (
              <div key={type}>
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                  {typeToLabel[type]}
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
                      <th scope="col" className="w-16 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.data
                      .filter((t) => t.type === type)
                      .filter((t) =>
                        activeFilter === 'Non-linked'
                          ? !t.verificationId
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
                            {transaction.verificationId && (
                              <a
                                href="#"
                                className={classNames(
                                  'inline-flex items-center text-gray-500 hover:text-gray-800',
                                  showLinkedTo ? 'text-gray-800' : '',
                                )}
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
            ))}
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
