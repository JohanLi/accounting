import { Amount } from '../../src/components/Amount'
import Select from '../components/Select'
import {
  getAllFiscalYearsInReverse,
  getCurrentFiscalYear,
} from '../../src/utils'
import { getAccountTotals } from './getAccountTotals'

export default async function AccountTotals({
  searchParams,
}: {
  searchParams: { fiscalYear: string }
}) {
  const currentFiscalYear = getCurrentFiscalYear()
  const selectedFiscalYear =
    parseInt(searchParams.fiscalYear) || currentFiscalYear
  const items = getAllFiscalYearsInReverse().map((fiscalYear) => ({
    href:
      fiscalYear === currentFiscalYear
        ? '/accountTotals'
        : `/accountTotals?fiscalYear=${fiscalYear}`,
    value: fiscalYear,
  }))

  const accountTotals = await getAccountTotals(selectedFiscalYear)

  return (
    <>
      <div className="flex justify-end">
        <label className="flex items-center space-x-4">
          <div className="text-gray-500">FY</div>
          <Select selectedValue={selectedFiscalYear} items={items} />
        </label>
      </div>
      <div>
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Accounts
        </h2>
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
