'use client'

import { JournalEntryType as JournalEntryType } from '../getJournalEntries'
import { useState } from 'react'
import EditForm from './EditForm'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import DocumentLink from './DocumentLink'
import { Button } from '../components/Button'
import {
  DateOrAccountCodeTd,
  DescriptionTd,
  DocumentTd,
  LinkedTd,
} from '../components/common/table'
import { LinkPopover } from './link/LinkPopover'

type Props = {
  journalEntry: JournalEntryType
}

export function JournalEntry({ journalEntry }: Props) {
  const [edit, setEdit] = useState(false)

  if (edit) {
    return (
      <tr>
        <td colSpan={6}>
          <EditForm
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
        <DateOrAccountCodeTd>
          <DateFormatted date={journalEntry.date} />
        </DateOrAccountCodeTd>
        <DescriptionTd>{journalEntry.description}</DescriptionTd>
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
        <DocumentTd>
          <DocumentLink id={journalEntry.documentId} />
        </DocumentTd>
        <LinkedTd>
          <LinkPopover journalEntry={journalEntry} />
        </LinkedTd>
        <td className="space-x-2 text-right">
          <Button type="secondary" onClick={() => setEdit(true)} text="Edit" />
        </td>
      </tr>
    </>
  )
}
