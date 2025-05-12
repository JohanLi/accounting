import { getNonLinkedTransactions } from '../api/transactions/transactions'
import { H2 } from '../components/common/heading'
import {
  AmountTh,
  DateOrAccountCodeTh,
  DescriptionTh,
  LinkedTh,
  Table,
  TableBody,
  TableHeader,
} from '../components/common/table'
import NonLinkedTransactionsClient from './NonLinkedTransactionsClient'

export default async function NonLinkedTransactions() {
  const transactions = await getNonLinkedTransactions()

  return (
    <div className="mt-8 space-y-8">
      <H2>Non-linked transactions</H2>
      {transactions.length > 0 && (
        <Table>
          <TableHeader>
            <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
            <DescriptionTh>Description</DescriptionTh>
            <AmountTh>Amount</AmountTh>
            <AmountTh>Balance</AmountTh>
            <LinkedTh />
          </TableHeader>
          <TableBody>
            <NonLinkedTransactionsClient transactions={transactions} />
          </TableBody>
        </Table>
      )}
    </div>
  )
}
