'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { updateJournalEntry } from '../actions/updateJournalEntry'
import { formatDate } from '../components/DateFormatted'
import { Submit } from '../components/Submit'
import {
  DateOrAccountCodeTdEditable,
  DescriptionTd,
  DocumentTd,
  SubmitTd,
  TableRowEditable,
  TransactionsTd,
} from '../components/common/table'
import { DateInput } from '../journalEntries/DateInput'
import DocumentLink from '../journalEntries/DocumentLink'
import { JournalEntryTransactions } from '../journalEntries/JournalEntryTransactions'
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
    <TableRowEditable>
      <DateOrAccountCodeTdEditable>
        <DateInput value={date} onChange={setDate} />
      </DateOrAccountCodeTdEditable>
      <DescriptionTd>
        <TextInput
          value={description}
          onChange={(value) => setDescription(value)}
        />
      </DescriptionTd>
      <TransactionsTd>
        <JournalEntryTransactions transactions={suggestion.transactions} />
      </TransactionsTd>
      <DocumentTd>
        {!!suggestion.documentId && <DocumentLink id={suggestion.documentId} />}
      </DocumentTd>
      <SubmitTd>
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
      </SubmitTd>
    </TableRowEditable>
  )
}
