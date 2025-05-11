import { Metadata } from 'next'

import { Amount } from '../components/Amount'
import { H1 } from '../components/common/heading'
import {
  AmountTd,
  AmountTh,
  DateOrAccountCodeTd,
  DateOrAccountCodeTh,
  DescriptionTd,
  DescriptionTh,
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '../components/common/table'
import { getSelect } from '../components/select/getSelect'
import { NextPageProps } from '../types'
import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from '../utils'
import { getAccountTotals } from './getAccountTotals'

export const metadata: Metadata = {
  title: 'Accounts',
}

export default async function AccountTotals(props: NextPageProps) {
  const searchParams = await props.searchParams
  const [selectedFiscalYear, Select] = getSelect({
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
          <TableHeader>
            <DateOrAccountCodeTh>Code</DateOrAccountCodeTh>
            <DescriptionTh>Description</DescriptionTh>
            <AmountTh>Incoming</AmountTh>
            <AmountTh>Result</AmountTh>
            <AmountTh>Outgoing</AmountTh>
          </TableHeader>
          <TableBody>
            {accountTotals.map((a) => (
              <TableRow key={a.id}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
