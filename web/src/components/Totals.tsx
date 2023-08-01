import { useQuery } from '@tanstack/react-query'
import { Total } from '../pages/api/totals'
import { Amount } from './Amount'

const accountsOfInterest: { [accountId: number]: string } = {
  1930: 'Bank 1',
  1932: 'Bank 2',
  2890: 'Owed to Self',
  3011: 'Invoiced',
}

export default function Totals() {
  const totals = useQuery<Total[]>({
    queryKey: ['totals'],
    queryFn: () => fetch('/api/totals').then((res) => res.json()),
  })

  if (!totals.data) {
    return null
  }

  return (
    <div className="mt-8">
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Totals
      </h1>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
            >
              Account
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {totals.data
            .filter((total) => accountsOfInterest[total.accountId])
            .map((total) => (
              <tr key={total.accountId}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                  {accountsOfInterest[total.accountId]}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <Amount amount={total.amount} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
