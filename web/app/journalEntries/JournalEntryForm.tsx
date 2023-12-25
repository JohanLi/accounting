'use client'

import { useState } from 'react'
import { Button } from '../components/Button'
import { JournalEntryType, Transaction } from '../getJournalEntries'
import { formatDate } from '../components/DateFormatted'
import { AmountInput } from '../components/AmountInput'
import DocumentLink from './DocumentLink'
import { DateInput } from './DateInput'
import { Submit } from '../components/Submit'
import { updateJournalEntry } from '../actions/updateJournalEntry'
import { useRouter } from 'next/navigation'

type Props = {
  journalEntry: JournalEntryType
  onClose: () => void
}

// TODO cancelling should reset the transactions' values

export default function JournalEntryForm({ journalEntry, onClose }: Props) {
  const router = useRouter()

  const [date, setDate] = useState(formatDate(journalEntry.date))
  const [description, setDescription] = useState(journalEntry.description)

  const [transactions, setTransactions] = useState<Transaction[]>(
    journalEntry.transactions,
  )

  return (
    <div className="grid grid-cols-12 gap-x-4" data-testid="journalEntryForm">
      <label className="col-span-2">
        <div>Date</div>
        <DateInput value={date} onChange={setDate} />
      </label>
      <label className="col-span-3">
        <div>Description</div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
      </label>
      <div className="col-span-3">
        <div>Transactions</div>
        {transactions.map((t, i) => (
          <div
            key={i}
            className="flex items-center space-x-4"
            data-testid="transaction"
          >
            <input
              type="text"
              value={t.accountId || ''}
              onChange={(e) => {
                const newTransactions = [...transactions]
                newTransactions[i].accountId = parseInt(e.target.value)
                setTransactions(newTransactions)
              }}
              className="w-24"
            />
            <AmountInput
              value={t.amount}
              onChange={(amount) => {
                const newTransactions = [...transactions]
                newTransactions[i].amount = amount
                setTransactions(newTransactions)
              }}
            />
          </div>
        ))}
      </div>
      {!!journalEntry.documentId && (
        <div className="col-span-1">
          <DocumentLink id={journalEntry.documentId} />
        </div>
      )}
      <div className="col-span-2">
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
          className="flex space-x-4"
        >
          <Submit disabled={false} />
          <Button
            type="secondary"
            onClick={() => {
              onClose()
            }}
            text="Cancel"
          />
        </form>
      </div>
    </div>
  )
}
