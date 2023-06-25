import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { AccountsResponse } from './api/accounts'
import { Amount } from '../components/Amount'

export default function Accounts() {
  const accounts = useQuery<AccountsResponse>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then((res) => res.json()),
  })

  return (
    <Layout>
      <div className="mt-8">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          Accounts
        </h1>
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
              >
                Code
              </th>
              <th
                scope="col"
                className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
              >
                Description
              </th>
              <th
                scope="col"
                className="py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.data?.map((account) => (
              <tr key={account.code}>
                <td className="whitespace-nowrap py-4 pr-3">{account.code}</td>
                <td className="whitespace-nowrap py-4 pr-3">
                  {account.description}
                </td>
                <td className="whitespace-nowrap py-4 text-right text-sm text-gray-500">
                  <Amount amount={account.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
