import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import DocumentLinks from './DocumentLinks'
import { LinkIcon } from '@heroicons/react/20/solid'
import { JournalEntry as JournalEntryType } from '../pages/api/journalEntries'
import { useState } from 'react'
import JournalEntryForm from './JournalEntryForm'
import { Button } from './Button'

type Props = {
  journalEntry: JournalEntryType
  onHasLinkClick: () => void
}

export function JournalEntry({ journalEntry, onHasLinkClick }: Props) {
  const [edit, setEdit] = useState(false)

  if (edit) {
    return (
      <tr>
        <td colSpan={6}>
          <JournalEntryForm
            journalEntry={journalEntry}
            onClose={() => setEdit(false)}
          />
        </td>
      </tr>
    )
  }

  return (
    <>
      <tr key={journalEntry.id}>
        <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
          <DateFormatted date={journalEntry.date} />
        </td>
        <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
          {journalEntry.description}
        </td>
        <td className="whitespace-nowrap py-4 pr-3 text-sm text-gray-500">
          {journalEntry.transactions.length && (
            <table className="min-w-full divide-y divide-gray-300">
              <tbody className="divide-y divide-gray-200 bg-white">
                {journalEntry.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="w-16 py-2 pr-3 text-sm text-gray-500">
                      {transaction.accountId}
                    </td>
                    <td className="px-2 py-2 text-right text-sm font-medium">
                      <Amount amount={transaction.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          <DocumentLinks documents={journalEntry.documents} />
        </td>
        <td className="relative whitespace-nowrap py-4 text-xs">
          {journalEntry.hasLink && (
            <a
              href="#"
              className="inline-flex items-center text-gray-500 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault()

                onHasLinkClick()
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
        </td>
        <td className="text-right">
          <Button type="secondary" onClick={() => setEdit(true)} text="Edit" />
        </td>
      </tr>
    </>
  )
}
