import {
  DateOrAccountCodeTh,
  DescriptionTh,
  DocumentTh, EditTh,
  LinkedTh,
  Table,
  TableBody,
  TableHeader, TransactionsTh,
} from '../components/common/table'
import { JournalEntryType } from '../getJournalEntries'
import { JournalEntry } from './JournalEntry'

export function JournalEntries({
  journalEntries,
}: {
  journalEntries: JournalEntryType[]
}) {
  return (
    <Table>
      <TableHeader>
        <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
        <DescriptionTh>Description</DescriptionTh>
        <TransactionsTh>
          Transactions
        </TransactionsTh>
        <DocumentTh />
        <LinkedTh />
        <EditTh />
      </TableHeader>
      <TableBody>
        {journalEntries.map((journalEntry) => (
          <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
        ))}
      </TableBody>
    </Table>
  )
}
