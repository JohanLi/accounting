'use client'

import { useState } from 'react'

import { Amount } from '../components/Amount'
import { Button } from '../components/Button'
import { DateFormatted } from '../components/DateFormatted'
import {
  DateOrAccountCodeTd,
  DescriptionTd,
  DocumentTd,
  EditTd,
  LinkedTd, TableBody,
  TableRow,
  TransactionsTd,
} from '../components/common/table'
import { JournalEntryType } from '../getJournalEntries'
import DocumentLink from './DocumentLink'
import EditForm from './EditForm'
import { LinkPopover } from './link/LinkPopover'

type Props = {
  journalEntry: JournalEntryType
}

export function JournalEntry({ journalEntry }: Props) {
  const [edit, setEdit] = useState(false)

  if (edit) {
    return (
      <EditForm journalEntry={journalEntry} onClose={() => setEdit(false)} />
    )
  }

  return (
    <TableRow>
      <DateOrAccountCodeTd>
        <DateFormatted date={journalEntry.date} />
      </DateOrAccountCodeTd>
      <DescriptionTd>{journalEntry.description}</DescriptionTd>
      <TransactionsTd>
        {journalEntry.transactions.length && (
            <TableBody>
              {journalEntry.transactions.map((transaction, i) => (
                <div key={i} className="flex py-2">
                  <div className="w-16 text-sm text-gray-500">
                    {transaction.accountId}
                  </div>
                  <div className="flex-1 text-right text-sm font-medium">
                    <Amount amount={transaction.amount} />
                  </div>
                </div>
              ))}
            </TableBody>
        )}
      </TransactionsTd>
      <DocumentTd>
        <DocumentLink id={journalEntry.documentId} />
      </DocumentTd>
      <LinkedTd>
        <LinkPopover journalEntry={journalEntry} />
      </LinkedTd>
      <EditTd>
        <Button type="secondary" onClick={() => setEdit(true)} text="Edit" />
      </EditTd>
    </TableRow>
  )
}
