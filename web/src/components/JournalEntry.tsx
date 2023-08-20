import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import DocumentLinks from './DocumentLinks'
import { classNames } from '../utils'
import { LinkIcon } from '@heroicons/react/20/solid'
import { JournalEntry as JournalEntryType } from '../pages/api/journalEntries'
import Modal from './Modal'
import LinkedTo, { LinkedToProps } from './LinkedTo'
import { useState } from 'react'
import JournalEntryForm from './JournalEntryForm'
import { Button } from './Button'

type Props = {
  journalEntry: JournalEntryType
}

export function JournalEntry({ journalEntry }: Props) {
  const [edit, setEdit] = useState(false)
  const [showLinkedTo, setShowLinkedTo] = useState<LinkedToProps | null>(null)

  if (edit) {
    return (
      <tr>
        <td colSpan={5}>
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
        <td className="relative whitespace-nowrap py-4 text-right text-xs">
          {journalEntry.hasLink && (
            <a
              href="#"
              className={classNames(
                'inline-flex items-center text-gray-500 hover:text-gray-800',
                showLinkedTo ? 'text-gray-800' : '',
              )}
              onClick={(e) => {
                e.preventDefault()

                setShowLinkedTo({ journalEntry })
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
          <Button type="secondary" onClick={() => setEdit(true)} text="Edit" />
        </td>
      </tr>
      {!!showLinkedTo && (
        <Modal
          open={!!showLinkedTo}
          setOpen={() => setShowLinkedTo(null)}
          size="large"
        >
          <LinkedTo {...showLinkedTo} />
        </Modal>
      )}
    </>
  )
}
