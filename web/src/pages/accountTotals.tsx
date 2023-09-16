import Layout from '../components/Layout'
import { Amount } from '../components/Amount'
import { useState } from 'react'
import Select from '../components/Select'
import { getAllFiscalYearsInReverse } from '../utils'
import { useAccountTotals } from '../hooks/useAccountTotals'

export default function AccountTotals() {
  // TODO hardcoded to 2023 right now, as no entries exist for 2024 yet
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(2023)

  const accountTotals = useAccountTotals(selectedFiscalYear)

  return (
    <Layout title="Accounts">
      <div className="flex justify-end">
        <div className="flex items-center space-x-4">
          <div className="text-gray-500">FY</div>
          <Select
            value={selectedFiscalYear}
            onChange={setSelectedFiscalYear}
            items={getAllFiscalYearsInReverse()}
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
                Incoming
              </th>
              <th
                scope="col"
                className="py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Result
              </th>
              <th
                scope="col"
                className="py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Outgoing
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accountTotals.data?.map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                  {a.id}
                </td>
                <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                  {a.description}
                </td>
                <td className="whitespace-nowrap py-4 text-right text-sm">
                  <Amount amount={a.openingBalance} />
                </td>
                <td className="whitespace-nowrap py-4 text-right text-sm">
                  <Amount amount={a.result} />
                </td>
                <td className="whitespace-nowrap py-4 text-right text-sm">
                  <Amount amount={a.closingBalance} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
