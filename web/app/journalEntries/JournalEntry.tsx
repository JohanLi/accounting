'use client'

import { useState } from 'react'

import { Button } from '../components/Button'
import { DateFormatted } from '../components/DateFormatted'
import {
  DateOrAccountCodeTd,
  DescriptionTd,
  DocumentTd,
  EditTd,
  LinkedTd,
  TableRow,
  TransactionsTd,
} from '../components/common/table'
import { JournalEntryType } from '../getJournalEntries'
import DocumentLink from './DocumentLink'
import EditForm from './EditForm'
import { JournalEntryTransactions } from './JournalEntryTransactions'
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
        <JournalEntryTransactions transactions={journalEntry.transactions} />
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
