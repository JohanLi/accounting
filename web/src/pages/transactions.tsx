import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { Amount } from '../components/Amount'
import { TransactionsResponse } from './api/transactions'
import { DateFormatted } from '../components/DateFormatted'

export default function Accounts() {
  const transactions = useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })

  return (
    <Layout>
      <div className="mt-8 space-y-12">
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Företagskonto
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.data?.regular.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                    <DateFormatted date={transaction.bookedDate} />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Sparkonto
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.data?.savings.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                    <DateFormatted date={transaction.bookedDate} />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.data?.tax.map((transaction) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
