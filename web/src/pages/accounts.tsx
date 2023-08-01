import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { AccountsResponse } from './api/accounts'
import { Amount } from '../components/Amount'
import { useState } from 'react'
import Dropdown from '../components/Dropdown'

export default function Accounts() {
  // TODO hardcoded to 2023 right now, as no entries exist for 2024 yet
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(2023)

  const accounts = useQuery<AccountsResponse>({
    queryKey: ['accounts', selectedFiscalYear],
    queryFn: () =>
      fetch(`/api/accounts?fiscalYear=${selectedFiscalYear}`).then((res) =>
        res.json(),
      ),
  })

  return (
    <Layout>
      <div className="flex justify-end">
        <div className="flex items-center space-x-4">
          <div className="text-gray-500">FY</div>
          <Dropdown
            selectedFiscalYear={selectedFiscalYear}
            setSelectedFiscalYear={setSelectedFiscalYear}
          />
        </div>
      </div>
      <div>
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          Accounts
        </h1>
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
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
              <tr key={account.id}>
                <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                  {account.id}
                </td>
                <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                  {account.description}
                </td>
                <td className="whitespace-nowrap py-4 text-right text-sm">
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
