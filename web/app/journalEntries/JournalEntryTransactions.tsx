import { Amount } from '../components/Amount'
import {
  Table,
  TableBody,
  TableRow,
  TransactionsAccountTd,
  TransactionsAmountTd,
} from '../components/common/table'
import { Transaction } from '../getJournalEntries'

export function JournalEntryTransactions({
  transactions,
}: {
  transactions: Transaction[]
}) {
  if (!transactions.length) {
    return null
  }

  return (
    <Table>
      <TableBody>
        {transactions.map((transaction, i) => (
          <TableRow key={i} padding="compact" data-testid="transaction">
            <TransactionsAccountTd>
              {transaction.accountId}
            </TransactionsAccountTd>
            <TransactionsAmountTd>
              <Amount amount={transaction.amount} />
            </TransactionsAmountTd>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
