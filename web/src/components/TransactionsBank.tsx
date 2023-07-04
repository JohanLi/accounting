import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import { TransactionsResponse } from '../pages/api/transactions'

const typeToLabel = {
  regular: 'Företagskonto',
  savings: 'Sparkonto',
}

type Props = {
  transactions: TransactionsResponse['regular']
  type: keyof typeof typeToLabel
}

export default function TransactionsBank({ transactions, type }: Props) {
  return (
    <div>
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
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
  )
}
