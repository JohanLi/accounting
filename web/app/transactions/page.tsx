import { Metadata } from 'next'

import { getTransactions } from '../api/transactions/transactions'
import { H1 } from '../components/common/heading'
import {
  AmountTh,
  DateOrAccountCodeTh,
  DescriptionTh,
  LinkedTh,
  Table,
  TableBody,
  TableHeader,
} from '../components/common/table'
import { getFilterPill } from '../components/filterPill/getFilterPill'
import { getFilterTab } from '../components/filterTab/getFilterTab'
import { transactionTypes } from '../schema'
import { NextPageProps } from '../types'
import { Transaction } from './Transaction'
import { transactionTypeToLabel } from './transactionTypeToLabel'

export const metadata: Metadata = {
  title: 'Transactions',
}

export default async function Transactions(props: NextPageProps) {
  const searchParams = await props.searchParams
  const transactions = await getTransactions()

  const [selectedType, FilterTab] = getFilterTab({
    searchParams,
    name: 'type',
    defaultValue: 'bankRegular',
    items: transactionTypes.map((type) => ({
      label: transactionTypeToLabel[type],
      value: type,
    })),
  })

  const filteredTransactions = transactions.filter(
    (t) => t.type === selectedType,
  )
  const filteredNonLinkedTransactions = filteredTransactions.filter(
    (t) => !t.journalEntryId,
  )

  const [linkedFilter, LinkedFilterPill] = getFilterPill({
    searchParams,
    name: 'filter',
    defaultValue: 'all',
    items: [
      {
        label: `All (${filteredTransactions.length})`,
        value: 'all',
      },
      {
        label: `Non-linked (${filteredNonLinkedTransactions.length})`,
        value: 'non-linked',
      },
    ],
  })

  return (
    <>
      <H1>Transactions</H1>
      <FilterTab />
      <div className="mb-4 mt-8 flex justify-end space-x-4">
        <LinkedFilterPill />
      </div>
      <div className="space-y-12">
        <div>
          <Table>
            <TableHeader>
              <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
              <DescriptionTh>Description</DescriptionTh>
              <AmountTh>Amount</AmountTh>
              <AmountTh>Balance</AmountTh>
              <LinkedTh />
            </TableHeader>
            <TableBody>
              {(linkedFilter === 'all'
                ? filteredTransactions
                : filteredNonLinkedTransactions
              ).map((transaction) => (
                <Transaction key={transaction.id} transaction={transaction} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
