import { useState } from 'react'
import { Button } from '../components/Button'
import { JournalEntryType, Transaction } from '../getJournalEntries'
import { formatDate } from '../components/DateFormatted'
import { AmountInput } from '../components/AmountInput'
import { DateInput } from './DateInput'
import { Submit } from '../components/Submit'
import { updateJournalEntry } from '../actions/updateJournalEntry'
import { useRouter } from 'next/navigation'
import { TextInput } from './TextInput'

type Props = {
  journalEntry: JournalEntryType
  onClose: () => void
}

// TODO cancelling should reset the transactions' values

export default function EditForm({ journalEntry, onClose }: Props) {
  const router = useRouter()

  const [date, setDate] = useState(formatDate(journalEntry.date))
  const [description, setDescription] = useState(journalEntry.description)

  const [transactions, setTransactions] = useState<Transaction[]>(
    journalEntry.transactions,
  )

  return (
    <div
      className="-ml-4 flex items-center gap-x-3 py-4"
      data-testid="journalEntryForm"
    >
      <label className="w-32">
        <DateInput value={date} onChange={setDate} />
      </label>
      <label className="flex-1">
        <TextInput value={description} onChange={setDescription} />
      </label>
      <div className="space-y-1">
        {transactions.map((t, i) => (
          <div
            key={i}
            className="flex items-center space-x-1"
            data-testid="transaction"
          >
            <div className="w-16">
              <TextInput
                value={t.accountId.toString() || ''}
                onChange={(value) => {
                  const newTransactions = [...transactions]
                  newTransactions[i].accountId = parseInt(value)
                  setTransactions(newTransactions)
                }}
              />
            </div>
            <div className="w-28">
              <AmountInput
                value={t.amount}
                onChange={(amount) => {
                  const newTransactions = [...transactions]
                  newTransactions[i].amount = amount
                  setTransactions(newTransactions)
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="ml-auto w-52">
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
      </div>
    </div>
  )
}
