import { Amount } from '../components/Amount'
import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from '../utils'
import { getAccountTotals } from './getAccountTotals'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { Metadata } from 'next'
import { H1 } from '../components/common/heading'

export const metadata: Metadata = {
  title: 'Accounts',
}

export default async function AccountTotals({ searchParams }: NextPageProps) {
  const [selectedFiscalYear, Select] = useSelect({
    searchParams,
    name: 'fiscalYear',
    defaultValue: getCurrentFiscalYear(),
    values: getAllFiscalYearsInReverse(),
  })

  const accountTotals = await getAccountTotals(selectedFiscalYear)

  return (
    <>
      <H1>Account totals</H1>
      <div className="flex justify-end">
        <label className="flex items-center space-x-4">
          <div className="text-gray-500">FY</div>
          <Select />
        </label>
      </div>
      <div>
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
            {accountTotals.map((a) => (
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
    </>
  )
}
