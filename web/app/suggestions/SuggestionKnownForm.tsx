'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Amount } from '../components/Amount'
import { formatDate } from '../components/DateFormatted'
import { Submit } from '../components/Submit'
import { DateInput } from '../journalEntries/DateInput'
import DocumentLink from '../journalEntries/DocumentLink'
import { TextInput } from '../journalEntries/TextInput'
import { Suggestions } from './getSuggestions'

export function SuggestionKnownForm({
  suggestion,
}: {
  suggestion: Suggestions
}) {
  const router = useRouter()

  const [date, setDate] = useState(formatDate(suggestion.date))
  const [description, setDescription] = useState(suggestion.description)

  return (
    <div
      className="flex items-center gap-x-4 py-4"
      data-testid="journalEntryForm"
    >
      <label className="w-36">
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
        {suggestion.transactions.map((t) => (
          <div
            key={t.accountId}
            className="flex items-center space-x-1"
            data-testid="transaction"
          >
            <div className="w-16 text-sm text-gray-500">{t.accountId}</div>
            <div className="w-20 text-right text-sm">
              <Amount amount={t.amount} />
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
              date: new Date(suggestion.date),
              description,
              transactions: suggestion.transactions,
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
