'use client'

import { SuggestionFromKnown } from './getSuggestions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatDate } from '../components/DateFormatted'
import { DateInput } from '../journalEntries/DateInput'
import { AmountInput } from '../components/AmountInput'
import DocumentLink from '../journalEntries/DocumentLink'
import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Submit } from '../components/Submit'
import { Transaction } from '../getJournalEntries'
import { TextInput } from '../journalEntries/TextInput'

export function SuggestionKnownForm({
  suggestion,
}: {
  suggestion: SuggestionFromKnown
}) {
  const router = useRouter()

  const [date, setDate] = useState(formatDate(suggestion.date))
  const [description, setDescription] = useState(suggestion.description)

  const [transactions, setTransactions] = useState<Transaction[]>(
    suggestion.transactions,
  )

  return (
    <div
      className="flex items-center gap-x-4 py-4"
      data-testid="journalEntryForm"
    >
      <label className="w-32">
        <div className="sr-only">Date</div>
        <DateInput value={date} onChange={setDate} />
      </label>
      <label className="w-96">
        <div className="sr-only">Description</div>
        <TextInput
          value={description}
          onChange={(value) => setDescription(value)}
        />
      </label>
      <div className="space-y-1">
        {transactions.map((t) => (
          <div
            key={t.accountId}
            className="flex items-center space-x-1"
            data-testid="transaction"
          >
            <div className="w-16">
              <TextInput
                value={t.accountId.toString()}
                onChange={(value) => {
                  setTransactions(
                    transactions.map((transaction) => {
                      if (transaction.accountId === t.accountId) {
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
            </div>
            <div className="w-28">
              <AmountInput
                value={t.amount}
                onChange={(amount) => {
                  setTransactions(
                    transactions.map((transaction) => {
                      if (transaction.accountId === t.accountId) {
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
            </div>
          </div>
        ))}
      </div>
      {!!suggestion.documentId && (
        <div className="w-16">
          <DocumentLink id={suggestion.documentId} />
        </div>
      )}
      <div className="ml-auto w-24">
        <form
          action={async () => {
            const entry = {
              date: new Date(date),
              description,
              transactions,
              linkedToTransactionIds: suggestion.linkedToTransactionIds,
              documentId: suggestion.documentId,
            }

            await updateJournalEntry(entry)

            router.refresh()
          }}
          className="flex justify-end space-x-2"
        >
          <Submit disabled={false} />
        </form>
      </div>
    </div>
  )
}
