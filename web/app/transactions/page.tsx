import { transactionTypes } from '../schema'
import { Transaction } from './Transaction'
import { transactionTypeToLabel } from './transactionTypeToLabel'
import { getTransactions } from '../api/transactions/transactions'
import { useFilterPill } from '../components/filterPill/useFilterPill'
import { NextPageProps } from '../types'
import { Metadata } from 'next'
import { H1 } from '../components/common/heading'
import { useFilterTab } from '../components/filterTab/useFilterTab'
import {
  AmountTh,
  DateOrAccountCodeTh,
  DescriptionTh,
  LinkedTh,
  Table,
} from '../components/common/table'

export const metadata: Metadata = {
  title: 'Transactions',
}

export default async function Transactions({ searchParams }: NextPageProps) {
  const transactions = await getTransactions()

  const [selectedType, FilterTab] = useFilterTab({
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

  const [linkedFilter, LinkedFilterPill] = useFilterPill({
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
            <thead>
              <tr>
                <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
                <DescriptionTh>Description</DescriptionTh>
                <AmountTh>Amount</AmountTh>
                <AmountTh>Balance</AmountTh>
                <LinkedTh />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(linkedFilter === 'all'
                ? filteredTransactions
                : filteredNonLinkedTransactions
              ).map((transaction) => (
                <Transaction key={transaction.id} transaction={transaction} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  )
}
