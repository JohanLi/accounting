import { Amount } from './Amount'
import Documents from './Documents'
import { Verification } from '../pages/api/verifications'
import { DateFormatted } from './DateFormatted'

type Props = {
  verifications: Verification[]
}

export default function Verifications({ verifications }: Props) {
  return (
    <div>
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {verifications.map((verification) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
