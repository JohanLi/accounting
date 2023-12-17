'use client'

// TODO the linked document and linked transactions should trigger a popover on hover

import { JournalEntry as JournalEntryType } from '../getJournalEntries'
import { useState } from 'react'
import JournalEntryForm from './JournalEntryForm'
import { JournalEntryLinkForm } from './JournalEntryLinkForm'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import DocumentLink from './DocumentLink'
import { LinkIcon } from '@heroicons/react/20/solid'
import { Button } from '../components/Button'

type Props = {
  journalEntry: JournalEntryType
}

export function JournalEntry({ journalEntry }: Props) {
  const [edit, setEdit] = useState(false)
  const [editLink, setEditLink] = useState(false)

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

  if (editLink) {
    return (
      <tr>
        <td colSpan={6}>
          <JournalEntryLinkForm
            journalEntry={journalEntry}
            onClose={() => setEditLink(false)}
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
                {journalEntry.transactions.map((transaction, i) => (
                  <tr key={i}>
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
          <DocumentLink id={journalEntry.documentId} />
        </td>
        <td className="relative whitespace-nowrap py-4 text-xs">
          {journalEntry.linkedToTransactionIds.length > 0 && (
            <a
              href="#"
              className="inline-flex items-center text-gray-500 hover:text-gray-800"
              onClick={(e) => {
                e.preventDefault()

                setEditLink(true)
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
        </td>
        <td className="space-x-2 text-right">
          <Button type="secondary" onClick={() => setEdit(true)} text="Edit" />
          {!journalEntry.linkedToTransactionIds.length && (
            <Button
              type="secondary"
              onClick={() => setEditLink(true)}
              text="Add link"
            />
          )}
        </td>
      </tr>
    </>
  )
}
