import { useQuery } from '@tanstack/react-query'
import { VerificationWithTransactions } from '../pages/api/import'

export default function Verifications() {
  const verifications = useQuery<VerificationWithTransactions[]>({
    queryKey: ['verifications'],
    queryFn: () => fetch('/api/verifications').then((res) => res.json()),
  })

  return (
    <div className="mt-8">
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Verifications
      </h1>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
            >
              Date
            </th>
            <th
              scope="col"
              className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Description
            </th>
            <th
              scope="col"
              className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Transactions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {verifications.data?.map((verification) => (
            <tr key={verification.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {verification.date.toString()}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                {verification.description}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                {verification.transactions.map((transaction) => (
                  <div key={transaction.id}>
                    {transaction.accountCode} {transaction.amount}
                  </div>
                ))}
              </td>
            </tr>
          ))}
          {verifications.data?.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 px-3 text-sm text-gray-500">
                No verifications found. Import an SIE file first.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
