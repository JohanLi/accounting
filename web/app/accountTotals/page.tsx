import { Amount } from '../components/Amount'
import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from '../utils'
import { getAccountTotals } from './getAccountTotals'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { Metadata } from 'next'
import { H1 } from '../components/common/heading'
import {
  AmountTd,
  AmountTh,
  DateOrAccountCodeTd,
  DateOrAccountCodeTh,
  DescriptionTd,
  DescriptionTh,
  Table,
} from '../components/common/table'

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
        <Table>
          <thead>
            <tr>
              <DateOrAccountCodeTh>Code</DateOrAccountCodeTh>
              <DescriptionTh>Description</DescriptionTh>
              <AmountTh>Incoming</AmountTh>
              <AmountTh>Result</AmountTh>
              <AmountTh>Outgoing</AmountTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accountTotals.map((a) => (
              <tr key={a.id}>
                <DateOrAccountCodeTd>{a.id}</DateOrAccountCodeTd>
                <DescriptionTd>{a.description}</DescriptionTd>
                <AmountTd>
                  <Amount amount={a.openingBalance} />
                </AmountTd>
                <AmountTd>
                  <Amount amount={a.result} />
                </AmountTd>
                <AmountTd>
                  <Amount amount={a.closingBalance} />
                </AmountTd>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  )
}
