import { useQuery } from '@tanstack/react-query'
import { Amount } from './Amount'
import Dropdown from './Dropdown'
import { getCurrentFiscalYear, withinFiscalYear } from '../utils'
import { useState } from 'react'
import Documents from './Documents'
import { VerificationWithTransactionsAndDocuments } from '../pages/api/verifications'

export default function Verifications() {
  const verifications = useQuery<VerificationWithTransactionsAndDocuments[]>({
    queryKey: ['verifications'],
    queryFn: () => fetch('/api/verifications').then((res) => res.json()),
  })

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    getCurrentFiscalYear(),
  )

  const filteredVerifications =
    verifications.data?.filter((verification) =>
      withinFiscalYear(verification, selectedFiscalYear),
    ) || []

  return (
    <div className="mt-8">
      <div className="flex justify-end">
        <div className="flex items-center space-x-4">
          <div className="text-gray-500">FY</div>
          <Dropdown
            selectedFiscalYear={selectedFiscalYear}
            setSelectedFiscalYear={setSelectedFiscalYear}
          />
        </div>
      </div>
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
            <th
              scope="col"
              className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Documents
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredVerifications.map((verification) => (
            <tr key={verification.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {new Date(verification.date).toLocaleDateString('sv-SE')}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                {verification.description}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                {verification.transactions.length && (
                  <table className="min-w-full divide-y divide-gray-300">
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {verification.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="w-16 py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                            {transaction.accountCode}
                          </td>
                          <td className="px-2 py-2 text-sm font-medium">
                            <Amount amount={transaction.amount} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                <Documents documents={verification.documents} />
              </td>
            </tr>
          ))}
          {filteredVerifications.length === 0 && (
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
