import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { updateJournalEntry } from '../actions/updateJournalEntry'
import { AmountInput } from '../components/AmountInput'
import { Button } from '../components/Button'
import { formatDate } from '../components/DateFormatted'
import { Submit } from '../components/Submit'
import {
  DateOrAccountCodeTdEditable,
  DescriptionTd,
  SubmitTd,
  Table,
  TableBody,
  TableRow,
  TableRowEditable,
  TransactionsAccountTd,
  TransactionsAmountEditableTd,
  TransactionsTd,
} from '../components/common/table'
import { JournalEntryType, Transaction } from '../getJournalEntries'
import { DateInput } from './DateInput'
import { TextInput } from './TextInput'

type Props = {
  journalEntry: JournalEntryType
  onClose: () => void
}

export default function EditForm({ journalEntry, onClose }: Props) {
  const router = useRouter()

  const [date, setDate] = useState(formatDate(journalEntry.date))
  const [description, setDescription] = useState(journalEntry.description)

  const [transactions, setTransactions] = useState<Transaction[]>(
    journalEntry.transactions,
  )

  return (
    <TableRowEditable>
      <DateOrAccountCodeTdEditable>
        <DateInput value={date} onChange={setDate} />
      </DateOrAccountCodeTdEditable>
      <DescriptionTd>
        <TextInput value={description} onChange={setDescription} />
      </DescriptionTd>
      <TransactionsTd>
        <Table>
          <TableBody hideDividers>
            {transactions.map((transaction, i) => (
              <TableRow key={i} padding="extraCompact">
                <TransactionsAccountTd>
                  <TextInput
                    value={transaction.accountId.toString()}
                    onChange={(value) => {
                      setTransactions(
                        transactions.map((transaction) => {
                          if (transaction.accountId === transaction.accountId) {
                            return {
                              ...transaction,
                              accountId: parseInt(value),
                            }
                          }

                          return transaction
                        }),
                      )
                    }}
                  />
                </TransactionsAccountTd>
                <TransactionsAmountEditableTd>
                  <AmountInput
                    value={transaction.amount}
                    onChange={(amount) => {
                      setTransactions(
                        transactions.map((transaction) => {
                          if (transaction.accountId === transaction.accountId) {
                            return {
                              ...transaction,
                              amount,
                            }
                          }

                          return transaction
                        }),
                      )
                    }}
                  />
                </TransactionsAmountEditableTd>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TransactionsTd>
      <SubmitTd wide>
        <form
          action={async () => {
            const entry = {
              id: journalEntry.id,
              date: new Date(date),
              description,
              transactions,
              linkedToTransactionIds: journalEntry.linkedToTransactionIds,
              documentId: journalEntry.documentId,
            }

            await updateJournalEntry(entry)

            router.refresh()
            onClose()
          }}
          className="flex justify-end space-x-2"
        >
          <Button
            type="secondary"
            onClick={() => {
              onClose()
            }}
            text="Cancel"
          />
          <Submit disabled={false} />
        </form>
      </SubmitTd>
    </TableRowEditable>
  )
}
